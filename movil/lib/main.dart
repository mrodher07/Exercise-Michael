import 'package:flutter/material.dart';

import 'ui/app.dart';
import 'ui/cronometro.dart';
import 'ui/estado.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Los datos se leen antes de pintar nada: el tema es uno de ellos, y sin esto la
  // aplicación abriría en claro para saltar a oscuro medio segundo después.
  final estado = Estado();
  await estado.cargar();

  // El canal de avisos se prepara al arrancar, pero el permiso **no** se pide aquí: se pide
  // al activar el aviso en Ajustes, que es cuando se entiende para qué es. Un permiso pedido
  // antes de eso es un permiso que se deniega.
  await Avisos.preparar();

  runApp(App(estado: estado));
}
