/// Todo lo que se guarda, y cómo se guarda.
///
/// Un archivo JSON por colección en la carpeta de datos de la aplicación. No hay base de
/// datos, y es a propósito:
///
///  · Un año de entrenos son unos cientos de kilobytes. Meter SQL —esquema, migraciones,
///    consultas— para eso es traer toda la maquinaria y ninguna de las ventajas: la
///    aplicación siempre lee la colección **entera** en memoria, porque el resumen de la
///    semana y los récords necesitan mirarlo todo de todas formas.
///  · La copia de seguridad es el propio archivo. Sin exportador que pueda desincronizarse
///    del formato real.
///
/// Lo que sí hace falta cuidar: **escribir sin poder dejar el archivo a medias**. Se escribe
/// en un temporal y se renombra encima, que es una operación atómica del sistema de
/// archivos. Si el móvil se apaga a mitad, queda la versión anterior íntegra en vez de un
/// JSON truncado que no se puede leer — y perder el historial entero por un apagón sería
/// bastante peor que perder el último entreno.
library;

import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:path_provider/path_provider.dart';

import '../datos/ejercicios.dart';
import '../motor/entreno.dart';
import '../motor/fechas.dart';

/// Un id nuevo. No hace falta que sea un UUID de verdad: sólo que no choque con otro id
/// de este mismo dispositivo, y el reloj más azar de sobra para eso.
String nuevoId() {
  final azar = Random().nextInt(1 << 32).toRadixString(36);
  return 'id-${DateTime.now().microsecondsSinceEpoch.toRadixString(36)}-$azar';
}

// ─────────────────────────── Rutinas ───────────────────────────

/// Un ejercicio dentro de una rutina: lo que uno *pretende* hacer.
///
/// Las repeticiones son texto (`8-10`, `al fallo`) y no un número porque una rutina se
/// escribe como se habla. El número exacto se apunta al hacer la serie, que es donde sí
/// tiene que ser un número.
class PlantillaEjercicio {
  PlantillaEjercicio({
    required this.ejercicioId,
    this.series = 3,
    this.reps = '8-10',
    this.peso,
    this.descanso = 90,
    this.notas,
  });

  String ejercicioId;
  int series;
  String reps;
  double? peso;
  int descanso;
  String? notas;

  Map<String, dynamic> aJson() => {
        'ejercicioId': ejercicioId,
        'series': series,
        'reps': reps,
        'peso': peso,
        'descanso': descanso,
        'notas': notas,
      };

  static PlantillaEjercicio deJson(Map<String, dynamic> j) => PlantillaEjercicio(
        ejercicioId: j['ejercicioId'] as String,
        series: (j['series'] as num?)?.toInt() ?? 3,
        reps: (j['reps'] as String?) ?? '8-10',
        peso: (j['peso'] as num?)?.toDouble(),
        descanso: (j['descanso'] as num?)?.toInt() ?? 90,
        notas: j['notas'] as String?,
      );
}

/// Un día de la rutina. Una rutina tiene varios días porque así se entrena: «Torso /
/// Pierna», «Empuje / Tirón / Pierna». Como lista plana habría que crear cinco rutinas y no
/// se podrían ver como un plan.
class DiaDeRutina {
  DiaDeRutina({required this.id, required this.nombre, required this.ejercicios});

  final String id;
  String nombre;
  List<PlantillaEjercicio> ejercicios;

  Map<String, dynamic> aJson() =>
      {'id': id, 'nombre': nombre, 'ejercicios': ejercicios.map((e) => e.aJson()).toList()};

  static DiaDeRutina deJson(Map<String, dynamic> j) => DiaDeRutina(
        id: j['id'] as String,
        nombre: j['nombre'] as String,
        ejercicios: ((j['ejercicios'] as List?) ?? const [])
            .map((e) => PlantillaEjercicio.deJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class Rutina {
  Rutina({
    required this.id,
    required this.nombre,
    required this.dias,
    DateTime? actualizadoEn,
    this.descripcion,
    this.favorita = false,
  }) : actualizadoEn = actualizadoEn ?? DateTime.now();

  final String id;
  DateTime actualizadoEn;
  String nombre;
  String? descripcion;
  List<DiaDeRutina> dias;

  /// Se muestra primero y se propone al empezar a entrenar.
  bool favorita;

  Map<String, dynamic> aJson() => {
        'id': id,
        'actualizadoEn': actualizadoEn.toIso8601String(),
        'nombre': nombre,
        'descripcion': descripcion,
        'favorita': favorita,
        'dias': dias.map((d) => d.aJson()).toList(),
      };

  static Rutina deJson(Map<String, dynamic> j) => Rutina(
        id: j['id'] as String,
        actualizadoEn: DateTime.parse(j['actualizadoEn'] as String),
        nombre: j['nombre'] as String,
        descripcion: j['descripcion'] as String?,
        favorita: (j['favorita'] as bool?) ?? false,
        dias: ((j['dias'] as List?) ?? const [])
            .map((d) => DiaDeRutina.deJson(d as Map<String, dynamic>))
            .toList(),
      );
}

// ─────────────────────────── Medidas ───────────────────────────

/// Peso y perímetros. Todo opcional: se apunta lo que se mide ese día, no todo. Un hueco
/// vacío es «no me lo he medido», que no es lo mismo que «mide cero».
class Medida {
  Medida({
    required this.id,
    required this.fecha,
    DateTime? actualizadoEn,
    this.peso,
    this.grasa,
    this.musculo,
    this.cintura,
    this.pecho,
    this.brazo,
    this.pierna,
    this.cadera,
    this.notas,
  }) : actualizadoEn = actualizadoEn ?? DateTime.now();

  final String id;
  DateTime actualizadoEn;
  ClaveDia fecha;
  double? peso;
  double? grasa;
  double? musculo;
  double? cintura;
  double? pecho;
  double? brazo;
  double? pierna;
  double? cadera;
  String? notas;

  bool get vacia => [peso, grasa, musculo, cintura, pecho, brazo, pierna, cadera]
      .every((v) => v == null);

  Map<String, dynamic> aJson() => {
        'id': id,
        'actualizadoEn': actualizadoEn.toIso8601String(),
        'fecha': fecha,
        'peso': peso,
        'grasa': grasa,
        'musculo': musculo,
        'cintura': cintura,
        'pecho': pecho,
        'brazo': brazo,
        'pierna': pierna,
        'cadera': cadera,
        'notas': notas,
      };

  static Medida deJson(Map<String, dynamic> j) => Medida(
        id: j['id'] as String,
        actualizadoEn: DateTime.parse(j['actualizadoEn'] as String),
        fecha: j['fecha'] as String,
        peso: (j['peso'] as num?)?.toDouble(),
        grasa: (j['grasa'] as num?)?.toDouble(),
        musculo: (j['musculo'] as num?)?.toDouble(),
        cintura: (j['cintura'] as num?)?.toDouble(),
        pecho: (j['pecho'] as num?)?.toDouble(),
        brazo: (j['brazo'] as num?)?.toDouble(),
        pierna: (j['pierna'] as num?)?.toDouble(),
        cadera: (j['cadera'] as num?)?.toDouble(),
        notas: j['notas'] as String?,
      );
}

// ─────────────────────────── Ajustes ───────────────────────────

class Ajustes {
  Ajustes({
    this.nombre,
    this.tema = 'oscuro',
    this.descansoPorDefecto = 90,
    this.avisoDescanso = true,
    this.avisoConPantallaApagada = true,
  });

  String? nombre;
  String tema;
  int descansoPorDefecto;

  /// Vibrar al acabar el descanso.
  bool avisoDescanso;

  /// Notificación al acabar el descanso aunque la app no esté delante. Es lo que no puede
  /// hacer la versión web, y la razón de que esto sea una app de Android.
  bool avisoConPantallaApagada;

  Map<String, dynamic> aJson() => {
        'nombre': nombre,
        'tema': tema,
        'descansoPorDefecto': descansoPorDefecto,
        'avisoDescanso': avisoDescanso,
        'avisoConPantallaApagada': avisoConPantallaApagada,
      };

  static Ajustes deJson(Map<String, dynamic> j) => Ajustes(
        nombre: j['nombre'] as String?,
        tema: (j['tema'] as String?) ?? 'oscuro',
        descansoPorDefecto: (j['descansoPorDefecto'] as num?)?.toInt() ?? 90,
        avisoDescanso: (j['avisoDescanso'] as bool?) ?? true,
        avisoConPantallaApagada: (j['avisoConPantallaApagada'] as bool?) ?? true,
      );
}

// ─────────────────────────── El almacén ───────────────────────────

class Almacen {
  Almacen({Directory? carpeta}) : _carpetaFijada = carpeta;

  /// Para las pruebas: una carpeta temporal en vez de la del sistema.
  final Directory? _carpetaFijada;
  Directory? _carpeta;

  Future<Directory> get carpeta async {
    if (_carpetaFijada != null) return _carpetaFijada;
    return _carpeta ??= await getApplicationDocumentsDirectory();
  }

  Future<File> _archivo(String nombre) async => File('${(await carpeta).path}/$nombre.json');

  /// Lee una lista. Un archivo que no existe es una colección vacía, no un error: la
  /// primera vez que se abre la aplicación no hay nada y eso es lo normal.
  Future<List<T>> _leerLista<T>(String nombre, T Function(Map<String, dynamic>) deJson) async {
    final archivo = await _archivo(nombre);
    if (!await archivo.exists()) return [];
    try {
      final crudo = jsonDecode(await archivo.readAsString());
      if (crudo is! List) return [];
      return crudo
          .whereType<Map<String, dynamic>>()
          .map((j) {
            try {
              return deJson(j);
            } catch (_) {
              // Un registro corrupto no se lleva por delante el resto del historial.
              return null;
            }
          })
          .whereType<T>()
          .toList();
    } catch (_) {
      return [];
    }
  }

  /// Escribe en un temporal y renombra encima: si el móvil se apaga a mitad, queda la
  /// versión anterior entera en vez de un archivo truncado.
  Future<void> _escribir(String nombre, Object contenido) async {
    final destino = await _archivo(nombre);
    final temporal = File('${destino.path}.tmp');
    await temporal.writeAsString(jsonEncode(contenido), flush: true);
    await temporal.rename(destino.path);
  }

  // Entrenos ─ del más reciente al más antiguo, que es como se leen.
  Future<List<Entreno>> leerEntrenos() async {
    final lista = await _leerLista('entrenos', Entreno.deJson);
    lista.sort((a, b) => b.comienzo.compareTo(a.comienzo));
    return lista;
  }

  Future<void> guardarEntrenos(List<Entreno> entrenos) =>
      _escribir('entrenos', entrenos.map((e) => e.aJson()).toList());

  // Rutinas ─ las favoritas primero, después por nombre.
  Future<List<Rutina>> leerRutinas() async {
    final lista = await _leerLista('rutinas', Rutina.deJson);
    lista.sort((a, b) {
      if (a.favorita != b.favorita) return a.favorita ? -1 : 1;
      return a.nombre.toLowerCase().compareTo(b.nombre.toLowerCase());
    });
    return lista;
  }

  Future<void> guardarRutinas(List<Rutina> rutinas) =>
      _escribir('rutinas', rutinas.map((r) => r.aJson()).toList());

  /// Ejercicios propios. El catálogo de casa no se guarda —vive en el código—, así que aquí
  /// sólo están los que ha escrito el usuario.
  Future<List<Ejercicio>> leerEjercicios() async {
    final lista = await _leerLista('ejercicios', Ejercicio.deJson);
    lista.sort((a, b) => a.nombre.compareTo(b.nombre));
    return lista;
  }

  Future<void> guardarEjercicios(List<Ejercicio> ejercicios) =>
      _escribir('ejercicios', ejercicios.map((e) => e.aJson()).toList());

  // Medidas ─ de la más reciente a la más antigua.
  Future<List<Medida>> leerMedidas() async {
    final lista = await _leerLista('medidas', Medida.deJson);
    lista.sort((a, b) => b.fecha.compareTo(a.fecha));
    return lista;
  }

  Future<void> guardarMedidas(List<Medida> medidas) =>
      _escribir('medidas', medidas.map((m) => m.aJson()).toList());

  // Ajustes ─ un único objeto.
  Future<Ajustes> leerAjustes() async {
    final archivo = await _archivo('ajustes');
    if (!await archivo.exists()) return Ajustes();
    try {
      final crudo = jsonDecode(await archivo.readAsString());
      // Se fusiona con los valores por defecto: añadir un ajuste nuevo no debe romper los
      // que ya estaban guardados sin ese campo.
      return Ajustes.deJson(crudo as Map<String, dynamic>);
    } catch (_) {
      return Ajustes();
    }
  }

  Future<void> guardarAjustes(Ajustes ajustes) => _escribir('ajustes', ajustes.aJson());

  /// Todo junto, para la copia de seguridad.
  Future<String> exportar() async {
    final datos = {
      'version': 1,
      'exportadoEn': DateTime.now().toIso8601String(),
      'entrenos': (await leerEntrenos()).map((e) => e.aJson()).toList(),
      'rutinas': (await leerRutinas()).map((r) => r.aJson()).toList(),
      'ejercicios': (await leerEjercicios()).map((e) => e.aJson()).toList(),
      'medidas': (await leerMedidas()).map((m) => m.aJson()).toList(),
      'ajustes': (await leerAjustes()).aJson(),
    };
    return const JsonEncoder.withIndent('  ').convert(datos);
  }

  /// Restaura una copia.
  ///
  /// No borra lo que hay: fusiona por id y, en caso de choque, gana lo más recientemente
  /// tocado. Así importar dos veces la misma copia no duplica nada, y traer la copia del
  /// móvil viejo no se lleva por delante lo de aquí.
  Future<Map<String, int>> importar(String json) async {
    final datos = jsonDecode(json) as Map<String, dynamic>;
    final cuenta = <String, int>{};

    List<T> fusionar<T>(
      List<T> actuales,
      List<dynamic>? entrantes,
      T Function(Map<String, dynamic>) deJson,
      String Function(T) idDe,
      DateTime Function(T) fechaDe,
      String etiqueta,
    ) {
      if (entrantes == null) return actuales;
      final porId = {for (final r in actuales) idDe(r): r};
      var nuevos = 0;
      for (final crudo in entrantes.whereType<Map<String, dynamic>>()) {
        final T entrante;
        try {
          entrante = deJson(crudo);
        } catch (_) {
          continue;
        }
        final previo = porId[idDe(entrante)];
        if (previo != null && fechaDe(previo).isAfter(fechaDe(entrante))) continue;
        porId[idDe(entrante)] = entrante;
        nuevos += 1;
      }
      cuenta[etiqueta] = nuevos;
      return porId.values.toList();
    }

    final entrenos = fusionar(await leerEntrenos(), datos['entrenos'] as List?, Entreno.deJson,
        (e) => e.id, (e) => e.actualizadoEn, 'entrenos');
    final rutinas = fusionar(await leerRutinas(), datos['rutinas'] as List?, Rutina.deJson,
        (r) => r.id, (r) => r.actualizadoEn, 'rutinas');
    final medidas = fusionar(await leerMedidas(), datos['medidas'] as List?, Medida.deJson,
        (m) => m.id, (m) => m.actualizadoEn, 'medidas');

    // Los ejercicios propios no llevan fecha de modificación: se queda el que entra.
    final ejerciciosActuales = {for (final e in await leerEjercicios()) e.id: e};
    var ejerciciosNuevos = 0;
    for (final crudo in (datos['ejercicios'] as List? ?? []).whereType<Map<String, dynamic>>()) {
      try {
        final e = Ejercicio.deJson(crudo);
        ejerciciosActuales[e.id] = e;
        ejerciciosNuevos += 1;
      } catch (_) {
        continue;
      }
    }
    cuenta['ejercicios'] = ejerciciosNuevos;

    await guardarEntrenos(entrenos);
    await guardarRutinas(rutinas);
    await guardarMedidas(medidas);
    await guardarEjercicios(ejerciciosActuales.values.toList());

    return cuenta;
  }

  /// Empezar de cero: se va todo.
  Future<void> borrarTodo() async {
    for (final nombre in ['entrenos', 'rutinas', 'ejercicios', 'medidas', 'ajustes']) {
      final archivo = await _archivo(nombre);
      if (await archivo.exists()) await archivo.delete();
    }
  }
}

/// Un entreno recién empezado.
Entreno entrenoVacio([String nombre = 'Entreno libre']) {
  final ahora = DateTime.now();
  return Entreno(
    id: nuevoId(),
    fecha: claveDia(ahora),
    nombre: nombre,
    comienzo: ahora,
    ejercicios: [],
  );
}

Rutina rutinaVacia([String nombre = 'Rutina nueva']) => Rutina(
      id: nuevoId(),
      nombre: nombre,
      dias: [DiaDeRutina(id: nuevoId(), nombre: 'Día 1', ejercicios: [])],
    );
