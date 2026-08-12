import 'package:flutter/material.dart';

import 'cronometro.dart';
import 'estado.dart';
import 'tema.dart';
import 'vista_ajustes.dart';
import 'vista_ejercicios.dart';
import 'vista_entreno.dart';
import 'vista_progreso.dart';
import 'vista_resumen.dart';
import 'vista_rutinas.dart';

/// Las secciones. **No cambian nunca**, ni haya entreno en curso ni no lo haya: una barra que
/// aparece y desaparece obliga a mirarla cada vez en lugar de aprendérsela.
///
/// El orden va de dentro afuera, y en el móvil eso importa porque el pulgar llega antes a lo
/// de la izquierda:
///
///   1. Resumen: cómo va la semana. Es a lo que se entra veinte veces al día.
///   2. Entrenar: el entreno de ahora mismo y el historial.
///   3. Ejercicios y Rutinas: el material con el que se construye un entreno.
///   4. Progreso: lo que se mira sentado, una vez por semana.
///   5. Ajustes: lo que se toca una vez.
enum Seccion {
  resumen('Resumen', Icons.dashboard_outlined, Icons.dashboard),
  entrenar('Entrenar', Icons.fitness_center_outlined, Icons.fitness_center),
  ejercicios('Ejercicios', Icons.list_alt_outlined, Icons.list_alt),
  rutinas('Rutinas', Icons.calendar_month_outlined, Icons.calendar_month),
  progreso('Progreso', Icons.show_chart_outlined, Icons.show_chart),
  ajustes('Ajustes', Icons.settings_outlined, Icons.settings);

  const Seccion(this.texto, this.icono, this.iconoMarcado);
  final String texto;
  final IconData icono;
  final IconData iconoMarcado;
}

class App extends StatefulWidget {
  const App({super.key, required this.estado});

  final Estado estado;

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  @override
  Widget build(BuildContext context) {
    return ProveedorDeEstado(
      estado: widget.estado,
      // El tema se lee del estado, así que la aplicación se reconstruye al cambiarlo.
      child: AnimatedBuilder(
        animation: widget.estado,
        builder: (contexto, _) => MaterialApp(
          title: 'FitLog',
          debugShowCheckedModeBanner: false,
          theme: temaDatosDe(widget.estado.ajustes.tema),
          home: const _Marco(),
        ),
      ),
    );
  }
}

class _Marco extends StatefulWidget {
  const _Marco();

  @override
  State<_Marco> createState() => _MarcoState();
}

class _MarcoState extends State<_Marco> {
  var _seccion = Seccion.resumen;
  DescansoEnMarcha? _descanso;

  void _empezarDescanso(int segundos) {
    if (segundos <= 0) return;
    setState(() {
      _descanso = DescansoEnMarcha(
        finEn: DateTime.now().add(Duration(seconds: segundos)),
        total: Duration(seconds: segundos),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);

    if (estado.cargando) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final saludo = estado.ajustes.nombre != null && estado.ajustes.nombre!.isNotEmpty
        ? 'Hola, ${estado.ajustes.nombre}'
        : 'FitLog';

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(saludo),
            Text(
              'Entrenos y progreso',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: c.textoDebil),
            ),
          ],
        ),
        actions: [
          if (estado.enCurso != null && _seccion != Seccion.entrenar)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: FilledButton(
                onPressed: () => setState(() => _seccion = Seccion.entrenar),
                style: FilledButton.styleFrom(
                  minimumSize: const Size(0, 34),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
                child: const Text('Entreno en curso'),
              ),
            ),
        ],
      ),
      body: switch (_seccion) {
        Seccion.resumen => VistaResumen(
            onIrAEntrenar: () => setState(() => _seccion = Seccion.entrenar),
          ),
        Seccion.entrenar => VistaEntreno(onDescansar: _empezarDescanso),
        Seccion.ejercicios => const VistaEjercicios(),
        Seccion.rutinas => const VistaRutinas(),
        Seccion.progreso => const VistaProgreso(),
        Seccion.ajustes => const VistaAjustes(),
      },
      // El botón de empezar sólo aparece donde tiene sentido: si ya hay entreno en curso, o
      // si estás en la pantalla de entrenar, sería un botón que no hace nada nuevo.
      floatingActionButton: estado.enCurso == null &&
              _seccion != Seccion.entrenar &&
              _seccion != Seccion.ajustes
          ? FloatingActionButton.extended(
              onPressed: () => setState(() => _seccion = Seccion.entrenar),
              icon: const Icon(Icons.fitness_center),
              label: const Text('Entrenar'),
            )
          : null,
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_descanso != null)
            BarraDeDescanso(
              descanso: _descanso!,
              vibrar: estado.ajustes.avisoDescanso,
              avisarConPantallaApagada: estado.ajustes.avisoConPantallaApagada,
              onCambiar: (nuevo) => setState(() => _descanso = nuevo),
              onCerrar: () => setState(() => _descanso = null),
            ),
          NavigationBar(
            selectedIndex: _seccion.index,
            onDestinationSelected: (i) => setState(() => _seccion = Seccion.values[i]),
            destinations: [
              for (final s in Seccion.values)
                NavigationDestination(
                  icon: Icon(s.icono),
                  selectedIcon: Icon(s.iconoMarcado),
                  label: s.texto,
                ),
            ],
          ),
        ],
      ),
    );
  }
}
