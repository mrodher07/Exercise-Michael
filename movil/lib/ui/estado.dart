/// El estado de la aplicación: las colecciones guardadas y cómo se tocan.
///
/// Un único `ChangeNotifier` para todo, y no un gestor de estado con paquete aparte. El
/// motivo es el tamaño real del problema: aquí no hay peticiones a un servidor, ni caché que
/// invalidar, ni dos pantallas peleándose por el mismo dato. Hay cuatro listas en memoria y
/// unos archivos JSON al lado.
///
/// Se guarda **con retardo**. Escribir el archivo en cada pulsación de tecla mientras se
/// apunta un peso a mitad del entreno es escribir cincuenta veces para guardar un número;
/// con 400 ms de espera se escribe una vez y la interfaz responde igual, porque el estado en
/// memoria cambia en el acto y el archivo va detrás.
///
/// Y lo pendiente **se vuelca al irse la aplicación al fondo**. Ese retardo abre una ventana
/// en la que lo último escrito sólo está en memoria; si en ese momento se bloquea el móvil o
/// Android se lleva la aplicación, ese cambio se perdería, y la promesa de esto es justamente
/// que no hay que darle a guardar.
library;

import 'dart:async';

import 'package:flutter/widgets.dart';

import '../almacen/almacen.dart';
import '../datos/ejercicios.dart';
import '../motor/entreno.dart';
import '../motor/fechas.dart';

const _retardoGuardado = Duration(milliseconds: 400);

class Estado extends ChangeNotifier with WidgetsBindingObserver {
  Estado({Almacen? almacen}) : _almacen = almacen ?? Almacen() {
    WidgetsBinding.instance.addObserver(this);
  }

  final Almacen _almacen;

  var _cargando = true;
  bool get cargando => _cargando;

  Ajustes _ajustes = Ajustes();
  Ajustes get ajustes => _ajustes;

  List<Entreno> _entrenos = [];
  List<Entreno> get entrenos => _entrenos;

  /// Los entrenos terminados, que son los que cuentan para las estadísticas.
  List<Entreno> get entrenosHechos => _entrenos.where((e) => !e.enCurso).toList();

  /// El entreno en curso es el que no tiene fin. Sale de los propios datos y no de una
  /// variable aparte: así no puede haber dos versiones de la verdad, que es lo que se queda
  /// descolgado en cuanto algo falla a medias.
  Entreno? get enCurso => _entrenos.where((e) => e.enCurso).firstOrNull;

  List<Rutina> _rutinas = [];
  List<Rutina> get rutinas => _rutinas;

  List<Ejercicio> _propios = [];
  List<Ejercicio> get ejerciciosPropios => _propios;

  List<Medida> _medidas = [];
  List<Medida> get medidas => _medidas;

  List<Ejercicio> _catalogo = ejerciciosDeCasa;
  List<Ejercicio> get catalogo => _catalogo;
  Map<String, Ejercicio> _porId = {for (final e in ejerciciosDeCasa) e.id: e};

  Ejercicio? ejercicioPorId(String id) => _porId[id];

  /// Nombre para mostrar de un ejercicio que puede haber desaparecido del catálogo (por
  /// ejemplo si se borró uno propio que ya estaba en un entreno guardado).
  String nombreDeEjercicio(String id) => _porId[id]?.nombre ?? id;

  final _pendientes = <String, Timer>{};

  /// Las escrituras que ya han salido pero todavía no han acabado de tocar el disco.
  ///
  /// La ventana en la que un cambio sólo está en memoria no se cierra cuando salta el
  /// temporizador de los 400 ms, sino cuando el archivo está escrito. Sin llevar esta cuenta,
  /// `vaciarPendientes` podía contestar «ya está todo guardado» con una escritura a medio
  /// camino: justo el momento en el que Android puede matar el proceso.
  final _enVuelo = <Future<void>>{};

  void _anotarEscritura(Future<void> escritura) {
    // Si escribir falla no hay nada útil que hacer —el archivo anterior sigue entero, que
    // para eso se escribe en un temporal y se renombra encima—, pero el error no puede
    // quedar suelto: dejaría la espera de `vaciarPendientes` colgada de una excepción sin
    // dueño.
    final seguida = escritura.catchError((Object _) {});
    _enVuelo.add(seguida);
    seguida.whenComplete(() => _enVuelo.remove(seguida));
  }

  Future<void> cargar() async {
    _ajustes = await _almacen.leerAjustes();
    _entrenos = await _almacen.leerEntrenos();
    _rutinas = await _almacen.leerRutinas();
    _propios = await _almacen.leerEjercicios();
    _medidas = await _almacen.leerMedidas();
    _recalcularCatalogo();
    _cargando = false;
    notifyListeners();
  }

  void _recalcularCatalogo() {
    _catalogo = catalogoCon(_propios);
    _porId = {for (final e in _catalogo) e.id: e};
  }

  /// Programa el guardado de una colección. Si llega otro cambio antes de los 400 ms, se
  /// reinicia la cuenta: lo que se guarda es el estado final, no cada paso intermedio.
  void _programar(String coleccion, Future<void> Function() escribir) {
    _pendientes[coleccion]?.cancel();
    _pendientes[coleccion] = Timer(_retardoGuardado, () {
      _pendientes.remove(coleccion);
      _anotarEscritura(escribir());
    });
  }

  /// Escribe ya todo lo que estuviera esperando y **no vuelve hasta que está en el disco**,
  /// incluidas las escrituras que ya habían salido por su cuenta.
  Future<void> vaciarPendientes() async {
    for (final clave in _pendientes.keys.toList()) {
      _pendientes.remove(clave)?.cancel();
      _anotarEscritura(_escribirColeccion(clave));
    }
    // En bucle y no un único `Future.wait`: mientras se espera puede saltar el temporizador
    // de otra colección y añadir una escritura más a la lista.
    while (_enVuelo.isNotEmpty) {
      await Future.wait(_enVuelo.toList());
    }
  }

  Future<void> _escribirColeccion(String clave) => switch (clave) {
        'entrenos' => _almacen.guardarEntrenos(_entrenos),
        'rutinas' => _almacen.guardarRutinas(_rutinas),
        'ejercicios' => _almacen.guardarEjercicios(_propios),
        'medidas' => _almacen.guardarMedidas(_medidas),
        'ajustes' => _almacen.guardarAjustes(_ajustes),
        _ => Future.value(),
      };

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // `paused` es el aviso fiable de que Android se está llevando la aplicación al fondo.
    if (state == AppLifecycleState.paused || state == AppLifecycleState.detached) {
      vaciarPendientes();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    for (final temporizador in _pendientes.values) {
      temporizador.cancel();
    }
    super.dispose();
  }

  // ─────────────── Ajustes ───────────────

  void cambiarAjustes({
    String? nombre,
    String? tema,
    int? descansoPorDefecto,
    bool? avisoDescanso,
    bool? avisoConPantallaApagada,
  }) {
    if (nombre != null) _ajustes.nombre = nombre;
    if (tema != null) _ajustes.tema = tema;
    if (descansoPorDefecto != null) _ajustes.descansoPorDefecto = descansoPorDefecto;
    if (avisoDescanso != null) _ajustes.avisoDescanso = avisoDescanso;
    if (avisoConPantallaApagada != null) {
      _ajustes.avisoConPantallaApagada = avisoConPantallaApagada;
    }
    _programar('ajustes', () => _almacen.guardarAjustes(_ajustes));
    notifyListeners();
  }

  // ─────────────── Entrenos ───────────────

  /// Empieza un entreno, opcionalmente sacado de un día de una rutina.
  ///
  /// Las series nacen vacías y sin marcar: la plantilla dice cuántas van, no que ya estén
  /// hechas. El peso propuesto sí se rellena, para no teclearlo, y se puede pisar.
  Entreno empezarEntreno({String nombre = 'Entreno libre', Rutina? rutina, DiaDeRutina? dia}) {
    final entreno = entrenoVacio(nombre)
      ..rutinaId = rutina?.id
      ..diaId = dia?.id
      // El sitio se hereda del último entreno: lo normal es entrenar donde se entrenó ayer, y
      // así el dato se rellena solo salvo el día que cambias de sitio.
      ..lugar = lugaresUsados(entrenosHechos).firstOrNull
      ..ejercicios = (dia?.ejercicios ?? const []).map((plantilla) {
        return EjercicioDelEntreno(
          id: nuevoId(),
          ejercicioId: plantilla.ejercicioId,
          descanso: plantilla.descanso > 0 ? plantilla.descanso : _ajustes.descansoPorDefecto,
          notas: plantilla.notas,
          series: List.generate(
            plantilla.series < 1 ? 1 : plantilla.series,
            (_) => SerieRegistrada(peso: plantilla.peso),
          ),
        );
      }).toList();

    _entrenos = [entreno, ..._entrenos];
    // Un entreno que empieza se guarda ya: es el registro de que estás entrenando ahora, y
    // si Android se lleva la aplicación en los primeros segundos no debe desaparecer.
    _almacen.guardarEntrenos(_entrenos);
    notifyListeners();
    return entreno;
  }

  /// Avisa de que un entreno ha cambiado. El objeto se modifica en el sitio —es el mismo que
  /// está en la lista— y aquí sólo se programa el guardado y se repinta.
  void entrenoTocado(Entreno entreno) {
    entreno.actualizadoEn = DateTime.now();
    _programar('entrenos', () => _almacen.guardarEntrenos(_entrenos));
    notifyListeners();
  }

  /// Cierra el entreno y devuelve los récords que ha batido.
  /// Cierra el entreno y devuelve los récords que se hayan batido.
  ///
  /// Escribe **sin el retardo** de los 400 ms —un entreno cerrado ya no se vuelve a tocar, no
  /// hay nada que agrupar— pero **no espera al disco para avisar a la pantalla**. Antes sí lo
  /// hacía, y tenía dos pegas: la interfaz se quedaba mirando un archivo justo en el momento
  /// en que uno le da a «Terminar» y quiere ver el resultado, y si la escritura fallaba la
  /// pantalla se quedaba enseñando para siempre un entreno que en memoria ya estaba cerrado.
  List<RecordBatido> terminarEntreno(Entreno entreno) {
    entreno.fin = DateTime.now();
    entreno.actualizadoEn = DateTime.now();
    _pendientes.remove('entrenos')?.cancel();
    _anotarEscritura(_almacen.guardarEntrenos(_entrenos));
    notifyListeners();
    return recordsBatidos(entreno, _entrenos);
  }

  void borrarEntreno(Entreno entreno) {
    _entrenos = _entrenos.where((e) => e.id != entreno.id).toList();
    _pendientes.remove('entrenos')?.cancel();
    _anotarEscritura(_almacen.guardarEntrenos(_entrenos));
    notifyListeners();
  }

  // ─────────────── Rutinas ───────────────

  Rutina crearRutina() {
    final rutina = rutinaVacia();
    _rutinas = [rutina, ..._rutinas];
    _almacen.guardarRutinas(_rutinas);
    notifyListeners();
    return rutina;
  }

  /// Guarda un entreno ya hecho como rutina nueva.
  ///
  /// Es el atajo para el caso de siempre: entras sin plan, sale un entreno que te gusta y
  /// quieres repetirlo. Copiarlo a mano en una rutina son seis formularios, así que no se hace.
  Rutina crearRutinaDesdeEntreno(Entreno entreno, {String? nombre}) {
    final rutina = rutinaDesdeEntreno(entreno, nombre: nombre);
    _rutinas = [rutina, ..._rutinas];
    _ordenarRutinas();
    _anotarEscritura(_almacen.guardarRutinas(_rutinas));
    notifyListeners();
    return rutina;
  }

  /// Añade lo que se hizo en un entreno como un día más de una rutina que ya existe.
  DiaDeRutina anadirDiaDesdeEntreno(Rutina rutina, Entreno entreno, {String? nombre}) {
    final dia = diaDesdeEntreno(entreno, nombre: nombre);
    rutina.dias = [...rutina.dias, dia];
    rutina.actualizadoEn = DateTime.now();
    _ordenarRutinas();
    _anotarEscritura(_almacen.guardarRutinas(_rutinas));
    notifyListeners();
    return dia;
  }

  void rutinaTocada(Rutina rutina) {
    rutina.actualizadoEn = DateTime.now();
    _ordenarRutinas();
    _programar('rutinas', () => _almacen.guardarRutinas(_rutinas));
    notifyListeners();
  }

  void _ordenarRutinas() {
    _rutinas.sort((a, b) {
      if (a.favorita != b.favorita) return a.favorita ? -1 : 1;
      return a.nombre.toLowerCase().compareTo(b.nombre.toLowerCase());
    });
  }

  Rutina duplicarRutina(Rutina rutina) {
    final copia = Rutina(
      id: nuevoId(),
      nombre: '${rutina.nombre} (copia)',
      descripcion: rutina.descripcion,
      // Los días y sus ejercicios también son nuevos: si compartieran id, editar la copia
      // tocaría la original.
      dias: rutina.dias
          .map((d) => DiaDeRutina(
                id: nuevoId(),
                nombre: d.nombre,
                ejercicios: d.ejercicios
                    .map((e) => PlantillaEjercicio(
                          ejercicioId: e.ejercicioId,
                          series: e.series,
                          reps: e.reps,
                          peso: e.peso,
                          descanso: e.descanso,
                          notas: e.notas,
                        ))
                    .toList(),
              ))
          .toList(),
    );
    _rutinas = [..._rutinas, copia];
    _ordenarRutinas();
    _almacen.guardarRutinas(_rutinas);
    notifyListeners();
    return copia;
  }

  Future<void> borrarRutina(Rutina rutina) async {
    _rutinas = _rutinas.where((r) => r.id != rutina.id).toList();
    _pendientes.remove('rutinas')?.cancel();
    await _almacen.guardarRutinas(_rutinas);
    notifyListeners();
  }

  // ─────────────── Ejercicios propios ───────────────

  void guardarEjercicioPropio(Ejercicio ejercicio) {
    _propios = [..._propios.where((e) => e.id != ejercicio.id), ejercicio]
      ..sort((a, b) => a.nombre.compareTo(b.nombre));
    _recalcularCatalogo();
    _almacen.guardarEjercicios(_propios);
    notifyListeners();
  }

  Future<void> borrarEjercicioPropio(Ejercicio ejercicio) async {
    _propios = _propios.where((e) => e.id != ejercicio.id).toList();
    _recalcularCatalogo();
    await _almacen.guardarEjercicios(_propios);
    notifyListeners();
  }

  // ─────────────── Medidas ───────────────

  void guardarMedida(Medida medida) {
    medida.actualizadoEn = DateTime.now();
    _medidas = [..._medidas.where((m) => m.id != medida.id), medida]
      ..sort((a, b) => b.fecha.compareTo(a.fecha));
    _programar('medidas', () => _almacen.guardarMedidas(_medidas));
    notifyListeners();
  }

  Future<void> borrarMedida(Medida medida) async {
    _medidas = _medidas.where((m) => m.id != medida.id).toList();
    _pendientes.remove('medidas')?.cancel();
    await _almacen.guardarMedidas(_medidas);
    notifyListeners();
  }

  // ─────────────── Copias ───────────────

  Future<String> exportar() async {
    await vaciarPendientes();
    return _almacen.exportar();
  }

  /// Cuántos entrenos se perderían ahora mismo si desapareciera el móvil.
  int get entrenosSinCopiar => entrenosSinCopia(entrenosHechos, _ajustes.ultimaCopia);

  bool get tocaCopia => tocaRecordarCopia(
        sinCopia: entrenosSinCopiar,
        ultimaCopia: _ajustes.ultimaCopia,
        ahora: DateTime.now(),
      );

  /// Apunta que la copia ha salido de aquí. Se escribe **ya**, sin el retardo de los 400 ms:
  /// es un dato de una sola vez y no una tecla más de un peso.
  void apuntarCopia() {
    _ajustes.ultimaCopia = DateTime.now();
    _pendientes.remove('ajustes')?.cancel();
    _anotarEscritura(_almacen.guardarAjustes(_ajustes));
    notifyListeners();
  }

  Future<Map<String, int>> importar(String json) async {
    await vaciarPendientes();
    final cuenta = await _almacen.importar(json);
    await cargar();
    // Restaurar también cuenta como tener una copia: el archivo que se acaba de leer existe
    // fuera de este móvil. Sin esto, un móvil nuevo con el historial recién importado
    // saludaría con un aviso de «tienes 200 entrenos sin copia», que es falso y enseña a no
    // hacer caso de los avisos.
    apuntarCopia();
    return cuenta;
  }

  Future<void> borrarTodo() async {
    for (final temporizador in _pendientes.values) {
      temporizador.cancel();
    }
    _pendientes.clear();
    await _almacen.borrarTodo();
    await cargar();
  }

  // ─────────────── Cuentas para las vistas ───────────────

  /// Cuántas veces se ha entrenado cada ejercicio. Se calcula una vez y no por fila.
  Map<String, int> vecesPorEjercicio() {
    final cuenta = <String, int>{};
    for (final entreno in entrenosHechos) {
      for (final id in entreno.ejercicios.map((l) => l.ejercicioId).toSet()) {
        cuenta[id] = (cuenta[id] ?? 0) + 1;
      }
    }
    return cuenta;
  }

  List<Entreno> entrenosDesde(ClaveDia desde) =>
      entrenosHechos.where((e) => e.fecha.compareTo(desde) >= 0).toList();
}

/// Da acceso al estado desde cualquier punto del árbol y repinta a quien lo escuche.
class ProveedorDeEstado extends InheritedNotifier<Estado> {
  const ProveedorDeEstado({super.key, required Estado estado, required super.child})
      : super(notifier: estado);

  static Estado de(BuildContext context) {
    final proveedor = context.dependOnInheritedWidgetOfExactType<ProveedorDeEstado>();
    assert(proveedor != null, 'No hay ProveedorDeEstado por encima de este widget');
    return proveedor!.notifier!;
  }

  /// Para cuando sólo se quiere leer o llamar a un método, sin suscribirse a los cambios.
  static Estado leer(BuildContext context) {
    final proveedor = context.getInheritedWidgetOfExactType<ProveedorDeEstado>();
    assert(proveedor != null, 'No hay ProveedorDeEstado por encima de este widget');
    return proveedor!.notifier!;
  }
}
