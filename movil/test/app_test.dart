/// Pruebas de la interfaz.
///
/// No hay móvil ni emulador en el sitio donde se escribió esto, así que estas pruebas son la
/// única forma de comprobar que las pantallas se construyen y responden de verdad, y no sólo
/// que el código compila. Recorren el camino que se usa todos los días: empezar un entreno,
/// añadir un ejercicio, apuntar una serie, marcarla y terminar.
///
/// El almacén se apunta a una carpeta temporal en vez de a la del sistema, que es para lo que
/// `Almacen` acepta una carpeta: `path_provider` es un plugin nativo y no existe aquí.
///
/// Un detalle que cuesta una tarde si no se sabe: dentro de un `testWidgets` el tiempo es
/// falso, y con él la cola de tareas. Un `await` sobre algo que espera al mundo de verdad
/// —leer o escribir un archivo— **no vuelve nunca** y la prueba muere a los diez minutos. Por
/// eso todo lo que toca el disco va envuelto en `runAsync`, que es la puerta al reloj real.
/// En `setUp` no hace falta, porque eso se ejecuta fuera de esa burbuja.
library;

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fitlog/almacen/almacen.dart';
import 'package:fitlog/motor/entreno.dart';
import 'package:fitlog/motor/fechas.dart';
import 'package:fitlog/ui/app.dart';
import 'package:fitlog/ui/estado.dart';

void main() {
  late Directory carpeta;
  late Estado estado;

  setUp(() async {
    carpeta = await Directory.systemTemp.createTemp('fitlog-prueba');
    estado = Estado(almacen: Almacen(carpeta: carpeta));
    await estado.cargar();
  });

  tearDown(() async {
    estado.dispose();
    if (carpeta.existsSync()) await carpeta.delete(recursive: true);
  });

  Future<void> abrir(WidgetTester probador) async {
    await probador.pumpWidget(App(estado: estado));
    await probador.pumpAndSettle();
  }

  Future<void> irA(WidgetTester probador, String seccion) async {
    await probador.tap(find.widgetWithText(NavigationDestination, seccion));
    await probador.pumpAndSettle();
  }

  /// Pulsa algo que puede estar por debajo del borde de la pantalla.
  ///
  /// La ventana de las pruebas es más baja que un móvil de verdad, y las pantallas son listas
  /// perezosas: lo que no se ve **no está construido**, así que `tap` no lo encuentra. Se
  /// desplaza hasta que aparece y entonces se pulsa.
  Future<void> pulsar(WidgetTester probador, Finder objetivo) async {
    await probador.scrollUntilVisible(objetivo, 200, scrollable: find.byType(Scrollable).first);
    await probador.pumpAndSettle();
    await probador.tap(objetivo);
    await probador.pumpAndSettle();
  }

  testWidgets('arranca en el resumen y dice que no hay nada', (probador) async {
    await abrir(probador);
    expect(find.text('Aquí no hay nada todavía'), findsOne);
  });

  testWidgets('el flujo completo de un entreno', (probador) async {
    await abrir(probador);

    // Empezar.
    await irA(probador, 'Entrenar');
    await probador.tap(find.text('Entreno libre'));
    await probador.pumpAndSettle();
    expect(find.text('Sin ejercicios'), findsOne);
    expect(estado.enCurso, isNotNull);

    // Añadir un ejercicio buscándolo.
    await pulsar(probador, find.text('Añadir ejercicios'));
    await probador.enterText(find.widgetWithText(TextField, 'Buscar ejercicio'), 'press banca barra');
    await probador.pumpAndSettle();
    await probador.tap(find.text('Press de banca con barra').first);
    await probador.pumpAndSettle();
    await probador.tap(find.textContaining('Añadir (1)'));
    await probador.pumpAndSettle();

    expect(estado.enCurso!.ejercicios, hasLength(1));
    expect(find.text('Press de banca con barra'), findsOne);

    // Apuntar 80 × 8 y marcarla.
    final campos = find.byType(TextField);
    await probador.enterText(campos.at(1), '80');
    await probador.enterText(campos.at(2), '8');
    await probador.pumpAndSettle();

    await probador.tap(find.bySemanticsLabel('Marcar la serie 1 como hecha'));
    await probador.pumpAndSettle();

    final serie = estado.enCurso!.ejercicios.first.series.first;
    expect(serie.peso, 80);
    expect(serie.reps, 8);
    expect(serie.hecha, isTrue);
    expect(estado.enCurso!.volumen, 640);

    // El descanso arranca solo al marcar.
    expect(find.textContaining('30 s'), findsOne);

    // Terminar.
    await pulsar(probador, find.text('Terminar entreno'));
    await probador.tap(find.widgetWithText(FilledButton, 'Terminar'));
    await probador.pumpAndSettle();

    expect(estado.enCurso, isNull);
    expect(estado.entrenosHechos, hasLength(1));

    // Y el entreno cerrado aparece en el historial, que queda por debajo del borde: al
    // terminar, la pantalla vuelve al estado «sin entreno» y la lista arranca arriba. En
    // mayúsculas porque los títulos de sección se pintan así.
    final historial = find.textContaining('HISTORIAL · 1 ENTRENO');
    await probador.scrollUntilVisible(historial, 200, scrollable: find.byType(Scrollable).first);
    expect(historial, findsOne);
  });

  testWidgets('el entreno guardado sobrevive a reabrir la aplicación', (probador) async {
    // Un entreno ya cerrado, escrito directamente en el almacén.
    final entreno = Entreno(
      id: 'previo',
      fecha: hoy(),
      nombre: 'Torso',
      comienzo: DateTime.now().subtract(const Duration(hours: 1)),
      fin: DateTime.now(),
      ejercicios: [
        EjercicioDelEntreno(
          id: 'l1',
          ejercicioId: 'press-de-banca-con-barra',
          series: [SerieRegistrada(peso: 100, reps: 5, hecha: true)],
        ),
      ],
    );
    await probador.runAsync(() => Almacen(carpeta: carpeta).guardarEntrenos([entreno]));

    // Un estado nuevo, como al abrir la aplicación otra vez.
    final otro = Estado(almacen: Almacen(carpeta: carpeta));
    await probador.runAsync(() => otro.cargar());
    await probador.pumpWidget(App(estado: otro));
    await probador.pumpAndSettle();

    expect(otro.entrenosHechos, hasLength(1));
    // 100 × 5 = 500 kg, y el resumen lo cuenta como el volumen de la semana.
    expect(find.text('500 kg'), findsWidgets);
    otro.dispose();
  });

  testWidgets('el catálogo de ejercicios se filtra por grupo', (probador) async {
    await abrir(probador);
    await irA(probador, 'Ejercicios');

    expect(find.textContaining('ejercicios en el buscador'), findsNothing);
    expect(find.textContaining('${estado.catalogo.length} ejercicios'), findsOne);

    await probador.tap(find.widgetWithText(FilterChip, 'Solo los que he hecho'));
    await probador.pumpAndSettle();
    // Sin entrenos, ningún ejercicio se ha hecho todavía.
    expect(find.text('Nada coincide'), findsOne);
  });

  testWidgets('crear una rutina la deja en la lista', (probador) async {
    await abrir(probador);
    await irA(probador, 'Rutinas');

    expect(find.text('Sin rutinas'), findsOne);
    await probador.tap(find.text('Crear la primera'));
    await probador.pumpAndSettle();

    expect(estado.rutinas, hasLength(1));
    expect(find.text('Editar rutina'), findsOne);
  });

  testWidgets('cambiar el tema se guarda', (probador) async {
    await abrir(probador);
    await irA(probador, 'Ajustes');

    await probador.tap(find.textContaining('Claro'));
    // Un fotograma y no `pumpAndSettle`: con el reloj falso, dejar «reposar» adelanta los
    // 400 ms del retardo y el guardado saldría dentro de la burbuja, donde el disco no
    // responde. Así el guardado sigue pendiente y lo fuerza `vaciarPendientes` desde el
    // reloj real, que es exactamente lo que se quiere comprobar.
    await probador.pump();
    expect(estado.ajustes.tema, 'claro');

    // Y llega al archivo, no sólo a memoria.
    final guardados = await probador.runAsync(() async {
      await estado.vaciarPendientes();
      return Almacen(carpeta: carpeta).leerAjustes();
    });
    expect(guardados!.tema, 'claro');
  });

  testWidgets('el aviso de la copia sale en el resumen cuando hay algo que perder',
      (probador) async {
    // Cuatro entrenos cerrados y ninguna copia: es el caso en el que perder el móvil duele.
    final hechos = [
      for (var i = 0; i < 4; i++)
        Entreno(
          id: 'e$i',
          fecha: sumarDias(hoy(), -i),
          nombre: 'Torso',
          comienzo: DateTime.now().subtract(Duration(days: i, hours: 1)),
          fin: DateTime.now().subtract(Duration(days: i)),
          ejercicios: [
            EjercicioDelEntreno(
              id: 'l$i',
              ejercicioId: 'press-de-banca-con-barra',
              series: [SerieRegistrada(peso: 100, reps: 5, hecha: true)],
            ),
          ],
        ),
    ];
    await probador.runAsync(() => Almacen(carpeta: carpeta).guardarEntrenos(hechos));

    final otro = Estado(almacen: Almacen(carpeta: carpeta));
    await probador.runAsync(() => otro.cargar());
    await probador.pumpWidget(App(estado: otro));
    await probador.pumpAndSettle();

    expect(otro.entrenosSinCopiar, 4);
    expect(otro.tocaCopia, isTrue);
    expect(find.textContaining('sólo existe en este móvil'), findsOne);
    expect(find.text('Guardar una copia'), findsOne);

    // Y el botón lleva a Ajustes, donde se hace.
    await probador.tap(find.text('Guardar una copia'));
    await probador.pumpAndSettle();
    final panelDeCopias = find.text('Copias de seguridad');
    await probador.scrollUntilVisible(
      panelDeCopias,
      200,
      scrollable: find.byType(Scrollable).first,
    );
    expect(panelDeCopias, findsOne);
    // «Nunca» es el resumen del panel, en la misma línea del título.
    expect(find.text('Nunca'), findsOne);

    // Apuntada la copia, el aviso se va.
    otro.apuntarCopia();
    await probador.pumpAndSettle();
    expect(otro.tocaCopia, isFalse);
    await probador.tap(find.widgetWithText(NavigationDestination, 'Resumen'));
    await probador.pumpAndSettle();
    expect(find.text('Guardar una copia'), findsNothing);

    otro.dispose();
  });

  testWidgets('la ficha de un ejercicio explica cómo se hace', (probador) async {
    await abrir(probador);
    await irA(probador, 'Ejercicios');

    // Se busca uno concreto para no depender de en qué orden aparece la lista.
    await probador.enterText(find.widgetWithText(TextField, 'Buscar ejercicio'), 'press banca barra');
    await probador.pumpAndSettle();
    await probador.tap(find.text('Press de banca con barra').first);
    await probador.pumpAndSettle();

    // Nunca se ha hecho, así que la técnica sale abierta y con las tres partes.
    expect(find.text('Cómo se hace'), findsOne);
    expect(find.text('COLOCACIÓN'), findsOne);
    expect(find.text('MOVIMIENTO'), findsOne);
    expect(find.text('EL FALLO TÍPICO'), findsOne);
    expect(find.textContaining('Junta los omóplatos'), findsOne);
    expect(find.text('Ver vídeo del ejercicio'), findsOne);
  });

  testWidgets('un entreno libre se guarda como rutina', (probador) async {
    // Un entreno ya cerrado, con dos ejercicios y series distintas, escrito en el almacén.
    final entreno = Entreno(
      id: 'libre',
      fecha: hoy(),
      nombre: 'Torso libre',
      comienzo: DateTime.now().subtract(const Duration(hours: 1)),
      fin: DateTime.now(),
      ejercicios: [
        EjercicioDelEntreno(
          id: 'l1',
          ejercicioId: 'press-de-banca-con-barra',
          series: [
            SerieRegistrada(peso: 40, reps: 12, hecha: true, tipo: TipoDeSerie.calentamiento),
            SerieRegistrada(peso: 80, reps: 8, hecha: true),
            SerieRegistrada(peso: 85, reps: 6, hecha: true),
          ],
        ),
        EjercicioDelEntreno(
          id: 'l2',
          ejercicioId: 'dominadas',
          series: [SerieRegistrada(reps: 8, hecha: true), SerieRegistrada(reps: 6, hecha: true)],
        ),
      ],
    );
    await probador.runAsync(() => Almacen(carpeta: carpeta).guardarEntrenos([entreno]));

    final otro = Estado(almacen: Almacen(carpeta: carpeta));
    await probador.runAsync(() => otro.cargar());
    await probador.pumpWidget(App(estado: otro));
    await probador.pumpAndSettle();

    await probador.tap(find.widgetWithText(NavigationDestination, 'Entrenar'));
    await probador.pumpAndSettle();

    // Se abre el entreno del historial y se guarda como rutina nueva.
    await pulsar(probador, find.text('Torso libre').first);
    await pulsar(probador, find.text('Guardar como rutina'));

    // La vista previa dice lo que va a guardar antes de decidir: el calentamiento no cuenta,
    // así que del press quedan dos series de 6 a 8 con el peso más alto. Y las dominadas, que
    // coinciden en series y repeticiones, salen sin peso porque no llevaban lastre.
    expect(find.text('2×6-8 · 85 kg'), findsOne);
    expect(find.text('2×6-8'), findsOne);

    await pulsar(probador, find.text('Crear una rutina nueva'));

    expect(otro.rutinas, hasLength(1));
    final rutina = otro.rutinas.single;
    expect(rutina.nombre, 'Torso libre');
    expect(rutina.dias, hasLength(1));

    final plantillas = rutina.dias.single.ejercicios;
    expect(plantillas, hasLength(2));
    expect(plantillas.first.ejercicioId, 'press-de-banca-con-barra');
    expect(plantillas.first.series, 2);
    expect(plantillas.first.reps, '6-8');
    expect(plantillas.first.peso, 85);
    // Las dominadas van sin peso porque no llevaban lastre.
    expect(plantillas.last.peso, isNull);
    expect(plantillas.last.reps, '6-8');

    otro.dispose();
  });

  testWidgets('un cardio se apunta en minutos, kilómetros y calorías', (probador) async {
    await abrir(probador);
    await irA(probador, 'Entrenar');
    await probador.tap(find.text('Entreno libre'));
    await probador.pumpAndSettle();

    await pulsar(probador, find.text('Añadir ejercicios'));
    await probador.enterText(find.widgetWithText(TextField, 'Buscar ejercicio'), 'cinta correr');
    await probador.pumpAndSettle();
    await probador.tap(find.text('Cinta de correr').first);
    await probador.pumpAndSettle();
    await probador.tap(find.textContaining('Añadir (1)'));
    await probador.pumpAndSettle();

    // Tres huecos y no dos: en cardio el RPE deja su sitio a las calorías.
    expect(find.text('KM'), findsOne);
    expect(find.text('MIN'), findsOne);
    expect(find.text('KCAL'), findsOne);
    expect(find.text('RPE'), findsNothing);

    final campos = find.byType(TextField);
    await probador.enterText(campos.at(1), '5');
    await probador.enterText(campos.at(2), '30');
    await probador.enterText(campos.at(3), '320');
    await probador.pumpAndSettle();

    final serie = estado.enCurso!.ejercicios.first.series.first;
    expect(serie.distancia, 5);
    // Se escriben minutos y por dentro se guardan segundos, como en todo lo demás.
    expect(serie.segundos, 1800);
    expect(serie.calorias, 320);

    // Marcada la serie, el ritmo y la velocidad se calculan solos.
    await probador.tap(find.bySemanticsLabel('Marcar la serie 1 como hecha'));
    await probador.pumpAndSettle();
    expect(find.text('10,0 km/h'), findsOne);
    expect(find.text('6:00 /km'), findsOne);
  });

  testWidgets('el sitio del entreno se elige de un toque y se hereda del anterior',
      (probador) async {
    await abrir(probador);
    await irA(probador, 'Entrenar');
    await probador.tap(find.text('Entreno libre'));
    await probador.pumpAndSettle();

    expect(find.text('DÓNDE'), findsOne);
    await probador.tap(find.widgetWithText(ChoiceChip, 'Casa'));
    await probador.pumpAndSettle();
    expect(estado.enCurso!.lugar, 'Casa');

    // Volver a tocarlo lo quita: apuntarlo es opcional.
    await probador.tap(find.widgetWithText(ChoiceChip, 'Casa'));
    await probador.pumpAndSettle();
    expect(estado.enCurso!.lugar, isNull);

    await probador.tap(find.widgetWithText(ChoiceChip, 'Aire libre'));
    await probador.pumpAndSettle();
    expect(estado.enCurso!.lugar, 'Aire libre');

    // Se cierra el entreno y el siguiente nace en el mismo sitio.
    final primero = estado.enCurso!;
    estado.terminarEntreno(primero);
    final segundo = estado.empezarEntreno();
    expect(segundo.lugar, 'Aire libre');
  });
}
