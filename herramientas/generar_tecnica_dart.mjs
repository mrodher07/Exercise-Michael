/**
 * Genera para la app de Android la técnica de cada ejercicio, a partir de la de la web.
 *
 * Mismo motivo que el generador del catálogo: el texto está escrito una sola vez, en
 * `src/datos/tecnica.ts`. Son casi tres mil líneas de texto en español; copiarlas a mano a
 * Dart sería garantizar que dentro de un mes cada aplicación explica el press de banca de una
 * manera.
 *
 * Uso:
 *   npx tsc src/datos/tecnica.ts --outDir .tmp-gen --module es2020 --target es2020
 *   node herramientas/generar_tecnica_dart.mjs > movil/lib/datos/tecnica.dart
 */

import { TECNICA } from '../.tmp-gen/tecnica.js';

/** Un literal de Dart con comillas simples, escapando lo que Dart interpretaría. */
const comilla = (t) => `'${t.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$')}'`;

/**
 * Parte el texto en varias líneas para que el archivo generado se pueda leer y no sea una
 * columna de líneas de trescientos caracteres. Dart pega los literales seguidos sin operador.
 */
function literalLargo(texto, sangria) {
  const ancho = 92 - sangria.length;
  if (texto.length <= ancho) return comilla(texto);
  const trozos = [];
  let actual = '';
  for (const palabra of texto.split(' ')) {
    if (actual && (actual + ' ' + palabra).length > ancho) {
      trozos.push(actual + ' ');
      actual = palabra;
    } else {
      actual = actual ? actual + ' ' + palabra : palabra;
    }
  }
  trozos.push(actual);
  return trozos.map((t, i) => (i === 0 ? comilla(t) : `\n${sangria}    ${comilla(t)}`)).join('');
}

const ids = Object.keys(TECNICA);
const salida = [];
const escribir = (linea = '') => salida.push(linea);

escribir(`// GENERADO por herramientas/generar_tecnica_dart.mjs — no editar a mano.
//
// La fuente es \`src/datos/tecnica.ts\`. Para rehacer este archivo:
//
//   npx tsc src/datos/tecnica.ts --outDir .tmp-gen --module es2020 --target es2020
//   node herramientas/generar_tecnica_dart.mjs > movil/lib/datos/tecnica.dart
//
// Son las fichas de los ${ids.length} ejercicios del catálogo: cómo colocarse, cómo hacer el
// movimiento y el error que más se ve. Escritas una sola vez para que las dos aplicaciones no
// expliquen el mismo ejercicio de dos maneras distintas.

/// Cómo se hace un ejercicio.
///
/// Tres partes, y son tres porque responden a las tres preguntas que uno se hace de pie
/// delante de la máquina: cómo me coloco, qué muevo y qué es lo que hace mal todo el mundo.
class Tecnica {
  const Tecnica({
    required this.preparacion,
    required this.ejecucion,
    required this.fallo,
    this.video,
  });

  /// Cómo colocarse antes de la primera repetición.
  final String preparacion;

  /// El movimiento: qué se mueve, hasta dónde y a qué ritmo.
  final String ejecucion;

  /// El error más común y por qué importa.
  final String fallo;

  /// Un vídeo concreto. Sin esto se busca por el nombre.
  final String? video;
}

const tecnicas = <String, Tecnica>{`);

for (const id of ids) {
  const t = TECNICA[id];
  escribir(`  ${comilla(id)}: Tecnica(`);
  escribir(`    preparacion: ${literalLargo(t.preparacion, '    ')},`);
  escribir(`    ejecucion: ${literalLargo(t.ejecucion, '    ')},`);
  escribir(`    fallo: ${literalLargo(t.fallo, '    ')},`);
  if (t.video) escribir(`    video: ${comilla(t.video)},`);
  escribir('  ),');
}

escribir(`};

/// La técnica de un ejercicio, si la hay.
///
/// Los ejercicios que crea el usuario no la tienen, y eso es normal: la interfaz enseña lo que
/// hay y no un hueco vacío.
Tecnica? tecnicaDe(String id) => tecnicas[id];

/// A dónde mandar a alguien que quiere ver el ejercicio en movimiento.
///
/// Es una búsqueda en YouTube por el nombre, y no un vídeo concreto, a conciencia: un
/// identificador de vídeo escrito hoy a mano es un enlace roto dentro de un año —los vídeos se
/// borran y los canales se cierran—. Una búsqueda por el nombre del ejercicio siempre lleva a
/// algo. Si algún día se elige un vídeo para un ejercicio, se pone en su ficha y esta función
/// lo devuelve en lugar de la búsqueda.
Uri videoDe(String nombre, [String? id]) {
  final fijado = id == null ? null : tecnicas[id]?.video;
  if (fijado != null) return Uri.parse(fijado);
  return Uri.https('www.youtube.com', '/results', {'search_query': '\$nombre técnica'});
}`);

process.stdout.write(salida.join('\n') + '\n');
