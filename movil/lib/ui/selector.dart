/// El buscador de ejercicios.
///
/// El catálogo pasa de doscientos noventa, así que una lista sin filtrar no sirve: se busca
/// por texto, por grupo muscular y por material, y esos dos últimos son los filtros que de
/// verdad se usan en un gimnasio —«hoy toca espalda» y «la máquina de remo está ocupada»—.
///
/// Deja elegir **varios de una vez**: al empezar un entreno se meten cinco o seis ejercicios
/// seguidos, y cerrar y volver a abrir el buscador por cada uno es media docena de toques de
/// más.
library;

import 'package:flutter/material.dart';

import '../datos/ejercicios.dart';
import 'piezas.dart';
import 'tema.dart';

/// Cuántos se pintan de una vez. Más allá nadie baja: se afina la búsqueda.
const _tope = 80;

/// Abre el buscador y devuelve los ejercicios elegidos, en el orden en que se marcaron.
Future<List<Ejercicio>?> elegirEjercicios(
  BuildContext context, {
  required List<Ejercicio> catalogo,
  String titulo = 'Añadir ejercicios',
}) {
  return showModalBottomSheet<List<Ejercicio>>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => _SelectorDeEjercicios(catalogo: catalogo, titulo: titulo),
  );
}

class _SelectorDeEjercicios extends StatefulWidget {
  const _SelectorDeEjercicios({required this.catalogo, required this.titulo});

  final List<Ejercicio> catalogo;
  final String titulo;

  @override
  State<_SelectorDeEjercicios> createState() => _SelectorDeEjerciciosState();
}

class _SelectorDeEjerciciosState extends State<_SelectorDeEjercicios> {
  var _busqueda = '';
  Grupo? _grupo;
  Equipo? _equipo;
  final _elegidos = <String>[];

  List<Ejercicio> get _filtrados => widget.catalogo
      .where((e) =>
          (_grupo == null || e.grupo == _grupo) &&
          (_equipo == null || e.equipo == _equipo) &&
          coincide(e, _busqueda))
      .toList();

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final filtrados = _filtrados;
    final mostrados = filtrados.take(_tope).toList();

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.92,
        maxChildSize: 0.95,
        builder: (contexto, controlador) => Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(16, 14, 8, 12),
              decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.borde))),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.titulo,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    tooltip: 'Cerrar',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
              child: Column(
                children: [
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
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      [
                        filtrados.length == widget.catalogo.length
                            ? '${widget.catalogo.length} ejercicios'
                            : '${filtrados.length} de ${widget.catalogo.length}',
                        if (_elegidos.isNotEmpty)
                          contar(_elegidos.length, 'elegido', 'elegidos', ''),
                      ].join(' · '),
                      style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: filtrados.isEmpty
                  ? const Vacio(
                      icono: Icons.search_off,
                      titulo: 'Nada coincide',
                      texto: 'Prueba con menos filtros, o créalo tú desde Ejercicios.',
                    )
                  : ListView.separated(
                      controller: controlador,
                      itemCount: mostrados.length + (filtrados.length > _tope ? 1 : 0),
                      separatorBuilder: (_, _) =>
                          Divider(height: 1, thickness: 1, color: c.bordeSuave),
                      itemBuilder: (contexto, i) {
                        if (i >= mostrados.length) {
                          return Padding(
                            padding: const EdgeInsets.all(16),
                            child: Text(
                              'Se muestran $_tope de ${filtrados.length}. Afina la búsqueda '
                              'para ver el resto.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                            ),
                          );
                        }
                        final e = mostrados[i];
                        final marcado = _elegidos.contains(e.id);
                        return CheckboxListTile(
                          value: marcado,
                          onChanged: (_) => setState(() {
                            marcado ? _elegidos.remove(e.id) : _elegidos.add(e.id);
                          }),
                          title: Text(
                            e.nombre,
                            style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(
                            [
                              e.grupo.texto,
                              e.equipo.texto,
                              if (e.unilateral) 'a un lado',
                              if (e.propio) 'tuyo',
                            ].join(' · '),
                            style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                          ),
                          controlAffinity: ListTileControlAffinity.leading,
                        );
                      },
                    ),
            ),
            SafeArea(
              top: false,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(border: Border(top: BorderSide(color: c.borde))),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Cancelar'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        onPressed: _elegidos.isEmpty
                            ? null
                            : () {
                                final porId = {for (final e in widget.catalogo) e.id: e};
                                Navigator.of(context).pop(
                                  _elegidos
                                      .map((id) => porId[id])
                                      .whereType<Ejercicio>()
                                      .toList(),
                                );
                              },
                        child: Text(
                          _elegidos.isEmpty ? 'Añadir' : 'Añadir (${_elegidos.length})',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
