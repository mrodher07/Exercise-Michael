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
    await probador.tap(find.text('Añadir ejercicios'));
    await probador.pumpAndSettle();
    await probador.enterText(find.byType(TextField).first, 'press banca barra');
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
}
