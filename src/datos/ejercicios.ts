/**
 * El catálogo de ejercicios.
 *
 * Está escrito a mano y en español, agrupado por lo que trabaja, porque así es como se
 * busca en un gimnasio: primero «hoy toca espalda» y después «con qué máquina». Un
 * catálogo ordenado por equipamiento obliga a saber de antemano en qué aparato piensas,
 * que es justo lo que no sabes cuando llegas y la máquina de remo está ocupada.
 *
 * Cada fila lleva sólo lo que no se puede adivinar: el equipamiento, los grupos que se
 * llevan trabajo secundario y —cuando no es lo normal— cómo se mide. Lo demás (el id, el
 * grupo principal) sale de dónde está escrita la fila, para que añadir un ejercicio sea
 * una línea y no un formulario.
 *
 * **Cómo añadir uno:** escribe la línea en el grupo que le toque. Si el ejercicio no es de
 * peso × repeticiones —una plancha, la cinta, un paseo del granjero— dile su `medida`. No
 * hace falta tocar nada más: los filtros, el buscador y las estadísticas leen de aquí.
 */

/** Con qué se hace. Es el filtro que más se usa: lo que hay libre manda. */
export type Equipo =
  | 'máquina'
  | 'polea'
  | 'multipower'
  | 'barra'
  | 'mancuernas'
  | 'kettlebell'
  | 'peso corporal'
  | 'banda elástica'
  | 'disco'
  | 'balón medicinal'
  | 'anillas'
  | 'cardio'
  | 'otro';

/**
 * Los grupos musculares, con el detalle que se usa al planificar. Aductores y abductores
 * van separados de glúteos porque tienen máquina propia, y los lumbares separados de la
 * espalda porque una cosa es remar y otra extenderse en el banco romano.
 */
export type Grupo =
  | 'Pecho'
  | 'Espalda'
  | 'Trapecio'
  | 'Hombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Antebrazo'
  | 'Cuádriceps'
  | 'Isquiotibiales'
  | 'Glúteos'
  | 'Aductores'
  | 'Abductores'
  | 'Gemelos'
  | 'Abdomen'
  | 'Lumbares'
  | 'Cuello'
  | 'Cuerpo completo'
  | 'Cardio';

/**
 * Qué se apunta de cada serie.
 *
 * Existe porque una plancha no tiene repeticiones y la cinta no tiene peso: si todo se
 * apuntara como «peso × reps» habría que escribir ceros en la mitad de los huecos, y el
 * volumen de la semana saldría mal.
 */
export type Medida =
  /** Lo normal: kilos y repeticiones. */
  | 'peso-reps'
  /** Peso corporal: sólo repeticiones (con lastre opcional). */
  | 'reps'
  /** Isométricos: segundos. */
  | 'tiempo'
  /** Transportes y sujeciones con carga: kilos y segundos. */
  | 'peso-tiempo'
  /** Cardio: distancia y minutos. */
  | 'distancia-tiempo';

export interface Ejercicio {
  id: string;
  nombre: string;
  grupo: Grupo;
  equipo: Equipo;
  /** Grupos que se llevan trabajo, pero no son el objetivo. */
  secundarios: Grupo[];
  medida: Medida;
  /** Se hace un lado a la vez: las series se apuntan por lado. */
  unilateral: boolean;
  /** Lo ha escrito el usuario, no viene en el catálogo. */
  propio?: boolean;
}

interface Opciones {
  medida?: Medida;
  unilateral?: boolean;
}

/** `[nombre, equipo, secundarios, opciones]`. El grupo lo pone la clave del bloque. */
type Fila = [string, Equipo, Grupo[]?, Opciones?];

const POR_GRUPO: Record<Grupo, Fila[]> = {
  Pecho: [
    ['Press de banca con barra', 'barra', ['Tríceps', 'Hombros']],
    ['Press de banca inclinado con barra', 'barra', ['Hombros', 'Tríceps']],
    ['Press de banca declinado con barra', 'barra', ['Tríceps']],
    ['Press de banca agarre estrecho', 'barra', ['Tríceps']],
    ['Press de banca con mancuernas', 'mancuernas', ['Tríceps', 'Hombros']],
    ['Press inclinado con mancuernas', 'mancuernas', ['Hombros', 'Tríceps']],
    ['Press declinado con mancuernas', 'mancuernas', ['Tríceps']],
    ['Press de suelo con mancuernas', 'mancuernas', ['Tríceps']],
    ['Press de pecho en máquina', 'máquina', ['Tríceps', 'Hombros']],
    ['Press de pecho inclinado en máquina', 'máquina', ['Hombros', 'Tríceps']],
    ['Press de pecho declinado en máquina', 'máquina', ['Tríceps']],
    ['Press de pecho en máquina de palanca', 'máquina', ['Tríceps', 'Hombros']],
    ['Press de pecho en máquina convergente', 'máquina', ['Tríceps']],
    ['Press de pecho a una mano en máquina', 'máquina', ['Tríceps'], { unilateral: true }],
    ['Press de banca en multipower', 'multipower', ['Tríceps', 'Hombros']],
    ['Press inclinado en multipower', 'multipower', ['Hombros', 'Tríceps']],
    ['Aperturas en máquina (peck deck)', 'máquina', []],
    ['Aperturas con mancuernas', 'mancuernas', ['Hombros']],
    ['Aperturas inclinado con mancuernas', 'mancuernas', ['Hombros']],
    ['Cruces en polea alta', 'polea', []],
    ['Cruces en polea media', 'polea', []],
    ['Cruces en polea baja', 'polea', ['Hombros']],
    ['Apertura en polea a una mano', 'polea', [], { unilateral: true }],
    ['Fondos en paralelas', 'peso corporal', ['Tríceps', 'Hombros'], { medida: 'reps' }],
    ['Fondos en paralelas lastrados', 'peso corporal', ['Tríceps', 'Hombros']],
    ['Fondos en máquina asistida', 'máquina', ['Tríceps', 'Hombros']],
    ['Flexiones', 'peso corporal', ['Tríceps', 'Hombros'], { medida: 'reps' }],
    ['Flexiones declinadas', 'peso corporal', ['Hombros', 'Tríceps'], { medida: 'reps' }],
    ['Flexiones inclinadas', 'peso corporal', ['Tríceps'], { medida: 'reps' }],
    ['Flexiones diamante', 'peso corporal', ['Tríceps'], { medida: 'reps' }],
    ['Flexiones con lastre', 'peso corporal', ['Tríceps', 'Hombros']],
    ['Flexiones en anillas', 'anillas', ['Tríceps', 'Hombros'], { medida: 'reps' }],
    ['Flexiones pliométricas', 'peso corporal', ['Tríceps'], { medida: 'reps' }],
    ['Pullover con mancuerna', 'mancuernas', ['Espalda']],
    ['Pullover en máquina', 'máquina', ['Espalda']],
    ['Press Svend con disco', 'disco', []],
    ['Aperturas con banda elástica', 'banda elástica', []],
    ['Press de pecho con banda elástica', 'banda elástica', ['Tríceps']],
  ],

  Espalda: [
    ['Dominadas', 'peso corporal', ['Bíceps'], { medida: 'reps' }],
    ['Dominadas supinas', 'peso corporal', ['Bíceps'], { medida: 'reps' }],
    ['Dominadas agarre neutro', 'peso corporal', ['Bíceps'], { medida: 'reps' }],
    ['Dominadas lastradas', 'peso corporal', ['Bíceps']],
    ['Dominadas en máquina asistida', 'máquina', ['Bíceps']],
    ['Jalón al pecho en polea', 'polea', ['Bíceps']],
    ['Jalón al pecho agarre estrecho', 'polea', ['Bíceps']],
    ['Jalón supino en polea', 'polea', ['Bíceps']],
    ['Jalón tras nuca en polea', 'polea', ['Bíceps']],
    ['Jalón a una mano en polea', 'polea', ['Bíceps'], { unilateral: true }],
    ['Jalón con brazos rectos en polea', 'polea', []],
    ['Jalón al pecho en máquina', 'máquina', ['Bíceps']],
    ['Remo con barra', 'barra', ['Bíceps', 'Lumbares']],
    ['Remo con barra agarre supino', 'barra', ['Bíceps']],
    ['Remo Pendlay', 'barra', ['Bíceps', 'Lumbares']],
    ['Remo con mancuerna a una mano', 'mancuernas', ['Bíceps'], { unilateral: true }],
    ['Remo con mancuernas a dos manos', 'mancuernas', ['Bíceps']],
    ['Remo en punta con barra T', 'barra', ['Bíceps']],
    ['Remo en máquina T', 'máquina', ['Bíceps']],
    ['Remo sentado en polea', 'polea', ['Bíceps']],
    ['Remo sentado en polea agarre ancho', 'polea', ['Bíceps', 'Hombros']],
    ['Remo en polea a una mano', 'polea', ['Bíceps'], { unilateral: true }],
    ['Remo sentado en máquina', 'máquina', ['Bíceps']],
    ['Remo en máquina de palanca', 'máquina', ['Bíceps']],
    ['Remo en máquina a una mano', 'máquina', ['Bíceps'], { unilateral: true }],
    ['Remo en multipower', 'multipower', ['Bíceps']],
    ['Remo invertido', 'peso corporal', ['Bíceps'], { medida: 'reps' }],
    ['Remo en anillas', 'anillas', ['Bíceps'], { medida: 'reps' }],
    ['Remo gorila con kettlebell', 'kettlebell', ['Bíceps']],
    ['Peso muerto convencional', 'barra', ['Isquiotibiales', 'Glúteos', 'Lumbares']],
    ['Peso muerto sumo', 'barra', ['Glúteos', 'Cuádriceps', 'Aductores']],
    ['Peso muerto con barra hexagonal', 'barra', ['Cuádriceps', 'Glúteos']],
    ['Peso muerto con mancuernas', 'mancuernas', ['Isquiotibiales', 'Glúteos']],
    ['Peso muerto en multipower', 'multipower', ['Isquiotibiales', 'Glúteos']],
    ['Rack pull', 'barra', ['Trapecio', 'Isquiotibiales']],
    ['Retracción escapular en barra', 'peso corporal', ['Trapecio'], { medida: 'reps' }],
    ['Pull-over en polea alta', 'polea', ['Pecho']],
  ],

  Trapecio: [
    ['Encogimientos con barra', 'barra', []],
    ['Encogimientos con mancuernas', 'mancuernas', []],
    ['Encogimientos en máquina', 'máquina', []],
    ['Encogimientos en multipower', 'multipower', []],
    ['Encogimientos en polea', 'polea', []],
    ['Encogimientos con barra hexagonal', 'barra', ['Antebrazo']],
  ],

  Hombros: [
    ['Press militar con barra de pie', 'barra', ['Tríceps', 'Abdomen']],
    ['Press militar sentado con barra', 'barra', ['Tríceps']],
    ['Press tras nuca con barra', 'barra', ['Tríceps']],
    ['Press de hombros con mancuernas', 'mancuernas', ['Tríceps']],
    ['Press Arnold', 'mancuernas', ['Tríceps']],
    ['Press de hombros en máquina', 'máquina', ['Tríceps']],
    ['Press de hombros en multipower', 'multipower', ['Tríceps']],
    ['Push press con barra', 'barra', ['Tríceps', 'Cuádriceps']],
    ['Press con kettlebell', 'kettlebell', ['Tríceps'], { unilateral: true }],
    ['Landmine press', 'barra', ['Tríceps'], { unilateral: true }],
    ['Elevaciones laterales con mancuernas', 'mancuernas', []],
    ['Elevaciones laterales en polea', 'polea', [], { unilateral: true }],
    ['Elevaciones laterales en máquina', 'máquina', []],
    ['Elevaciones laterales inclinado', 'mancuernas', [], { unilateral: true }],
    ['Elevaciones frontales con mancuernas', 'mancuernas', []],
    ['Elevaciones frontales con disco', 'disco', []],
    ['Elevaciones frontales en polea', 'polea', []],
    ['Pájaros con mancuernas', 'mancuernas', ['Espalda']],
    ['Pájaros en máquina', 'máquina', ['Espalda']],
    ['Pájaros en polea cruzada', 'polea', ['Espalda']],
    ['Face pull en polea', 'polea', ['Trapecio', 'Espalda']],
    ['Remo al cuello con barra', 'barra', ['Trapecio']],
    ['Remo al cuello en polea', 'polea', ['Trapecio']],
    ['Elevación en Y en banco inclinado', 'mancuernas', ['Trapecio']],
    ['Rotación externa en polea', 'polea', [], { unilateral: true }],
    ['Rotación externa con banda elástica', 'banda elástica', []],
    ['Press de hombros con banda elástica', 'banda elástica', ['Tríceps']],
    ['Flexiones pica', 'peso corporal', ['Tríceps'], { medida: 'reps' }],
    ['Flexiones en vertical', 'peso corporal', ['Tríceps'], { medida: 'reps' }],
  ],

  Bíceps: [
    ['Curl con barra', 'barra', ['Antebrazo']],
    ['Curl con barra Z', 'barra', ['Antebrazo']],
    ['Curl con mancuernas', 'mancuernas', ['Antebrazo']],
    ['Curl alterno con mancuernas', 'mancuernas', ['Antebrazo'], { unilateral: true }],
    ['Curl martillo', 'mancuernas', ['Antebrazo']],
    ['Curl inclinado con mancuernas', 'mancuernas', []],
    ['Curl concentrado', 'mancuernas', [], { unilateral: true }],
    ['Curl araña', 'mancuernas', []],
    ['Curl Zottman', 'mancuernas', ['Antebrazo']],
    ['Curl en banco Scott con barra', 'barra', []],
    ['Curl en banco Scott con mancuerna', 'mancuernas', [], { unilateral: true }],
    ['Curl en máquina', 'máquina', []],
    ['Curl en polea baja', 'polea', ['Antebrazo']],
    ['Curl con cuerda en polea', 'polea', ['Antebrazo']],
    ['Curl en polea alta a dos manos', 'polea', []],
    ['Curl con kettlebell', 'kettlebell', ['Antebrazo']],
    ['Curl con banda elástica', 'banda elástica', []],
  ],

  Tríceps: [
    ['Extensión de tríceps en polea con cuerda', 'polea', []],
    ['Extensión de tríceps en polea con barra', 'polea', []],
    ['Extensión de tríceps en polea agarre inverso', 'polea', []],
    ['Extensión de tríceps sobre la cabeza en polea', 'polea', []],
    ['Extensión de tríceps sobre la cabeza con mancuerna', 'mancuernas', []],
    ['Press francés con barra', 'barra', []],
    ['Press francés con mancuernas', 'mancuernas', []],
    ['Rompecráneos con barra Z', 'barra', []],
    ['JM press', 'barra', []],
    ['Patada de tríceps con mancuerna', 'mancuernas', [], { unilateral: true }],
    ['Patada de tríceps en polea', 'polea', [], { unilateral: true }],
    ['Extensión de tríceps en máquina', 'máquina', []],
    ['Fondos en banco', 'peso corporal', ['Pecho'], { medida: 'reps' }],
    ['Fondos entre bancos con lastre', 'peso corporal', ['Pecho']],
    ['Extensión de tríceps con banda elástica', 'banda elástica', []],
  ],

  Antebrazo: [
    ['Curl de muñeca con barra', 'barra', []],
    ['Curl de muñeca inverso con barra', 'barra', []],
    ['Curl de muñeca con mancuernas', 'mancuernas', []],
    ['Curl inverso con barra Z', 'barra', []],
    ['Rodillo de muñeca', 'otro', []],
    ['Pronosupinación con mancuerna', 'mancuernas', [], { unilateral: true }],
    ['Pinza de agarre', 'otro', [], { medida: 'tiempo' }],
    ['Colgarse de la barra', 'peso corporal', ['Espalda'], { medida: 'tiempo' }],
  ],

  Cuádriceps: [
    ['Sentadilla con barra', 'barra', ['Glúteos', 'Isquiotibiales', 'Lumbares']],
    ['Sentadilla frontal', 'barra', ['Glúteos', 'Abdomen']],
    ['Sentadilla Zercher', 'barra', ['Glúteos', 'Abdomen']],
    ['Sentadilla en multipower', 'multipower', ['Glúteos']],
    ['Sentadilla goblet con kettlebell', 'kettlebell', ['Glúteos']],
    ['Sentadilla búlgara con mancuernas', 'mancuernas', ['Glúteos'], { unilateral: true }],
    ['Sentadilla búlgara con barra', 'barra', ['Glúteos'], { unilateral: true }],
    ['Sentadilla hack en máquina', 'máquina', ['Glúteos']],
    ['Sentadilla en máquina pendular', 'máquina', ['Glúteos']],
    ['Sentadilla en máquina de cinturón', 'máquina', ['Glúteos']],
    ['Sentadilla sissy', 'peso corporal', [], { medida: 'reps' }],
    ['Sentadilla libre', 'peso corporal', ['Glúteos'], { medida: 'reps' }],
    ['Sentadilla con salto', 'peso corporal', ['Glúteos'], { medida: 'reps' }],
    ['Sentadilla isométrica en pared', 'peso corporal', [], { medida: 'tiempo' }],
    ['Sentadilla a una pierna (pistol)', 'peso corporal', ['Glúteos'], { medida: 'reps', unilateral: true }],
    ['Sentadilla con banda elástica', 'banda elástica', ['Glúteos'], { medida: 'reps' }],
    ['Prensa de piernas 45º', 'máquina', ['Glúteos', 'Isquiotibiales']],
    ['Prensa de piernas horizontal', 'máquina', ['Glúteos']],
    ['Prensa de piernas vertical', 'máquina', ['Glúteos']],
    ['Prensa de piernas a una pierna', 'máquina', ['Glúteos'], { unilateral: true }],
    ['Extensión de cuádriceps en máquina', 'máquina', []],
    ['Extensión de cuádriceps a una pierna', 'máquina', [], { unilateral: true }],
    ['Zancadas con mancuernas', 'mancuernas', ['Glúteos'], { unilateral: true }],
    ['Zancadas con barra', 'barra', ['Glúteos'], { unilateral: true }],
    ['Zancadas caminando', 'mancuernas', ['Glúteos'], { unilateral: true }],
    ['Zancadas inversas', 'mancuernas', ['Glúteos'], { unilateral: true }],
    ['Subida al cajón con mancuernas', 'mancuernas', ['Glúteos'], { unilateral: true }],
  ],

  Isquiotibiales: [
    ['Peso muerto rumano con barra', 'barra', ['Glúteos', 'Lumbares']],
    ['Peso muerto rumano con mancuernas', 'mancuernas', ['Glúteos']],
    ['Peso muerto rumano en multipower', 'multipower', ['Glúteos']],
    ['Peso muerto rumano a una pierna', 'mancuernas', ['Glúteos'], { unilateral: true }],
    ['Peso muerto rígido con barra', 'barra', ['Glúteos', 'Lumbares']],
    ['Curl femoral tumbado en máquina', 'máquina', ['Gemelos']],
    ['Curl femoral sentado en máquina', 'máquina', ['Gemelos']],
    ['Curl femoral de pie en máquina', 'máquina', [], { unilateral: true }],
    ['Curl femoral con banda elástica', 'banda elástica', []],
    ['Curl nórdico', 'peso corporal', ['Glúteos'], { medida: 'reps' }],
    ['Curl femoral con fitball', 'peso corporal', ['Glúteos'], { medida: 'reps' }],
    ['Elevación glúteo-femoral (GHR)', 'máquina', ['Glúteos', 'Lumbares'], { medida: 'reps' }],
    ['Buenos días con barra', 'barra', ['Lumbares', 'Glúteos']],
  ],

  Glúteos: [
    ['Hip thrust con barra', 'barra', ['Isquiotibiales']],
    ['Hip thrust en máquina', 'máquina', ['Isquiotibiales']],
    ['Hip thrust a una pierna', 'peso corporal', ['Isquiotibiales'], { medida: 'reps', unilateral: true }],
    ['Puente de glúteo', 'peso corporal', ['Isquiotibiales'], { medida: 'reps' }],
    ['Puente de glúteo con barra', 'barra', ['Isquiotibiales']],
    ['Patada de glúteo en máquina', 'máquina', [], { unilateral: true }],
    ['Patada de glúteo en polea', 'polea', [], { unilateral: true }],
    ['Patada de glúteo con banda elástica', 'banda elástica', [], { unilateral: true }],
    ['Extensión de cadera en máquina', 'máquina', ['Isquiotibiales']],
    ['Pull-through en polea', 'polea', ['Isquiotibiales']],
    ['Sentadilla sumo con mancuerna', 'mancuernas', ['Aductores']],
    ['Hiperextensión inversa', 'máquina', ['Isquiotibiales', 'Lumbares'], { medida: 'reps' }],
    ['Máquina de glúteo de pie', 'máquina', ['Isquiotibiales'], { unilateral: true }],
  ],

  Aductores: [
    ['Aducción de cadera en máquina', 'máquina', []],
    ['Aducción de cadera en polea', 'polea', [], { unilateral: true }],
    ['Aducción con banda elástica', 'banda elástica', [], { unilateral: true }],
    ['Sentadilla cosaco', 'peso corporal', ['Cuádriceps'], { medida: 'reps', unilateral: true }],
    ['Zancada lateral con mancuernas', 'mancuernas', ['Cuádriceps'], { unilateral: true }],
    ['Plancha Copenhague', 'peso corporal', ['Abdomen'], { medida: 'tiempo', unilateral: true }],
  ],

  Abductores: [
    ['Abducción de cadera en máquina', 'máquina', ['Glúteos']],
    ['Abducción de cadera en polea', 'polea', ['Glúteos'], { unilateral: true }],
    ['Abducción de cadera tumbado', 'peso corporal', ['Glúteos'], { medida: 'reps', unilateral: true }],
    ['Paso lateral con banda elástica', 'banda elástica', ['Glúteos'], { medida: 'reps' }],
    ['Elevación de cadera lateral', 'peso corporal', ['Abdomen'], { medida: 'reps', unilateral: true }],
  ],

  Gemelos: [
    ['Elevación de talones de pie en máquina', 'máquina', []],
    ['Elevación de talones sentado en máquina', 'máquina', []],
    ['Elevación de talones en prensa', 'máquina', []],
    ['Elevación de talones en multipower', 'multipower', []],
    ['Elevación de talones con mancuernas', 'mancuernas', []],
    ['Elevación de talones a una pierna', 'peso corporal', [], { medida: 'reps', unilateral: true }],
    ['Elevación de talones tipo burro', 'máquina', []],
    ['Flexión dorsal de tobillo con banda', 'banda elástica', [], { medida: 'reps' }],
  ],

  Abdomen: [
    ['Plancha', 'peso corporal', ['Lumbares'], { medida: 'tiempo' }],
    ['Plancha lateral', 'peso corporal', [], { medida: 'tiempo', unilateral: true }],
    ['Plancha con lastre', 'disco', ['Lumbares'], { medida: 'peso-tiempo' }],
    ['Encogimientos', 'peso corporal', [], { medida: 'reps' }],
    // «abdominales» en el nombre no es un adorno: la máquina de encogimientos de trapecio
    // se llama igual, y como el id sale del nombre, las dos compartirían historial.
    ['Encogimientos abdominales en máquina', 'máquina', []],
    ['Encogimientos en polea arrodillado', 'polea', []],
    ['Encogimientos inversos', 'peso corporal', [], { medida: 'reps' }],
    ['Elevación de piernas colgado', 'peso corporal', [], { medida: 'reps' }],
    ['Elevación de rodillas en paralelas', 'peso corporal', [], { medida: 'reps' }],
    ['Elevación de piernas tumbado', 'peso corporal', [], { medida: 'reps' }],
    ['Punta de pies a la barra', 'peso corporal', [], { medida: 'reps' }],
    ['Rueda abdominal', 'otro', ['Lumbares'], { medida: 'reps' }],
    ['Bicicleta abdominal', 'peso corporal', [], { medida: 'reps' }],
    ['Giro ruso con disco', 'disco', [], { medida: 'reps' }],
    ['Giro ruso con balón medicinal', 'balón medicinal', [], { medida: 'reps' }],
    ['Leñador en polea', 'polea', [], { unilateral: true }],
    ['Press Pallof en polea', 'polea', [], { unilateral: true }],
    ['Rotación de tronco en máquina', 'máquina', [], { unilateral: true }],
    ['Bandera dragón', 'peso corporal', [], { medida: 'reps' }],
    ['Hollow hold', 'peso corporal', [], { medida: 'tiempo' }],
    ['Escalador', 'peso corporal', ['Cardio'], { medida: 'tiempo' }],
    ['Abdominales V', 'peso corporal', [], { medida: 'reps' }],
    ['Abdominales con lastre', 'disco', []],
    ['Bicho muerto', 'peso corporal', [], { medida: 'reps' }],
    ['Vacío abdominal', 'peso corporal', [], { medida: 'tiempo' }],
    ['Abdominal en máquina de rodillos', 'máquina', []],
  ],

  Lumbares: [
    ['Hiperextensiones en banco romano', 'peso corporal', ['Glúteos'], { medida: 'reps' }],
    ['Hiperextensiones con lastre', 'disco', ['Glúteos']],
    ['Extensión lumbar en máquina', 'máquina', ['Glúteos']],
    ['Superman', 'peso corporal', ['Glúteos'], { medida: 'reps' }],
    ['Sujeción de peso muerto', 'barra', ['Trapecio', 'Antebrazo'], { medida: 'peso-tiempo' }],
  ],

  Cuello: [
    ['Flexión de cuello con disco', 'disco', [], { medida: 'reps' }],
    ['Extensión de cuello con disco', 'disco', [], { medida: 'reps' }],
    ['Flexión de cuello con banda elástica', 'banda elástica', [], { medida: 'reps' }],
    ['Cuello en máquina', 'máquina', []],
  ],

  'Cuerpo completo': [
    ['Cargada de fuerza', 'barra', ['Trapecio', 'Cuádriceps', 'Glúteos']],
    ['Cargada y envión', 'barra', ['Hombros', 'Cuádriceps']],
    ['Arrancada con barra', 'barra', ['Hombros', 'Trapecio']],
    ['Arrancada con mancuerna', 'mancuernas', ['Hombros'], { unilateral: true }],
    ['Cargada con mancuernas', 'mancuernas', ['Trapecio', 'Cuádriceps']],
    ['Thruster con barra', 'barra', ['Cuádriceps', 'Hombros']],
    ['Thruster con mancuernas', 'mancuernas', ['Cuádriceps', 'Hombros']],
    ['Swing con kettlebell', 'kettlebell', ['Glúteos', 'Isquiotibiales']],
    ['Swing a una mano con kettlebell', 'kettlebell', ['Glúteos'], { unilateral: true }],
    ['Tirón alto con kettlebell', 'kettlebell', ['Trapecio', 'Hombros']],
    ['Turkish get-up', 'kettlebell', ['Abdomen', 'Hombros'], { unilateral: true }],
    ['Devil press', 'mancuernas', ['Hombros', 'Pecho']],
    ['Man maker', 'mancuernas', ['Pecho', 'Espalda']],
    ['Burpees', 'peso corporal', ['Cardio'], { medida: 'reps' }],
    ['Wall ball', 'balón medicinal', ['Cuádriceps', 'Hombros'], { medida: 'reps' }],
    ['Slam ball', 'balón medicinal', ['Abdomen'], { medida: 'reps' }],
    ['Cuerdas de batalla', 'otro', ['Hombros', 'Cardio'], { medida: 'tiempo' }],
    ['Paseo del granjero', 'mancuernas', ['Antebrazo', 'Trapecio'], { medida: 'peso-tiempo' }],
    ['Empuje de trineo', 'otro', ['Cuádriceps', 'Cardio'], { medida: 'peso-tiempo' }],
    ['Arrastre de trineo', 'otro', ['Isquiotibiales', 'Cardio'], { medida: 'peso-tiempo' }],
    ['Muscle-up', 'peso corporal', ['Espalda', 'Tríceps'], { medida: 'reps' }],
    ['Escalada de cuerda', 'otro', ['Espalda', 'Antebrazo'], { medida: 'reps' }],
    ['Salto al cajón', 'peso corporal', ['Cuádriceps', 'Glúteos'], { medida: 'reps' }],
    ['Salto vertical', 'peso corporal', ['Cuádriceps'], { medida: 'reps' }],
    ['Salto de longitud sin carrera', 'peso corporal', ['Cuádriceps'], { medida: 'reps' }],
  ],

  Cardio: [
    ['Cinta de correr', 'cardio', [], { medida: 'distancia-tiempo' }],
    ['Caminata inclinada en cinta', 'cardio', [], { medida: 'distancia-tiempo' }],
    ['Bicicleta estática', 'cardio', [], { medida: 'distancia-tiempo' }],
    ['Bicicleta de spinning', 'cardio', [], { medida: 'distancia-tiempo' }],
    ['Assault bike', 'cardio', [], { medida: 'distancia-tiempo' }],
    ['Elíptica', 'cardio', [], { medida: 'distancia-tiempo' }],
    ['Remo ergómetro', 'cardio', ['Espalda'], { medida: 'distancia-tiempo' }],
    ['SkiErg', 'cardio', ['Espalda'], { medida: 'distancia-tiempo' }],
    ['Escaladora de peldaños', 'cardio', ['Glúteos'], { medida: 'tiempo' }],
    ['Comba', 'otro', ['Gemelos'], { medida: 'tiempo' }],
    ['Correr al aire libre', 'otro', [], { medida: 'distancia-tiempo' }],
    ['Bicicleta al aire libre', 'otro', [], { medida: 'distancia-tiempo' }],
    ['Natación', 'otro', ['Cuerpo completo'], { medida: 'distancia-tiempo' }],
    ['Senderismo', 'otro', [], { medida: 'distancia-tiempo' }],
    ['Caminar', 'otro', [], { medida: 'distancia-tiempo' }],
  ],
};

/**
 * El id sale del nombre, sin acentos ni signos. Es estable mientras no se renombre el
 * ejercicio, y eso es lo que importa: los entrenos guardados apuntan aquí.
 */
export function idDeNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const EJERCICIOS: readonly Ejercicio[] = Object.entries(POR_GRUPO).flatMap(
  ([grupo, filas]) =>
    filas.map(([nombre, equipo, secundarios = [], opciones = {}]) => ({
      id: idDeNombre(nombre),
      nombre,
      grupo: grupo as Grupo,
      equipo,
      secundarios,
      medida: opciones.medida ?? 'peso-reps',
      unilateral: opciones.unilateral ?? false,
    })),
);

/** Para los filtros: el orden es el del catálogo, no alfabético. */
export const GRUPOS = Object.keys(POR_GRUPO) as Grupo[];

export const EQUIPOS: Equipo[] = [
  'máquina',
  'polea',
  'multipower',
  'barra',
  'mancuernas',
  'kettlebell',
  'peso corporal',
  'banda elástica',
  'disco',
  'balón medicinal',
  'anillas',
  'cardio',
  'otro',
];

/** Qué hueco tiene sentido pedir para cada forma de medir. */
export const CAMPOS_DE_MEDIDA: Record<Medida, { peso: boolean; reps: boolean; tiempo: boolean; distancia: boolean }> = {
  'peso-reps': { peso: true, reps: true, tiempo: false, distancia: false },
  reps: { peso: false, reps: true, tiempo: false, distancia: false },
  tiempo: { peso: false, reps: false, tiempo: true, distancia: false },
  'peso-tiempo': { peso: true, reps: false, tiempo: true, distancia: false },
  'distancia-tiempo': { peso: false, reps: false, tiempo: true, distancia: true },
};

/**
 * Busca sin acentos y por trozos sueltos: «press incl mancu» encuentra «Press inclinado
 * con mancuernas». Se escribe en el móvil y con prisa, así que no se exige el orden ni la
 * ortografía completa.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function coincide(ejercicio: Ejercicio, busqueda: string): boolean {
  const trozos = normalizar(busqueda).split(/\s+/).filter(Boolean);
  if (trozos.length === 0) return true;
  const paja = normalizar(`${ejercicio.nombre} ${ejercicio.grupo} ${ejercicio.equipo}`);
  return trozos.every((t) => paja.includes(t));
}

/** El catálogo con los ejercicios que ha escrito el usuario delante de los de casa. */
export function catalogoCon(propios: Ejercicio[]): Ejercicio[] {
  const mios = propios.map((e) => ({ ...e, propio: true }));
  const ids = new Set(mios.map((e) => e.id));
  return [...mios, ...EJERCICIOS.filter((e) => !ids.has(e.id))];
}

export function ejercicioPorId(catalogo: Ejercicio[], id: string): Ejercicio | null {
  return catalogo.find((e) => e.id === id) ?? null;
}
