/// Las mismas pruebas que la versión web, portadas.
///
/// No son una traducción por gusto: el motor de cálculo es lo único que, si se equivoca,
/// no se nota en la pantalla sino tres semanas después, cuando un récord no cuadra con lo
/// que uno recuerda haber levantado. Y correr aquí no necesita ni móvil ni emulador.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog/datos/ejercicios.dart';
import 'package:fitlog/motor/entreno.dart';
import 'package:fitlog/motor/fechas.dart';

SerieRegistrada serie(
  double peso,
  int reps, {
  bool hecha = true,
  TipoDeSerie tipo = TipoDeSerie.normal,
}) =>
    SerieRegistrada(peso: peso, reps: reps, hecha: hecha, tipo: tipo);

Entreno entreno(String fecha, String ejercicioId, List<SerieRegistrada> series) => Entreno(
      id: 'e-$fecha-$ejercicioId',
      fecha: fecha,
      nombre: 'Entreno',
      comienzo: DateTime.parse('${fecha}T10:00:00'),
      fin: DateTime.parse('${fecha}T11:00:00'),
      ejercicios: [
        EjercicioDelEntreno(id: 'l1', ejercicioId: ejercicioId, series: series),
      ],
    );

void main() {
  group('claves de día', () {
    test('usa el día local, no el de UTC', () {
      // 23:30 del 12 de agosto en local ya es el 13 en UTC; para quien entrena, es el 12.
      expect(claveDia(DateTime(2026, 8, 12, 23, 30)), '2026-08-12');
    });

    test('rellena mes y día con dos cifras', () {
      expect(claveDia(DateTime(2026, 1, 5)), '2026-01-05');
    });

    test('ida y vuelta sin perder el día', () {
      expect(claveDia(fechaDeClave('2026-03-29')), '2026-03-29');
    });

    test('suma y resta días cruzando el cambio de mes', () {
      expect(sumarDias('2026-08-31', 1), '2026-09-01');
      expect(sumarDias('2026-01-01', -1), '2025-12-31');
    });

    test('cuenta los días entre dos fechas', () {
      expect(diasEntre('2026-08-10', '2026-08-17'), 7);
      expect(diasEntre('2026-08-17', '2026-08-10'), -7);
    });
  });

  group('semanas', () {
    test('la semana empieza en lunes', () {
      expect(nombreDelDia('2026-08-12'), 'Miércoles');
      expect(lunesDe('2026-08-12'), '2026-08-10');
    });

    test('el domingo pertenece a la semana que acaba, no a la que empieza', () {
      expect(nombreDelDia('2026-08-16'), 'Domingo');
      expect(lunesDe('2026-08-16'), '2026-08-10');
    });

    test('un lunes es su propio lunes', () {
      expect(lunesDe('2026-08-10'), '2026-08-10');
    });

    test('los últimos días acaban en la fecha dada', () {
      expect(ultimosDias(3, '2026-08-12'), ['2026-08-10', '2026-08-11', '2026-08-12']);
    });
  });

  group('duraciones', () {
    test('la hora sólo aparece cuando existe', () {
      expect(formatoDuracion(309), '5:09');
      expect(formatoDuracion(3909), '1:05:09');
    });

    test('no cuenta hacia atrás', () {
      expect(formatoDuracion(-5), '0:00');
    });

    test('en texto largo redondea a minutos', () {
      expect(duracionLarga(4320), '1 h 12 min');
      expect(duracionLarga(3600), '1 h');
      expect(duracionLarga(600), '10 min');
    });

    test('no dice «0 min», que parece un error', () {
      expect(duracionLarga(40), '1 min');
      expect(duracionLarga(20), 'menos de 1 min');
    });
  });

  group('volumen', () {
    test('multiplica kilos por repeticiones', () {
      final e = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5), serie(80, 5)]);
      expect(e.volumen, 800);
    });

    test('no cuenta el calentamiento', () {
      final e = entreno('2026-08-10', 'press-de-banca-con-barra', [
        serie(40, 10, tipo: TipoDeSerie.calentamiento),
        serie(80, 5),
      ]);
      expect(e.volumen, 400);
      expect(e.seriesHechas, 1);
    });

    test('no cuenta lo que no está marcado como hecho', () {
      final e = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5, hecha: false)]);
      expect(e.volumen, 0);
    });

    test('agrupa el volumen por semanas naturales', () {
      // El 10 de agosto de 2026 es lunes; el 16, domingo de la misma semana.
      final semanas = volumenPorSemana([
        entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5)]),
        entreno('2026-08-16', 'press-de-banca-con-barra', [serie(80, 5)]),
        entreno('2026-08-17', 'press-de-banca-con-barra', [serie(80, 5)]),
      ]);
      expect(semanas.map((s) => s.semana).toList(), ['2026-08-10', '2026-08-17']);
      expect(semanas[0].volumen, 800);
      expect(semanas[0].entrenos, 2);
      expect(semanas[1].volumen, 400);
    });
  });

  group('máximo a una repetición', () {
    test('con una repetición es el propio peso', () {
      expect(unaRepeticionMaxima(100, 1), 100);
    });

    test('sube con las repeticiones', () {
      expect(unaRepeticionMaxima(100, 5), closeTo(116.7, 0.05));
    });

    test('no estima por encima de doce repeticiones, donde la fórmula ya no vale', () {
      expect(unaRepeticionMaxima(100, 13), isNull);
    });

    test('descarta series sin peso o sin repeticiones', () {
      expect(unaRepeticionMaxima(0, 5), isNull);
      expect(unaRepeticionMaxima(100, 0), isNull);
    });
  });

  group('mejor serie', () {
    test('elige por máximo estimado, no por kilos', () {
      // 90 × 5 estima 105, más que 100 × 1.
      expect(mejorSerie([serie(100, 1), serie(90, 5)], '2026-08-10')?.peso, 90);
    });

    test('a igualdad de estimación se queda con la de más peso', () {
      expect(mejorSerie([serie(100, 3), serie(110, 1)], '2026-08-10')?.peso, 110);
    });

    test('sin series válidas no inventa una marca', () {
      expect(mejorSerie([serie(80, 5, hecha: false)], '2026-08-10'), isNull);
    });
  });

  group('récords', () {
    final entrenos = [
      entreno('2026-08-03', 'press-de-banca-con-barra', [serie(80, 6)]),
      entreno('2026-08-10', 'press-de-banca-con-barra', [serie(100, 2), serie(90, 4)]),
      entreno('2026-08-12', 'sentadilla-con-barra', [serie(120, 5)]),
    ];

    test('guarda el mejor peso y las veces entrenado', () {
      final r = recordsDe(entrenos, 'press-de-banca-con-barra');
      expect(r.mejorPeso?.peso, 100);
      expect(r.vecesEntrenado, 2);
      expect(r.ultimaVez, '2026-08-10');
    });

    test('el mejor volumen de sesión suma todas las series de esa sesión', () {
      final r = recordsDe(entrenos, 'press-de-banca-con-barra');
      // 100×2 + 90×4 = 560, más que los 480 de la sesión de una sola serie.
      expect(r.mejorVolumenDeSesion?.volumen, 560);
      expect(r.mejorVolumenDeSesion?.fecha, '2026-08-10');
    });

    test('no mezcla ejercicios distintos', () {
      expect(recordsDe(entrenos, 'sentadilla-con-barra').mejorPeso?.peso, 120);
    });

    test('el historial va de la sesión más antigua a la más reciente', () {
      final h = historialDe(entrenos, 'press-de-banca-con-barra');
      expect(h.map((x) => x.fecha).toList(), ['2026-08-03', '2026-08-10']);
    });
  });

  group('récords batidos', () {
    final previo = entreno('2026-08-03', 'press-de-banca-con-barra', [serie(80, 8)]);

    test('avisa cuando se sube el peso máximo', () {
      final hoyMismo = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(85, 8)]);
      final batidos = recordsBatidos(hoyMismo, [previo, hoyMismo]);
      expect(batidos.length, 1);
      expect(batidos.first.tipo, TipoDeRecord.peso);
      expect(batidos.first.antes, 80);
      expect(batidos.first.ahora, 85);
    });

    test('no se compara consigo mismo', () {
      final hoyMismo = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 8)]);
      expect(recordsBatidos(hoyMismo, [previo, hoyMismo]), isEmpty);
    });

    test('la primera vez que se hace un ejercicio no cuenta como récord', () {
      final hoyMismo = entreno('2026-08-10', 'sentadilla-con-barra', [serie(100, 5)]);
      expect(recordsBatidos(hoyMismo, [previo, hoyMismo]), isEmpty);
    });

    test('con el mismo peso, más repeticiones también es récord', () {
      final hoyMismo = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 10)]);
      expect(recordsBatidos(hoyMismo, [previo, hoyMismo]).first.tipo, TipoDeRecord.estimado);
    });
  });

  group('última vez', () {
    test('devuelve las series de la sesión más reciente', () {
      final previa = ultimaVezDe([
        entreno('2026-08-03', 'press-de-banca-con-barra', [serie(80, 8)]),
        entreno('2026-08-10', 'press-de-banca-con-barra', [serie(85, 8)]),
      ], 'press-de-banca-con-barra');
      expect(previa?.fecha, '2026-08-10');
      expect(previa?.series.first.peso, 85);
    });

    test('el entreno en curso no es «la última vez»', () {
      final enCurso = entreno('2026-08-12', 'press-de-banca-con-barra', [serie(95, 5)]);
      final previa = ultimaVezDe(
        [entreno('2026-08-10', 'press-de-banca-con-barra', [serie(85, 8)]), enCurso],
        'press-de-banca-con-barra',
        excluir: enCurso.id,
      );
      expect(previa?.fecha, '2026-08-10');
    });
  });

  group('series por grupo', () {
    test('cuenta media serie a los grupos secundarios', () {
      final cuenta = seriesPorGrupo(
        [entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5), serie(80, 5)])],
        ejerciciosDeCasa,
      );
      expect(cuenta[Grupo.pecho], 2);
      // El press de banca lleva tríceps y hombros de refuerzo.
      expect(cuenta[Grupo.triceps], 1);
      expect(cuenta[Grupo.hombros], 1);
    });

    test('ignora ejercicios que ya no están en el catálogo', () {
      final cuenta = seriesPorGrupo(
        [entreno('2026-08-10', 'ejercicio-que-ya-no-existe', [serie(80, 5)])],
        ejerciciosDeCasa,
      );
      expect(cuenta, isEmpty);
    });
  });

  group('el catálogo generado', () {
    test('trae los ejercicios de la versión web', () {
      expect(ejerciciosDeCasa.length, greaterThan(250));
    });

    test('no hay ids repetidos: los entrenos guardados apuntan a ellos', () {
      final ids = ejerciciosDeCasa.map((e) => e.id).toList();
      expect(ids.toSet().length, ids.length);
    });

    test('el id sale del nombre sin acentos', () {
      expect(idDeNombre('Elevación de talones de pie en máquina'),
          'elevacion-de-talones-de-pie-en-maquina');
    });

    test('busca por trozos sueltos y sin acentos', () {
      final press = ejerciciosDeCasa.firstWhere((e) => e.id == 'press-inclinado-con-mancuernas');
      expect(coincide(press, 'press incl mancu'), isTrue);
      expect(coincide(press, 'sentadilla'), isFalse);
    });

    test('los ejercicios propios van delante de los de casa', () {
      final mio = Ejercicio(
        id: 'mi-maquina',
        nombre: 'Mi máquina',
        grupo: Grupo.pecho,
        equipo: Equipo.maquina,
        propio: true,
      );
      expect(catalogoCon([mio]).first.id, 'mi-maquina');
    });

    test('un ejercicio propio con el id de uno de casa lo sustituye, no lo duplica', () {
      final mio = Ejercicio(
        id: 'press-de-banca-con-barra',
        nombre: 'Press de banca con barra',
        grupo: Grupo.pecho,
        equipo: Equipo.barra,
        propio: true,
      );
      final catalogo = catalogoCon([mio]);
      expect(catalogo.where((e) => e.id == 'press-de-banca-con-barra').length, 1);
    });

    test('sobrevive a ir y volver de JSON', () {
      final original =
          ejerciciosDeCasa.firstWhere((e) => e.medida == FormaDeMedir.distanciaTiempo);
      final vuelta = Ejercicio.deJson(original.aJson());
      expect(vuelta.id, original.id);
      expect(vuelta.medida, original.medida);
      expect(vuelta.grupo, original.grupo);
      expect(vuelta.secundarios, original.secundarios);
    });
  });

  group('el entreno sobrevive a ir y volver de JSON', () {
    test('con todo lo que lleva dentro', () {
      final original = entreno('2026-08-10', 'press-de-banca-con-barra', [
        serie(40, 10, tipo: TipoDeSerie.calentamiento),
        SerieRegistrada(peso: 80, reps: 8, rpe: 8, hecha: true),
      ]);
      original.notas = 'Buen día';
      original.sensacion = 4;

      final vuelta = Entreno.deJson(original.aJson());
      expect(vuelta.id, original.id);
      expect(vuelta.fecha, original.fecha);
      expect(vuelta.notas, 'Buen día');
      expect(vuelta.sensacion, 4);
      expect(vuelta.volumen, original.volumen);
      expect(vuelta.ejercicios.first.series.first.tipo, TipoDeSerie.calentamiento);
      expect(vuelta.ejercicios.first.series[1].rpe, 8);
      expect(vuelta.enCurso, isFalse);
    });

    test('un entreno en curso sigue en curso al volver', () {
      final enCurso = Entreno(
        id: 'x',
        fecha: '2026-08-12',
        nombre: 'Entreno libre',
        comienzo: DateTime.now(),
        ejercicios: [],
      );
      expect(Entreno.deJson(enCurso.aJson()).enCurso, isTrue);
    });
  });
}
