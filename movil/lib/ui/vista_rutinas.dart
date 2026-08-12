/// Rutinas: el plan de la semana.
///
/// Una rutina tiene **días**, no una lista plana de ejercicios, porque así se entrena de
/// verdad: «Torso / Pierna», «Empuje / Tirón / Pierna». Con una lista plana habría que crear
/// cinco rutinas y no se podrían ver como un plan.
///
/// Lo que se escribe aquí es una intención, no un registro: las repeticiones se guardan como
/// texto («8-10», «al fallo») porque una rutina se apunta como se habla. El número exacto se
/// pone al hacer la serie, que es donde sí tiene que ser un número.
library;

import 'package:flutter/material.dart';

import '../almacen/almacen.dart';
import '../datos/ejercicios.dart';
import 'estado.dart';
import 'piezas.dart';
import 'selector.dart';
import 'tema.dart';

class VistaRutinas extends StatelessWidget {
  const VistaRutinas({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        TituloDeSeccion(
          'Rutinas',
          accion: 'Crear',
          onAccion: () => _editar(context, estado.crearRutina()),
        ),
        if (estado.rutinas.isEmpty)
          Panel(
            hijo: Vacio(
              icono: Icons.list_alt,
              titulo: 'Sin rutinas',
              texto: 'Una rutina es un plan con días. Al empezar a entrenar podrás elegir un '
                  'día y tendrás los ejercicios puestos.',
              accion: FilledButton.icon(
                onPressed: () => _editar(context, estado.crearRutina()),
                icon: const Icon(Icons.add),
                label: const Text('Crear la primera'),
              ),
            ),
          ),
        for (final rutina in estado.rutinas)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: PanelPlegable(
              titulo: Row(
                children: [
                  if (rutina.favorita)
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: Icon(Icons.star, size: 16, color: c.acento),
                    ),
                  Expanded(child: Text(rutina.nombre)),
                ],
              ),
              resumen: contar(rutina.dias.length, 'día', 'días', 'vacía'),
              abierto: false,
              hijo: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (rutina.descripcion != null && rutina.descripcion!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(
                        rutina.descripcion!,
                        style: TextStyle(fontSize: 13, color: c.textoTenue, height: 1.45),
                      ),
                    ),
                  for (final dia in rutina.dias)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Panel(
                        apagado: true,
                        relleno: 12,
                        hijo: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(dia.nombre,
                                style: const TextStyle(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            if (dia.ejercicios.isEmpty)
                              Text(
                                'Sin ejercicios.',
                                style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                              )
                            else
                              for (final p in dia.ejercicios)
                                Text(
                                  '· ${estado.nombreDeEjercicio(p.ejercicioId)} · '
                                  '${p.series}×${p.reps}'
                                  '${p.peso != null ? ' · ${kilos(p.peso!)} kg' : ''}',
                                  style: TextStyle(fontSize: 13, color: c.textoTenue),
                                ),
                          ],
                        ),
                      ),
                    ),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        onPressed: () => _editar(context, rutina),
                        icon: const Icon(Icons.edit_outlined, size: 18),
                        label: const Text('Editar'),
                        style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () {
                          estado.duplicarRutina(rutina);
                          avisar(context, 'Rutina duplicada');
                        },
                        child: const Text('Duplicar'),
                      ),
                      const Spacer(),
                      IconButton(
                        tooltip: rutina.favorita ? 'Quitar de favoritas' : 'Marcar favorita',
                        icon: Icon(rutina.favorita ? Icons.star : Icons.star_border),
                        color: rutina.favorita ? c.acento : null,
                        onPressed: () {
                          rutina.favorita = !rutina.favorita;
                          estado.rutinaTocada(rutina);
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  void _editar(BuildContext context, Rutina rutina) {
    final estado = ProveedorDeEstado.leer(context);
    abrirHoja(
      context,
      titulo: 'Editar rutina',
      contenido: (contexto) => _EditorDeRutina(rutina: rutina, estado: estado),
    );
  }
}

class _EditorDeRutina extends StatefulWidget {
  const _EditorDeRutina({required this.rutina, required this.estado});

  final Rutina rutina;
  final Estado estado;

  @override
  State<_EditorDeRutina> createState() => _EditorDeRutinaState();
}

class _EditorDeRutinaState extends State<_EditorDeRutina> {
  Rutina get rutina => widget.rutina;
  Estado get estado => widget.estado;

  void _tocada() {
    estado.rutinaTocada(rutina);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          initialValue: rutina.nombre,
          decoration: const InputDecoration(labelText: 'Nombre'),
          onChanged: (texto) {
            rutina.nombre = texto;
            estado.rutinaTocada(rutina);
          },
        ),
        const SizedBox(height: 14),
        TextFormField(
          initialValue: rutina.descripcion ?? '',
          minLines: 2,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Descripción',
            hintText: 'Cuatro días, fuerza, ocho semanas.',
          ),
          onChanged: (texto) {
            rutina.descripcion = texto;
            estado.rutinaTocada(rutina);
          },
        ),
        Interruptor(
          texto: 'Favorita',
          pista: 'Sale primero y aparece desplegada al empezar a entrenar.',
          activo: rutina.favorita,
          onCambiar: (v) {
            rutina.favorita = v;
            _tocada();
          },
        ),
        const Divider(height: 24),
        for (final (indiceDia, dia) in rutina.dias.indexed) ...[
          Panel(
            apagado: true,
            hijo: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        initialValue: dia.nombre,
                        decoration: const InputDecoration(labelText: 'Día'),
                        onChanged: (texto) {
                          dia.nombre = texto;
                          estado.rutinaTocada(rutina);
                        },
                      ),
                    ),
                    if (rutina.dias.length > 1)
                      IconButton(
                        tooltip: 'Quitar ${dia.nombre}',
                        icon: const Icon(Icons.delete_outline),
                        color: c.malo,
                        onPressed: () {
                          rutina.dias = rutina.dias.where((d) => d.id != dia.id).toList();
                          _tocada();
                        },
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                if (dia.ejercicios.isEmpty)
                  Text(
                    'Todavía no hay ejercicios en ${dia.nombre.toLowerCase()}.',
                    style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                  ),
                for (final (i, plantilla) in dia.ejercicios.indexed)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Panel(
                      relleno: 12,
                      hijo: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  estado.nombreDeEjercicio(plantilla.ejercicioId),
                                  style: const TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              IconButton(
                                tooltip: 'Quitar del día',
                                icon: const Icon(Icons.delete_outline, size: 20),
                                onPressed: () {
                                  dia.ejercicios = [
                                    ...dia.ejercicios.take(i),
                                    ...dia.ejercicios.skip(i + 1),
                                  ];
                                  _tocada();
                                },
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: CampoNumero(
                                  valor: plantilla.series,
                                  etiqueta: 'Series',
                                  decimal: false,
                                  onCambiar: (v) {
                                    plantilla.series = v?.toInt() ?? 1;
                                    estado.rutinaTocada(rutina);
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextFormField(
                                  initialValue: plantilla.reps,
                                  textAlign: TextAlign.center,
                                  decoration: const InputDecoration(labelText: 'Reps'),
                                  onChanged: (texto) {
                                    plantilla.reps = texto;
                                    estado.rutinaTocada(rutina);
                                  },
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: CampoNumero(
                                  valor: plantilla.peso,
                                  etiqueta: 'Peso (kg)',
                                  pista: '—',
                                  onCambiar: (v) {
                                    plantilla.peso = v?.toDouble();
                                    estado.rutinaTocada(rutina);
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: CampoNumero(
                                  valor: plantilla.descanso,
                                  etiqueta: 'Descanso (s)',
                                  decimal: false,
                                  onCambiar: (v) {
                                    plantilla.descanso =
                                        v?.toInt() ?? estado.ajustes.descansoPorDefecto;
                                    estado.rutinaTocada(rutina);
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                OutlinedButton.icon(
                  onPressed: () => _anadirA(dia),
                  icon: const Icon(Icons.add, size: 18),
                  label: Text('Añadir ejercicios a ${dia.nombre}'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 40)),
                ),
                if (indiceDia == rutina.dias.length - 1) ...[
                  const SizedBox(height: 8),
                  TextButton.icon(
                    onPressed: () {
                      rutina.dias = [
                        ...rutina.dias,
                        DiaDeRutina(
                          id: nuevoId(),
                          nombre: 'Día ${rutina.dias.length + 1}',
                          ejercicios: [],
                        ),
                      ];
                      _tocada();
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Añadir otro día'),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () async {
            final seguro = await confirmar(
              context,
              titulo: 'Borrar rutina',
              texto: 'Se borra la rutina y sus días. Los entrenos que ya hiciste con ella no '
                  'se tocan.',
              si: 'Sí, borrar rutina',
            );
            if (!seguro || !context.mounted) return;
            await estado.borrarRutina(rutina);
            if (context.mounted) {
              Navigator.of(context).pop();
              avisar(context, 'Rutina borrada');
            }
          },
          icon: const Icon(Icons.delete_outline),
          label: const Text('Borrar rutina'),
          style: OutlinedButton.styleFrom(foregroundColor: c.malo),
        ),
      ],
    );
  }

  Future<void> _anadirA(DiaDeRutina dia) async {
    final elegidos = await elegirEjercicios(
      context,
      catalogo: estado.catalogo,
      titulo: 'Añadir a la rutina',
    );
    if (elegidos == null || elegidos.isEmpty) return;
    dia.ejercicios = [
      ...dia.ejercicios,
      for (final e in elegidos)
        PlantillaEjercicio(
          ejercicioId: e.id,
          series: 3,
          reps: e.medida == FormaDeMedir.tiempo ? '30 s' : '8-10',
          descanso: estado.ajustes.descansoPorDefecto,
        ),
    ];
    _tocada();
  }
}
