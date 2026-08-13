/// Resumen: en qué punto estoy.
///
/// Se abre veinte veces al día y casi siempre para responder a una de estas dos preguntas:
/// «¿he entrenado ya esta semana?» y «¿voy más o menos que la anterior?». Todo lo que hay
/// aquí contesta a una de las dos; lo demás vive en Progreso, que es donde se va a mirar
/// despacio.
library;

import 'package:flutter/material.dart';

import '../motor/entreno.dart';
import '../motor/fechas.dart';
import 'estado.dart';
import 'graficos.dart';
import 'piezas.dart';

/// Series semanales por grupo a partir de las cuales un grupo está bien atendido.
///
/// Diez es el número que se repite como suelo razonable para hacer crecer un grupo. Aquí es
/// sólo una **referencia** en el gráfico, no un objetivo que la aplicación exija: quien esté
/// haciendo fuerza pura, rehabilitación o mantenimiento va a estar por debajo a propósito, y
/// eso no es un fallo.
const seriesDeReferencia = 10.0;

class VistaResumen extends StatelessWidget {
  const VistaResumen({super.key, required this.onIrAEntrenar, required this.onIrAAjustes});

  final VoidCallback onIrAEntrenar;

  /// Para el aviso de la copia de seguridad: el botón lleva a donde se hace.
  final VoidCallback onIrAAjustes;

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final hechos = estado.entrenosHechos;

    if (hechos.isEmpty) {
      return ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        children: [
          const TituloDeSeccion('Resumen'),
          Panel(
            hijo: Vacio(
              icono: Icons.fitness_center,
              titulo: 'Aquí no hay nada todavía',
              texto: 'En cuanto guardes el primer entreno, esta pantalla empieza a contarte '
                  'cómo va la semana y a comparar con la anterior.',
              accion: FilledButton.icon(
                onPressed: onIrAEntrenar,
                icon: const Icon(Icons.play_arrow),
                label: const Text('Empezar a entrenar'),
              ),
            ),
          ),
        ],
      );
    }

    final lunes = lunesDe(hoy());
    final lunesPasado = sumarDias(lunes, -7);
    final deEstaSemana = hechos.where((e) => e.fecha.compareTo(lunes) >= 0).toList();
    final deLaPasada = hechos
        .where((e) => e.fecha.compareTo(lunesPasado) >= 0 && e.fecha.compareTo(lunes) < 0)
        .toList();

    final volumenSemana = deEstaSemana.fold(0.0, (t, e) => t + e.volumen);
    final volumenPasada = deLaPasada.fold(0.0, (t, e) => t + e.volumen);
    final seriesSemana = deEstaSemana.fold(0, (t, e) => t + e.seriesHechas);

    final porSemana = volumenPorSemana(hechos);
    final ultimas = porSemana.length > 8 ? porSemana.sublist(porSemana.length - 8) : porSemana;

    final porGrupo = seriesPorGrupo(deEstaSemana, estado.catalogo);
    final grupos = porGrupo.entries.where((x) => x.value > 0).toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    final ultimo = hechos.first;
    final diasSinEntrenar = diasEntre(ultimo.fecha, claveDia());
    final diferenciaEntrenos = deEstaSemana.length - deLaPasada.length;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        // El aviso de la copia va aquí, y no sólo en Ajustes, porque Ajustes no se abre nunca
        // —es su virtud— y un recordatorio donde nadie mira no recuerda nada. Sale sólo
        // cuando hay entrenos que se perderían y desaparece en cuanto se comparte una copia,
        // así que no es un adorno permanente que se aprenda a ignorar.
        if (estado.tocaCopia) ...[
          const TituloDeSeccion('Copia de seguridad'),
          Panel(
            hijo: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Aviso(avisoDeCopia(estado.entrenosSinCopiar, estado.ajustes.ultimaCopia)),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: onIrAAjustes,
                  icon: const Icon(Icons.ios_share),
                  label: const Text('Guardar una copia'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
        const TituloDeSeccion('Esta semana'),
        Row(
          children: [
            Expanded(
              child: Cifra(
                etiqueta: 'Entrenos',
                valor: '${deEstaSemana.length}',
                delta: deLaPasada.isEmpty
                    ? null
                    : '${diferenciaEntrenos >= 0 ? '+' : ''}$diferenciaEntrenos vs semana pasada',
                signo: diferenciaEntrenos >= 0 ? SignoDelta.buena : SignoDelta.neutra,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(child: Cifra(etiqueta: 'Series', valor: '$seriesSemana')),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: Cifra(
                etiqueta: 'Volumen',
                valor: volumenCorto(volumenSemana),
                delta: volumenPasada <= 0
                    ? null
                    : '${volumenSemana >= volumenPasada ? '+' : ''}'
                        '${cifra((volumenSemana - volumenPasada) / volumenPasada * 100)} %',
                signo: volumenSemana >= volumenPasada ? SignoDelta.buena : SignoDelta.neutra,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Cifra(
                etiqueta: 'Último entreno',
                valor: diasSinEntrenar == 0 ? 'Hoy' : 'Hace $diasSinEntrenar d',
              ),
            ),
          ],
        ),
        if (ultimas.length > 1) ...[
          const SizedBox(height: 8),
          const TituloDeSeccion('Volumen por semana'),
          Panel(
            hijo: Columnas(
              subtitulo: 'Kilos levantados por semana, sin contar calentamientos.',
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
        if (grupos.isNotEmpty) ...[
          const SizedBox(height: 8),
          const TituloDeSeccion('Series por grupo esta semana'),
          PanelPlegable(
            titulo: const Text('Reparto'),
            resumen: contar(grupos.length, 'grupo', 'grupos'),
            ayuda: 'Cuenta las series hechas de cada grupo, sin calentamientos. Lo que un '
                'ejercicio trabaja de refuerzo suma media serie: el press de banca hace algo '
                'por el tríceps, pero no lo mismo que una extensión en polea.\n\n'
                'La línea marca ${seriesDeReferencia.round()} series, que es el suelo que se '
                'suele citar para hacer crecer un grupo. Es una referencia, no un deber: en '
                'fuerza pura o en mantenimiento se está por debajo a propósito.',
            hijo: Barras(
              referencia: seriesDeReferencia,
              datos: [
                for (final g in grupos)
                  PuntoGrafico(clave: g.key.texto, etiqueta: g.key.texto, valor: g.value),
              ],
              formato: (n) => n == n.roundToDouble() ? '${n.round()}' : n.toStringAsFixed(1),
            ),
          ),
        ],
        const SizedBox(height: 8),
        const TituloDeSeccion('Últimos entrenos'),
        ListaEnPanel(
          filas: [
            for (final entreno in hechos.take(4))
              FilaDeLista(
                icono: Icons.fitness_center,
                iconoAcento: true,
                nombre: entreno.nombre,
                meta: '${fechaRelativa(entreno.fecha)} · '
                    '${contar(entreno.seriesHechas, 'serie', 'series')} · '
                    '${duracionLarga(entreno.duracionEnSegundos)}',
                valor: volumenCorto(entreno.volumen),
              ),
          ],
        ),
      ],
    );
  }
}
