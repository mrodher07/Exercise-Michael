/// Entrenar: el entreno en curso y el historial.
///
/// Es la pantalla que se usa **de pie, con una mano y con prisa**, entre series, y eso manda
/// en todo lo de aquí:
///
///  · Apuntar una serie son dos números y un toque. Nada de abrir un diálogo por serie.
///  · Debajo de cada ejercicio se ve **lo que se hizo la última vez**. Es lo primero que se
///    mira para decidir si hoy toca subir, y tenerlo delante evita el viaje al historial.
///  · Marcar la serie como hecha arranca el descanso solo.
///  · No hay botón de guardar. Se guarda al escribir, con un retardo pequeño, porque un
///    entreno perdido por no darle a guardar no se recupera.
library;

import 'package:flutter/material.dart';

import '../almacen/almacen.dart';
import '../datos/ejercicios.dart';
import '../motor/entreno.dart';
import '../motor/fechas.dart';
import 'cronometro.dart';
import 'estado.dart';
import 'piezas.dart';
import 'selector.dart';
import 'tecnica.dart';
import 'tema.dart';

class VistaEntreno extends StatelessWidget {
  const VistaEntreno({super.key, required this.onDescansar});

  final void Function(int segundos) onDescansar;

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final enCurso = estado.enCurso;
    return enCurso == null
        ? const _SinEntreno()
        : _EnCurso(entreno: enCurso, onDescansar: onDescansar);
  }
}

// ─────────────────────── Sin entreno: empezar o repasar ───────────────────────

class _SinEntreno extends StatelessWidget {
  const _SinEntreno();

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);
    final hechos = estado.entrenosHechos;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        const TituloDeSeccion('Empezar'),
        Panel(
          hijo: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              FilledButton.icon(
                onPressed: () => estado.empezarEntreno(),
                icon: const Icon(Icons.play_arrow),
                label: const Text('Entreno libre'),
                style: FilledButton.styleFrom(minimumSize: const Size(0, 52)),
              ),
              const SizedBox(height: 10),
              Text(
                'Sin plan: se van añadiendo ejercicios sobre la marcha. Para seguir una '
                'rutina, elige uno de sus días.',
                style: TextStyle(fontSize: 12.5, color: c.textoDebil, height: 1.45),
              ),
            ],
          ),
        ),
        for (final rutina in estado.rutinas) ...[
          const SizedBox(height: 12),
          PanelPlegable(
            titulo: Text(rutina.nombre),
            resumen: contar(rutina.dias.length, 'día', 'días', 'vacía'),
            abierto: rutina.favorita,
            hijo: Column(
              children: [
                for (final dia in rutina.dias)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: OutlinedButton(
                      onPressed: () => estado.empezarEntreno(
                        nombre: '${rutina.nombre} · ${dia.nombre}',
                        rutina: rutina,
                        dia: dia,
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.play_arrow, size: 18),
                          const SizedBox(width: 8),
                          Expanded(child: Text(dia.nombre)),
                          Text(
                            contar(dia.ejercicios.length, 'ejercicio', 'ejercicios', 'vacío'),
                            style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 8),
        TituloDeSeccion('Historial · ${contar(hechos.length, 'entreno', 'entrenos', 'ninguno')}'),
        if (hechos.isEmpty)
          const Panel(
            hijo: Vacio(
              icono: Icons.fitness_center,
              titulo: 'Todavía no hay entrenos',
              texto: 'Dale a «Entreno libre» y añade el primer ejercicio. Lo que apuntes hoy '
                  'es con lo que se comparará lo de la semana que viene.',
            ),
          )
        else
          ListaEnPanel(
            filas: [
              for (final entreno in hechos.take(40))
                FilaDeLista(
                  icono: Icons.fitness_center,
                  iconoAcento: true,
                  nombre: entreno.nombre,
                  meta: [
                    fechaRelativa(entreno.fecha),
                    contar(entreno.seriesHechas, 'serie', 'series'),
                    duracionLarga(entreno.duracionEnSegundos),
                    if (entreno.lugar != null && entreno.lugar!.isNotEmpty) entreno.lugar!,
                  ].join(' · '),
                  valor: volumenCorto(entreno.volumen),
                  onPulsar: () => _abrirDetalle(context, entreno),
                ),
            ],
          ),
      ],
    );
  }

  void _abrirDetalle(BuildContext context, Entreno entreno) {
    final estado = ProveedorDeEstado.leer(context);
    abrirHoja(
      context,
      titulo: entreno.nombre,
      contenido: (contexto) => _DetalleDeEntreno(entreno: entreno, estado: estado),
    );
  }
}

class _DetalleDeEntreno extends StatelessWidget {
  const _DetalleDeEntreno({required this.entreno, required this.estado});

  final Entreno entreno;
  final Estado estado;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          [
            '${fechaRelativa(entreno.fecha)} a las ${horaDe(entreno.comienzo)}',
            duracionLarga(entreno.duracionEnSegundos),
            if (entreno.lugar != null && entreno.lugar!.isNotEmpty) entreno.lugar!,
          ].join(' · '),
          style: TextStyle(fontSize: 12.5, color: c.textoDebil),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: Cifra(etiqueta: 'Series', valor: '${entreno.seriesHechas}')),
            const SizedBox(width: 10),
            Expanded(child: Cifra(etiqueta: 'Volumen', valor: volumenCorto(entreno.volumen))),
            const SizedBox(width: 10),
            Expanded(
              child: Cifra(etiqueta: 'Ejercicios', valor: '${entreno.ejercicios.length}'),
            ),
          ],
        ),
        if (entreno.notas != null && entreno.notas!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(entreno.notas!, style: TextStyle(color: c.textoTenue, height: 1.45)),
        ],
        const SizedBox(height: 12),
        for (final linea in entreno.ejercicios) ...[
          Panel(
            apagado: true,
            hijo: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  estado.nombreDeEjercicio(linea.ejercicioId),
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                if (linea.series.where((s) => s.hecha).isEmpty)
                  Text(
                    'Ninguna serie marcada.',
                    style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                  )
                else
                  for (final (i, s) in linea.series.where((s) => s.hecha).indexed)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Text(
                        '${s.tipo == TipoDeSerie.calentamiento ? 'Calent.' : '${i + 1}'}  '
                        '${s.peso != null ? '${kilos(s.peso!)} kg' : '—'}'
                        '${s.reps != null ? ' × ${s.reps}' : ''}'
                        '${s.segundos != null ? ' · ${s.segundos} s' : ''}'
                        '${s.rpe != null ? ' · RPE ${s.rpe}' : ''}',
                        style: TextStyle(fontSize: 13, color: c.textoTenue),
                      ),
                    ),
                if (linea.notas != null && linea.notas!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(linea.notas!, style: TextStyle(fontSize: 12.5, color: c.textoDebil)),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
        FilledButton.icon(
          onPressed: () => guardarComoRutina(context, estado, entreno),
          icon: const Icon(Icons.event_repeat),
          label: const Text('Guardar como rutina'),
          style: FilledButton.styleFrom(minimumSize: const Size(0, 48)),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () async {
            final seguro = await confirmar(
              context,
              titulo: 'Borrar entreno',
              texto: 'Se borra todo lo apuntado en este entreno y no se puede recuperar.',
            );
            if (!seguro || !context.mounted) return;
            estado.borrarEntreno(entreno);
            Navigator.of(context).pop();
          },
          icon: const Icon(Icons.delete_outline),
          label: const Text('Borrar entreno'),
          style: OutlinedButton.styleFrom(foregroundColor: c.malo),
        ),
      ],
    );
  }
}

// ─────────────────────── En curso ───────────────────────

class _EnCurso extends StatelessWidget {
  const _EnCurso({required this.entreno, required this.onDescansar});

  final Entreno entreno;
  final void Function(int) onDescansar;

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
      children: [
        const TituloDeSeccion('En curso'),
        Panel(
          hijo: Column(
            children: [
              TextFormField(
                initialValue: entreno.nombre,
                decoration: const InputDecoration(labelText: 'Nombre del entreno'),
                onChanged: (texto) {
                  entreno.nombre = texto;
                  estado.entrenoTocado(entreno);
                },
              ),
              const SizedBox(height: 10),
              _DondeSeEntrena(entreno: entreno),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _RelojDelEntreno(comienzo: entreno.comienzo)),
                  const SizedBox(width: 10),
                  Expanded(child: Cifra(etiqueta: 'Series', valor: '${entreno.seriesHechas}')),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Cifra(etiqueta: 'Volumen', valor: volumenCorto(entreno.volumen)),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (entreno.ejercicios.isEmpty)
          Panel(
            hijo: Vacio(
              icono: Icons.fitness_center,
              titulo: 'Sin ejercicios',
              texto: 'Busca por grupo muscular o por la máquina que tengas libre.',
              accion: FilledButton.icon(
                onPressed: () => _anadir(context),
                icon: const Icon(Icons.add),
                label: const Text('Añadir ejercicios'),
              ),
            ),
          ),
        for (final (indice, linea) in entreno.ejercicios.indexed)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _LineaDeEjercicio(
              key: ValueKey(linea.id),
              entreno: entreno,
              linea: linea,
              indice: indice,
              onDescansar: onDescansar,
            ),
          ),
        if (entreno.ejercicios.isNotEmpty) ...[
          OutlinedButton.icon(
            onPressed: () => _anadir(context),
            icon: const Icon(Icons.add),
            label: const Text('Añadir ejercicio'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            initialValue: entreno.notas ?? '',
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Notas del entreno',
              hintText: 'Cómo ha ido, molestias, lo que sea.',
            ),
            onChanged: (texto) {
              entreno.notas = texto;
              estado.entrenoTocado(entreno);
            },
          ),
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: () => _terminar(context),
            icon: const Icon(Icons.flag_outlined),
            label: const Text('Terminar entreno'),
            style: FilledButton.styleFrom(minimumSize: const Size(0, 52)),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () async {
              final seguro = await confirmar(
                context,
                titulo: 'Descartar entreno',
                texto: 'Se borra todo lo apuntado y no se puede recuperar.',
                si: 'Sí, descartar',
                no: 'No, seguir',
              );
              if (!seguro || !context.mounted) return;
              estado.borrarEntreno(entreno);
              avisar(context, 'Entreno descartado');
            },
            style: TextButton.styleFrom(foregroundColor: c.malo),
            child: const Text('Descartar'),
          ),
        ],
      ],
    );
  }

  Future<void> _anadir(BuildContext context) async {
    final estado = ProveedorDeEstado.leer(context);
    final elegidos = await elegirEjercicios(context, catalogo: estado.catalogo);
    if (elegidos == null || elegidos.isEmpty) return;
    entreno.ejercicios = [
      ...entreno.ejercicios,
      for (final e in elegidos)
        EjercicioDelEntreno(
          id: nuevoId(),
          ejercicioId: e.id,
          descanso: estado.ajustes.descansoPorDefecto,
          series: [SerieRegistrada()],
        ),
    ];
    estado.entrenoTocado(entreno);
  }

  Future<void> _terminar(BuildContext context) async {
    final estado = ProveedorDeEstado.leer(context);
    final sinMarcar = entreno.ejercicios.any((l) => l.series.every((s) => !s.hecha));

    final confirmado = await showDialog<bool>(
      context: context,
      builder: (contexto) => AlertDialog(
        title: const Text('Terminar entreno'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${contar(entreno.seriesHechas, 'serie hecha', 'series hechas')} y '
              '${volumenCorto(entreno.volumen)} de volumen en '
              '${duracionLarga(entreno.duracionEnSegundos)}.',
            ),
            if (sinMarcar) ...[
              const SizedBox(height: 12),
              const Aviso(
                'Hay ejercicios sin ninguna serie marcada. Se guardan igual, pero no cuentan '
                'para el volumen ni para los récords.',
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(contexto, false),
            child: const Text('Seguir entrenando'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(contexto, true),
            child: const Text('Terminar'),
          ),
        ],
      ),
    );

    if (confirmado != true || !context.mounted) return;

    // El contexto para después: al terminar el entreno esta pantalla se sustituye por la de
    // «sin entreno», así que su contexto deja de estar montado y no sirve para abrir nada. El
    // del navegador vive lo que viva la aplicación.
    final contextoDurable = Navigator.of(context).context;

    // Ofrecer guardarlo como rutina aquí y no sólo en el historial: es el momento exacto en
    // que uno piensa «esto lo repito», y media hora después ya no vuelve a buscarlo.
    final ofrecerRutina = entreno.rutinaId == null && entreno.ejercicios.isNotEmpty;
    void guardar() => guardarComoRutina(contextoDurable, estado, entreno);

    final batidos = estado.terminarEntreno(entreno);
    if (batidos.isEmpty) {
      avisar(
        context,
        'Entreno guardado · ${contar(entreno.seriesHechas, 'serie', 'series')}',
        accion: ofrecerRutina ? 'Guardar como rutina' : null,
        onAccion: ofrecerRutina ? guardar : null,
      );
    } else {
      final primero = estado.nombreDeEjercicio(batidos.first.ejercicioId);
      avisar(
        context,
        batidos.length == 1
            ? '¡Récord en $primero!'
            : '¡${batidos.length} récords, empezando por $primero!',
        accion: ofrecerRutina ? 'Guardar como rutina' : null,
        onAccion: ofrecerRutina ? guardar : null,
      );
    }
  }
}

/// Dónde se está entrenando.
///
/// Tres propuestas fijas —gimnasio, casa, aire libre— más los sitios que ya se hayan escrito
/// antes, y la posibilidad de escribir otro. Un toque y ya está: si hubiera que teclearlo cada
/// vez, a la tercera sesión nadie lo rellena y el dato acaba siendo inútil.
///
/// Se propone solo el del último entreno, porque lo normal es entrenar donde se entrenó ayer.
class _DondeSeEntrena extends StatelessWidget {
  const _DondeSeEntrena({required this.entreno});

  final Entreno entreno;

  static const _propuestas = ['Gimnasio', 'Casa', 'Aire libre'];

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);

    final usados = lugaresUsados(estado.entrenosHechos);
    final opciones = [
      ..._propuestas,
      for (final lugar in usados)
        if (!_propuestas.any((p) => p.toLowerCase() == lugar.toLowerCase())) lugar,
    ];
    final actual = entreno.lugar?.trim() ?? '';

    void poner(String? lugar) {
      entreno.lugar = lugar;
      estado.entrenoTocado(entreno);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'DÓNDE',
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
            color: c.textoDebil,
          ),
        ),
        const SizedBox(height: 6),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            for (final opcion in opciones)
              ChoiceChip(
                label: Text(opcion),
                selected: actual.toLowerCase() == opcion.toLowerCase(),
                // Volver a tocar el sitio elegido lo quita: apuntarlo es opcional y hay que
                // poder deshacerlo sin buscar una papelera.
                onSelected: (marcado) => poner(marcado ? opcion : null),
              ),
            ActionChip(
              avatar: const Icon(Icons.edit_outlined, size: 16),
              label: Text(
                actual.isNotEmpty && !opciones.any((o) => o.toLowerCase() == actual.toLowerCase())
                    ? actual
                    : 'Otro',
              ),
              onPressed: () => _escribirLugar(context, entreno, poner),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _escribirLugar(
    BuildContext context,
    Entreno entreno,
    void Function(String?) poner,
  ) async {
    final control = TextEditingController(text: entreno.lugar ?? '');
    final escrito = await showDialog<String>(
      context: context,
      builder: (contexto) => AlertDialog(
        title: const Text('Dónde entrenas'),
        content: TextField(
          controller: control,
          autofocus: true,
          textCapitalization: TextCapitalization.sentences,
          decoration: const InputDecoration(
            labelText: 'Sitio',
            hintText: 'Gimnasio de la uni, parque, hotel...',
          ),
          onSubmitted: (texto) => Navigator.pop(contexto, texto),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(contexto),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(contexto, control.text),
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
    control.dispose();
    if (escrito == null) return;
    final limpio = escrito.trim();
    poner(limpio.isEmpty ? null : limpio);
  }
}

/// El tiempo que lleva el entreno. Va en su propio widget para que su latido de cada segundo
/// no repinte la pantalla entera.
class _RelojDelEntreno extends StatefulWidget {
  const _RelojDelEntreno({required this.comienzo});

  final DateTime comienzo;

  @override
  State<_RelojDelEntreno> createState() => _RelojDelEntrenoState();
}

class _RelojDelEntrenoState extends State<_RelojDelEntreno> {
  late final Stream<void> _latido = Stream.periodic(const Duration(seconds: 1));

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<void>(
      stream: _latido,
      builder: (contexto, _) => Cifra(
        etiqueta: 'Tiempo',
        valor: formatoDuracion(segundosEntre(widget.comienzo, null)),
      ),
    );
  }
}

/// Los dos huecos que se piden por serie según cómo se mida el ejercicio.
///
/// Una plancha no tiene repeticiones y la cinta no tiene peso: pedir siempre «kg» y «reps»
/// obligaría a escribir ceros en la mitad de los huecos, y esos ceros luego cuentan como
/// datos y estropean las medias.
enum _Hueco { peso, reps, segundos, distancia, calorias }

/// Qué huecos se pintan en cada serie.
///
/// Como mucho tres, y el tercero sólo lo tiene el cardio: en una pantalla de móvil no caben
/// más campos sin que cada uno quede demasiado estrecho para escribir con el pulgar. Cuando
/// hay tres, el RPE deja su sitio a las calorías; en una cinta uno apunta lo que marca la
/// máquina, no su esfuerzo percibido.
List<({_Hueco cual, String pista})> _huecosDe(FormaDeMedir medida, {bool cardio = false}) {
  final huecos = <({_Hueco cual, String pista})>[];
  if (medida.pideDistancia) huecos.add((cual: _Hueco.distancia, pista: 'km'));
  if (medida.pidePeso) huecos.add((cual: _Hueco.peso, pista: 'kg'));
  // Con peso corporal el hueco de peso sigue estando, pero lo que se apunta ahí es el
  // lastre: el cinturón con discos de las dominadas, no lo que pesas tú.
  if (medida == FormaDeMedir.reps) huecos.add((cual: _Hueco.peso, pista: 'lastre'));
  if (medida.pideReps) huecos.add((cual: _Hueco.reps, pista: 'reps'));
  if (medida.pideTiempo) {
    huecos.add((
      cual: _Hueco.segundos,
      pista: medida == FormaDeMedir.distanciaTiempo ? 'min' : 'seg',
    ));
  }
  if (cardio) huecos.add((cual: _Hueco.calorias, pista: 'kcal'));
  return huecos.take(3).toList();
}

/// El orden en el que rota el tipo de serie al tocar su número.
const _tipos = TipoDeSerie.values;

class _LineaDeEjercicio extends StatelessWidget {
  const _LineaDeEjercicio({
    super.key,
    required this.entreno,
    required this.linea,
    required this.indice,
    required this.onDescansar,
  });

  final Entreno entreno;
  final EjercicioDelEntreno linea;
  final int indice;
  final void Function(int) onDescansar;

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);
    final ejercicio = estado.ejercicioPorId(linea.ejercicioId);
    final medida = ejercicio?.medida ?? FormaDeMedir.pesoReps;
    final cardio = ejercicio?.grupo == Grupo.cardio;
    final huecos = _huecosDe(medida, cardio: cardio);
    final ultima = ultimaVezDe(estado.entrenos, linea.ejercicioId, excluir: entreno.id);
    final mejor = mejorSerie(linea.series, entreno.fecha);

    return Panel(
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ejercicio?.nombre ?? linea.ejercicioId,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                    Text(
                      ejercicio == null
                          ? 'Ejercicio no encontrado'
                          : [
                              ejercicio.grupo.texto,
                              ejercicio.equipo.texto,
                              if (ejercicio.unilateral) 'por lado',
                            ].join(' · '),
                      style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                    ),
                  ],
                ),
              ),
              if (indice > 0)
                IconButton(
                  tooltip: 'Subir en la lista',
                  icon: const Icon(Icons.arrow_upward, size: 20),
                  onPressed: () {
                    final orden = [...entreno.ejercicios];
                    final movido = orden.removeAt(indice);
                    orden.insert(indice - 1, movido);
                    entreno.ejercicios = orden;
                    estado.entrenoTocado(entreno);
                  },
                ),
              // Cómo se hace, a un toque y sin salir del entreno: es la pregunta que aparece
              // delante de una máquina que no se toca desde hace tres meses.
              if (ejercicio != null)
                IconButton(
                  tooltip: 'Cómo se hace',
                  icon: const Icon(Icons.help_outline, size: 20),
                  onPressed: () => abrirHoja(
                    context,
                    titulo: ejercicio.nombre,
                    contenido: (_) => PanelDeTecnica(ejercicio: ejercicio, abierto: true),
                  ),
                ),
              IconButton(
                tooltip: 'Ajustes del ejercicio',
                icon: const Icon(Icons.tune, size: 20),
                onPressed: () => _abrirAjustes(context, estado, ejercicio),
              ),
            ],
          ),
          if (ultima != null)
            Padding(
              padding: const EdgeInsets.only(top: 2, bottom: 6),
              child: Row(
                children: [
                  Icon(Icons.history, size: 14, color: c.textoDebil),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      '${fechaRelativa(ultima.fecha)}: '
                      '${ultima.series.take(4).map(_resumenDeSerie).join(' · ')}',
                      style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 4),
          _CabeceraDeSeries(huecos: huecos),
          for (final (i, serie) in linea.series.indexed)
            _FilaDeSerie(
              entreno: entreno,
              linea: linea,
              serie: serie,
              posicion: i,
              huecos: huecos,
              medida: medida,
              onDescansar: onDescansar,
            ),
          const SizedBox(height: 8),
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: () {
                  // Copia la última serie: repetir peso y reps es lo normal, y así es un toque.
                  final anterior = linea.series.lastWhere(
                    (s) => s.tipo != TipoDeSerie.calentamiento,
                    orElse: () => SerieRegistrada(),
                  );
                  linea.series = [
                    ...linea.series,
                    SerieRegistrada(
                      peso: anterior.peso,
                      reps: anterior.reps,
                      segundos: anterior.segundos,
                      distancia: anterior.distancia,
                    ),
                  ];
                  estado.entrenoTocado(entreno);
                },
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Serie'),
                style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
              ),
              if (linea.series.length > 1) ...[
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () {
                    linea.series = linea.series.sublist(0, linea.series.length - 1);
                    estado.entrenoTocado(entreno);
                  },
                  child: const Text('Quitar última'),
                ),
              ],
              const Spacer(),
              // En cardio, el ritmo y la velocidad se calculan de los kilómetros y el tiempo.
              // Pedirlos como un campo más sería pedir un número que ya está apuntado, y uno
              // más que rellenar entre jadeos.
              if (cardio) ...[
                for (final serie in linea.series.where((x) => x.cuenta).take(1)) ...[
                  if (velocidadDe(serie) != null)
                    EtiquetaPill('${cifra(velocidadDe(serie)!, 1)} km/h'),
                  if (ritmoDe(serie) != null) ...[
                    const SizedBox(width: 6),
                    EtiquetaPill('${ritmoDe(serie)} /km'),
                  ],
                ],
              ] else if (mejor != null)
                EtiquetaPill(
                  '${kilos(mejor.peso)}×${mejor.reps}'
                  '${mejor.estimado != null ? ' · ~${kilos(mejor.estimado!)}' : ''}',
                ),
            ],
          ),
        ],
      ),
    );
  }

  static String _resumenDeSerie(SerieRegistrada s) {
    if (s.peso != null && s.reps != null) return '${kilos(s.peso!)}×${s.reps}';
    if (s.reps != null) return '${s.reps} reps';
    // El cardio se lee en kilómetros y minutos, no en segundos: «1.800 s» no le dice nada a
    // nadie que acabe de bajarse de la cinta.
    if (s.distancia != null && s.segundos != null) {
      return '${kilos(s.distancia!)} km · ${duracionCorta(s.segundos!)}';
    }
    if (s.distancia != null) return '${kilos(s.distancia!)} km';
    if (s.segundos != null) return duracionCorta(s.segundos!);
    return '—';
  }

  void _abrirAjustes(BuildContext context, Estado estado, Ejercicio? ejercicio) {
    abrirHoja(
      context,
      titulo: ejercicio?.nombre ?? 'Ejercicio',
      contenido: (contexto) => StatefulBuilder(
        builder: (contexto, repintar) => Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Descanso entre series',
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: ColoresFitLog.de(contexto).textoTenue,
              ),
            ),
            const SizedBox(height: 6),
            SelectorDeDescanso(
              segundos: linea.descanso,
              onCambiar: (segundos) {
                linea.descanso = segundos;
                estado.entrenoTocado(entreno);
                repintar(() {});
              },
            ),
            const SizedBox(height: 6),
            Text(
              'Se pone en marcha al marcar una serie como hecha.',
              style: TextStyle(fontSize: 12.5, color: ColoresFitLog.de(contexto).textoDebil),
            ),
            const SizedBox(height: 16),
            TextFormField(
              initialValue: linea.notas ?? '',
              minLines: 2,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Notas del ejercicio',
                hintText: 'Altura del asiento, agarre, molestias…',
              ),
              onChanged: (texto) {
                linea.notas = texto;
                estado.entrenoTocado(entreno);
              },
            ),
            const SizedBox(height: 12),
            Text(
              'Toca el número de una serie para cambiar su tipo: normal, calentamiento, al '
              'fallo o descendente. El calentamiento no cuenta para el volumen.',
              style: TextStyle(
                fontSize: 12.5,
                height: 1.45,
                color: ColoresFitLog.de(contexto).textoDebil,
              ),
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () {
                entreno.ejercicios =
                    entreno.ejercicios.where((l) => l.id != linea.id).toList();
                estado.entrenoTocado(entreno);
                Navigator.of(contexto).pop();
              },
              icon: const Icon(Icons.delete_outline),
              label: const Text('Quitar del entreno'),
              style: OutlinedButton.styleFrom(
                foregroundColor: ColoresFitLog.de(contexto).malo,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CabeceraDeSeries extends StatelessWidget {
  const _CabeceraDeSeries({required this.huecos});

  final List<({_Hueco cual, String pista})> huecos;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    Widget etiqueta(String texto, {double? ancho, bool expandir = false}) {
      final hijo = Text(
        texto.toUpperCase(),
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
          color: c.textoDebil,
        ),
      );
      if (expandir) return Expanded(child: hijo);
      return SizedBox(width: ancho, child: hijo);
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          etiqueta('#', ancho: 30),
          for (final hueco in huecos) ...[
            const SizedBox(width: 6),
            etiqueta(hueco.pista, expandir: true),
          ],
          if (huecos.length < 2) const Expanded(child: SizedBox.shrink()),
          if (huecos.length < 3) ...[
            const SizedBox(width: 6),
            etiqueta('RPE', ancho: 52),
          ],
          const SizedBox(width: 6),
          const SizedBox(width: 44),
        ],
      ),
    );
  }
}

class _FilaDeSerie extends StatelessWidget {
  const _FilaDeSerie({
    required this.entreno,
    required this.linea,
    required this.serie,
    required this.posicion,
    required this.huecos,
    required this.medida,
    required this.onDescansar,
  });

  final Entreno entreno;
  final EjercicioDelEntreno linea;
  final SerieRegistrada serie;
  final int posicion;
  final List<({_Hueco cual, String pista})> huecos;
  final FormaDeMedir medida;
  final void Function(int) onDescansar;

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);

    // El número de la serie no cuenta los calentamientos: la «primera serie» es la primera
    // que va en serio, que es la que se compara con la semana pasada.
    final numero = linea.series
        .take(posicion + 1)
        .where((s) => s.tipo != TipoDeSerie.calentamiento)
        .length;

    final etiquetaNumero = switch (serie.tipo) {
      TipoDeSerie.calentamiento => 'C',
      TipoDeSerie.fallo => 'F',
      TipoDeSerie.descendente => 'D',
      TipoDeSerie.normal => '$numero',
    };

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(
            width: 30,
            child: Tooltip(
              message: serie.tipo.nombre,
              child: InkWell(
                onTap: () {
                  serie.tipo = _tipos[(_tipos.indexOf(serie.tipo) + 1) % _tipos.length];
                  estado.entrenoTocado(entreno);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Text(
                    etiquetaNumero,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      color: serie.tipo == TipoDeSerie.calentamiento ? c.aviso : c.textoDebil,
                    ),
                  ),
                ),
              ),
            ),
          ),
          for (final hueco in huecos) ...[
            const SizedBox(width: 6),
            Expanded(child: _campo(hueco, estado)),
          ],
          if (huecos.length < 2) const Expanded(child: SizedBox.shrink()),
          if (huecos.length < 3) ...[
            const SizedBox(width: 6),
            SizedBox(
              width: 52,
              child: CampoNumero(
                valor: serie.rpe,
                pista: '–',
                decimal: false,
                onCambiar: (v) {
                  serie.rpe = v?.toInt();
                  estado.entrenoTocado(entreno);
                },
              ),
            ),
          ],
          const SizedBox(width: 6),
          SizedBox(
            width: 44,
            height: 46,
            child: Semantics(
              label: 'Marcar la serie $numero como hecha',
              child: Material(
                color: serie.hecha ? c.bueno : c.panel,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(radioXs),
                  side: BorderSide(color: serie.hecha ? Colors.transparent : c.bordeFuerte),
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(radioXs),
                  onTap: () {
                    final hecha = !serie.hecha;
                    serie.hecha = hecha;
                    estado.entrenoTocado(entreno);
                    // El descanso empieza al marcar, no antes: es cuando de verdad empieza.
                    // Y no se arranca al desmarcar, que suele ser una corrección.
                    if (hecha && serie.tipo != TipoDeSerie.calentamiento) {
                      onDescansar(linea.descanso);
                    }
                  },
                  child: Icon(
                    Icons.check,
                    size: 20,
                    color: serie.hecha ? Colors.white : c.textoDebil,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _campo(({_Hueco cual, String pista}) hueco, Estado estado) {
    // El cardio se apunta en minutos porque nadie cuenta media hora en segundos; por dentro
    // se guardan segundos, como en todo lo demás.
    final enMinutos = hueco.cual == _Hueco.segundos && medida == FormaDeMedir.distanciaTiempo;

    final valor = switch (hueco.cual) {
      _Hueco.peso => serie.peso,
      _Hueco.reps => serie.reps,
      _Hueco.segundos => enMinutos
          ? (serie.segundos == null ? null : (serie.segundos! / 60).round())
          : serie.segundos,
      _Hueco.distancia => serie.distancia,
      _Hueco.calorias => serie.calorias,
    };

    return CampoNumero(
      valor: valor,
      pista: hueco.pista,
      decimal: hueco.cual == _Hueco.peso || hueco.cual == _Hueco.distancia,
      onCambiar: (v) {
        switch (hueco.cual) {
          case _Hueco.peso:
            serie.peso = v?.toDouble();
          case _Hueco.reps:
            serie.reps = v?.toInt();
          case _Hueco.segundos:
            serie.segundos = v == null ? null : (enMinutos ? (v * 60).round() : v.toInt());
          case _Hueco.distancia:
            serie.distancia = v?.toDouble();
          case _Hueco.calorias:
            serie.calorias = v?.toInt();
        }
        estado.entrenoTocado(entreno);
      },
    );
  }
}

// ─────────────────── Guardar un entreno como rutina ───────────────────

/// Abre la hoja para convertir un entreno en rutina.
///
/// Existe porque las rutinas buenas casi nunca se escriben: se entrenan. Uno entra sin plan,
/// va tirando de lo que hay libre y al terminar piensa «esto lo repito el jueves». Copiarlo a
/// mano son seis formularios, así que no se copia y se pierde.
Future<void> guardarComoRutina(BuildContext context, Estado estado, Entreno entreno) async {
  final hecho = await abrirHoja<String>(
    context,
    titulo: 'Guardar como rutina',
    contenido: (_) => _GuardarComoRutina(entreno: entreno, estado: estado),
  );
  if (hecho != null && context.mounted) avisar(context, hecho);
}

class _GuardarComoRutina extends StatefulWidget {
  const _GuardarComoRutina({required this.entreno, required this.estado});

  final Entreno entreno;
  final Estado estado;

  @override
  State<_GuardarComoRutina> createState() => _GuardarComoRutinaState();
}

class _GuardarComoRutinaState extends State<_GuardarComoRutina> {
  late final TextEditingController _nombre =
      TextEditingController(text: widget.entreno.nombre);

  @override
  void dispose() {
    _nombre.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final estado = widget.estado;
    final vistaPrevia = diaDesdeEntreno(widget.entreno);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Antes de decidir, qué es exactamente lo que se va a guardar. Sin esto hay que
        // guardarlo, ir a Rutinas y comprobar si ha salido lo que uno esperaba.
        Panel(
          apagado: true,
          hijo: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Se copia lo que hiciste: las series que marcaste, sin calentamientos, con su '
                'rango de repeticiones y el peso más alto de cada ejercicio.',
                style: TextStyle(fontSize: 12.5, height: 1.45, color: c.textoDebil),
              ),
              const SizedBox(height: 10),
              for (final plantilla in vistaPrevia.ejercicios)
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          estado.nombreDeEjercicio(plantilla.ejercicioId),
                          style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${plantilla.series}×${plantilla.reps}'
                        '${plantilla.peso == null ? '' : ' · ${kilos(plantilla.peso!)} kg'}',
                        style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                      ),
                    ],
                  ),
                ),
              if (vistaPrevia.ejercicios.isEmpty)
                Text(
                  'Este entreno no tiene ejercicios, así que la rutina saldría vacía.',
                  style: TextStyle(fontSize: 12.5, color: c.aviso),
                ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _nombre,
          decoration: const InputDecoration(
            labelText: 'Nombre',
            helperText: 'El de la rutina nueva, o el del día que se añade a una que ya tienes.',
          ),
          textCapitalization: TextCapitalization.sentences,
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: () {
            final rutina = estado.crearRutinaDesdeEntreno(widget.entreno, nombre: _nombreElegido);
            Navigator.of(context).pop('Rutina «${rutina.nombre}» creada');
          },
          icon: const Icon(Icons.add),
          label: const Text('Crear una rutina nueva'),
          style: FilledButton.styleFrom(minimumSize: const Size(0, 48)),
        ),
        if (estado.rutinas.isNotEmpty) ...[
          const SizedBox(height: 18),
          const TituloDeSeccion('O añadirlo como un día de'),
          ListaEnPanel(
            filas: [
              for (final rutina in estado.rutinas)
                FilaDeLista(
                  icono: Icons.calendar_month,
                  nombre: rutina.nombre,
                  meta: contar(rutina.dias.length, 'día', 'días', 'vacía'),
                  valor: '+ día',
                  onPulsar: () {
                    estado.anadirDiaDesdeEntreno(rutina, widget.entreno, nombre: _nombreElegido);
                    Navigator.of(context).pop(
                      '«$_nombreElegido» añadido a ${rutina.nombre}',
                    );
                  },
                ),
            ],
          ),
        ],
      ],
    );
  }

  /// El nombre escrito, o el del entreno si se ha dejado en blanco.
  String get _nombreElegido {
    final escrito = _nombre.text.trim();
    return escrito.isEmpty ? widget.entreno.nombre : escrito;
  }
}
