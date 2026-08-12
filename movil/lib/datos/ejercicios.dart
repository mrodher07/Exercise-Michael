// GENERADO por herramientas/generar_catalogo_dart.mjs — no editar a mano.
//
// La fuente es `src/datos/ejercicios.ts`, que es donde se añaden ejercicios nuevos. Para
// rehacer este archivo:
//
//   npx tsc src/datos/ejercicios.ts --outDir .tmp-gen --module es2020 --target es2020
//   node herramientas/generar_catalogo_dart.mjs > movil/lib/datos/ejercicios.dart
//
// Así los 297 ejercicios están escritos una sola vez y las dos aplicaciones no pueden
// acabar diciendo cosas distintas.

/// Con qué se hace. Es el filtro que más se usa: lo que hay libre manda.
enum Equipo {
  maquina('máquina'),
  polea('polea'),
  multipower('multipower'),
  barra('barra'),
  mancuernas('mancuernas'),
  kettlebell('kettlebell'),
  pesoCorporal('peso corporal'),
  bandaElastica('banda elástica'),
  disco('disco'),
  balonMedicinal('balón medicinal'),
  anillas('anillas'),
  cardio('cardio'),
  otro('otro'),
  ;

  const Equipo(this.texto);
  final String texto;
}

/// Los grupos musculares, con el detalle que se usa al planificar.
enum Grupo {
  pecho('Pecho'),
  espalda('Espalda'),
  trapecio('Trapecio'),
  hombros('Hombros'),
  biceps('Bíceps'),
  triceps('Tríceps'),
  antebrazo('Antebrazo'),
  cuadriceps('Cuádriceps'),
  isquiotibiales('Isquiotibiales'),
  gluteos('Glúteos'),
  aductores('Aductores'),
  abductores('Abductores'),
  gemelos('Gemelos'),
  abdomen('Abdomen'),
  lumbares('Lumbares'),
  cuello('Cuello'),
  cuerpoCompleto('Cuerpo completo'),
  cardio('Cardio'),
  ;

  const Grupo(this.texto);
  final String texto;
}

/// Qué se apunta de cada serie. Una plancha no tiene repeticiones y la cinta no tiene peso:
/// si todo se apuntara como «peso × reps» habría que escribir ceros en la mitad de los
/// huecos, y esos ceros luego cuentan como datos y estropean las medias.
///
/// Se llama así y no «Medida» porque una Medida es una medida corporal —el peso, la
/// cintura—, y dos conceptos distintos con el mismo nombre se confunden al leerlos.
enum FormaDeMedir {
  pesoReps('peso-reps'),
  reps('reps'),
  tiempo('tiempo'),
  pesoTiempo('peso-tiempo'),
  distanciaTiempo('distancia-tiempo'),
  ;

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

/// El catálogo de casa. 297 ejercicios.
const List<Ejercicio> ejerciciosDeCasa = [
  Ejercicio(id: 'press-de-banca-con-barra', nombre: 'Press de banca con barra', grupo: Grupo.pecho, equipo: Equipo.barra, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'press-de-banca-inclinado-con-barra', nombre: 'Press de banca inclinado con barra', grupo: Grupo.pecho, equipo: Equipo.barra, secundarios: [Grupo.hombros, Grupo.triceps]),
  Ejercicio(id: 'press-de-banca-declinado-con-barra', nombre: 'Press de banca declinado con barra', grupo: Grupo.pecho, equipo: Equipo.barra, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-banca-agarre-estrecho', nombre: 'Press de banca agarre estrecho', grupo: Grupo.pecho, equipo: Equipo.barra, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-banca-con-mancuernas', nombre: 'Press de banca con mancuernas', grupo: Grupo.pecho, equipo: Equipo.mancuernas, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'press-inclinado-con-mancuernas', nombre: 'Press inclinado con mancuernas', grupo: Grupo.pecho, equipo: Equipo.mancuernas, secundarios: [Grupo.hombros, Grupo.triceps]),
  Ejercicio(id: 'press-declinado-con-mancuernas', nombre: 'Press declinado con mancuernas', grupo: Grupo.pecho, equipo: Equipo.mancuernas, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-suelo-con-mancuernas', nombre: 'Press de suelo con mancuernas', grupo: Grupo.pecho, equipo: Equipo.mancuernas, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-pecho-en-maquina', nombre: 'Press de pecho en máquina', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'press-de-pecho-inclinado-en-maquina', nombre: 'Press de pecho inclinado en máquina', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.hombros, Grupo.triceps]),
  Ejercicio(id: 'press-de-pecho-declinado-en-maquina', nombre: 'Press de pecho declinado en máquina', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-pecho-en-maquina-de-palanca', nombre: 'Press de pecho en máquina de palanca', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'press-de-pecho-en-maquina-convergente', nombre: 'Press de pecho en máquina convergente', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-pecho-a-una-mano-en-maquina', nombre: 'Press de pecho a una mano en máquina', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.triceps], unilateral: true),
  Ejercicio(id: 'press-de-banca-en-multipower', nombre: 'Press de banca en multipower', grupo: Grupo.pecho, equipo: Equipo.multipower, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'press-inclinado-en-multipower', nombre: 'Press inclinado en multipower', grupo: Grupo.pecho, equipo: Equipo.multipower, secundarios: [Grupo.hombros, Grupo.triceps]),
  Ejercicio(id: 'aperturas-en-maquina-peck-deck', nombre: 'Aperturas en máquina (peck deck)', grupo: Grupo.pecho, equipo: Equipo.maquina),
  Ejercicio(id: 'aperturas-con-mancuernas', nombre: 'Aperturas con mancuernas', grupo: Grupo.pecho, equipo: Equipo.mancuernas, secundarios: [Grupo.hombros]),
  Ejercicio(id: 'aperturas-inclinado-con-mancuernas', nombre: 'Aperturas inclinado con mancuernas', grupo: Grupo.pecho, equipo: Equipo.mancuernas, secundarios: [Grupo.hombros]),
  Ejercicio(id: 'cruces-en-polea-alta', nombre: 'Cruces en polea alta', grupo: Grupo.pecho, equipo: Equipo.polea),
  Ejercicio(id: 'cruces-en-polea-media', nombre: 'Cruces en polea media', grupo: Grupo.pecho, equipo: Equipo.polea),
  Ejercicio(id: 'cruces-en-polea-baja', nombre: 'Cruces en polea baja', grupo: Grupo.pecho, equipo: Equipo.polea, secundarios: [Grupo.hombros]),
  Ejercicio(id: 'apertura-en-polea-a-una-mano', nombre: 'Apertura en polea a una mano', grupo: Grupo.pecho, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'fondos-en-paralelas', nombre: 'Fondos en paralelas', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps, Grupo.hombros], medida: FormaDeMedir.reps),
  Ejercicio(id: 'fondos-en-paralelas-lastrados', nombre: 'Fondos en paralelas lastrados', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'fondos-en-maquina-asistida', nombre: 'Fondos en máquina asistida', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'flexiones', nombre: 'Flexiones', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps, Grupo.hombros], medida: FormaDeMedir.reps),
  Ejercicio(id: 'flexiones-declinadas', nombre: 'Flexiones declinadas', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.hombros, Grupo.triceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'flexiones-inclinadas', nombre: 'Flexiones inclinadas', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'flexiones-diamante', nombre: 'Flexiones diamante', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'flexiones-con-lastre', nombre: 'Flexiones con lastre', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps, Grupo.hombros]),
  Ejercicio(id: 'flexiones-en-anillas', nombre: 'Flexiones en anillas', grupo: Grupo.pecho, equipo: Equipo.anillas, secundarios: [Grupo.triceps, Grupo.hombros], medida: FormaDeMedir.reps),
  Ejercicio(id: 'flexiones-pliometricas', nombre: 'Flexiones pliométricas', grupo: Grupo.pecho, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'pullover-con-mancuerna', nombre: 'Pullover con mancuerna', grupo: Grupo.pecho, equipo: Equipo.mancuernas, secundarios: [Grupo.espalda]),
  Ejercicio(id: 'pullover-en-maquina', nombre: 'Pullover en máquina', grupo: Grupo.pecho, equipo: Equipo.maquina, secundarios: [Grupo.espalda]),
  Ejercicio(id: 'press-svend-con-disco', nombre: 'Press Svend con disco', grupo: Grupo.pecho, equipo: Equipo.disco),
  Ejercicio(id: 'aperturas-con-banda-elastica', nombre: 'Aperturas con banda elástica', grupo: Grupo.pecho, equipo: Equipo.bandaElastica),
  Ejercicio(id: 'press-de-pecho-con-banda-elastica', nombre: 'Press de pecho con banda elástica', grupo: Grupo.pecho, equipo: Equipo.bandaElastica, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'dominadas', nombre: 'Dominadas', grupo: Grupo.espalda, equipo: Equipo.pesoCorporal, secundarios: [Grupo.biceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'dominadas-supinas', nombre: 'Dominadas supinas', grupo: Grupo.espalda, equipo: Equipo.pesoCorporal, secundarios: [Grupo.biceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'dominadas-agarre-neutro', nombre: 'Dominadas agarre neutro', grupo: Grupo.espalda, equipo: Equipo.pesoCorporal, secundarios: [Grupo.biceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'dominadas-lastradas', nombre: 'Dominadas lastradas', grupo: Grupo.espalda, equipo: Equipo.pesoCorporal, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'dominadas-en-maquina-asistida', nombre: 'Dominadas en máquina asistida', grupo: Grupo.espalda, equipo: Equipo.maquina, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'jalon-al-pecho-en-polea', nombre: 'Jalón al pecho en polea', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'jalon-al-pecho-agarre-estrecho', nombre: 'Jalón al pecho agarre estrecho', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'jalon-supino-en-polea', nombre: 'Jalón supino en polea', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'jalon-tras-nuca-en-polea', nombre: 'Jalón tras nuca en polea', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'jalon-a-una-mano-en-polea', nombre: 'Jalón a una mano en polea', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps], unilateral: true),
  Ejercicio(id: 'jalon-con-brazos-rectos-en-polea', nombre: 'Jalón con brazos rectos en polea', grupo: Grupo.espalda, equipo: Equipo.polea),
  Ejercicio(id: 'jalon-al-pecho-en-maquina', nombre: 'Jalón al pecho en máquina', grupo: Grupo.espalda, equipo: Equipo.maquina, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-con-barra', nombre: 'Remo con barra', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.biceps, Grupo.lumbares]),
  Ejercicio(id: 'remo-con-barra-agarre-supino', nombre: 'Remo con barra agarre supino', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-pendlay', nombre: 'Remo Pendlay', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.biceps, Grupo.lumbares]),
  Ejercicio(id: 'remo-con-mancuerna-a-una-mano', nombre: 'Remo con mancuerna a una mano', grupo: Grupo.espalda, equipo: Equipo.mancuernas, secundarios: [Grupo.biceps], unilateral: true),
  Ejercicio(id: 'remo-con-mancuernas-a-dos-manos', nombre: 'Remo con mancuernas a dos manos', grupo: Grupo.espalda, equipo: Equipo.mancuernas, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-en-punta-con-barra-t', nombre: 'Remo en punta con barra T', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-en-maquina-t', nombre: 'Remo en máquina T', grupo: Grupo.espalda, equipo: Equipo.maquina, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-sentado-en-polea', nombre: 'Remo sentado en polea', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-sentado-en-polea-agarre-ancho', nombre: 'Remo sentado en polea agarre ancho', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps, Grupo.hombros]),
  Ejercicio(id: 'remo-en-polea-a-una-mano', nombre: 'Remo en polea a una mano', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.biceps], unilateral: true),
  Ejercicio(id: 'remo-sentado-en-maquina', nombre: 'Remo sentado en máquina', grupo: Grupo.espalda, equipo: Equipo.maquina, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-en-maquina-de-palanca', nombre: 'Remo en máquina de palanca', grupo: Grupo.espalda, equipo: Equipo.maquina, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-en-maquina-a-una-mano', nombre: 'Remo en máquina a una mano', grupo: Grupo.espalda, equipo: Equipo.maquina, secundarios: [Grupo.biceps], unilateral: true),
  Ejercicio(id: 'remo-en-multipower', nombre: 'Remo en multipower', grupo: Grupo.espalda, equipo: Equipo.multipower, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'remo-invertido', nombre: 'Remo invertido', grupo: Grupo.espalda, equipo: Equipo.pesoCorporal, secundarios: [Grupo.biceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'remo-en-anillas', nombre: 'Remo en anillas', grupo: Grupo.espalda, equipo: Equipo.anillas, secundarios: [Grupo.biceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'remo-gorila-con-kettlebell', nombre: 'Remo gorila con kettlebell', grupo: Grupo.espalda, equipo: Equipo.kettlebell, secundarios: [Grupo.biceps]),
  Ejercicio(id: 'peso-muerto-convencional', nombre: 'Peso muerto convencional', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.isquiotibiales, Grupo.gluteos, Grupo.lumbares]),
  Ejercicio(id: 'peso-muerto-sumo', nombre: 'Peso muerto sumo', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.gluteos, Grupo.cuadriceps, Grupo.aductores]),
  Ejercicio(id: 'peso-muerto-con-barra-hexagonal', nombre: 'Peso muerto con barra hexagonal', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.cuadriceps, Grupo.gluteos]),
  Ejercicio(id: 'peso-muerto-con-mancuernas', nombre: 'Peso muerto con mancuernas', grupo: Grupo.espalda, equipo: Equipo.mancuernas, secundarios: [Grupo.isquiotibiales, Grupo.gluteos]),
  Ejercicio(id: 'peso-muerto-en-multipower', nombre: 'Peso muerto en multipower', grupo: Grupo.espalda, equipo: Equipo.multipower, secundarios: [Grupo.isquiotibiales, Grupo.gluteos]),
  Ejercicio(id: 'rack-pull', nombre: 'Rack pull', grupo: Grupo.espalda, equipo: Equipo.barra, secundarios: [Grupo.trapecio, Grupo.isquiotibiales]),
  Ejercicio(id: 'retraccion-escapular-en-barra', nombre: 'Retracción escapular en barra', grupo: Grupo.espalda, equipo: Equipo.pesoCorporal, secundarios: [Grupo.trapecio], medida: FormaDeMedir.reps),
  Ejercicio(id: 'pull-over-en-polea-alta', nombre: 'Pull-over en polea alta', grupo: Grupo.espalda, equipo: Equipo.polea, secundarios: [Grupo.pecho]),
  Ejercicio(id: 'encogimientos-con-barra', nombre: 'Encogimientos con barra', grupo: Grupo.trapecio, equipo: Equipo.barra),
  Ejercicio(id: 'encogimientos-con-mancuernas', nombre: 'Encogimientos con mancuernas', grupo: Grupo.trapecio, equipo: Equipo.mancuernas),
  Ejercicio(id: 'encogimientos-en-maquina', nombre: 'Encogimientos en máquina', grupo: Grupo.trapecio, equipo: Equipo.maquina),
  Ejercicio(id: 'encogimientos-en-multipower', nombre: 'Encogimientos en multipower', grupo: Grupo.trapecio, equipo: Equipo.multipower),
  Ejercicio(id: 'encogimientos-en-polea', nombre: 'Encogimientos en polea', grupo: Grupo.trapecio, equipo: Equipo.polea),
  Ejercicio(id: 'encogimientos-con-barra-hexagonal', nombre: 'Encogimientos con barra hexagonal', grupo: Grupo.trapecio, equipo: Equipo.barra, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'press-militar-con-barra-de-pie', nombre: 'Press militar con barra de pie', grupo: Grupo.hombros, equipo: Equipo.barra, secundarios: [Grupo.triceps, Grupo.abdomen]),
  Ejercicio(id: 'press-militar-sentado-con-barra', nombre: 'Press militar sentado con barra', grupo: Grupo.hombros, equipo: Equipo.barra, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-tras-nuca-con-barra', nombre: 'Press tras nuca con barra', grupo: Grupo.hombros, equipo: Equipo.barra, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-hombros-con-mancuernas', nombre: 'Press de hombros con mancuernas', grupo: Grupo.hombros, equipo: Equipo.mancuernas, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-arnold', nombre: 'Press Arnold', grupo: Grupo.hombros, equipo: Equipo.mancuernas, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-hombros-en-maquina', nombre: 'Press de hombros en máquina', grupo: Grupo.hombros, equipo: Equipo.maquina, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'press-de-hombros-en-multipower', nombre: 'Press de hombros en multipower', grupo: Grupo.hombros, equipo: Equipo.multipower, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'push-press-con-barra', nombre: 'Push press con barra', grupo: Grupo.hombros, equipo: Equipo.barra, secundarios: [Grupo.triceps, Grupo.cuadriceps]),
  Ejercicio(id: 'press-con-kettlebell', nombre: 'Press con kettlebell', grupo: Grupo.hombros, equipo: Equipo.kettlebell, secundarios: [Grupo.triceps], unilateral: true),
  Ejercicio(id: 'landmine-press', nombre: 'Landmine press', grupo: Grupo.hombros, equipo: Equipo.barra, secundarios: [Grupo.triceps], unilateral: true),
  Ejercicio(id: 'elevaciones-laterales-con-mancuernas', nombre: 'Elevaciones laterales con mancuernas', grupo: Grupo.hombros, equipo: Equipo.mancuernas),
  Ejercicio(id: 'elevaciones-laterales-en-polea', nombre: 'Elevaciones laterales en polea', grupo: Grupo.hombros, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'elevaciones-laterales-en-maquina', nombre: 'Elevaciones laterales en máquina', grupo: Grupo.hombros, equipo: Equipo.maquina),
  Ejercicio(id: 'elevaciones-laterales-inclinado', nombre: 'Elevaciones laterales inclinado', grupo: Grupo.hombros, equipo: Equipo.mancuernas, unilateral: true),
  Ejercicio(id: 'elevaciones-frontales-con-mancuernas', nombre: 'Elevaciones frontales con mancuernas', grupo: Grupo.hombros, equipo: Equipo.mancuernas),
  Ejercicio(id: 'elevaciones-frontales-con-disco', nombre: 'Elevaciones frontales con disco', grupo: Grupo.hombros, equipo: Equipo.disco),
  Ejercicio(id: 'elevaciones-frontales-en-polea', nombre: 'Elevaciones frontales en polea', grupo: Grupo.hombros, equipo: Equipo.polea),
  Ejercicio(id: 'pajaros-con-mancuernas', nombre: 'Pájaros con mancuernas', grupo: Grupo.hombros, equipo: Equipo.mancuernas, secundarios: [Grupo.espalda]),
  Ejercicio(id: 'pajaros-en-maquina', nombre: 'Pájaros en máquina', grupo: Grupo.hombros, equipo: Equipo.maquina, secundarios: [Grupo.espalda]),
  Ejercicio(id: 'pajaros-en-polea-cruzada', nombre: 'Pájaros en polea cruzada', grupo: Grupo.hombros, equipo: Equipo.polea, secundarios: [Grupo.espalda]),
  Ejercicio(id: 'face-pull-en-polea', nombre: 'Face pull en polea', grupo: Grupo.hombros, equipo: Equipo.polea, secundarios: [Grupo.trapecio, Grupo.espalda]),
  Ejercicio(id: 'remo-al-cuello-con-barra', nombre: 'Remo al cuello con barra', grupo: Grupo.hombros, equipo: Equipo.barra, secundarios: [Grupo.trapecio]),
  Ejercicio(id: 'remo-al-cuello-en-polea', nombre: 'Remo al cuello en polea', grupo: Grupo.hombros, equipo: Equipo.polea, secundarios: [Grupo.trapecio]),
  Ejercicio(id: 'elevacion-en-y-en-banco-inclinado', nombre: 'Elevación en Y en banco inclinado', grupo: Grupo.hombros, equipo: Equipo.mancuernas, secundarios: [Grupo.trapecio]),
  Ejercicio(id: 'rotacion-externa-en-polea', nombre: 'Rotación externa en polea', grupo: Grupo.hombros, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'rotacion-externa-con-banda-elastica', nombre: 'Rotación externa con banda elástica', grupo: Grupo.hombros, equipo: Equipo.bandaElastica),
  Ejercicio(id: 'press-de-hombros-con-banda-elastica', nombre: 'Press de hombros con banda elástica', grupo: Grupo.hombros, equipo: Equipo.bandaElastica, secundarios: [Grupo.triceps]),
  Ejercicio(id: 'flexiones-pica', nombre: 'Flexiones pica', grupo: Grupo.hombros, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'flexiones-en-vertical', nombre: 'Flexiones en vertical', grupo: Grupo.hombros, equipo: Equipo.pesoCorporal, secundarios: [Grupo.triceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'curl-con-barra', nombre: 'Curl con barra', grupo: Grupo.biceps, equipo: Equipo.barra, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-con-barra-z', nombre: 'Curl con barra Z', grupo: Grupo.biceps, equipo: Equipo.barra, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-con-mancuernas', nombre: 'Curl con mancuernas', grupo: Grupo.biceps, equipo: Equipo.mancuernas, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-alterno-con-mancuernas', nombre: 'Curl alterno con mancuernas', grupo: Grupo.biceps, equipo: Equipo.mancuernas, secundarios: [Grupo.antebrazo], unilateral: true),
  Ejercicio(id: 'curl-martillo', nombre: 'Curl martillo', grupo: Grupo.biceps, equipo: Equipo.mancuernas, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-inclinado-con-mancuernas', nombre: 'Curl inclinado con mancuernas', grupo: Grupo.biceps, equipo: Equipo.mancuernas),
  Ejercicio(id: 'curl-concentrado', nombre: 'Curl concentrado', grupo: Grupo.biceps, equipo: Equipo.mancuernas, unilateral: true),
  Ejercicio(id: 'curl-arana', nombre: 'Curl araña', grupo: Grupo.biceps, equipo: Equipo.mancuernas),
  Ejercicio(id: 'curl-zottman', nombre: 'Curl Zottman', grupo: Grupo.biceps, equipo: Equipo.mancuernas, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-en-banco-scott-con-barra', nombre: 'Curl en banco Scott con barra', grupo: Grupo.biceps, equipo: Equipo.barra),
  Ejercicio(id: 'curl-en-banco-scott-con-mancuerna', nombre: 'Curl en banco Scott con mancuerna', grupo: Grupo.biceps, equipo: Equipo.mancuernas, unilateral: true),
  Ejercicio(id: 'curl-en-maquina', nombre: 'Curl en máquina', grupo: Grupo.biceps, equipo: Equipo.maquina),
  Ejercicio(id: 'curl-en-polea-baja', nombre: 'Curl en polea baja', grupo: Grupo.biceps, equipo: Equipo.polea, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-con-cuerda-en-polea', nombre: 'Curl con cuerda en polea', grupo: Grupo.biceps, equipo: Equipo.polea, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-en-polea-alta-a-dos-manos', nombre: 'Curl en polea alta a dos manos', grupo: Grupo.biceps, equipo: Equipo.polea),
  Ejercicio(id: 'curl-con-kettlebell', nombre: 'Curl con kettlebell', grupo: Grupo.biceps, equipo: Equipo.kettlebell, secundarios: [Grupo.antebrazo]),
  Ejercicio(id: 'curl-con-banda-elastica', nombre: 'Curl con banda elástica', grupo: Grupo.biceps, equipo: Equipo.bandaElastica),
  Ejercicio(id: 'extension-de-triceps-en-polea-con-cuerda', nombre: 'Extensión de tríceps en polea con cuerda', grupo: Grupo.triceps, equipo: Equipo.polea),
  Ejercicio(id: 'extension-de-triceps-en-polea-con-barra', nombre: 'Extensión de tríceps en polea con barra', grupo: Grupo.triceps, equipo: Equipo.polea),
  Ejercicio(id: 'extension-de-triceps-en-polea-agarre-inverso', nombre: 'Extensión de tríceps en polea agarre inverso', grupo: Grupo.triceps, equipo: Equipo.polea),
  Ejercicio(id: 'extension-de-triceps-sobre-la-cabeza-en-polea', nombre: 'Extensión de tríceps sobre la cabeza en polea', grupo: Grupo.triceps, equipo: Equipo.polea),
  Ejercicio(id: 'extension-de-triceps-sobre-la-cabeza-con-mancuerna', nombre: 'Extensión de tríceps sobre la cabeza con mancuerna', grupo: Grupo.triceps, equipo: Equipo.mancuernas),
  Ejercicio(id: 'press-frances-con-barra', nombre: 'Press francés con barra', grupo: Grupo.triceps, equipo: Equipo.barra),
  Ejercicio(id: 'press-frances-con-mancuernas', nombre: 'Press francés con mancuernas', grupo: Grupo.triceps, equipo: Equipo.mancuernas),
  Ejercicio(id: 'rompecraneos-con-barra-z', nombre: 'Rompecráneos con barra Z', grupo: Grupo.triceps, equipo: Equipo.barra),
  Ejercicio(id: 'jm-press', nombre: 'JM press', grupo: Grupo.triceps, equipo: Equipo.barra),
  Ejercicio(id: 'patada-de-triceps-con-mancuerna', nombre: 'Patada de tríceps con mancuerna', grupo: Grupo.triceps, equipo: Equipo.mancuernas, unilateral: true),
  Ejercicio(id: 'patada-de-triceps-en-polea', nombre: 'Patada de tríceps en polea', grupo: Grupo.triceps, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'extension-de-triceps-en-maquina', nombre: 'Extensión de tríceps en máquina', grupo: Grupo.triceps, equipo: Equipo.maquina),
  Ejercicio(id: 'fondos-en-banco', nombre: 'Fondos en banco', grupo: Grupo.triceps, equipo: Equipo.pesoCorporal, secundarios: [Grupo.pecho], medida: FormaDeMedir.reps),
  Ejercicio(id: 'fondos-entre-bancos-con-lastre', nombre: 'Fondos entre bancos con lastre', grupo: Grupo.triceps, equipo: Equipo.pesoCorporal, secundarios: [Grupo.pecho]),
  Ejercicio(id: 'extension-de-triceps-con-banda-elastica', nombre: 'Extensión de tríceps con banda elástica', grupo: Grupo.triceps, equipo: Equipo.bandaElastica),
  Ejercicio(id: 'curl-de-muneca-con-barra', nombre: 'Curl de muñeca con barra', grupo: Grupo.antebrazo, equipo: Equipo.barra),
  Ejercicio(id: 'curl-de-muneca-inverso-con-barra', nombre: 'Curl de muñeca inverso con barra', grupo: Grupo.antebrazo, equipo: Equipo.barra),
  Ejercicio(id: 'curl-de-muneca-con-mancuernas', nombre: 'Curl de muñeca con mancuernas', grupo: Grupo.antebrazo, equipo: Equipo.mancuernas),
  Ejercicio(id: 'curl-inverso-con-barra-z', nombre: 'Curl inverso con barra Z', grupo: Grupo.antebrazo, equipo: Equipo.barra),
  Ejercicio(id: 'rodillo-de-muneca', nombre: 'Rodillo de muñeca', grupo: Grupo.antebrazo, equipo: Equipo.otro),
  Ejercicio(id: 'pronosupinacion-con-mancuerna', nombre: 'Pronosupinación con mancuerna', grupo: Grupo.antebrazo, equipo: Equipo.mancuernas, unilateral: true),
  Ejercicio(id: 'pinza-de-agarre', nombre: 'Pinza de agarre', grupo: Grupo.antebrazo, equipo: Equipo.otro, medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'colgarse-de-la-barra', nombre: 'Colgarse de la barra', grupo: Grupo.antebrazo, equipo: Equipo.pesoCorporal, secundarios: [Grupo.espalda], medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'sentadilla-con-barra', nombre: 'Sentadilla con barra', grupo: Grupo.cuadriceps, equipo: Equipo.barra, secundarios: [Grupo.gluteos, Grupo.isquiotibiales, Grupo.lumbares]),
  Ejercicio(id: 'sentadilla-frontal', nombre: 'Sentadilla frontal', grupo: Grupo.cuadriceps, equipo: Equipo.barra, secundarios: [Grupo.gluteos, Grupo.abdomen]),
  Ejercicio(id: 'sentadilla-zercher', nombre: 'Sentadilla Zercher', grupo: Grupo.cuadriceps, equipo: Equipo.barra, secundarios: [Grupo.gluteos, Grupo.abdomen]),
  Ejercicio(id: 'sentadilla-en-multipower', nombre: 'Sentadilla en multipower', grupo: Grupo.cuadriceps, equipo: Equipo.multipower, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'sentadilla-goblet-con-kettlebell', nombre: 'Sentadilla goblet con kettlebell', grupo: Grupo.cuadriceps, equipo: Equipo.kettlebell, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'sentadilla-bulgara-con-mancuernas', nombre: 'Sentadilla búlgara con mancuernas', grupo: Grupo.cuadriceps, equipo: Equipo.mancuernas, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'sentadilla-bulgara-con-barra', nombre: 'Sentadilla búlgara con barra', grupo: Grupo.cuadriceps, equipo: Equipo.barra, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'sentadilla-hack-en-maquina', nombre: 'Sentadilla hack en máquina', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'sentadilla-en-maquina-pendular', nombre: 'Sentadilla en máquina pendular', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'sentadilla-en-maquina-de-cinturon', nombre: 'Sentadilla en máquina de cinturón', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'sentadilla-sissy', nombre: 'Sentadilla sissy', grupo: Grupo.cuadriceps, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'sentadilla-libre', nombre: 'Sentadilla libre', grupo: Grupo.cuadriceps, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'sentadilla-con-salto', nombre: 'Sentadilla con salto', grupo: Grupo.cuadriceps, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'sentadilla-isometrica-en-pared', nombre: 'Sentadilla isométrica en pared', grupo: Grupo.cuadriceps, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'sentadilla-a-una-pierna-pistol', nombre: 'Sentadilla a una pierna (pistol)', grupo: Grupo.cuadriceps, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps, unilateral: true),
  Ejercicio(id: 'sentadilla-con-banda-elastica', nombre: 'Sentadilla con banda elástica', grupo: Grupo.cuadriceps, equipo: Equipo.bandaElastica, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'prensa-de-piernas-45', nombre: 'Prensa de piernas 45º', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, secundarios: [Grupo.gluteos, Grupo.isquiotibiales]),
  Ejercicio(id: 'prensa-de-piernas-horizontal', nombre: 'Prensa de piernas horizontal', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'prensa-de-piernas-vertical', nombre: 'Prensa de piernas vertical', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'prensa-de-piernas-a-una-pierna', nombre: 'Prensa de piernas a una pierna', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'extension-de-cuadriceps-en-maquina', nombre: 'Extensión de cuádriceps en máquina', grupo: Grupo.cuadriceps, equipo: Equipo.maquina),
  Ejercicio(id: 'extension-de-cuadriceps-a-una-pierna', nombre: 'Extensión de cuádriceps a una pierna', grupo: Grupo.cuadriceps, equipo: Equipo.maquina, unilateral: true),
  Ejercicio(id: 'zancadas-con-mancuernas', nombre: 'Zancadas con mancuernas', grupo: Grupo.cuadriceps, equipo: Equipo.mancuernas, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'zancadas-con-barra', nombre: 'Zancadas con barra', grupo: Grupo.cuadriceps, equipo: Equipo.barra, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'zancadas-caminando', nombre: 'Zancadas caminando', grupo: Grupo.cuadriceps, equipo: Equipo.mancuernas, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'zancadas-inversas', nombre: 'Zancadas inversas', grupo: Grupo.cuadriceps, equipo: Equipo.mancuernas, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'subida-al-cajon-con-mancuernas', nombre: 'Subida al cajón con mancuernas', grupo: Grupo.cuadriceps, equipo: Equipo.mancuernas, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'peso-muerto-rumano-con-barra', nombre: 'Peso muerto rumano con barra', grupo: Grupo.isquiotibiales, equipo: Equipo.barra, secundarios: [Grupo.gluteos, Grupo.lumbares]),
  Ejercicio(id: 'peso-muerto-rumano-con-mancuernas', nombre: 'Peso muerto rumano con mancuernas', grupo: Grupo.isquiotibiales, equipo: Equipo.mancuernas, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'peso-muerto-rumano-en-multipower', nombre: 'Peso muerto rumano en multipower', grupo: Grupo.isquiotibiales, equipo: Equipo.multipower, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'peso-muerto-rumano-a-una-pierna', nombre: 'Peso muerto rumano a una pierna', grupo: Grupo.isquiotibiales, equipo: Equipo.mancuernas, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'peso-muerto-rigido-con-barra', nombre: 'Peso muerto rígido con barra', grupo: Grupo.isquiotibiales, equipo: Equipo.barra, secundarios: [Grupo.gluteos, Grupo.lumbares]),
  Ejercicio(id: 'curl-femoral-tumbado-en-maquina', nombre: 'Curl femoral tumbado en máquina', grupo: Grupo.isquiotibiales, equipo: Equipo.maquina, secundarios: [Grupo.gemelos]),
  Ejercicio(id: 'curl-femoral-sentado-en-maquina', nombre: 'Curl femoral sentado en máquina', grupo: Grupo.isquiotibiales, equipo: Equipo.maquina, secundarios: [Grupo.gemelos]),
  Ejercicio(id: 'curl-femoral-de-pie-en-maquina', nombre: 'Curl femoral de pie en máquina', grupo: Grupo.isquiotibiales, equipo: Equipo.maquina, unilateral: true),
  Ejercicio(id: 'curl-femoral-con-banda-elastica', nombre: 'Curl femoral con banda elástica', grupo: Grupo.isquiotibiales, equipo: Equipo.bandaElastica),
  Ejercicio(id: 'curl-nordico', nombre: 'Curl nórdico', grupo: Grupo.isquiotibiales, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'curl-femoral-con-fitball', nombre: 'Curl femoral con fitball', grupo: Grupo.isquiotibiales, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'elevacion-gluteo-femoral-ghr', nombre: 'Elevación glúteo-femoral (GHR)', grupo: Grupo.isquiotibiales, equipo: Equipo.maquina, secundarios: [Grupo.gluteos, Grupo.lumbares], medida: FormaDeMedir.reps),
  Ejercicio(id: 'buenos-dias-con-barra', nombre: 'Buenos días con barra', grupo: Grupo.isquiotibiales, equipo: Equipo.barra, secundarios: [Grupo.lumbares, Grupo.gluteos]),
  Ejercicio(id: 'hip-thrust-con-barra', nombre: 'Hip thrust con barra', grupo: Grupo.gluteos, equipo: Equipo.barra, secundarios: [Grupo.isquiotibiales]),
  Ejercicio(id: 'hip-thrust-en-maquina', nombre: 'Hip thrust en máquina', grupo: Grupo.gluteos, equipo: Equipo.maquina, secundarios: [Grupo.isquiotibiales]),
  Ejercicio(id: 'hip-thrust-a-una-pierna', nombre: 'Hip thrust a una pierna', grupo: Grupo.gluteos, equipo: Equipo.pesoCorporal, secundarios: [Grupo.isquiotibiales], medida: FormaDeMedir.reps, unilateral: true),
  Ejercicio(id: 'puente-de-gluteo', nombre: 'Puente de glúteo', grupo: Grupo.gluteos, equipo: Equipo.pesoCorporal, secundarios: [Grupo.isquiotibiales], medida: FormaDeMedir.reps),
  Ejercicio(id: 'puente-de-gluteo-con-barra', nombre: 'Puente de glúteo con barra', grupo: Grupo.gluteos, equipo: Equipo.barra, secundarios: [Grupo.isquiotibiales]),
  Ejercicio(id: 'patada-de-gluteo-en-maquina', nombre: 'Patada de glúteo en máquina', grupo: Grupo.gluteos, equipo: Equipo.maquina, unilateral: true),
  Ejercicio(id: 'patada-de-gluteo-en-polea', nombre: 'Patada de glúteo en polea', grupo: Grupo.gluteos, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'patada-de-gluteo-con-banda-elastica', nombre: 'Patada de glúteo con banda elástica', grupo: Grupo.gluteos, equipo: Equipo.bandaElastica, unilateral: true),
  Ejercicio(id: 'extension-de-cadera-en-maquina', nombre: 'Extensión de cadera en máquina', grupo: Grupo.gluteos, equipo: Equipo.maquina, secundarios: [Grupo.isquiotibiales]),
  Ejercicio(id: 'pull-through-en-polea', nombre: 'Pull-through en polea', grupo: Grupo.gluteos, equipo: Equipo.polea, secundarios: [Grupo.isquiotibiales]),
  Ejercicio(id: 'sentadilla-sumo-con-mancuerna', nombre: 'Sentadilla sumo con mancuerna', grupo: Grupo.gluteos, equipo: Equipo.mancuernas, secundarios: [Grupo.aductores]),
  Ejercicio(id: 'hiperextension-inversa', nombre: 'Hiperextensión inversa', grupo: Grupo.gluteos, equipo: Equipo.maquina, secundarios: [Grupo.isquiotibiales, Grupo.lumbares], medida: FormaDeMedir.reps),
  Ejercicio(id: 'maquina-de-gluteo-de-pie', nombre: 'Máquina de glúteo de pie', grupo: Grupo.gluteos, equipo: Equipo.maquina, secundarios: [Grupo.isquiotibiales], unilateral: true),
  Ejercicio(id: 'aduccion-de-cadera-en-maquina', nombre: 'Aducción de cadera en máquina', grupo: Grupo.aductores, equipo: Equipo.maquina),
  Ejercicio(id: 'aduccion-de-cadera-en-polea', nombre: 'Aducción de cadera en polea', grupo: Grupo.aductores, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'aduccion-con-banda-elastica', nombre: 'Aducción con banda elástica', grupo: Grupo.aductores, equipo: Equipo.bandaElastica, unilateral: true),
  Ejercicio(id: 'sentadilla-cosaco', nombre: 'Sentadilla cosaco', grupo: Grupo.aductores, equipo: Equipo.pesoCorporal, secundarios: [Grupo.cuadriceps], medida: FormaDeMedir.reps, unilateral: true),
  Ejercicio(id: 'zancada-lateral-con-mancuernas', nombre: 'Zancada lateral con mancuernas', grupo: Grupo.aductores, equipo: Equipo.mancuernas, secundarios: [Grupo.cuadriceps], unilateral: true),
  Ejercicio(id: 'plancha-copenhague', nombre: 'Plancha Copenhague', grupo: Grupo.aductores, equipo: Equipo.pesoCorporal, secundarios: [Grupo.abdomen], medida: FormaDeMedir.tiempo, unilateral: true),
  Ejercicio(id: 'abduccion-de-cadera-en-maquina', nombre: 'Abducción de cadera en máquina', grupo: Grupo.abductores, equipo: Equipo.maquina, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'abduccion-de-cadera-en-polea', nombre: 'Abducción de cadera en polea', grupo: Grupo.abductores, equipo: Equipo.polea, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'abduccion-de-cadera-tumbado', nombre: 'Abducción de cadera tumbado', grupo: Grupo.abductores, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps, unilateral: true),
  Ejercicio(id: 'paso-lateral-con-banda-elastica', nombre: 'Paso lateral con banda elástica', grupo: Grupo.abductores, equipo: Equipo.bandaElastica, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'elevacion-de-cadera-lateral', nombre: 'Elevación de cadera lateral', grupo: Grupo.abductores, equipo: Equipo.pesoCorporal, secundarios: [Grupo.abdomen], medida: FormaDeMedir.reps, unilateral: true),
  Ejercicio(id: 'elevacion-de-talones-de-pie-en-maquina', nombre: 'Elevación de talones de pie en máquina', grupo: Grupo.gemelos, equipo: Equipo.maquina),
  Ejercicio(id: 'elevacion-de-talones-sentado-en-maquina', nombre: 'Elevación de talones sentado en máquina', grupo: Grupo.gemelos, equipo: Equipo.maquina),
  Ejercicio(id: 'elevacion-de-talones-en-prensa', nombre: 'Elevación de talones en prensa', grupo: Grupo.gemelos, equipo: Equipo.maquina),
  Ejercicio(id: 'elevacion-de-talones-en-multipower', nombre: 'Elevación de talones en multipower', grupo: Grupo.gemelos, equipo: Equipo.multipower),
  Ejercicio(id: 'elevacion-de-talones-con-mancuernas', nombre: 'Elevación de talones con mancuernas', grupo: Grupo.gemelos, equipo: Equipo.mancuernas),
  Ejercicio(id: 'elevacion-de-talones-a-una-pierna', nombre: 'Elevación de talones a una pierna', grupo: Grupo.gemelos, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps, unilateral: true),
  Ejercicio(id: 'elevacion-de-talones-tipo-burro', nombre: 'Elevación de talones tipo burro', grupo: Grupo.gemelos, equipo: Equipo.maquina),
  Ejercicio(id: 'flexion-dorsal-de-tobillo-con-banda', nombre: 'Flexión dorsal de tobillo con banda', grupo: Grupo.gemelos, equipo: Equipo.bandaElastica, medida: FormaDeMedir.reps),
  Ejercicio(id: 'plancha', nombre: 'Plancha', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, secundarios: [Grupo.lumbares], medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'plancha-lateral', nombre: 'Plancha lateral', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.tiempo, unilateral: true),
  Ejercicio(id: 'plancha-con-lastre', nombre: 'Plancha con lastre', grupo: Grupo.abdomen, equipo: Equipo.disco, secundarios: [Grupo.lumbares], medida: FormaDeMedir.pesoTiempo),
  Ejercicio(id: 'encogimientos', nombre: 'Encogimientos', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'encogimientos-abdominales-en-maquina', nombre: 'Encogimientos abdominales en máquina', grupo: Grupo.abdomen, equipo: Equipo.maquina),
  Ejercicio(id: 'encogimientos-en-polea-arrodillado', nombre: 'Encogimientos en polea arrodillado', grupo: Grupo.abdomen, equipo: Equipo.polea),
  Ejercicio(id: 'encogimientos-inversos', nombre: 'Encogimientos inversos', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'elevacion-de-piernas-colgado', nombre: 'Elevación de piernas colgado', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'elevacion-de-rodillas-en-paralelas', nombre: 'Elevación de rodillas en paralelas', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'elevacion-de-piernas-tumbado', nombre: 'Elevación de piernas tumbado', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'punta-de-pies-a-la-barra', nombre: 'Punta de pies a la barra', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'rueda-abdominal', nombre: 'Rueda abdominal', grupo: Grupo.abdomen, equipo: Equipo.otro, secundarios: [Grupo.lumbares], medida: FormaDeMedir.reps),
  Ejercicio(id: 'bicicleta-abdominal', nombre: 'Bicicleta abdominal', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'giro-ruso-con-disco', nombre: 'Giro ruso con disco', grupo: Grupo.abdomen, equipo: Equipo.disco, medida: FormaDeMedir.reps),
  Ejercicio(id: 'giro-ruso-con-balon-medicinal', nombre: 'Giro ruso con balón medicinal', grupo: Grupo.abdomen, equipo: Equipo.balonMedicinal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'lenador-en-polea', nombre: 'Leñador en polea', grupo: Grupo.abdomen, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'press-pallof-en-polea', nombre: 'Press Pallof en polea', grupo: Grupo.abdomen, equipo: Equipo.polea, unilateral: true),
  Ejercicio(id: 'rotacion-de-tronco-en-maquina', nombre: 'Rotación de tronco en máquina', grupo: Grupo.abdomen, equipo: Equipo.maquina, unilateral: true),
  Ejercicio(id: 'bandera-dragon', nombre: 'Bandera dragón', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'hollow-hold', nombre: 'Hollow hold', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'escalador', nombre: 'Escalador', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, secundarios: [Grupo.cardio], medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'abdominales-v', nombre: 'Abdominales V', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'abdominales-con-lastre', nombre: 'Abdominales con lastre', grupo: Grupo.abdomen, equipo: Equipo.disco),
  Ejercicio(id: 'bicho-muerto', nombre: 'Bicho muerto', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.reps),
  Ejercicio(id: 'vacio-abdominal', nombre: 'Vacío abdominal', grupo: Grupo.abdomen, equipo: Equipo.pesoCorporal, medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'abdominal-en-maquina-de-rodillos', nombre: 'Abdominal en máquina de rodillos', grupo: Grupo.abdomen, equipo: Equipo.maquina),
  Ejercicio(id: 'hiperextensiones-en-banco-romano', nombre: 'Hiperextensiones en banco romano', grupo: Grupo.lumbares, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'hiperextensiones-con-lastre', nombre: 'Hiperextensiones con lastre', grupo: Grupo.lumbares, equipo: Equipo.disco, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'extension-lumbar-en-maquina', nombre: 'Extensión lumbar en máquina', grupo: Grupo.lumbares, equipo: Equipo.maquina, secundarios: [Grupo.gluteos]),
  Ejercicio(id: 'superman', nombre: 'Superman', grupo: Grupo.lumbares, equipo: Equipo.pesoCorporal, secundarios: [Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'sujecion-de-peso-muerto', nombre: 'Sujeción de peso muerto', grupo: Grupo.lumbares, equipo: Equipo.barra, secundarios: [Grupo.trapecio, Grupo.antebrazo], medida: FormaDeMedir.pesoTiempo),
  Ejercicio(id: 'flexion-de-cuello-con-disco', nombre: 'Flexión de cuello con disco', grupo: Grupo.cuello, equipo: Equipo.disco, medida: FormaDeMedir.reps),
  Ejercicio(id: 'extension-de-cuello-con-disco', nombre: 'Extensión de cuello con disco', grupo: Grupo.cuello, equipo: Equipo.disco, medida: FormaDeMedir.reps),
  Ejercicio(id: 'flexion-de-cuello-con-banda-elastica', nombre: 'Flexión de cuello con banda elástica', grupo: Grupo.cuello, equipo: Equipo.bandaElastica, medida: FormaDeMedir.reps),
  Ejercicio(id: 'cuello-en-maquina', nombre: 'Cuello en máquina', grupo: Grupo.cuello, equipo: Equipo.maquina),
  Ejercicio(id: 'cargada-de-fuerza', nombre: 'Cargada de fuerza', grupo: Grupo.cuerpoCompleto, equipo: Equipo.barra, secundarios: [Grupo.trapecio, Grupo.cuadriceps, Grupo.gluteos]),
  Ejercicio(id: 'cargada-y-envion', nombre: 'Cargada y envión', grupo: Grupo.cuerpoCompleto, equipo: Equipo.barra, secundarios: [Grupo.hombros, Grupo.cuadriceps]),
  Ejercicio(id: 'arrancada-con-barra', nombre: 'Arrancada con barra', grupo: Grupo.cuerpoCompleto, equipo: Equipo.barra, secundarios: [Grupo.hombros, Grupo.trapecio]),
  Ejercicio(id: 'arrancada-con-mancuerna', nombre: 'Arrancada con mancuerna', grupo: Grupo.cuerpoCompleto, equipo: Equipo.mancuernas, secundarios: [Grupo.hombros], unilateral: true),
  Ejercicio(id: 'cargada-con-mancuernas', nombre: 'Cargada con mancuernas', grupo: Grupo.cuerpoCompleto, equipo: Equipo.mancuernas, secundarios: [Grupo.trapecio, Grupo.cuadriceps]),
  Ejercicio(id: 'thruster-con-barra', nombre: 'Thruster con barra', grupo: Grupo.cuerpoCompleto, equipo: Equipo.barra, secundarios: [Grupo.cuadriceps, Grupo.hombros]),
  Ejercicio(id: 'thruster-con-mancuernas', nombre: 'Thruster con mancuernas', grupo: Grupo.cuerpoCompleto, equipo: Equipo.mancuernas, secundarios: [Grupo.cuadriceps, Grupo.hombros]),
  Ejercicio(id: 'swing-con-kettlebell', nombre: 'Swing con kettlebell', grupo: Grupo.cuerpoCompleto, equipo: Equipo.kettlebell, secundarios: [Grupo.gluteos, Grupo.isquiotibiales]),
  Ejercicio(id: 'swing-a-una-mano-con-kettlebell', nombre: 'Swing a una mano con kettlebell', grupo: Grupo.cuerpoCompleto, equipo: Equipo.kettlebell, secundarios: [Grupo.gluteos], unilateral: true),
  Ejercicio(id: 'tiron-alto-con-kettlebell', nombre: 'Tirón alto con kettlebell', grupo: Grupo.cuerpoCompleto, equipo: Equipo.kettlebell, secundarios: [Grupo.trapecio, Grupo.hombros]),
  Ejercicio(id: 'turkish-get-up', nombre: 'Turkish get-up', grupo: Grupo.cuerpoCompleto, equipo: Equipo.kettlebell, secundarios: [Grupo.abdomen, Grupo.hombros], unilateral: true),
  Ejercicio(id: 'devil-press', nombre: 'Devil press', grupo: Grupo.cuerpoCompleto, equipo: Equipo.mancuernas, secundarios: [Grupo.hombros, Grupo.pecho]),
  Ejercicio(id: 'man-maker', nombre: 'Man maker', grupo: Grupo.cuerpoCompleto, equipo: Equipo.mancuernas, secundarios: [Grupo.pecho, Grupo.espalda]),
  Ejercicio(id: 'burpees', nombre: 'Burpees', grupo: Grupo.cuerpoCompleto, equipo: Equipo.pesoCorporal, secundarios: [Grupo.cardio], medida: FormaDeMedir.reps),
  Ejercicio(id: 'wall-ball', nombre: 'Wall ball', grupo: Grupo.cuerpoCompleto, equipo: Equipo.balonMedicinal, secundarios: [Grupo.cuadriceps, Grupo.hombros], medida: FormaDeMedir.reps),
  Ejercicio(id: 'slam-ball', nombre: 'Slam ball', grupo: Grupo.cuerpoCompleto, equipo: Equipo.balonMedicinal, secundarios: [Grupo.abdomen], medida: FormaDeMedir.reps),
  Ejercicio(id: 'cuerdas-de-batalla', nombre: 'Cuerdas de batalla', grupo: Grupo.cuerpoCompleto, equipo: Equipo.otro, secundarios: [Grupo.hombros, Grupo.cardio], medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'paseo-del-granjero', nombre: 'Paseo del granjero', grupo: Grupo.cuerpoCompleto, equipo: Equipo.mancuernas, secundarios: [Grupo.antebrazo, Grupo.trapecio], medida: FormaDeMedir.pesoTiempo),
  Ejercicio(id: 'empuje-de-trineo', nombre: 'Empuje de trineo', grupo: Grupo.cuerpoCompleto, equipo: Equipo.otro, secundarios: [Grupo.cuadriceps, Grupo.cardio], medida: FormaDeMedir.pesoTiempo),
  Ejercicio(id: 'arrastre-de-trineo', nombre: 'Arrastre de trineo', grupo: Grupo.cuerpoCompleto, equipo: Equipo.otro, secundarios: [Grupo.isquiotibiales, Grupo.cardio], medida: FormaDeMedir.pesoTiempo),
  Ejercicio(id: 'muscle-up', nombre: 'Muscle-up', grupo: Grupo.cuerpoCompleto, equipo: Equipo.pesoCorporal, secundarios: [Grupo.espalda, Grupo.triceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'escalada-de-cuerda', nombre: 'Escalada de cuerda', grupo: Grupo.cuerpoCompleto, equipo: Equipo.otro, secundarios: [Grupo.espalda, Grupo.antebrazo], medida: FormaDeMedir.reps),
  Ejercicio(id: 'salto-al-cajon', nombre: 'Salto al cajón', grupo: Grupo.cuerpoCompleto, equipo: Equipo.pesoCorporal, secundarios: [Grupo.cuadriceps, Grupo.gluteos], medida: FormaDeMedir.reps),
  Ejercicio(id: 'salto-vertical', nombre: 'Salto vertical', grupo: Grupo.cuerpoCompleto, equipo: Equipo.pesoCorporal, secundarios: [Grupo.cuadriceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'salto-de-longitud-sin-carrera', nombre: 'Salto de longitud sin carrera', grupo: Grupo.cuerpoCompleto, equipo: Equipo.pesoCorporal, secundarios: [Grupo.cuadriceps], medida: FormaDeMedir.reps),
  Ejercicio(id: 'cinta-de-correr', nombre: 'Cinta de correr', grupo: Grupo.cardio, equipo: Equipo.cardio, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'caminata-inclinada-en-cinta', nombre: 'Caminata inclinada en cinta', grupo: Grupo.cardio, equipo: Equipo.cardio, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'bicicleta-estatica', nombre: 'Bicicleta estática', grupo: Grupo.cardio, equipo: Equipo.cardio, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'bicicleta-de-spinning', nombre: 'Bicicleta de spinning', grupo: Grupo.cardio, equipo: Equipo.cardio, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'assault-bike', nombre: 'Assault bike', grupo: Grupo.cardio, equipo: Equipo.cardio, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'eliptica', nombre: 'Elíptica', grupo: Grupo.cardio, equipo: Equipo.cardio, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'remo-ergometro', nombre: 'Remo ergómetro', grupo: Grupo.cardio, equipo: Equipo.cardio, secundarios: [Grupo.espalda], medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'skierg', nombre: 'SkiErg', grupo: Grupo.cardio, equipo: Equipo.cardio, secundarios: [Grupo.espalda], medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'escaladora-de-peldanos', nombre: 'Escaladora de peldaños', grupo: Grupo.cardio, equipo: Equipo.cardio, secundarios: [Grupo.gluteos], medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'comba', nombre: 'Comba', grupo: Grupo.cardio, equipo: Equipo.otro, secundarios: [Grupo.gemelos], medida: FormaDeMedir.tiempo),
  Ejercicio(id: 'correr-al-aire-libre', nombre: 'Correr al aire libre', grupo: Grupo.cardio, equipo: Equipo.otro, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'bicicleta-al-aire-libre', nombre: 'Bicicleta al aire libre', grupo: Grupo.cardio, equipo: Equipo.otro, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'natacion', nombre: 'Natación', grupo: Grupo.cardio, equipo: Equipo.otro, secundarios: [Grupo.cuerpoCompleto], medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'senderismo', nombre: 'Senderismo', grupo: Grupo.cardio, equipo: Equipo.otro, medida: FormaDeMedir.distanciaTiempo),
  Ejercicio(id: 'caminar', nombre: 'Caminar', grupo: Grupo.cardio, equipo: Equipo.otro, medida: FormaDeMedir.distanciaTiempo),
];

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
    .replaceAll(RegExp(r'^-|-$'), '');

/// Busca por trozos sueltos: «press incl mancu» encuentra «Press inclinado con mancuernas».
/// Se escribe en el móvil y con prisa, así que no se exige el orden ni la ortografía entera.
bool coincide(Ejercicio e, String busqueda) {
  final trozos = normalizar(busqueda).split(RegExp(r'\s+')).where((t) => t.isNotEmpty);
  if (trozos.isEmpty) return true;
  final paja = normalizar('${e.nombre} ${e.grupo.texto} ${e.equipo.texto}');
  return trozos.every(paja.contains);
}

/// El catálogo con los ejercicios propios delante: son los que uno hace de verdad.
List<Ejercicio> catalogoCon(List<Ejercicio> propios) {
  final ids = propios.map((e) => e.id).toSet();
  return [...propios, ...ejerciciosDeCasa.where((e) => !ids.contains(e.id))];
}
