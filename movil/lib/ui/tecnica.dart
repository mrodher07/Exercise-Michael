/// Cómo se hace el ejercicio, dentro de la aplicación.
///
/// Vive aparte de las vistas porque se enseña en dos sitios: en la ficha del ejercicio, donde
/// uno mira antes de decidir si lo mete en la rutina, y en medio del entreno, cuando toca una
/// máquina que no se usa desde hace tres meses y no queda claro cómo iba.
///
/// Del vídeo: el botón abre una búsqueda en YouTube con el nombre del ejercicio. No se
/// incrusta un reproductor ni se fija un vídeo concreto, y no es por pereza: un vídeo
/// concreto es un enlace roto en cuanto su autor lo borra, y aquí no hay forma de comprobar
/// que siga vivo. La búsqueda por el nombre siempre lleva a algo, y además a lo que la gente
/// está viendo ahora.
library;

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../datos/ejercicios.dart';
import '../datos/tecnica.dart';
import 'piezas.dart';
import 'tema.dart';

/// La ficha de técnica de un ejercicio: preparación, ejecución y el fallo típico.
///
/// Devuelve un panel plegable. Se abre solo cuando el ejercicio es nuevo para ti —que es
/// cuando hace falta— y se queda cerrado cuando ya lo has hecho, porque entonces lo que
/// interesa de esa pantalla son tus marcas.
class PanelDeTecnica extends StatelessWidget {
  const PanelDeTecnica({super.key, required this.ejercicio, this.abierto = false});

  final Ejercicio ejercicio;
  final bool abierto;

  @override
  Widget build(BuildContext context) {
    final tecnica = tecnicaDe(ejercicio.id);
    if (tecnica == null) {
      // Un ejercicio creado por el usuario no trae técnica escrita, pero el vídeo sí sirve.
      return Panel(
        hijo: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Texto(
              'Este ejercicio lo has creado tú, así que no trae explicación. El vídeo busca por '
              'su nombre.',
            ),
            const SizedBox(height: 10),
            BotonDeVideo(ejercicio: ejercicio),
          ],
        ),
      );
    }

    return PanelPlegable(
      titulo: const Text('Cómo se hace'),
      resumen: abierto ? null : 'técnica',
      abierto: abierto,
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _Parte(titulo: 'Colocación', texto: tecnica.preparacion, icono: Icons.accessibility_new),
          const SizedBox(height: 12),
          _Parte(titulo: 'Movimiento', texto: tecnica.ejecucion, icono: Icons.sync_alt),
          const SizedBox(height: 12),
          _Parte(titulo: 'El fallo típico', texto: tecnica.fallo, icono: Icons.warning_amber, aviso: true),
          const SizedBox(height: 14),
          BotonDeVideo(ejercicio: ejercicio),
        ],
      ),
    );
  }
}

/// Un texto normal, con el interlineado del resto de explicaciones.
class Texto extends StatelessWidget {
  const Texto(this.texto, {super.key});

  final String texto;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Text(texto, style: TextStyle(fontSize: 13.5, height: 1.5, color: c.textoTenue));
  }
}

class _Parte extends StatelessWidget {
  const _Parte({
    required this.titulo,
    required this.texto,
    required this.icono,
    this.aviso = false,
  });

  final String titulo;
  final String texto;
  final IconData icono;

  /// El fallo se pinta con el color de aviso: es lo que hay que leer si sólo se lee una cosa.
  final bool aviso;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final color = aviso ? c.aviso : c.acento;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icono, size: 15, color: color),
            const SizedBox(width: 6),
            Text(
              titulo.toUpperCase(),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.6,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 5),
        Texto(texto),
      ],
    );
  }
}

/// El botón que lleva al vídeo.
class BotonDeVideo extends StatelessWidget {
  const BotonDeVideo({super.key, required this.ejercicio});

  final Ejercicio ejercicio;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: () => abrirVideo(context, ejercicio),
      icon: const Icon(Icons.play_circle_outline),
      label: const Text('Ver vídeo del ejercicio'),
    );
  }
}

/// Abre el vídeo fuera de la aplicación, en YouTube si está instalado.
///
/// Si no se puede abrir —un móvil sin navegador, o sin conexión— se dice y ya está, en vez de
/// dejar el botón haciendo nada, que es lo que más desconcierta.
Future<void> abrirVideo(BuildContext context, Ejercicio ejercicio) async {
  final enlace = videoDe(ejercicio.nombre, ejercicio.id);
  final abierto = await launchUrl(enlace, mode: LaunchMode.externalApplication);
  if (!abierto && context.mounted) {
    avisar(context, 'No se ha podido abrir el vídeo');
  }
}
