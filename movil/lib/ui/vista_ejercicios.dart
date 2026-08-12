/// Ejercicios: el catálogo y lo que uno ha hecho con cada uno.
///
/// Vale para dos cosas distintas y por eso está junto: mirar qué hay —«¿qué máquinas de
/// espalda existen?»— y mirar tu propia historia con un ejercicio —«¿cuánto hice la última
/// vez en prensa?»—. Lo segundo es lo que se consulta de verdad, así que cada ejercicio que
/// se ha entrenado alguna vez lleva su cuenta a la vista en la lista.
///
/// También se pueden crear ejercicios propios: la máquina rara de tu gimnasio, ese accesorio
/// que nadie llama igual. Los tuyos van primero.
library;

import 'package:flutter/material.dart';

import '../datos/ejercicios.dart';
import '../motor/entreno.dart';
import '../motor/fechas.dart';
import 'estado.dart';
import 'graficos.dart';
import 'piezas.dart';
import 'tema.dart';

const _tope = 60;

class VistaEjercicios extends StatefulWidget {
  const VistaEjercicios({super.key});

  @override
  State<VistaEjercicios> createState() => _VistaEjerciciosState();
}

class _VistaEjerciciosState extends State<VistaEjercicios> {
  var _busqueda = '';
  Grupo? _grupo;
  Equipo? _equipo;
  var _soloEntrenados = false;

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);
    final veces = estado.vecesPorEjercicio();

    final filtrados = estado.catalogo
        .where((e) =>
            (_grupo == null || e.grupo == _grupo) &&
            (_equipo == null || e.equipo == _equipo) &&
            (!_soloEntrenados || (veces[e.id] ?? 0) > 0) &&
            coincide(e, _busqueda))
        .toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        const TituloDeSeccion('Ejercicios'),
        Buscador(
          etiqueta: 'Buscar ejercicio',
          onCambiar: (texto) => setState(() => _busqueda = texto),
        ),
        const SizedBox(height: 10),
        Chips<Grupo>(
          opciones: Grupo.values,
          elegida: _grupo,
          todas: 'Todos los grupos',
          textoDe: (g) => g.texto,
          onElegir: (g) => setState(() => _grupo = g),
        ),
        const SizedBox(height: 6),
        Chips<Equipo>(
          opciones: Equipo.values,
          elegida: _equipo,
          todas: 'Todo el material',
          textoDe: (e) => e.texto,
          onElegir: (e) => setState(() => _equipo = e),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            FilterChip(
              label: const Text('Solo los que he hecho'),
              selected: _soloEntrenados,
              onSelected: (v) => setState(() => _soloEntrenados = v),
            ),
            const Spacer(),
            OutlinedButton.icon(
              onPressed: _crear,
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Crear'),
              style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          filtrados.length == estado.catalogo.length
              ? '${estado.catalogo.length} ejercicios '
                  '(${ejerciciosDeCasa.length} del catálogo'
                  '${estado.ejerciciosPropios.isEmpty ? '' : ' y ${estado.ejerciciosPropios.length} tuyos'})'
              : '${filtrados.length} de ${estado.catalogo.length}',
          style: TextStyle(fontSize: 12.5, color: c.textoDebil),
        ),
        const SizedBox(height: 10),
        if (filtrados.isEmpty)
          const Panel(
            hijo: Vacio(
              icono: Icons.search_off,
              titulo: 'Nada coincide',
              texto: 'Quita algún filtro, o créalo tú si es una máquina que no está.',
            ),
          )
        else
          ListaEnPanel(
            filas: [
              for (final ejercicio in filtrados.take(_tope))
                FilaDeLista(
                  icono: Icons.fitness_center,
                  iconoAcento: (veces[ejercicio.id] ?? 0) > 0,
                  nombre: ejercicio.nombre,
                  meta: [
                    ejercicio.grupo.texto,
                    ejercicio.equipo.texto,
                    if (ejercicio.propio) 'tuyo',
                  ].join(' · '),
                  valor: (veces[ejercicio.id] ?? 0) > 0
                      ? '${veces[ejercicio.id]}${veces[ejercicio.id] == 1 ? ' vez' : ' veces'}'
                      : null,
                  onPulsar: () => _abrirFicha(ejercicio),
                ),
            ],
          ),
        if (filtrados.length > _tope)
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Text(
              'Se muestran $_tope de ${filtrados.length}. Afina la búsqueda para ver el resto.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12.5, color: c.textoDebil),
            ),
          ),
      ],
    );
  }

  void _abrirFicha(Ejercicio ejercicio) {
    final estado = ProveedorDeEstado.leer(context);
    abrirHoja(
      context,
      titulo: ejercicio.nombre,
      contenido: (contexto) => _FichaDeEjercicio(ejercicio: ejercicio, estado: estado),
    );
  }

  void _crear() {
    final estado = ProveedorDeEstado.leer(context);
    abrirHoja(
      context,
      titulo: 'Crear ejercicio',
      contenido: (contexto) => _CrearEjercicio(estado: estado),
    );
  }
}

class _FichaDeEjercicio extends StatelessWidget {
  const _FichaDeEjercicio({required this.ejercicio, required this.estado});

  final Ejercicio ejercicio;
  final Estado estado;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final records = recordsDe(estado.entrenosHechos, ejercicio.id);
    final historial = historialDe(estado.entrenosHechos, ejercicio.id);

    // Se pinta el máximo estimado y no el peso a secas: es lo que permite comparar una serie
    // de 100×2 con otra de 90×5, que de otro modo parecerían un retroceso.
    final puntos = [
      for (final h in historial.where((h) => h.mejor.estimado != null))
        PuntoGrafico(
          clave: h.fecha,
          etiqueta: '${h.fecha.substring(8)}/${h.fecha.substring(5, 7)}',
          detalle: '${formatoFecha(h.fecha)} · ${kilos(h.mejor.peso)} kg × ${h.mejor.reps}',
          valor: h.mejor.estimado!,
        ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            EtiquetaPill(ejercicio.grupo.texto),
            EtiquetaPill(ejercicio.equipo.texto),
            if (ejercicio.unilateral) const EtiquetaPill('Por lado'),
            for (final s in ejercicio.secundarios) EtiquetaPill('+ ${s.texto}'),
          ],
        ),
        const SizedBox(height: 14),
        if (records.vecesEntrenado == 0)
          const Vacio(
            icono: Icons.fitness_center,
            titulo: 'Nunca lo has hecho',
            texto: 'En cuanto lo apuntes en un entreno, aquí aparecerán tus marcas y su '
                'evolución.',
          )
        else ...[
          Row(
            children: [
              Expanded(
                child: Cifra(
                  etiqueta: 'Más peso',
                  valor: records.mejorPeso == null ? '—' : kilos(records.mejorPeso!.peso),
                  unidad: 'kg',
                  delta: records.mejorPeso == null
                      ? null
                      : '${records.mejorPeso!.reps} reps · '
                          '${fechaRelativa(records.mejorPeso!.fecha)}',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Cifra(
                  etiqueta: 'Máx. estimado',
                  valor: records.mejorEstimado?.estimado == null
                      ? '—'
                      : kilos(records.mejorEstimado!.estimado!),
                  unidad: 'kg',
                  delta: records.mejorEstimado == null
                      ? null
                      : 'de ${kilos(records.mejorEstimado!.peso)}×${records.mejorEstimado!.reps}',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Cifra(
                  etiqueta: 'Más reps',
                  valor: '${records.masRepeticiones?.reps ?? '—'}',
                  delta: records.masRepeticiones == null
                      ? null
                      : 'con ${kilos(records.masRepeticiones!.peso)} kg',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(child: Cifra(etiqueta: 'Veces', valor: '${records.vecesEntrenado}')),
            ],
          ),
          if (puntos.length > 1) ...[
            const SizedBox(height: 12),
            Panel(
              apagado: true,
              hijo: LineaGrafico(
                titulo: 'Máximo estimado',
                subtitulo: 'Convierte cada serie a un equivalente de una repetición, para '
                    'poder comparar series de distintas reps.',
                datos: puntos,
                unidad: 'kg',
                formato: kilos,
              ),
            ),
          ],
          const SizedBox(height: 12),
          Text(
            'Últimas sesiones',
            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: c.textoTenue),
          ),
          const SizedBox(height: 6),
          for (final h in historial.reversed.take(20))
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Expanded(child: Text(formatoFecha(h.fecha), style: const TextStyle(fontSize: 13))),
                  Text(
                    '${kilos(h.mejor.peso)}×${h.mejor.reps}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 76,
                    child: Text(
                      '${cifra(h.volumen)} kg',
                      textAlign: TextAlign.right,
                      style: TextStyle(fontSize: 13, color: c.textoDebil),
                    ),
                  ),
                ],
              ),
            ),
        ],
        if (ejercicio.propio) ...[
          const SizedBox(height: 20),
          OutlinedButton.icon(
            onPressed: () async {
              final seguro = await confirmar(
                context,
                titulo: 'Borrar ejercicio',
                texto: 'Se quita del buscador. Los entrenos que ya lo usan lo siguen '
                    'mencionando, pero dejarán de mostrar su nombre.',
              );
              if (!seguro || !context.mounted) return;
              await estado.borrarEjercicioPropio(ejercicio);
              if (context.mounted) {
                Navigator.of(context).pop();
                avisar(context, 'Ejercicio borrado');
              }
            },
            icon: const Icon(Icons.delete_outline),
            label: const Text('Borrar ejercicio'),
            style: OutlinedButton.styleFrom(foregroundColor: c.malo),
          ),
        ],
      ],
    );
  }
}

class _CrearEjercicio extends StatefulWidget {
  const _CrearEjercicio({required this.estado});

  final Estado estado;

  @override
  State<_CrearEjercicio> createState() => _CrearEjercicioState();
}

class _CrearEjercicioState extends State<_CrearEjercicio> {
  var _nombre = '';
  var _grupo = Grupo.pecho;
  var _equipo = Equipo.maquina;
  var _medida = FormaDeMedir.pesoReps;
  var _unilateral = false;

  static const _formas = [
    (FormaDeMedir.pesoReps, 'Peso y reps'),
    (FormaDeMedir.reps, 'Solo reps'),
    (FormaDeMedir.tiempo, 'Tiempo'),
    (FormaDeMedir.pesoTiempo, 'Peso y tiempo'),
    (FormaDeMedir.distanciaTiempo, 'Distancia'),
  ];

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final id = idDeNombre(_nombre);
    final repetido = id.isNotEmpty && widget.estado.catalogo.any((e) => e.id == id);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          decoration: InputDecoration(
            labelText: 'Nombre',
            hintText: 'Prensa inclinada del gimnasio nuevo',
            errorText: repetido ? 'Ya existe un ejercicio con ese nombre.' : null,
            helperText: repetido ? null : 'Como lo llames tú: es lo que vas a buscar luego.',
          ),
          onChanged: (texto) => setState(() => _nombre = texto),
        ),
        const SizedBox(height: 14),
        DropdownButtonFormField<Grupo>(
          initialValue: _grupo,
          decoration: const InputDecoration(labelText: 'Grupo muscular'),
          items: [
            for (final g in Grupo.values) DropdownMenuItem(value: g, child: Text(g.texto)),
          ],
          onChanged: (g) => setState(() => _grupo = g ?? _grupo),
        ),
        const SizedBox(height: 14),
        DropdownButtonFormField<Equipo>(
          initialValue: _equipo,
          decoration: const InputDecoration(labelText: 'Material'),
          items: [
            for (final e in Equipo.values) DropdownMenuItem(value: e, child: Text(e.texto)),
          ],
          onChanged: (e) => setState(() => _equipo = e ?? _equipo),
        ),
        const SizedBox(height: 14),
        DropdownButtonFormField<FormaDeMedir>(
          initialValue: _medida,
          decoration: const InputDecoration(
            labelText: 'Qué se apunta de cada serie',
            helperText: 'Decide los huecos que verás al entrenar.',
            helperMaxLines: 2,
          ),
          items: [
            for (final (valor, texto) in _formas)
              DropdownMenuItem(value: valor, child: Text(texto)),
          ],
          onChanged: (m) => setState(() => _medida = m ?? _medida),
        ),
        const SizedBox(height: 6),
        Interruptor(
          texto: 'Se hace un lado a la vez',
          pista: 'Las series se apuntan por lado, como en el remo con mancuerna.',
          activo: _unilateral,
          onCambiar: (v) => setState(() => _unilateral = v),
        ),
        const SizedBox(height: 6),
        Text(
          'Si el que quieres ya está con otro nombre, mejor usa ese: así el historial no se '
          'parte en dos.',
          style: TextStyle(fontSize: 12.5, height: 1.45, color: c.textoDebil),
        ),
        const SizedBox(height: 18),
        FilledButton.icon(
          onPressed: _nombre.trim().length < 3 || repetido
              ? null
              : () {
                  widget.estado.guardarEjercicioPropio(Ejercicio(
                    id: id,
                    nombre: _nombre.trim(),
                    grupo: _grupo,
                    equipo: _equipo,
                    medida: _medida,
                    unilateral: _unilateral,
                    propio: true,
                  ));
                  Navigator.of(context).pop();
                  avisar(context, '«${_nombre.trim()}» añadido');
                },
          icon: const Icon(Icons.auto_awesome),
          label: const Text('Crear'),
        ),
      ],
    );
  }
}
