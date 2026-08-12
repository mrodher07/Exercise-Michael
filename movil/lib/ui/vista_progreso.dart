/// Progreso: lo que se mira despacio, sentado y una vez por semana.
///
/// Está separado del Resumen a propósito. El Resumen contesta «¿cómo va la semana?» de un
/// vistazo; aquí se viene a comparar meses, ver si un grupo se está quedando corto o repasar
/// los récords. Son dos usos distintos y mezclarlos convierte la primera pantalla en un panel
/// de control que hay que leer entero.
library;

import 'package:flutter/material.dart';

import '../almacen/almacen.dart';
import '../motor/entreno.dart';
import '../motor/fechas.dart';
import 'estado.dart';
import 'graficos.dart';
import 'piezas.dart';
import 'tema.dart';
import 'vista_resumen.dart' show seriesDeReferencia;

enum _Pestana { volumen, grupos, records, cuerpo }

class VistaProgreso extends StatefulWidget {
  const VistaProgreso({super.key});

  @override
  State<VistaProgreso> createState() => _VistaProgresoState();
}

class _VistaProgresoState extends State<VistaProgreso> {
  var _pestana = _Pestana.volumen;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        const TituloDeSeccion('Progreso'),
        Segmentado<_Pestana>(
          elegida: _pestana,
          onElegir: (p) => setState(() => _pestana = p),
          opciones: const [
            (_Pestana.volumen, 'Volumen'),
            (_Pestana.grupos, 'Grupos'),
            (_Pestana.records, 'Récords'),
            (_Pestana.cuerpo, 'Cuerpo'),
          ],
        ),
        const SizedBox(height: 14),
        switch (_pestana) {
          _Pestana.volumen => const _Volumen(),
          _Pestana.grupos => const _Grupos(),
          _Pestana.records => const _Records(),
          _Pestana.cuerpo => const _Cuerpo(),
        },
      ],
    );
  }
}

class _Volumen extends StatelessWidget {
  const _Volumen();

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final hechos = estado.entrenosHechos;

    if (hechos.isEmpty) {
      return const Panel(
        hijo: Vacio(
          icono: Icons.show_chart,
          titulo: 'Sin datos todavía',
          texto: 'Con dos o tres entrenos guardados esta pantalla empieza a tener sentido.',
        ),
      );
    }

    final porSemana = volumenPorSemana(hechos);
    final ultimas =
        porSemana.length > 12 ? porSemana.sublist(porSemana.length - 12) : porSemana;
    final total = hechos.fold(0.0, (t, e) => t + e.volumen);
    final series = hechos.fold(0, (t, e) => t + e.seriesHechas);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const TituloDeSeccion('Desde el principio'),
        Row(
          children: [
            Expanded(child: Cifra(etiqueta: 'Entrenos', valor: '${hechos.length}')),
            const SizedBox(width: 10),
            Expanded(child: Cifra(etiqueta: 'Series', valor: cifra(series))),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: Cifra(etiqueta: 'Volumen total', valor: volumenCorto(total))),
            const SizedBox(width: 10),
            Expanded(
              child: Cifra(
                etiqueta: 'Media por entreno',
                valor: volumenCorto(total / hechos.length),
              ),
            ),
          ],
        ),
        if (ultimas.length > 1) ...[
          const SizedBox(height: 8),
          const TituloDeSeccion('Últimas semanas'),
          PanelPlegable(
            titulo: const Text('Volumen por semana'),
            resumen: contar(ultimas.length, 'semana', 'semanas'),
            ayuda: 'Kilos × repeticiones de todas las series hechas, sin contar '
                'calentamientos. Sube al levantar más peso, al hacer más repeticiones o al '
                'añadir series: es una medida de cuánto trabajo has hecho, no de lo fuerte '
                'que eres. Para eso están los récords.',
            hijo: Columnas(
              datos: [
                for (final s in ultimas)
                  PuntoGrafico(
                    clave: s.semana,
                    etiqueta: '${s.semana.substring(8)}/${s.semana.substring(5, 7)}',
                    detalle: 'Semana del ${formatoFecha(s.semana)} · '
                        '${contar(s.entrenos, 'entreno', 'entrenos')}',
                    valor: s.volumen,
                  ),
              ],
              formato: (n) => n >= 1000 ? '${cifra(n / 1000, 1)} t' : cifra(n),
            ),
          ),
        ],
      ],
    );
  }
}

class _Grupos extends StatefulWidget {
  const _Grupos();

  @override
  State<_Grupos> createState() => _GruposState();
}

class _GruposState extends State<_Grupos> {
  var _semanas = 4;

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final desde = sumarDias(lunesDe(hoy()), _semanas == 1 ? 0 : -21);
    final cuenta = seriesPorGrupo(estado.entrenosDesde(desde), estado.catalogo);
    final divisor = _semanas == 1 ? 1 : 4;

    final ordenados = cuenta.entries.where((x) => x.value > 0).toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Segmentado<int>(
          elegida: _semanas,
          onElegir: (v) => setState(() => _semanas = v),
          opciones: const [(1, 'Esta semana'), (4, 'Media de 4 semanas')],
        ),
        const SizedBox(height: 12),
        if (ordenados.isEmpty)
          const Panel(
            hijo: Vacio(icono: Icons.show_chart, titulo: 'Nada en este periodo'),
          )
        else
          PanelPlegable(
            titulo: const Text('Reparto'),
            resumen: contar(ordenados.length, 'grupo', 'grupos'),
            ayuda: 'Series hechas de cada grupo, sin calentamientos. El trabajo secundario '
                'suma media serie: el press de banca hace algo por el tríceps, pero no lo '
                'mismo que una extensión en polea.\n\n'
                'Sirve para ver desequilibrios —diez series de pecho y dos de espalda— más '
                'que para llegar a un número concreto.',
            hijo: Barras(
              referencia: seriesDeReferencia,
              datos: [
                for (final g in ordenados)
                  PuntoGrafico(
                    clave: g.key.texto,
                    etiqueta: g.key.texto,
                    valor: (g.value / divisor * 10).round() / 10,
                  ),
              ],
              formato: (n) => n == n.roundToDouble() ? '${n.round()}' : n.toStringAsFixed(1),
            ),
          ),
      ],
    );
  }
}

class _Records extends StatelessWidget {
  const _Records();

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);
    final hechos = estado.entrenosHechos;

    final ids = {for (final e in hechos) ...e.ejercicios.map((l) => l.ejercicioId)};
    final filas = ids
        .map((id) => (
              id: id,
              nombre: estado.nombreDeEjercicio(id),
              records: recordsDe(hechos, id),
            ))
        .where((f) => f.records.mejorPeso != null)
        .toList()
      ..sort((a, b) {
        final va = a.records.mejorEstimado?.estimado ?? a.records.mejorPeso?.peso ?? 0;
        final vb = b.records.mejorEstimado?.estimado ?? b.records.mejorPeso?.peso ?? 0;
        return vb.compareTo(va);
      });

    if (filas.isEmpty) {
      return const Panel(
        hijo: Vacio(
          icono: Icons.auto_awesome,
          titulo: 'Todavía no hay marcas',
          texto: 'Los récords salen de las series con peso y repeticiones. Apunta unas '
              'cuantas y vuelve.',
        ),
      );
    }

    return PanelPlegable(
      titulo: const Text('Tus marcas'),
      resumen: contar(filas.length, 'ejercicio', 'ejercicios'),
      ayuda: 'El máximo estimado convierte una serie a su equivalente de una repetición con '
          'la fórmula de Epley, para poder comparar 100×2 con 90×5. Por encima de doce '
          'repeticiones la fórmula deja de valer y no se estima nada, en vez de dar un '
          'número bonito y falso.',
      hijo: Column(
        children: [
          Row(
            children: [
              Expanded(
                flex: 3,
                child: Text('Ejercicio', style: _estiloCabecera(c)),
              ),
              Expanded(child: Text('Peso', textAlign: TextAlign.right, style: _estiloCabecera(c))),
              Expanded(child: Text('Máx.', textAlign: TextAlign.right, style: _estiloCabecera(c))),
            ],
          ),
          const SizedBox(height: 4),
          for (final f in filas)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Text(
                      f.nombre,
                      style: const TextStyle(fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      f.records.mejorPeso == null
                          ? '—'
                          : '${kilos(f.records.mejorPeso!.peso)}×${f.records.mejorPeso!.reps}',
                      textAlign: TextAlign.right,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      f.records.mejorEstimado?.estimado == null
                          ? '—'
                          : kilos(f.records.mejorEstimado!.estimado!),
                      textAlign: TextAlign.right,
                      style: TextStyle(fontSize: 13, color: c.textoTenue),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  TextStyle _estiloCabecera(ColoresFitLog c) => TextStyle(
        fontSize: 10.5,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.5,
        color: c.textoDebil,
      );
}

class _Cuerpo extends StatelessWidget {
  const _Cuerpo();

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);

    final conPeso = estado.medidas.where((m) => m.peso != null).toList()
      ..sort((a, b) => a.fecha.compareTo(b.fecha));

    if (conPeso.isEmpty) {
      return Panel(
        hijo: Vacio(
          icono: Icons.monitor_weight_outlined,
          titulo: 'Sin medidas',
          texto: 'El peso y los perímetros cuentan cosas que el volumen del entreno no '
              'cuenta. Pésate siempre a la misma hora: si no, el ruido del día tapa el '
              'cambio real.',
          accion: FilledButton.icon(
            onPressed: () => _apuntar(context),
            icon: const Icon(Icons.add),
            label: const Text('Apuntar la primera'),
          ),
        ),
      );
    }

    final ultima = conPeso.last;
    final primera = conPeso.first;
    final diferencia = ultima.peso! - primera.peso!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Cifra(
                etiqueta: 'Peso actual',
                valor: kilos(ultima.peso!),
                unidad: 'kg',
                delta: conPeso.length > 1
                    ? '${diferencia >= 0 ? '+' : ''}${kilos(diferencia)} kg desde el principio'
                    : null,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: ultima.cintura != null
                  ? Cifra(etiqueta: 'Cintura', valor: kilos(ultima.cintura!), unidad: 'cm')
                  : Cifra(etiqueta: 'Registros', valor: '${estado.medidas.length}'),
            ),
          ],
        ),
        if (conPeso.length > 1) ...[
          const SizedBox(height: 12),
          Panel(
            hijo: LineaGrafico(
              titulo: 'Peso corporal',
              subtitulo: 'El eje no arranca en cero a propósito: si lo hiciera, dos kilos de '
                  'cambio se verían como una línea plana.',
              unidad: 'kg',
              datos: [
                for (final m in conPeso)
                  PuntoGrafico(
                    clave: m.id,
                    etiqueta: '${m.fecha.substring(8)}/${m.fecha.substring(5, 7)}',
                    detalle: formatoFecha(m.fecha),
                    valor: m.peso!,
                  ),
              ],
              formato: (n) => kilos((n * 10).round() / 10),
            ),
          ),
        ],
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: () => _apuntar(context),
          icon: const Icon(Icons.add),
          label: const Text('Apuntar medida'),
        ),
        const SizedBox(height: 12),
        ListaEnPanel(
          filas: [
            for (final m in estado.medidas.take(20))
              FilaDeLista(
                icono: Icons.monitor_weight_outlined,
                nombre: formatoFecha(m.fecha),
                meta: [
                  if (m.peso != null) '${kilos(m.peso!)} kg',
                  if (m.grasa != null) '${kilos(m.grasa!)} % grasa',
                  if (m.cintura != null) 'cintura ${kilos(m.cintura!)} cm',
                  if (m.brazo != null) 'brazo ${kilos(m.brazo!)} cm',
                ].join(' · '),
                alFinal: IconButton(
                  tooltip: 'Borrar medida',
                  icon: Icon(Icons.delete_outline, color: c.textoDebil),
                  onPressed: () => estado.borrarMedida(m),
                ),
              ),
          ],
        ),
      ],
    );
  }

  void _apuntar(BuildContext context) {
    final estado = ProveedorDeEstado.leer(context);
    abrirHoja(
      context,
      titulo: 'Apuntar medida',
      contenido: (contexto) => _ApuntarMedida(estado: estado),
    );
  }
}

class _ApuntarMedida extends StatefulWidget {
  const _ApuntarMedida({required this.estado});

  final Estado estado;

  @override
  State<_ApuntarMedida> createState() => _ApuntarMedidaState();
}

class _ApuntarMedidaState extends State<_ApuntarMedida> {
  late final Medida _medida = Medida(id: nuevoId(), fecha: claveDia());

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);

    Widget campo(String etiqueta, double? valor, ValueChanged<double?> onCambiar) =>
        CampoNumero(
          valor: valor,
          etiqueta: etiqueta,
          onCambiar: (v) {
            onCambiar(v?.toDouble());
            setState(() {});
          },
        );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Fecha'),
          subtitle: Text(formatoFecha(_medida.fecha)),
          trailing: const Icon(Icons.calendar_today, size: 20),
          onTap: () async {
            final elegida = await showDatePicker(
              context: context,
              initialDate: fechaDeClave(_medida.fecha),
              firstDate: DateTime(2015),
              lastDate: DateTime.now(),
            );
            if (elegida != null) setState(() => _medida.fecha = claveDia(elegida));
          },
        ),
        Text(
          'Rellena solo lo que te hayas medido hoy. Lo que quede vacío no se guarda: no es '
          'lo mismo «no me lo he medido» que «mide cero».',
          style: TextStyle(fontSize: 12.5, height: 1.45, color: c.textoDebil),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(child: campo('Peso (kg)', _medida.peso, (v) => _medida.peso = v)),
            const SizedBox(width: 10),
            Expanded(child: campo('Grasa (%)', _medida.grasa, (v) => _medida.grasa = v)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: campo('Cintura (cm)', _medida.cintura, (v) => _medida.cintura = v)),
            const SizedBox(width: 10),
            Expanded(child: campo('Pecho (cm)', _medida.pecho, (v) => _medida.pecho = v)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: campo('Brazo (cm)', _medida.brazo, (v) => _medida.brazo = v)),
            const SizedBox(width: 10),
            Expanded(child: campo('Pierna (cm)', _medida.pierna, (v) => _medida.pierna = v)),
          ],
        ),
        const SizedBox(height: 12),
        TextFormField(
          minLines: 2,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Notas',
            hintText: 'En ayunas, después de entrenar…',
          ),
          onChanged: (texto) => _medida.notas = texto,
        ),
        const SizedBox(height: 18),
        FilledButton(
          onPressed: _medida.vacia
              ? null
              : () {
                  widget.estado.guardarMedida(_medida);
                  Navigator.of(context).pop();
                  avisar(context, 'Medida apuntada');
                },
          child: const Text('Guardar'),
        ),
      ],
    );
  }
}
