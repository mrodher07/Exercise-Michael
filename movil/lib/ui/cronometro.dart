/// El cronómetro de descanso y su aviso.
///
/// Arranca solo al marcar una serie como hecha, que es cuando empieza el descanso de verdad:
/// obligar a pulsar un botón aparte hace que nadie lo use a partir de la tercera serie.
///
/// Cuenta con la **hora de fin**, no restando un segundo cada segundo. Es la diferencia entre
/// que funcione y que no: al apagar la pantalla, Android frena los temporizadores, y un
/// contador que va restando se queda donde estaba. Guardando cuándo termina, al volver el
/// descanso está donde tiene que estar.
///
/// ## El aviso, y hasta dónde llega
///
/// Con la pantalla apagada suena la notificación: es lo que la versión web no podía hacer y
/// la razón de que esto sea una app de Android. El límite honesto: el aviso lo dispara un
/// temporizador **dentro de la aplicación**, así que si Android la mata del todo para
/// liberar memoria, ese aviso no llega. Con la app en segundo plano y la pantalla apagada
/// —el caso normal de un descanso de minuto y medio— sí llega.
///
/// Hacerlo a prueba de todo pediría una alarma exacta del sistema (`AlarmManager`) o un
/// servicio en primer plano con su notificación permanente. Es más código, más permisos y
/// una notificación fija en la barra durante todo el entreno; si algún día se nota que hace
/// falta, el sitio para cambiarlo es este archivo.
library;

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../motor/fechas.dart';
import 'piezas.dart';
import 'tema.dart';

/// Los avisos del sistema.
class Avisos {
  Avisos._();

  static final _plugin = FlutterLocalNotificationsPlugin();
  static var _listo = false;

  /// El canal en el que caen los avisos del descanso. Android agrupa por canal y deja al
  /// usuario silenciar sólo este si le molesta, sin apagar el resto de la aplicación.
  static const _canal = AndroidNotificationChannel(
    'descanso',
    'Descanso entre series',
    description: 'Avisa cuando acaba el descanso.',
    importance: Importance.high,
  );

  static Future<void> preparar() async {
    if (_listo) return;
    await _plugin.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
    );
    final android = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await android?.createNotificationChannel(_canal);
    _listo = true;
  }

  /// Pide permiso para avisar. En Android 13 y posteriores hace falta pedirlo, y se pide
  /// **cuando se va a usar** —al arrancar el primer descanso— y no al abrir la aplicación:
  /// un permiso pedido antes de que se entienda para qué es un permiso que se deniega.
  static Future<void> pedirPermiso() async {
    await preparar();
    final android = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await android?.requestNotificationsPermission();
  }

  static Future<void> avisarDelDescanso() async {
    await preparar();
    await _plugin.show(
      1,
      'Descanso terminado',
      'A por la siguiente serie.',
      NotificationDetails(
        android: AndroidNotificationDetails(
          _canal.id,
          _canal.name,
          channelDescription: _canal.description,
          importance: Importance.high,
          priority: Priority.high,
          // Se va sola al tocarla: no es información que haya que conservar.
          autoCancel: true,
          category: AndroidNotificationCategory.alarm,
        ),
      ),
    );
  }

  static Future<void> retirar() async {
    if (!_listo) return;
    await _plugin.cancel(1);
  }
}

/// El descanso en marcha.
class DescansoEnMarcha {
  const DescansoEnMarcha({required this.finEn, required this.total});

  final DateTime finEn;
  final Duration total;

  int get quedanSegundos {
    final s = finEn.difference(DateTime.now()).inSeconds;
    return s < 0 ? 0 : s;
  }

  DescansoEnMarcha masTiempo(Duration extra) => DescansoEnMarcha(
        // Se suma desde ahora si ya había terminado: «30 s más» cuando el contador está a
        // cero tiene que dar treinta segundos, no reanudar una cuenta vencida.
        finEn: (finEn.isBefore(DateTime.now()) ? DateTime.now() : finEn).add(extra),
        total: total + extra,
      );
}

/// La barra del descanso, fija sobre la navegación.
class BarraDeDescanso extends StatefulWidget {
  const BarraDeDescanso({
    super.key,
    required this.descanso,
    required this.onCambiar,
    required this.onCerrar,
    required this.vibrar,
    required this.avisarConPantallaApagada,
  });

  final DescansoEnMarcha descanso;
  final ValueChanged<DescansoEnMarcha> onCambiar;
  final VoidCallback onCerrar;
  final bool vibrar;
  final bool avisarConPantallaApagada;

  @override
  State<BarraDeDescanso> createState() => _BarraDeDescansoState();
}

class _BarraDeDescansoState extends State<BarraDeDescanso> {
  Timer? _reloj;
  var _yaAvisado = false;

  @override
  void initState() {
    super.initState();
    _reloj = Timer.periodic(const Duration(milliseconds: 250), (_) {
      if (mounted) setState(() {});
      _comprobarFin();
    });
  }

  @override
  void didUpdateWidget(BarraDeDescanso anterior) {
    super.didUpdateWidget(anterior);
    // Si se alarga el descanso, vuelve a poder avisar.
    if (widget.descanso.finEn != anterior.descanso.finEn) _yaAvisado = false;
  }

  void _comprobarFin() {
    if (_yaAvisado || widget.descanso.quedanSegundos > 0) return;
    _yaAvisado = true;
    if (widget.vibrar) HapticFeedback.heavyImpact();
    if (widget.avisarConPantallaApagada) Avisos.avisarDelDescanso();
  }

  @override
  void dispose() {
    _reloj?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final quedan = widget.descanso.quedanSegundos;
    final total = widget.descanso.total.inSeconds;
    final fondo = c.texto;
    final tinta = Theme.of(context).scaffoldBackgroundColor;

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: fondo,
        borderRadius: BorderRadius.circular(radio),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 16)],
      ),
      child: Row(
        children: [
          SizedBox(
            width: 66,
            child: Text(
              quedan > 0 ? formatoDuracion(quedan) : '¡Ya!',
              style: TextStyle(
                color: tinta,
                fontSize: 21,
                fontWeight: FontWeight.w800,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: total > 0 ? (quedan / total).clamp(0.0, 1.0) : 0,
                minHeight: 6,
                backgroundColor: tinta.withValues(alpha: 0.25),
                valueColor: AlwaysStoppedAnimation(tinta),
              ),
            ),
          ),
          const SizedBox(width: 10),
          TextButton(
            onPressed: () =>
                widget.onCambiar(widget.descanso.masTiempo(const Duration(seconds: 30))),
            style: TextButton.styleFrom(
              foregroundColor: tinta,
              backgroundColor: tinta.withValues(alpha: 0.18),
              minimumSize: const Size(0, 36),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            child: const Text('+30 s', style: TextStyle(fontWeight: FontWeight.w700)),
          ),
          IconButton(
            onPressed: () {
              Avisos.retirar();
              widget.onCerrar();
            },
            icon: Icon(Icons.close, color: tinta),
            tooltip: 'Saltar descanso',
          ),
        ],
      ),
    );
  }
}

/// Los descansos que se ofrecen. Se eligen con un toque en vez de escribir el número.
const descansosHabituales = [60, 90, 120, 180, 240];

String textoDeDescanso(int segundos) =>
    segundos < 120 ? '$segundos s' : '${(segundos / 60).round()} min';

/// El selector de descanso de un ejercicio.
class SelectorDeDescanso extends StatelessWidget {
  const SelectorDeDescanso({super.key, required this.segundos, required this.onCambiar});

  final int segundos;
  final ValueChanged<int> onCambiar;

  @override
  Widget build(BuildContext context) {
    return Segmentado<int>(
      opciones: [for (final s in descansosHabituales) (s, textoDeDescanso(s))],
      elegida: descansosHabituales.contains(segundos) ? segundos : 90,
      onElegir: onCambiar,
    );
  }
}
