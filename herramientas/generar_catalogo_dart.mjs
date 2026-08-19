/**
 * Genera el catálogo de ejercicios de la app de Android a partir del de la web.
 *
 * Los ejercicios están escritos una sola vez, en `src/datos/ejercicios.ts`. Copiarlos a mano a
 * Dart sería copiar trescientas filas y garantizar que dentro de un mes las dos listas no
 * digan lo mismo: alguien añade una máquina en un sitio y se olvida del otro. Aquí se
 * traducen, y si cambia el original se vuelve a ejecutar esto.
 *
 * La técnica de cada ejercicio va en su propio generador: `generar_tecnica_dart.mjs`.
 *
 * Uso:
 *   npx tsc src/datos/ejercicios.ts --outDir .tmp-gen --module es2020 --target es2020
 *   node herramientas/generar_catalogo_dart.mjs > movil/lib/datos/ejercicios.dart
 */

import { EJERCICIOS, EQUIPOS, GRUPOS } from '../.tmp-gen/ejercicios.js';

/** El nombre del valor de enumeración en Dart a partir del texto en español. */
function comoEnum(texto) {
  const limpio = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();
  const [primera, ...resto] = limpio.split(' ');
  return primera.toLowerCase() + resto.map((p) => p[0].toUpperCase() + p.slice(1)).join('');
}

const comilla = (t) => `'${t.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$')}'`;

const grupos = GRUPOS.map((g) => ({ enumerado: comoEnum(g), texto: g }));
const equipos = EQUIPOS.map((e) => ({ enumerado: comoEnum(e), texto: e }));
const medidas = ['peso-reps', 'reps', 'tiempo', 'peso-tiempo', 'distancia-tiempo'].map((m) => ({
  enumerado: comoEnum(m),
  texto: m,
}));

const enumDe = (lista, texto) => lista.find((x) => x.texto === texto).enumerado;

const salida = [];
const escribir = (linea = '') => salida.push(linea);

escribir(`// GENERADO por herramientas/generar_catalogo_dart.mjs — no editar a mano.
//
// La fuente es \`src/datos/ejercicios.ts\`, que es donde se añaden ejercicios nuevos. Para
// rehacer este archivo:
//
//   npx tsc src/datos/ejercicios.ts --outDir .tmp-gen --module es2020 --target es2020
//   node herramientas/generar_catalogo_dart.mjs > movil/lib/datos/ejercicios.dart
//
// Así los ${EJERCICIOS.length} ejercicios están escritos una sola vez y las dos aplicaciones no pueden
// acabar diciendo cosas distintas.

/// Con qué se hace. Es el filtro que más se usa: lo que hay libre manda.
enum Equipo {`);
for (const e of equipos) escribir(`  ${e.enumerado}(${comilla(e.texto)}),`);
escribir(`  ;

  const Equipo(this.texto);
  final String texto;
}

/// Los grupos musculares, con el detalle que se usa al planificar.
enum Grupo {`);
for (const g of grupos) escribir(`  ${g.enumerado}(${comilla(g.texto)}),`);
escribir(`  ;

  const Grupo(this.texto);
  final String texto;
}

/// Qué se apunta de cada serie. Una plancha no tiene repeticiones y la cinta no tiene peso:
/// si todo se apuntara como «peso × reps» habría que escribir ceros en la mitad de los
/// huecos, y esos ceros luego cuentan como datos y estropean las medias.
///
/// Se llama así y no «Medida» porque una Medida es una medida corporal —el peso, la
/// cintura—, y dos conceptos distintos con el mismo nombre se confunden al leerlos.
enum FormaDeMedir {`);
for (const m of medidas) escribir(`  ${m.enumerado}(${comilla(m.texto)}),`);
escribir(`  ;

  const FormaDeMedir(this.texto);
  final String texto;

  /// Qué huecos tiene sentido pedir para esta forma de medir.
  bool get pidePeso => this == FormaDeMedir.pesoReps || this == FormaDeMedir.pesoTiempo;
  bool get pideReps => this == FormaDeMedir.pesoReps || this == FormaDeMedir.reps;
  bool get pideTiempo =>
      this == FormaDeMedir.tiempo ||
      this == FormaDeMedir.pesoTiempo ||
      this == FormaDeMedir.distanciaTiempo;
  bool get pideDistancia => this == FormaDeMedir.distanciaTiempo;
}

class Ejercicio {
  const Ejercicio({
    required this.id,
    required this.nombre,
    required this.grupo,
    required this.equipo,
    this.secundarios = const [],
    this.medida = FormaDeMedir.pesoReps,
    this.unilateral = false,
    this.propio = false,
  });

  final String id;
  final String nombre;
  final Grupo grupo;
  final Equipo equipo;

  /// Grupos que se llevan trabajo, pero no son el objetivo.
  final List<Grupo> secundarios;
  final FormaDeMedir medida;

  /// Se hace un lado a la vez: las series se apuntan por lado.
  final bool unilateral;

  /// Lo ha escrito el usuario, no viene en el catálogo.
  final bool propio;

  Map<String, dynamic> aJson() => {
        'id': id,
        'nombre': nombre,
        'grupo': grupo.texto,
        'equipo': equipo.texto,
        'secundarios': secundarios.map((g) => g.texto).toList(),
        'medida': medida.texto,
        'unilateral': unilateral,
        'propio': propio,
      };

  static Ejercicio deJson(Map<String, dynamic> j) => Ejercicio(
        id: j['id'] as String,
        nombre: j['nombre'] as String,
        grupo: Grupo.values.firstWhere((g) => g.texto == j['grupo'], orElse: () => Grupo.values.first),
        equipo:
            Equipo.values.firstWhere((e) => e.texto == j['equipo'], orElse: () => Equipo.otro),
        secundarios: ((j['secundarios'] as List?) ?? const [])
            .map((t) => Grupo.values.firstWhere((g) => g.texto == t, orElse: () => Grupo.values.first))
            .toList(),
        medida: FormaDeMedir.values
            .firstWhere((m) => m.texto == j['medida'], orElse: () => FormaDeMedir.pesoReps),
        unilateral: (j['unilateral'] as bool?) ?? false,
        propio: (j['propio'] as bool?) ?? false,
      );
}

/// El catálogo de casa. ${EJERCICIOS.length} ejercicios.
const List<Ejercicio> ejerciciosDeCasa = [`);

for (const e of EJERCICIOS) {
  const partes = [
    `id: ${comilla(e.id)}`,
    `nombre: ${comilla(e.nombre)}`,
    `grupo: Grupo.${enumDe(grupos, e.grupo)}`,
    `equipo: Equipo.${enumDe(equipos, e.equipo)}`,
  ];
  if (e.secundarios.length > 0) {
    partes.push(`secundarios: [${e.secundarios.map((s) => `Grupo.${enumDe(grupos, s)}`).join(', ')}]`);
  }
  if (e.medida !== 'peso-reps') partes.push(`medida: FormaDeMedir.${enumDe(medidas, e.medida)}`);
  if (e.unilateral) partes.push('unilateral: true');
  escribir(`  Ejercicio(${partes.join(', ')}),`);
}

escribir(`];

/// Sin acentos y en minúsculas, para buscar y para hacer ids.
String normalizar(String texto) {
  const con = 'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ';
  const sin = 'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC';
  final salida = StringBuffer();
  for (final letra in texto.split('')) {
    final i = con.indexOf(letra);
    salida.write(i >= 0 ? sin[i] : letra);
  }
  return salida.toString().toLowerCase();
}

/// El id sale del nombre y es estable mientras no se renombre: los entrenos apuntan aquí.
String idDeNombre(String nombre) => normalizar(nombre)
    .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
    .replaceAll(RegExp(r'^-|-\$'), '');

/// Busca por trozos sueltos: «press incl mancu» encuentra «Press inclinado con mancuernas».
/// Se escribe en el móvil y con prisa, así que no se exige el orden ni la ortografía entera.
bool coincide(Ejercicio e, String busqueda) {
  final trozos = normalizar(busqueda).split(RegExp(r'\\s+')).where((t) => t.isNotEmpty);
  if (trozos.isEmpty) return true;
  final paja = normalizar('\${e.nombre} \${e.grupo.texto} \${e.equipo.texto}');
  return trozos.every(paja.contains);
}

/// El catálogo con los ejercicios propios delante: son los que uno hace de verdad.
List<Ejercicio> catalogoCon(List<Ejercicio> propios) {
  final ids = propios.map((e) => e.id).toSet();
  return [...propios, ...ejerciciosDeCasa.where((e) => !ids.contains(e.id))];
}`);

process.stdout.write(salida.join('\n') + '\n');
