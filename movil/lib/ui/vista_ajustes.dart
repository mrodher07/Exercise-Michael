/// Ajustes: lo que se toca una vez y ya.
///
/// Nada de lo de aquí hace falta para empezar a usar la aplicación —el tema, el descanso por
/// defecto y las copias tienen valores razonables desde el primer día— y por eso esta pantalla
/// va la última.
library;

import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../datos/ejercicios.dart';
import 'cronometro.dart';
import 'estado.dart';
import 'piezas.dart';
import 'tema.dart';

class VistaAjustes extends StatelessWidget {
  const VistaAjustes({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorDeEstado.de(context);
    final c = ColoresFitLog.de(context);
    final ajustes = estado.ajustes;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        const TituloDeSeccion('Ajustes'),
        Panel(
          hijo: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                initialValue: ajustes.nombre ?? '',
                decoration: const InputDecoration(
                  labelText: 'Tu nombre',
                  helperText: 'Sale en el saludo. Nada más.',
                ),
                onChanged: (texto) => estado.cambiarAjustes(nombre: texto),
              ),
              const SizedBox(height: 16),
              Text(
                'Tema',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: c.textoTenue,
                ),
              ),
              const SizedBox(height: 6),
              Segmentado<String>(
                elegida: ajustes.tema,
                onElegir: (tema) => estado.cambiarAjustes(tema: tema),
                opciones: [for (final t in temas) (t.id, '${t.icono}  ${t.nombre}')],
              ),
              const SizedBox(height: 6),
              Text(
                temaDe(ajustes.tema).descripcion,
                style: TextStyle(fontSize: 12.5, color: c.textoDebil, height: 1.45),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        const TituloDeSeccion('Entreno'),
        Panel(
          hijo: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Descanso por defecto',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: c.textoTenue,
                ),
              ),
              const SizedBox(height: 6),
              SelectorDeDescanso(
                segundos: ajustes.descansoPorDefecto,
                onCambiar: (s) => estado.cambiarAjustes(descansoPorDefecto: s),
              ),
              const SizedBox(height: 6),
              Text(
                'Se usa en los ejercicios nuevos. Cada uno puede llevar el suyo.',
                style: TextStyle(fontSize: 12.5, color: c.textoDebil),
              ),
              const Divider(height: 20),
              Interruptor(
                texto: 'Vibrar al acabar el descanso',
                activo: ajustes.avisoDescanso,
                onCambiar: (v) => estado.cambiarAjustes(avisoDescanso: v),
              ),
              Interruptor(
                texto: 'Avisar con la pantalla apagada',
                pista: 'Notificación al acabar el descanso aunque la app no esté delante. Si '
                    'Android cierra la aplicación del todo para liberar memoria, ese aviso '
                    'no llega.',
                activo: ajustes.avisoConPantallaApagada,
                onCambiar: (v) async {
                  estado.cambiarAjustes(avisoConPantallaApagada: v);
                  // El permiso se pide al activarlo, que es cuando se entiende para qué es.
                  if (v) await Avisos.pedirPermiso();
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        const TituloDeSeccion('Tus datos'),
        PanelPlegable(
          titulo: const Text('Copias de seguridad'),
          resumen: '${estado.entrenos.length} entrenos',
          abierto: false,
          ayuda: 'Todo se guarda en este móvil, en la carpeta de la aplicación. No hay cuenta '
              'ni servidor, así que nadie más ve tus entrenos — y por lo mismo, si desinstalas '
              'la aplicación o cambias de móvil, se van contigo. La copia es un archivo JSON '
              'que puedes mandarte a donde quieras y traer al otro móvil.',
          hijo: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              OutlinedButton.icon(
                onPressed: () => _exportar(context, estado),
                icon: const Icon(Icons.ios_share),
                label: const Text('Compartir copia'),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () => _importar(context, estado),
                icon: const Icon(Icons.download_outlined),
                label: const Text('Restaurar desde un archivo'),
              ),
              const SizedBox(height: 8),
              Text(
                'Al restaurar no se borra nada: se fusiona por registro y, si algo choca, '
                'gana lo más recientemente tocado. Importar dos veces la misma copia no '
                'duplica entrenos.',
                style: TextStyle(fontSize: 12.5, height: 1.45, color: c.textoDebil),
              ),
              const Divider(height: 24),
              OutlinedButton.icon(
                onPressed: () async {
                  final seguro = await confirmar(
                    context,
                    titulo: 'Empezar de cero',
                    texto: 'Se borran los entrenos, las rutinas, los ejercicios que hayas '
                        'creado y las medidas. No se puede deshacer. Si quieres poder volver '
                        'atrás, comparte primero una copia.',
                    si: 'Sí, borrar todo',
                  );
                  if (!seguro || !context.mounted) return;
                  await estado.borrarTodo();
                  if (context.mounted) avisar(context, 'Todo borrado');
                },
                icon: const Icon(Icons.delete_outline),
                label: const Text('Empezar de cero'),
                style: OutlinedButton.styleFrom(foregroundColor: c.malo),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          '${ejerciciosDeCasa.length} ejercicios en el catálogo'
          '${estado.ejerciciosPropios.isEmpty ? '' : ' y ${estado.ejerciciosPropios.length} tuyos'}.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12.5, color: c.textoDebil),
        ),
      ],
    );
  }

  Future<void> _exportar(BuildContext context, Estado estado) async {
    final json = await estado.exportar();
    // Se escribe en la carpeta temporal y se comparte: así el usuario decide dónde acaba
    // —Drive, correo, WhatsApp— sin que la aplicación pida permisos de almacenamiento.
    final carpeta = await getTemporaryDirectory();
    final nombre = 'fitlog-${DateTime.now().toIso8601String().substring(0, 10)}.json';
    final archivo = File('${carpeta.path}/$nombre');
    await archivo.writeAsString(json, flush: true);
    if (!context.mounted) return;
    await SharePlus.instance.share(
      ShareParams(files: [XFile(archivo.path)], fileNameOverrides: [nombre]),
    );
  }

  Future<void> _importar(BuildContext context, Estado estado) async {
    final elegido = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['json'],
      withData: true,
    );
    final archivo = elegido?.files.firstOrNull;
    if (archivo == null || !context.mounted) return;

    final seguro = await confirmar(
      context,
      titulo: 'Restaurar copia',
      texto: 'Se añadirá lo que traiga el archivo a lo que ya tienes. Nada se borra.',
      si: 'Restaurar',
      no: 'Cancelar',
    );
    if (!seguro || !context.mounted) return;

    try {
      final texto = archivo.bytes != null
          ? String.fromCharCodes(archivo.bytes!)
          : await File(archivo.path!).readAsString();
      final cuenta = await estado.importar(texto);
      final total = cuenta.values.fold(0, (t, n) => t + n);
      if (context.mounted) {
        avisar(
          context,
          total > 0 ? 'Importados $total registros' : 'No había nada nuevo que importar',
        );
      }
    } catch (_) {
      if (context.mounted) avisar(context, 'Ese archivo no se entiende');
    }
  }
}
