/// Los números de un entreno: volumen, series, récords y reparto por grupo muscular.
///
/// No depende de la interfaz ni de la persistencia, y por eso se puede probar
/// (`test/entreno_test.dart`) sin arrancar la aplicación ni conectar un móvil. Es donde
/// conviene tener cuidado: un récord mal calculado se nota, porque se compara con lo que
/// uno cree que levantó la semana pasada.
library;

import '../datos/ejercicios.dart';
import 'fechas.dart';

/// El calentamiento se apunta pero **no** cuenta como volumen: si contara, subir el peso
/// poco a poco antes de la serie fuerte inflaría el total y las gráficas dirían que se
/// entrena más cada semana cuando lo único que ha cambiado es el calentamiento.
enum TipoDeSerie {
  normal('normal', 'Serie normal'),
  calentamiento('calentamiento', 'Calentamiento (no cuenta para el volumen)'),
  fallo('fallo', 'Al fallo'),
  descendente('descendente', 'Serie descendente');

  const TipoDeSerie(this.clave, this.nombre);
  final String clave;
  final String nombre;

  static TipoDeSerie deClave(String? clave) =>
      TipoDeSerie.values.firstWhere((t) => t.clave == clave, orElse: () => TipoDeSerie.normal);
}

class SerieRegistrada {
  SerieRegistrada({
    this.peso,
    this.reps,
    this.segundos,
    this.distancia,
    this.rpe,
    this.hecha = false,
    this.tipo = TipoDeSerie.normal,
  });

  /// Kilos de la serie. Con peso corporal es el lastre.
  double? peso;
  int? reps;

  /// Isométricos y cardio.
  int? segundos;

  /// Kilómetros.
  double? distancia;

  /// Esfuerzo percibido, 1 a 10.
  int? rpe;

  /// Marcada como hecha. Lo que no está hecho no cuenta para nada.
  bool hecha;
  TipoDeSerie tipo;

  /// Sólo cuentan las series hechas que no son de calentamiento.
  bool get cuenta => hecha && tipo != TipoDeSerie.calentamiento;

  /// Kilos × repeticiones. Lo que no tiene las dos cosas no suma volumen.
  double get volumen => cuenta ? (peso ?? 0) * (reps ?? 0) : 0;

  SerieRegistrada copia() => SerieRegistrada(
        peso: peso,
        reps: reps,
        segundos: segundos,
        distancia: distancia,
        rpe: rpe,
        hecha: hecha,
        tipo: tipo,
      );

  Map<String, dynamic> aJson() => {
        'peso': peso,
        'reps': reps,
        'segundos': segundos,
        'distancia': distancia,
        'rpe': rpe,
        'hecha': hecha,
        'tipo': tipo.clave,
      };

  static SerieRegistrada deJson(Map<String, dynamic> j) => SerieRegistrada(
        peso: (j['peso'] as num?)?.toDouble(),
        reps: (j['reps'] as num?)?.toInt(),
        segundos: (j['segundos'] as num?)?.toInt(),
        distancia: (j['distancia'] as num?)?.toDouble(),
        rpe: (j['rpe'] as num?)?.toInt(),
        hecha: (j['hecha'] as bool?) ?? false,
        tipo: TipoDeSerie.deClave(j['tipo'] as String?),
      );
}

class EjercicioDelEntreno {
  EjercicioDelEntreno({
    required this.id,
    required this.ejercicioId,
    required this.series,
    this.descanso = 90,
    this.notas,
  });

  /// Id de esta línea, no del ejercicio: el mismo ejercicio puede repetirse en un entreno.
  final String id;
  String ejercicioId;
  List<SerieRegistrada> series;

  /// Descanso entre series, en segundos.
  int descanso;
  String? notas;

  double get volumen => series.fold(0.0, (t, s) => t + s.volumen);

  Map<String, dynamic> aJson() => {
        'id': id,
        'ejercicioId': ejercicioId,
        'descanso': descanso,
        'notas': notas,
        'series': series.map((s) => s.aJson()).toList(),
      };

  static EjercicioDelEntreno deJson(Map<String, dynamic> j) => EjercicioDelEntreno(
        id: j['id'] as String,
        ejercicioId: j['ejercicioId'] as String,
        descanso: (j['descanso'] as num?)?.toInt() ?? 90,
        notas: j['notas'] as String?,
        series: ((j['series'] as List?) ?? const [])
            .map((s) => SerieRegistrada.deJson(s as Map<String, dynamic>))
            .toList(),
      );
}

class Entreno {
  Entreno({
    required this.id,
    required this.fecha,
    required this.nombre,
    required this.comienzo,
    required this.ejercicios,
    DateTime? actualizadoEn,
    this.fin,
    this.rutinaId,
    this.diaId,
    this.notas,
    this.sensacion,
  }) : actualizadoEn = actualizadoEn ?? DateTime.now();

  final String id;
  DateTime actualizadoEn;

  /// `AAAA-MM-DD` local.
  ClaveDia fecha;
  String nombre;
  DateTime comienzo;

  /// Cuándo se cerró. **`null` significa que está en curso**, y de ahí sale el entreno
  /// activo: no hace falta guardar en otro sitio «cuál estoy haciendo ahora», que es lo que
  /// se queda desincronizado en cuanto algo falla a medias.
  DateTime? fin;

  String? rutinaId;
  String? diaId;
  String? notas;

  /// Cómo ha ido, de 1 a 5.
  int? sensacion;

  List<EjercicioDelEntreno> ejercicios;

  bool get enCurso => fin == null;
  double get volumen => ejercicios.fold(0.0, (t, e) => t + e.volumen);
  int get seriesHechas =>
      ejercicios.fold(0, (n, e) => n + e.series.where((s) => s.cuenta).length);
  int get repeticionesTotales => ejercicios.fold(
      0, (n, e) => n + e.series.where((s) => s.cuenta).fold(0, (r, s) => r + (s.reps ?? 0)));
  int get duracionEnSegundos => segundosEntre(comienzo, fin);

  Map<String, dynamic> aJson() => {
        'id': id,
        'actualizadoEn': actualizadoEn.toIso8601String(),
        'fecha': fecha,
        'nombre': nombre,
        'comienzo': comienzo.toIso8601String(),
        'fin': fin?.toIso8601String(),
        'rutinaId': rutinaId,
        'diaId': diaId,
        'notas': notas,
        'sensacion': sensacion,
        'ejercicios': ejercicios.map((e) => e.aJson()).toList(),
      };

  static Entreno deJson(Map<String, dynamic> j) => Entreno(
        id: j['id'] as String,
        actualizadoEn: DateTime.parse(j['actualizadoEn'] as String),
        fecha: j['fecha'] as String,
        nombre: j['nombre'] as String,
        comienzo: DateTime.parse(j['comienzo'] as String),
        fin: j['fin'] == null ? null : DateTime.parse(j['fin'] as String),
        rutinaId: j['rutinaId'] as String?,
        diaId: j['diaId'] as String?,
        notas: j['notas'] as String?,
        sensacion: (j['sensacion'] as num?)?.toInt(),
        ejercicios: ((j['ejercicios'] as List?) ?? const [])
            .map((e) => EjercicioDelEntreno.deJson(e as Map<String, dynamic>))
            .toList(),
      );
}

/// Estimación del máximo a una repetición por la fórmula de Epley.
///
/// Es una estimación, no una medida: por encima de unas doce repeticiones se va, así que se
/// devuelve `null` en vez de un número bonito y falso. Vale para comparar progreso entre
/// series de distintas repeticiones, que es para lo que se usa aquí.
double? unaRepeticionMaxima(double peso, int reps) {
  if (peso <= 0 || reps <= 0 || reps > 12) return null;
  if (reps == 1) return peso;
  return (peso * (1 + reps / 30) * 10).round() / 10;
}

class Marca {
  const Marca({
    required this.peso,
    required this.reps,
    required this.fecha,
    this.estimado,
  });

  final double peso;
  final int reps;

  /// Máximo estimado, si la serie está en el rango en el que la fórmula se sostiene.
  final double? estimado;
  final ClaveDia fecha;

  double get valorParaComparar => estimado ?? peso;
}

/// La mejor serie de una lista, por máximo estimado; a igualdad, la de más peso.
Marca? mejorSerie(List<SerieRegistrada> series, ClaveDia fecha) {
  Marca? mejor;
  for (final s in series) {
    if (!s.cuenta || s.peso == null || s.reps == null) continue;
    final candidata = Marca(
      peso: s.peso!,
      reps: s.reps!,
      estimado: unaRepeticionMaxima(s.peso!, s.reps!),
      fecha: fecha,
    );
    final actual = mejor?.valorParaComparar ?? -1;
    if (candidata.valorParaComparar > actual ||
        (candidata.valorParaComparar == actual && candidata.peso > (mejor?.peso ?? 0))) {
      mejor = candidata;
    }
  }
  return mejor;
}

class VolumenDeSesion {
  const VolumenDeSesion(this.volumen, this.fecha);
  final double volumen;
  final ClaveDia fecha;
}

class Records {
  Records({
    this.mejorPeso,
    this.mejorEstimado,
    this.masRepeticiones,
    this.mejorVolumenDeSesion,
    this.vecesEntrenado = 0,
    this.ultimaVez,
  });

  Marca? mejorPeso;
  Marca? mejorEstimado;
  Marca? masRepeticiones;
  VolumenDeSesion? mejorVolumenDeSesion;
  int vecesEntrenado;
  ClaveDia? ultimaVez;
}

/// Los récords de un ejercicio a lo largo de todo el historial.
Records recordsDe(List<Entreno> entrenos, String ejercicioId) {
  final r = Records();

  for (final entreno in entrenos) {
    final lineas = entreno.ejercicios.where((x) => x.ejercicioId == ejercicioId).toList();
    if (lineas.isEmpty) continue;

    final series = lineas.expand((l) => l.series).where((s) => s.cuenta).toList();
    if (series.isEmpty) continue;

    r.vecesEntrenado += 1;
    if (r.ultimaVez == null || entreno.fecha.compareTo(r.ultimaVez!) > 0) {
      r.ultimaVez = entreno.fecha;
    }

    final volumen = lineas.fold(0.0, (t, l) => t + l.volumen);
    if (volumen > 0 &&
        (r.mejorVolumenDeSesion == null || volumen > r.mejorVolumenDeSesion!.volumen)) {
      r.mejorVolumenDeSesion = VolumenDeSesion(volumen, entreno.fecha);
    }

    for (final s in series) {
      if (s.peso == null || s.reps == null) continue;
      final marca = Marca(
        peso: s.peso!,
        reps: s.reps!,
        estimado: unaRepeticionMaxima(s.peso!, s.reps!),
        fecha: entreno.fecha,
      );
      if (r.mejorPeso == null || marca.peso > r.mejorPeso!.peso) r.mejorPeso = marca;
      if (marca.estimado != null &&
          (r.mejorEstimado == null || marca.estimado! > (r.mejorEstimado!.estimado ?? 0))) {
        r.mejorEstimado = marca;
      }
      if (r.masRepeticiones == null || marca.reps > r.masRepeticiones!.reps) {
        r.masRepeticiones = marca;
      }
    }
  }

  return r;
}

enum TipoDeRecord { peso, estimado, reps }

class RecordBatido {
  const RecordBatido({
    required this.ejercicioId,
    required this.tipo,
    required this.ahora,
    this.antes,
  });

  final String ejercicioId;
  final TipoDeRecord tipo;

  /// Lo que había antes. `null` si es la primera vez que se hace el ejercicio.
  final double? antes;
  final double ahora;
}

/// Qué récords ha batido un entreno.
///
/// Se compara contra el historial **sin contar este entreno**: si se comparara contra todo,
/// la propia serie que acaba de hacerse ya sería el récord y nunca se batiría nada.
///
/// La primera vez que se hace un ejercicio no cuenta como récord. Técnicamente lo es —no
/// había nada antes— pero avisar de que has batido tu récord de una máquina que estrenas hoy
/// convierte el aviso en ruido, y a la tercera vez ya nadie lo lee.
List<RecordBatido> recordsBatidos(Entreno entreno, List<Entreno> historial) {
  final otros = historial.where((e) => e.id != entreno.id && !e.enCurso).toList();
  final batidos = <RecordBatido>[];
  final vistos = <String>{};

  for (final linea in entreno.ejercicios) {
    if (!vistos.add(linea.ejercicioId)) continue;

    final series = entreno.ejercicios
        .where((l) => l.ejercicioId == linea.ejercicioId)
        .expand((l) => l.series)
        .toList();
    final mejor = mejorSerie(series, entreno.fecha);
    if (mejor == null) continue;

    final previos = recordsDe(otros, linea.ejercicioId);
    if (previos.vecesEntrenado == 0) continue;

    if (mejor.peso > (previos.mejorPeso?.peso ?? 0)) {
      batidos.add(RecordBatido(
        ejercicioId: linea.ejercicioId,
        tipo: TipoDeRecord.peso,
        antes: previos.mejorPeso?.peso,
        ahora: mejor.peso,
      ));
      continue;
    }
    if (mejor.estimado != null &&
        mejor.estimado! > (previos.mejorEstimado?.estimado ?? 0)) {
      batidos.add(RecordBatido(
        ejercicioId: linea.ejercicioId,
        tipo: TipoDeRecord.estimado,
        antes: previos.mejorEstimado?.estimado,
        ahora: mejor.estimado!,
      ));
      continue;
    }
    if (mejor.reps > (previos.masRepeticiones?.reps ?? 0)) {
      batidos.add(RecordBatido(
        ejercicioId: linea.ejercicioId,
        tipo: TipoDeRecord.reps,
        antes: previos.masRepeticiones?.reps.toDouble(),
        ahora: mejor.reps.toDouble(),
      ));
    }
  }

  return batidos;
}

/// Series por grupo muscular.
///
/// Es la cuenta que de verdad sirve para planificar una semana —más que el tonelaje, que
/// sube solo al cambiar de ejercicio—. Lo que un ejercicio trabaja de refuerzo cuenta
/// **media serie**: el press de banca hace algo por el tríceps, pero no lo mismo que una
/// extensión en polea, y contarlo entero diría que los tríceps están cubiertos cuando no se
/// han tocado.
Map<Grupo, double> seriesPorGrupo(List<Entreno> entrenos, List<Ejercicio> catalogo) {
  final porId = {for (final e in catalogo) e.id: e};
  final cuenta = <Grupo, double>{};

  for (final entreno in entrenos) {
    for (final linea in entreno.ejercicios) {
      final ejercicio = porId[linea.ejercicioId];
      if (ejercicio == null) continue;
      final series = linea.series.where((s) => s.cuenta).length;
      if (series == 0) continue;
      cuenta[ejercicio.grupo] = (cuenta[ejercicio.grupo] ?? 0) + series;
      for (final secundario in ejercicio.secundarios) {
        cuenta[secundario] = (cuenta[secundario] ?? 0) + series / 2;
      }
    }
  }

  return cuenta;
}

class SemanaDeVolumen {
  const SemanaDeVolumen(this.semana, this.volumen, this.entrenos);
  final ClaveDia semana;
  final double volumen;
  final int entrenos;
}

/// Volumen por semana, de la más antigua a la más reciente. Para la gráfica de progreso.
List<SemanaDeVolumen> volumenPorSemana(List<Entreno> entrenos) {
  final porSemana = <ClaveDia, List<double>>{};
  for (final e in entrenos) {
    if (e.enCurso) continue;
    final clave = lunesDe(e.fecha);
    final actual = porSemana.putIfAbsent(clave, () => [0, 0]);
    actual[0] += e.volumen;
    actual[1] += 1;
  }
  final salida = porSemana.entries
      .map((x) => SemanaDeVolumen(x.key, x.value[0], x.value[1].toInt()))
      .toList()
    ..sort((a, b) => a.semana.compareTo(b.semana));
  return salida;
}

class SesionDeEjercicio {
  const SesionDeEjercicio(this.fecha, this.mejor, this.volumen, this.series);
  final ClaveDia fecha;
  final Marca mejor;
  final double volumen;
  final int series;
}

/// El historial de un ejercicio: una entrada por sesión, con su mejor serie.
List<SesionDeEjercicio> historialDe(List<Entreno> entrenos, String ejercicioId) {
  final salida = <SesionDeEjercicio>[];
  for (final entreno in entrenos) {
    final lineas = entreno.ejercicios.where((x) => x.ejercicioId == ejercicioId).toList();
    if (lineas.isEmpty) continue;
    final series = lineas.expand((l) => l.series).toList();
    final mejor = mejorSerie(series, entreno.fecha);
    if (mejor == null) continue;
    salida.add(SesionDeEjercicio(
      entreno.fecha,
      mejor,
      lineas.fold(0.0, (t, l) => t + l.volumen),
      series.where((s) => s.cuenta).length,
    ));
  }
  salida.sort((a, b) => a.fecha.compareTo(b.fecha));
  return salida;
}

class UltimaVez {
  const UltimaVez(this.fecha, this.series);
  final ClaveDia fecha;
  final List<SerieRegistrada> series;
}

/// Qué se hizo la última vez con este ejercicio, para poder repetirlo o subirle algo.
///
/// Es lo primero que se mira al empezar una serie, así que se busca hacia atrás desde el
/// entreno más reciente.
UltimaVez? ultimaVezDe(List<Entreno> entrenos, String ejercicioId, {String? excluir}) {
  final ordenados = entrenos.where((e) => e.id != excluir && !e.enCurso).toList()
    ..sort((a, b) => b.fecha.compareTo(a.fecha));
  for (final entreno in ordenados) {
    final series = entreno.ejercicios
        .where((x) => x.ejercicioId == ejercicioId)
        .expand((x) => x.series)
        .where((s) => s.cuenta)
        .toList();
    if (series.isNotEmpty) return UltimaVez(entreno.fecha, series);
  }
  return null;
}
