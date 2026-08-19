/**
 * Cómo se hace cada ejercicio.
 *
 * Está separado del catálogo a propósito. El catálogo es una línea por ejercicio y se lee de
 * un tirón; esto son tres frases por ejercicio y son casi tres mil líneas. Juntarlos haría
 * ilegible lo que más se toca —añadir un ejercicio— por culpa de lo que casi nunca se cambia.
 *
 * Cada ficha tiene tres partes, y son tres porque responden a las tres preguntas que uno se
 * hace **de pie delante de la máquina**, en este orden:
 *
 *  1. `preparacion`: cómo me coloco. Alturas, agarre, distancia, hacia dónde miro.
 *  2. `ejecucion`: qué muevo, hasta dónde y a qué ritmo. Aquí va el recorrido y la respiración.
 *  3. `fallo`: el error que se ve todos los días en el gimnasio con este ejercicio. Uno, el
 *     que más caro sale, no una lista de diez que nadie lee entre series.
 *
 * Lo que **no** hay aquí: series, repeticiones ni cargas recomendadas. Eso depende de la
 * persona y del momento, y una app que lo suelte a bulto se equivoca más de lo que ayuda.
 *
 * Del vídeo: cada ficha puede llevar un enlace concreto en `video`, pero por defecto no lo
 * lleva. En su lugar, `videoDe` construye una búsqueda en YouTube con el nombre del ejercicio.
 * Es a conciencia: un identificador de vídeo escrito a mano hoy es un enlace roto dentro de
 * un año —los vídeos se borran y los canales se cierran—, y una búsqueda por el nombre lleva
 * siempre a algo. Cuando haya un vídeo que merezca la pena fijar, se pone en `video` y la
 * interfaz lo prefiere sin cambiar nada más.
 */

export interface Tecnica {
  /** Cómo colocarse antes de la primera repetición. */
  preparacion: string;
  /** El movimiento: qué se mueve, hasta dónde y a qué ritmo. */
  ejecucion: string;
  /** El error más común y por qué importa. */
  fallo: string;
  /** Un vídeo concreto. Sin esto se busca por el nombre. */
  video?: string;
}

export const TECNICA: Record<string, Tecnica> = {
  // ─────────────────────────────── Pecho ───────────────────────────────

  'press-de-banca-con-barra': {
    preparacion:
      'Tumbado, los ojos justo debajo de la barra y los pies firmes en el suelo. Agarre algo '
      + 'más ancho que los hombros, muñeca apilada sobre el codo y no doblada hacia atrás. '
      + 'Junta los omóplatos y métetelos en el bolsillo de atrás: el pecho sube y el hombro '
      + 'queda apoyado, no colgando.',
    ejecucion:
      'Baja la barra a la altura de la parte baja del pecho, con los codos a unos 45 grados '
      + 'respecto al tronco, hasta rozar la camiseta. Empuja hacia arriba y un poco atrás, '
      + 'buscando la vertical del hombro. Coge aire abajo y suelta al pasar lo difícil.',
    fallo:
      'Bajar la barra al cuello con los codos abiertos en cruz. Es la postura en la que el '
      + 'hombro aguanta todo el peso en su posición más frágil, y es de donde salen la mayoría '
      + 'de los hombros doloridos del gimnasio.',
  },

  'press-de-banca-inclinado-con-barra': {
    preparacion:
      'Banco entre 30 y 45 grados: más inclinado no trabaja más pecho de arriba, sólo convierte '
      + 'el ejercicio en un press de hombros. Omóplatos juntos y apoyados, culo en el banco.',
    ejecucion:
      'Baja a la altura de las clavículas o un dedo por debajo, controlando. Empuja hasta '
      + 'estirar los codos sin bloquearlos de golpe.',
    fallo:
      'Levantar el culo del banco para sacar la serie. Eso convierte el inclinado en un plano '
      + 'y de paso carga la zona lumbar con el arco.',
  },

  'press-de-banca-declinado-con-barra': {
    preparacion:
      'Banco declinado con las piernas bien sujetas en los rodillos antes de coger la barra. '
      + 'Si te resbalas hacia abajo, la serie se acaba ahí.',
    ejecucion:
      'Baja a la parte baja del pecho, que en esta posición queda casi donde la barra cae sola. '
      + 'Recorrido corto y controlado; empuja hasta estirar.',
    fallo:
      'Levantarse de golpe al terminar. Con la cabeza por debajo del corazón, incorporarse '
      + 'rápido marea; se sale despacio y con la barra ya en el soporte.',
  },

  'press-de-banca-agarre-estrecho': {
    preparacion:
      'Igual que el press normal pero con las manos a la anchura de los hombros, no más juntas: '
      + 'pegar las manos no da más tríceps, sólo tuerce la muñeca.',
    ejecucion:
      'Baja con los codos cerca del cuerpo, hacia la parte baja del pecho o el esternón. Empuja '
      + 'en línea recta.',
    fallo:
      'Agarrar tan estrecho que las muñecas se doblen hacia fuera. La barra se descontrola y la '
      + 'muñeca aguanta lo que debería aguantar el codo.',
  },

  'press-de-banca-con-mancuernas': {
    preparacion:
      'Sentado con las mancuernas en los muslos, túmbate empujándolas con las piernas hasta '
      + 'dejarlas a la altura del pecho. Omóplatos juntos, palmas mirando adelante o un poco '
      + 'giradas hacia dentro, que es lo que agradece el hombro.',
    ejecucion:
      'Baja hasta que las mancuernas queden a la altura del pecho y notes el estiramiento, sin '
      + 'forzar más. Sube juntándolas ligeramente, sin llegar a chocarlas.',
    fallo:
      'Bajar más de lo que aguanta el hombro por aprovechar que las mancuernas lo permiten. Más '
      + 'recorrido no es mejor recorrido si el hombro se va hacia delante.',
  },

  'press-inclinado-con-mancuernas': {
    preparacion:
      'Banco a 30 grados, mancuernas subidas con ayuda de las piernas. Codos algo por debajo de '
      + 'la línea de los hombros.',
    ejecucion:
      'Baja a la altura de la parte alta del pecho y empuja hacia arriba y adentro. Controla la '
      + 'bajada: es donde está el trabajo.',
    fallo:
      'Encoger los hombros hacia las orejas al empujar. En cuanto el trapecio entra, el pecho '
      + 'sale.',
  },

  'press-declinado-con-mancuernas': {
    preparacion:
      'Banco declinado, piernas sujetas, mancuernas colocadas antes de tumbarte del todo.',
    ejecucion:
      'Baja a los lados de la parte baja del pecho y empuja hasta arriba. El recorrido es corto, '
      + 'no lo alargues bajando de más.',
    fallo:
      'Elegir un peso pensando en el press plano. En declinado se maneja más carga y se pierde '
      + 'el control antes; empieza por debajo.',
  },

  'press-de-suelo-con-mancuernas': {
    preparacion:
      'Tumbado en el suelo, rodillas dobladas o piernas estiradas, mancuernas a la altura del '
      + 'pecho. El suelo es el que marca el final del recorrido.',
    ejecucion:
      'Baja hasta que el tríceps toque el suelo, haz una pausa de un segundo y empuja. Esa pausa '
      + 'es el ejercicio: quita el rebote y obliga a arrancar desde parado.',
    fallo:
      'Dejar caer los brazos para rebotar contra el suelo. Con eso desaparece justo lo que este '
      + 'ejercicio venía a entrenar.',
  },

  'press-de-pecho-en-maquina': {
    preparacion:
      'Ajusta el asiento hasta que las agarraderas queden a la altura de la mitad del pecho, no '
      + 'de los hombros. Espalda apoyada y omóplatos juntos.',
    ejecucion:
      'Empuja hasta casi estirar los codos y vuelve controlando hasta notar el pecho estirado, '
      + 'sin dejar que las placas descansen entre repeticiones.',
    fallo:
      'Dejar el asiento como lo dejó el anterior. Dos agujeros de más y el ejercicio pasa a ser '
      + 'un press de hombros mal hecho.',
  },

  'press-de-pecho-inclinado-en-maquina': {
    preparacion:
      'Asiento de forma que las manos queden a la altura de la clavícula. Pies apoyados y '
      + 'espalda pegada al respaldo.',
    ejecucion:
      'Empuja hacia arriba y adelante siguiendo la trayectoria de la máquina, y vuelve despacio.',
    fallo:
      'Empujar con la cabeza y el cuello adelantados. La cabeza se queda apoyada en el respaldo, '
      + 'quieta.',
  },

  'press-de-pecho-declinado-en-maquina': {
    preparacion:
      'Asiento alto para que las agarraderas queden por debajo de la línea del pecho.',
    ejecucion:
      'Empuja hacia abajo y adelante, y vuelve controlando hasta el estiramiento.',
    fallo:
      'Ayudarse con el tronco balanceándose adelante y atrás. Si hace falta eso, sobra peso.',
  },

  'press-de-pecho-en-maquina-de-palanca': {
    preparacion:
      'Siéntate del todo al fondo, pecho arriba, y comprueba que los brazos de la máquina '
      + 'arrancan por delante del cuerpo y no por detrás del hombro.',
    ejecucion:
      'Empuja los dos brazos a la vez hasta estirar y vuelve al punto en el que notas el pecho '
      + 'estirado sin que el hombro se vaya adelante.',
    fallo:
      'Arrancar con los codos muy por detrás de la espalda buscando recorrido. La palanca ahí no '
      + 'trabaja el pecho, sólo tira del hombro.',
  },

  'press-de-pecho-en-maquina-convergente': {
    preparacion:
      'Asiento a la altura de la mitad del pecho. Esta máquina junta las manos al empujar, así '
      + 'que deja que hagan ese camino en lugar de forzar la línea recta.',
    ejecucion:
      'Empuja acompañando la convergencia y aprieta el pecho arriba un instante antes de volver.',
    fallo:
      'Bloquear los codos con un golpe seco al final. El final del recorrido se busca apretando, '
      + 'no chocando.',
  },

  'press-de-pecho-a-una-mano-en-maquina': {
    preparacion:
      'Igual que a dos manos, pero agárrate con la mano libre al asiento o al chasis para no '
      + 'girar. Se apunta por lado.',
    ejecucion:
      'Empuja con un brazo manteniendo los hombros a la misma altura, y vuelve despacio sin '
      + 'dejar que el tronco rote.',
    fallo:
      'Girar el tronco para ayudar al brazo que empuja. Con eso el peso sube igual, pero lo mueve '
      + 'el oblicuo y no el pecho.',
  },

  'press-de-banca-en-multipower': {
    preparacion:
      'Banco centrado y a la altura que deje la barra a la mitad del pecho al bajar. Pon los '
      + 'topes de seguridad un dedo por debajo de tu punto más bajo: para eso está el multipower.',
    ejecucion:
      'Baja al pecho y empuja en la línea recta que impone la guía, sin buscar la curva del press '
      + 'libre.',
    fallo:
      'Entrenar sin poner los topes. Es la única ventaja real de esta máquina y es gratis.',
  },

  'press-inclinado-en-multipower': {
    preparacion:
      'Banco inclinado a 30 grados dentro del cajón, colocado para que la barra baje a la altura '
      + 'de la clavícula. Topes puestos.',
    ejecucion:
      'Baja a la parte alta del pecho, roza y empuja hasta arriba.',
    fallo:
      'Colocar el banco demasiado atrás, con lo que la barra baja al cuello. Se ajusta antes de '
      + 'cargar, no con el peso encima.',
  },

  'aperturas-en-maquina-peck-deck': {
    preparacion:
      'Asiento de forma que los codos queden a la altura del pecho, no de la barbilla. Espalda '
      + 'apoyada y omóplatos juntos.',
    ejecucion:
      'Junta los brazos describiendo un abrazo, aprieta un segundo con las manos cerca y abre '
      + 'despacio hasta notar el estiramiento.',
    fallo:
      'Abrir de golpe y dejar que el peso tire del brazo hacia atrás. La vuelta es la mitad del '
      + 'ejercicio y se hace frenando.',
  },

  'aperturas-con-mancuernas': {
    preparacion:
      'Tumbado en banco plano, mancuernas arriba con los codos ligeramente doblados. Ese ángulo '
      + 'del codo no cambia en todo el ejercicio.',
    ejecucion:
      'Abre en arco hasta notar el pecho estirado a la altura del hombro y vuelve juntando como '
      + 'si abrazaras un barril. Peso moderado: aquí la palanca es larguísima.',
    fallo:
      'Convertirlo en un press doblando y estirando el codo. Si el codo trabaja, el pecho '
      + 'descansa.',
  },

  'aperturas-inclinado-con-mancuernas': {
    preparacion:
      'Banco a 30 grados, mancuernas arriba, codos algo doblados y fijos.',
    ejecucion:
      'Abre en arco hasta el estiramiento y junta arriba sin chocar las mancuernas.',
    fallo:
      'Bajar por debajo de lo que aguanta el hombro. El estiramiento se busca, no se fuerza.',
  },

  'cruces-en-polea-alta': {
    preparacion:
      'Poleas arriba, un pie adelante para no bambolearte, tronco algo inclinado y codos '
      + 'ligeramente doblados.',
    ejecucion:
      'Junta las manos hacia abajo y adelante, a la altura del ombligo, cruzándolas un poco. '
      + 'Aprieta un instante y vuelve controlando.',
    fallo:
      'Terminar el movimiento con los codos, como si fuera una extensión de tríceps. El codo '
      + 'mantiene su ángulo; lo que se junta son los brazos.',
  },

  'cruces-en-polea-media': {
    preparacion:
      'Poleas a la altura del pecho, un pie adelante, pecho alto.',
    ejecucion:
      'Junta las manos por delante del esternón y aprieta. Vuelve abriendo despacio hasta notar '
      + 'el estiramiento.',
    fallo:
      'Dar un paso adelante a media serie para hacerlo más fácil. La posición se elige antes y no '
      + 'se cambia hasta acabar.',
  },

  'cruces-en-polea-baja': {
    preparacion:
      'Poleas abajo, tronco erguido, brazos algo doblados y separados del cuerpo.',
    ejecucion:
      'Junta las manos hacia arriba y adentro, terminando a la altura de la barbilla o el pecho. '
      + 'Baja frenando.',
    fallo:
      'Encogerse de hombros al subir. Si el trapecio se mete, baja el peso.',
  },

  'apertura-en-polea-a-una-mano': {
    preparacion:
      'Polea a la altura del pecho, de lado, el pie contrario adelante y la mano libre en la '
      + 'cadera. Se apunta por lado.',
    ejecucion:
      'Lleva la mano hasta el centro del cuerpo describiendo un arco, y vuelve controlando el '
      + 'estiramiento.',
    fallo:
      'Rotar el tronco para acompañar. El tronco se queda quieto; lo que se mueve es el brazo.',
  },

  'fondos-en-paralelas': {
    preparacion:
      'En las paralelas con los brazos estirados, tronco inclinado adelante y piernas algo por '
      + 'detrás: esa inclinación es la que hace que esto sea de pecho y no de tríceps.',
    ejecucion:
      'Baja doblando los codos hasta que el hombro quede a la altura del codo, y sube empujando '
      + 'sin llegar a bloquear.',
    fallo:
      'Bajar hasta el fondo buscando profundidad. Pasado el punto en el que el hombro baja del '
      + 'codo no hay más pecho, hay más riesgo.',
  },

  'fondos-en-paralelas-lastrados': {
    preparacion:
      'Igual que sin lastre, con el cinturón puesto y el disco colgando quieto antes de empezar. '
      + 'Apunta sólo el lastre, que es lo que cambia de una semana a otra.',
    ejecucion:
      'Baja controlando hasta que el hombro llegue a la altura del codo y sube. Con lastre la '
      + 'bajada tira más: frénala.',
    fallo:
      'Añadir lastre antes de dominar el movimiento con el peso del cuerpo. Primero el recorrido, '
      + 'después los discos.',
  },

  'fondos-en-maquina-asistida': {
    preparacion:
      'Elige la asistencia, apoya las rodillas en la plataforma y colócate con el tronco '
      + 'inclinado adelante.',
    ejecucion:
      'Baja hasta el hombro a la altura del codo y empuja. Baja la asistencia cuando la serie te '
      + 'sobre, no el recorrido.',
    fallo:
      'Sentarse en la plataforma y dejar que la máquina haga el trabajo. La asistencia ayuda, no '
      + 'levanta.',
  },

  'flexiones': {
    preparacion:
      'Manos algo más anchas que los hombros y a la altura del pecho, cuerpo en tabla desde la '
      + 'cabeza a los talones, glúteo y abdomen apretados.',
    ejecucion:
      'Baja el pecho hasta un puño del suelo con los codos a unos 45 grados, y empuja hasta '
      + 'estirar empujando el suelo lejos.',
    fallo:
      'Que la cadera baje antes que el pecho. Si el cuerpo se rompe por la mitad, el abdomen no '
      + 'está apretado y la lumbar lo paga.',
  },

  'flexiones-declinadas': {
    preparacion:
      'Pies en un banco o cajón, manos en el suelo, cuerpo en línea. Cuanto más alto el apoyo, '
      + 'más cuesta.',
    ejecucion:
      'Baja el pecho hacia el suelo y empuja. La cadera no se hunde ni se levanta.',
    fallo:
      'Subir tanto los pies que el ejercicio se convierta en un press de hombros. Con el banco de '
      + 'siempre basta.',
  },

  'flexiones-inclinadas': {
    preparacion:
      'Manos en un banco o barra a la altura de la cadera y pies en el suelo. Es la versión para '
      + 'empezar, o para meter repeticiones cuando las normales ya no salen.',
    ejecucion:
      'Baja el pecho a la superficie y empuja hasta estirar, cuerpo en tabla.',
    fallo:
      'Apoyar las manos tan alto que casi no haya recorrido. Baja el apoyo en cuanto puedas.',
  },

  'flexiones-diamante': {
    preparacion:
      'Manos juntas debajo del pecho formando un triángulo con índices y pulgares. Cuerpo en '
      + 'tabla.',
    ejecucion:
      'Baja hasta tocar las manos con el pecho, codos cerca del cuerpo, y empuja.',
    fallo:
      'Hacerlas si te molesta la muñeca. Con las manos juntas la muñeca trabaja en una posición '
      + 'exigente; separa un poco antes de aguantar el dolor.',
  },

  'flexiones-con-lastre': {
    preparacion:
      'Un disco o un chaleco sobre la espalda alta, no en la lumbar. Si es un disco, que alguien '
      + 'te lo coloque con el cuerpo ya en posición.',
    ejecucion:
      'Baja el pecho a un puño del suelo y empuja, con el abdomen apretado para que el peso no '
      + 'hunda la cadera.',
    fallo:
      'Poner el disco demasiado abajo. Sobre la lumbar convierte una flexión en un ejercicio '
      + 'incómodo y sin sentido.',
  },

  'flexiones-en-anillas': {
    preparacion:
      'Anillas cerca del suelo, brazos estirados, cuerpo en tabla. Las anillas se mueven: eso es '
      + 'el ejercicio.',
    ejecucion:
      'Baja el pecho a la altura de las anillas y empuja, girando las manos hacia fuera arriba '
      + 'para apretar el pecho.',
    fallo:
      'Dejar que las manos se abran solas al bajar. Se controla la separación todo el rato, y si '
      + 'no puedes, sube las anillas.',
  },

  'flexiones-pliometricas': {
    preparacion:
      'Como una flexión normal, pero con la intención de despegar. Hazlas al principio de la '
      + 'sesión, con el cuerpo fresco: cansado no se salta, se cae.',
    ejecucion:
      'Baja controlando y empuja tan rápido que las manos se separen del suelo. Cae con los codos '
      + 'algo doblados para amortiguar.',
    fallo:
      'Aterrizar con los brazos rígidos. El golpe se lo lleva entonces el codo y el hombro, no el '
      + 'músculo.',
  },

  'pullover-con-mancuerna': {
    preparacion:
      'Tumbado en el banco, una mancuerna sujeta con las dos manos sobre el pecho, codos algo '
      + 'doblados y fijos. Costillas abajo, sin arquear la lumbar.',
    ejecucion:
      'Lleva la mancuerna por detrás de la cabeza en arco hasta notar el estiramiento del pecho y '
      + 'el costado, y vuelve al punto de partida sin pasarte de la vertical.',
    fallo:
      'Buscar recorrido arqueando la espalda. Lo que estira es el hombro, no la lumbar.',
  },

  'pullover-en-maquina': {
    preparacion:
      'Asiento y palanca ajustados para que los codos apoyen cómodos con los brazos arriba. '
      + 'Espalda pegada al respaldo.',
    ejecucion:
      'Tira con los codos hacia abajo y adelante, aprieta abajo y vuelve arriba controlando el '
      + 'estiramiento.',
    fallo:
      'Tirar con las manos. En esta máquina las manos sólo acompañan; el que empuja el recorrido '
      + 'es el codo.',
  },

  'press-svend-con-disco': {
    preparacion:
      'De pie, un disco apretado entre las palmas a la altura del pecho, codos altos.',
    ejecucion:
      'Estira los brazos adelante apretando el disco todo el rato, y vuelve al pecho sin dejar de '
      + 'apretar. El trabajo lo hace la presión, no el peso.',
    fallo:
      'Coger un disco pesado. Aquí pesa más el apretar que los kilos, y con un disco grande sólo '
      + 'se te cae.',
  },

  'aperturas-con-banda-elastica': {
    preparacion:
      'Banda anclada detrás a la altura del pecho, una punta en cada mano, un pie adelante y '
      + 'codos algo doblados.',
    ejecucion:
      'Junta las manos por delante del pecho y aprieta. Vuelve frenando: la banda tira más cuanto '
      + 'más estirada está, así que el final es lo más duro.',
    fallo:
      'Dejar que la banda te lleve los brazos atrás de golpe al volver. Se acompaña, no se suelta.',
  },

  'press-de-pecho-con-banda-elastica': {
    preparacion:
      'Banda por detrás de la espalda a la altura de las axilas, una punta en cada mano, manos a '
      + 'la altura del pecho.',
    ejecucion:
      'Empuja adelante hasta estirar los brazos y vuelve controlando. Al final del empuje la '
      + 'banda aprieta más: aguanta ahí un instante.',
    fallo:
      'Pasar la banda por la lumbar en vez de por la espalda alta. Se sale de sitio y el empuje '
      + 'se desvía.',
  },

  // ────────────────────────────── Espalda ──────────────────────────────

  'dominadas': {
    preparacion:
      'Agarre prono algo más ancho que los hombros, cuerpo colgado con los hombros activos (no '
      + 'colgando muertos de la articulación) y piernas juntas, algo adelantadas.',
    ejecucion:
      'Empieza tirando de los omóplatos hacia abajo y luego sube el pecho hacia la barra, con los '
      + 'codos apuntando al suelo. Baja controlando hasta estirar del todo.',
    fallo:
      'Dar patadas y balancearse para sacar una repetición más. Si hace falta el balanceo, usa la '
      + 'máquina asistida o una banda; el balanceo no entrena la espalda.',
  },

  'dominadas-supinas': {
    preparacion:
      'Agarre supino (palmas hacia ti) a la anchura de los hombros. Pecho arriba y hombros '
      + 'activos.',
    ejecucion:
      'Sube llevando el pecho a la barra con los codos pegados al cuerpo. Baja hasta estirar.',
    fallo:
      'Empezar el tirón con los bíceps sin haber bajado los omóplatos. Sin ese primer gesto el '
      + 'brazo se lleva todo y la espalda casi no participa.',
  },

  'dominadas-agarre-neutro': {
    preparacion:
      'Agarre en paralelo, palmas enfrentadas. Es el agarre más amable para el hombro y el codo.',
    ejecucion:
      'Sube con el pecho hacia las manos y los codos hacia atrás, y baja estirando del todo.',
    fallo:
      'Quedarse a medio recorrido arriba. La repetición cuenta cuando la barbilla pasa las manos y '
      + 'los brazos vuelven a estirarse.',
  },

  'dominadas-lastradas': {
    preparacion:
      'Cinturón de lastre con el disco colgando o mancuerna entre los pies. Comprueba que el peso '
      + 'está estable antes de despegar. Apunta sólo el lastre.',
    ejecucion:
      'Sube con el recorrido completo de siempre. Si el lastre te quita repeticiones o recorrido, '
      + 'sobra lastre.',
    fallo:
      'Poner lastre para hacer medias dominadas. Vale más una serie completa sin peso que cinco '
      + 'medias con veinte kilos.',
  },

  'dominadas-en-maquina-asistida': {
    preparacion:
      'Rodillas o pies en la plataforma y agarre elegido. Recuerda que en esta máquina más peso '
      + 'seleccionado es más ayuda, no más esfuerzo.',
    ejecucion:
      'Sube el pecho hacia la barra y baja controlando hasta estirar los brazos.',
    fallo:
      'Impulsarse con las piernas desde la plataforma. Las piernas van muertas; lo que sube es la '
      + 'espalda.',
  },

  'jalon-al-pecho-en-polea': {
    preparacion:
      'Rodillos ajustados a tus muslos para que no te levanten, agarre algo más ancho que los '
      + 'hombros, tronco casi vertical con una inclinación pequeña atrás.',
    ejecucion:
      'Baja la barra a la parte alta del pecho llevando los codos hacia abajo y atrás. Sube '
      + 'controlando hasta estirar los brazos y notar el estiramiento.',
    fallo:
      'Tumbarse hacia atrás para tirar con el peso del cuerpo. Si el tronco se mueve mucho, eso ya '
      + 'no es un jalón, es un remo mal hecho.',
  },

  'jalon-al-pecho-agarre-estrecho': {
    preparacion:
      'Barra o triángulo con las manos a la anchura de los hombros. Rodillos ajustados.',
    ejecucion:
      'Baja al pecho con los codos pegados al cuerpo y sube estirando del todo.',
    fallo:
      'Encoger los hombros al final de la subida. Se estira el brazo, pero el hombro no se sube a '
      + 'la oreja.',
  },

  'jalon-supino-en-polea': {
    preparacion:
      'Agarre supino a la anchura de los hombros, pecho arriba.',
    ejecucion:
      'Baja la barra al pecho con los codos pegados al tronco, aprieta abajo y sube controlando.',
    fallo:
      'Bajar la barra hasta el ombligo. Pasado el pecho el recorrido lo hace el hombro hacia '
      + 'delante, no la espalda.',
  },

  'jalon-tras-nuca-en-polea': {
    preparacion:
      'Sólo si tienes hombro y movilidad para llevar los brazos atrás sin compensar con el cuello. '
      + 'Agarre ancho, tronco vertical, cabeza adelantada lo justo.',
    ejecucion:
      'Baja la barra por detrás hasta la base del cuello, sin forzar, y sube controlando.',
    fallo:
      'Hacerlo a lo bruto con peso alto. Es el ejercicio de espalda que más hombros ha estropeado; '
      + 'si dudas, haz el jalón al pecho, que trabaja lo mismo.',
  },

  'jalon-a-una-mano-en-polea': {
    preparacion:
      'Un solo asa en la polea alta, sentado o arrodillado, la mano libre en el muslo. Se apunta '
      + 'por lado.',
    ejecucion:
      'Tira del codo hacia abajo y atrás dejando que el omóplato se mueva, y sube dejando que el '
      + 'brazo estire del todo.',
    fallo:
      'Girar el tronco a cada tirón. Un poco de rotación es normal; convertirlo en un giro de '
      + 'cintura, no.',
  },

  'jalon-con-brazos-rectos-en-polea': {
    preparacion:
      'Polea alta, barra o cuerda, brazos estirados adelante, tronco algo inclinado y codos con un '
      + 'ángulo pequeño que no cambia.',
    ejecucion:
      'Lleva la barra hasta los muslos en arco, sin doblar los codos, y vuelve arriba controlando.',
    fallo:
      'Doblar los codos y convertirlo en una extensión de tríceps. Aquí el brazo va recto todo el '
      + 'recorrido.',
  },

  'jalon-al-pecho-en-maquina': {
    preparacion:
      'Asiento y pecho apoyado según la máquina, agarraderas arriba y brazos estirados.',
    ejecucion:
      'Tira hacia abajo con los codos y vuelve arriba dejando estirar del todo.',
    fallo:
      'Recorrido corto por vergüenza a bajar el peso. En la espalda, el estiramiento de arriba es '
      + 'media mitad del ejercicio.',
  },

  'remo-con-barra': {
    preparacion:
      'De pie, pies a la anchura de las caderas, cadera atrás y tronco inclinado entre 45 grados y '
      + 'casi horizontal, espalda recta y mirada al suelo un metro adelante. Agarre prono, algo '
      + 'más ancho que los hombros.',
    ejecucion:
      'Tira la barra hacia el ombligo llevando los codos atrás, aprieta y baja controlando hasta '
      + 'estirar los brazos. El tronco no sube ni baja.',
    fallo:
      'Erguirse a cada repetición para ayudarse con la cadera. Eso es un peso muerto a medias: si '
      + 'pasa, quita kilos y mantén el ángulo.',
  },

  'remo-con-barra-agarre-supino': {
    preparacion:
      'Igual que el remo prono pero con las palmas hacia arriba y las manos a la anchura de los '
      + 'hombros. El agarre supino permite llevar el codo más atrás.',
    ejecucion:
      'Tira hacia la parte baja del abdomen con los codos rozando el cuerpo, y baja estirando.',
    fallo:
      'Redondear la espalda al bajar el peso. La espalda se mantiene recta también en la bajada.',
  },

  'remo-pendlay': {
    preparacion:
      'Tronco casi paralelo al suelo y la barra apoyada en el suelo en cada repetición. Espalda '
      + 'recta y cadera atrás.',
    ejecucion:
      'Tira explosivo desde el suelo hasta el abdomen y devuelve la barra al suelo, parando del '
      + 'todo antes de la siguiente. Cada repetición arranca desde parado.',
    fallo:
      'Rebotar la barra en el suelo para enlazar. Si se enlaza con rebote, deja de ser un pendlay.',
  },

  'remo-con-mancuerna-a-una-mano': {
    preparacion:
      'Una mano y una rodilla en el banco o la mano apoyada en un soporte, espalda paralela al '
      + 'suelo y hombros a la misma altura. Se apunta por lado.',
    ejecucion:
      'Tira la mancuerna hacia la cadera con el codo pegado al cuerpo, deja que el omóplato se '
      + 'mueva, y baja hasta estirar el brazo.',
    fallo:
      'Rotar el tronco para subir más la mancuerna. Los hombros se quedan paralelos al suelo de '
      + 'principio a fin.',
  },

  'remo-con-mancuernas-a-dos-manos': {
    preparacion:
      'De pie, cadera atrás, tronco inclinado, una mancuerna en cada mano con las palmas hacia '
      + 'dentro y los brazos colgando.',
    ejecucion:
      'Tira las dos mancuernas hacia la cadera con los codos cerca del cuerpo y baja controlando.',
    fallo:
      'Perder el ángulo del tronco a mitad de serie. En cuanto te vas irguiendo, la espalda deja '
      + 'de trabajar.',
  },

  'remo-en-punta-con-barra-t': {
    preparacion:
      'Barra anclada por un extremo, pecho arriba, cadera atrás, agarre con las dos manos en el '
      + 'asa o en la propia barra.',
    ejecucion:
      'Tira hacia el pecho o el abdomen según el agarre, aprieta y baja hasta estirar.',
    fallo:
      'Empezar cada repetición con un tirón de piernas. Las piernas sujetan; no rebotan.',
  },

  'remo-en-maquina-t': {
    preparacion:
      'Pecho contra el soporte, pies firmes en las plataformas y agarraderas al alcance con los '
      + 'brazos estirados.',
    ejecucion:
      'Tira con los codos hacia atrás hasta que las manos lleguen al tronco, y vuelve estirando '
      + 'del todo.',
    fallo:
      'Separar el pecho del soporte para tirar con la espalda erguida. El apoyo está ahí justo '
      + 'para que eso no pase.',
  },

  'remo-sentado-en-polea': {
    preparacion:
      'Sentado con los pies en la plataforma, rodillas algo dobladas, tronco vertical y pecho '
      + 'arriba. Agarre en triángulo.',
    ejecucion:
      'Tira hacia el ombligo llevando los codos atrás y juntando los omóplatos; vuelve dejando que '
      + 'los brazos estiren y el omóplato se abra, sin encorvarte.',
    fallo:
      'Remar con el tronco hacia atrás y adelante como si fuera una barca. Un movimiento pequeño '
      + 'de tronco es normal, pero el que tira es el brazo.',
  },

  'remo-sentado-en-polea-agarre-ancho': {
    preparacion:
      'Barra recta con agarre prono ancho, tronco vertical, pecho arriba.',
    ejecucion:
      'Tira hacia la parte alta del abdomen con los codos abiertos a la altura de los hombros, y '
      + 'vuelve estirando.',
    fallo:
      'Encoger los hombros al tirar. Los omóplatos van hacia abajo y hacia el centro, no hacia las '
      + 'orejas.',
  },

  'remo-en-polea-a-una-mano': {
    preparacion:
      'Polea baja con una asa, sentado o de rodillas, mano libre apoyada. Se apunta por lado.',
    ejecucion:
      'Tira del codo hacia la cadera dejando que el omóplato se mueva, y vuelve estirando el brazo '
      + 'del todo.',
    fallo:
      'No dejar que el brazo estire al volver. El recorrido largo es la ventaja de hacerlo a una '
      + 'mano; si no lo usas, hazlo a dos.',
  },

  'remo-sentado-en-maquina': {
    preparacion:
      'Asiento y pecho apoyado en el soporte, altura tal que las agarraderas queden a la altura '
      + 'del pecho o el abdomen.',
    ejecucion:
      'Tira con los codos atrás y vuelve controlando hasta que los brazos estiren.',
    fallo:
      'Poner el asiento tan bajo que tires hacia arriba. Se ajusta antes de la primera repetición.',
  },

  'remo-en-maquina-de-palanca': {
    preparacion:
      'Pecho contra el soporte, pies apoyados, brazos estirados agarrando las palancas.',
    ejecucion:
      'Tira los dos brazos hacia atrás hasta juntar los omóplatos, y vuelve estirando.',
    fallo:
      'Empujar el pecho contra el soporte con la espalda arqueada. Espalda neutra y pecho apoyado, '
      + 'sin arquear.',
  },

  'remo-en-maquina-a-una-mano': {
    preparacion:
      'Como a dos manos, pero con una sola palanca. La otra mano sujeta el soporte para no rotar. '
      + 'Se apunta por lado.',
    ejecucion:
      'Tira del codo hacia atrás manteniendo el tronco quieto, y vuelve estirando del todo.',
    fallo:
      'Dejar que el hombro del lado que no trabaja se vaya adelante. Los dos hombros a la misma '
      + 'altura.',
  },

  'remo-en-multipower': {
    preparacion:
      'Barra a la altura de las espinillas en la guía, cadera atrás, tronco inclinado y agarre '
      + 'prono.',
    ejecucion:
      'Tira la barra al abdomen siguiendo la guía y baja controlando. La línea recta la pone la '
      + 'máquina; tú pon el ángulo del tronco.',
    fallo:
      'Colocarse demasiado lejos de la guía, lo que obliga a tirar en diagonal. Ponte debajo de la '
      + 'barra antes de empezar.',
  },

  'remo-invertido': {
    preparacion:
      'Barra a la altura de la cadera, cuerpo por debajo en tabla, talones apoyados. Cuanto más '
      + 'horizontal el cuerpo, más cuesta.',
    ejecucion:
      'Tira el pecho hacia la barra juntando los omóplatos y baja hasta estirar los brazos, sin '
      + 'romper la línea del cuerpo.',
    fallo:
      'Levantar la cadera para llegar con el pecho. Si no llegas, sube la barra o dobla las '
      + 'rodillas.',
  },

  'remo-en-anillas': {
    preparacion:
      'Anillas a la altura de la cadera, cuerpo en tabla por debajo, agarre neutro.',
    ejecucion:
      'Tira el pecho hacia las anillas llevando los codos atrás, y baja estirando. Las anillas '
      + 'dejan girar la mano: aprovéchalo si el codo lo agradece.',
    fallo:
      'Encoger los hombros al tirar. Primero bajan los omóplatos, después tira el brazo.',
  },

  'remo-gorila-con-kettlebell': {
    preparacion:
      'Dos kettlebells en el suelo entre los pies, cadera atrás, tronco inclinado y espalda recta.',
    ejecucion:
      'Tira una hacia la cadera mientras la otra apoya en el suelo, y alterna. El tronco se queda '
      + 'quieto y a la misma altura.',
    fallo:
      'Rotar la cadera con cada tirón. El abdomen aprieta para que el tronco no gire.',
  },

  'peso-muerto-convencional': {
    preparacion:
      'Barra sobre la mitad del pie, pies a la anchura de las caderas, agarre por fuera de las '
      + 'piernas. Baja a coger la barra echando la cadera atrás, pecho alto, espalda recta y '
      + 'brazos estirados; los hombros quedan justo delante de la barra.',
    ejecucion:
      'Empuja el suelo con las piernas manteniendo la barra pegada al cuerpo, y termina de pie '
      + 'estirando la cadera sin echarte atrás. Baja igual: cadera atrás primero y barra rozando '
      + 'las piernas.',
    fallo:
      'Tirar con la espalda porque la cadera sube antes que la barra. Si el peso te redondea la '
      + 'espalda, ese peso todavía no es tuyo.',
  },

  'peso-muerto-sumo': {
    preparacion:
      'Pies muy abiertos con las puntas hacia fuera, manos por dentro de las piernas, cadera más '
      + 'baja y tronco más vertical que en el convencional. Rodillas apuntando hacia los pies.',
    ejecucion:
      'Abre las rodillas empujando el suelo hacia los lados y sube manteniendo el tronco vertical. '
      + 'Termina estirando la cadera.',
    fallo:
      'Dejar que las rodillas se cierren hacia dentro al arrancar. En sumo, la rodilla sigue la '
      + 'dirección del pie durante todo el recorrido.',
  },

  'peso-muerto-con-barra-hexagonal': {
    preparacion:
      'Dentro del hexágono, en el centro, agarre neutro en las asas. Cadera atrás, pecho alto, '
      + 'espalda recta.',
    ejecucion:
      'Empuja el suelo y sube. Con el agarre neutro el tronco va más vertical, así que es la '
      + 'versión más amable con la espalda.',
    fallo:
      'Colocarse descentrado dentro de la barra. Un par de dedos de más por un lado y el peso te '
      + 'tira en diagonal.',
  },

  'peso-muerto-con-mancuernas': {
    preparacion:
      'Una mancuerna a cada lado de los pies o delante de las piernas, cadera atrás, espalda '
      + 'recta.',
    ejecucion:
      'Sube empujando el suelo con las mancuernas rozando las piernas, y baja llevando la cadera '
      + 'atrás.',
    fallo:
      'Dejar las mancuernas separadas del cuerpo. Cuanto más lejos van, más carga la lumbar.',
  },

  'peso-muerto-en-multipower': {
    preparacion:
      'Barra en la guía a la altura de media espinilla, pies debajo, cadera atrás, espalda recta.',
    ejecucion:
      'Sube siguiendo la guía y baja controlando hasta que la barra vuelva a los topes.',
    fallo:
      'Ponerse demasiado lejos de la guía. La barra sube recta te guste o no, y si tú estás lejos, '
      + 'la lumbar lo compensa.',
  },

  'rack-pull': {
    preparacion:
      'Barra apoyada en el rack a la altura de la rodilla o algo por debajo, pies debajo de la '
      + 'barra, pecho alto y espalda recta.',
    ejecucion:
      'Tira hasta ponerte de pie estirando la cadera, y baja hasta dejar la barra en los soportes. '
      + 'El recorrido es corto: aprovecha para mover más peso con la espalda bien puesta.',
    fallo:
      'Encorvarse al bajar porque el peso es alto. Si no puedes bajarlo con la espalda recta, no '
      + 'es tu peso.',
  },

  'retraccion-escapular-en-barra': {
    preparacion:
      'Colgado de la barra con los brazos estirados y el cuerpo relajado hacia abajo.',
    ejecucion:
      'Sin doblar los codos, baja los omóplatos y sube el cuerpo unos centímetros. Aguanta un '
      + 'segundo arriba y suelta despacio.',
    fallo:
      'Doblar los codos y convertirlo en media dominada. Aquí los brazos van rectos: es el gesto '
      + 'que le falta a quien no consigue empezar bien las dominadas.',
  },

  'pull-over-en-polea-alta': {
    preparacion:
      'Polea alta con barra o cuerda, de pie a un paso, tronco inclinado adelante, codos algo '
      + 'doblados y fijos.',
    ejecucion:
      'Lleva las manos hasta los muslos en arco manteniendo el codo con su ángulo, aprieta la '
      + 'espalda abajo y vuelve arriba controlando.',
    fallo:
      'Estirar y doblar el codo. Es la diferencia entre trabajar el dorsal y trabajar el tríceps.',
  },

  // ───────────────────────────── Trapecio ─────────────────────────────

  'encogimientos-con-barra': {
    preparacion:
      'De pie con la barra delante de los muslos, agarre a la anchura de los hombros, brazos '
      + 'estirados y pecho alto.',
    ejecucion:
      'Sube los hombros rectos hacia las orejas, aprieta arriba un segundo y baja despacio hasta '
      + 'notar el estiramiento.',
    fallo:
      'Rodar los hombros en círculos. El trapecio sube y baja; los círculos no añaden nada y '
      + 'machacan el hombro.',
  },

  'encogimientos-con-mancuernas': {
    preparacion:
      'Una mancuerna a cada lado, brazos colgando, pecho alto y barbilla neutra.',
    ejecucion:
      'Encoge los hombros hacia arriba, aprieta y baja controlando hasta el estiramiento completo.',
    fallo:
      'Ayudarse con un impulso de rodillas. Si hacen falta las piernas, el peso es de otro '
      + 'ejercicio.',
  },

  'encogimientos-en-maquina': {
    preparacion:
      'De pie o sentado según la máquina, agarraderas cogidas con los brazos estirados y el pecho '
      + 'alto.',
    ejecucion:
      'Sube los hombros, aprieta arriba y baja despacio.',
    fallo:
      'Recorrido mínimo con mucho peso. El trapecio tiene poco recorrido, pero el que tiene se usa '
      + 'entero.',
  },

  'encogimientos-en-multipower': {
    preparacion:
      'Barra en la guía a la altura de los muslos, agarre a la anchura de los hombros. Al ir '
      + 'guiada, puedes olvidarte del equilibrio y cargar más.',
    ejecucion:
      'Sube los hombros, aprieta y baja hasta estirar del todo.',
    fallo:
      'Colgar la cabeza adelante al subir. La barbilla se queda metida y el cuello, quieto.',
  },

  'encogimientos-en-polea': {
    preparacion:
      'Polea baja con barra o dos asas, de pie, brazos estirados y tronco erguido.',
    ejecucion:
      'Encoge los hombros contra la tensión de la polea, aprieta arriba y baja controlando. La '
      + 'polea mantiene tensión también abajo, que es su ventaja.',
    fallo:
      'Inclinarse atrás para contrarrestar el cable. Colócate a la distancia justa para estar '
      + 'vertical.',
  },

  'encogimientos-con-barra-hexagonal': {
    preparacion:
      'Dentro de la barra hexagonal, agarre neutro en las asas, de pie con el pecho alto. Es la '
      + 'versión más cómoda para las muñecas y la que permite más carga.',
    ejecucion:
      'Sube los hombros, aprieta arriba y baja despacio.',
    fallo:
      'Tanto peso que el agarre falla antes que el trapecio. Si se te escapa la barra, usa correas '
      + 'o baja los kilos.',
  },

  // ────────────────────────────── Hombros ──────────────────────────────

  'press-militar-con-barra-de-pie': {
    preparacion:
      'Barra en la parte alta del pecho, manos justo por fuera de los hombros, codos algo '
      + 'adelantados. Pies a la anchura de las caderas, glúteo y abdomen apretados: eso es lo que '
      + 'impide que el peso se te vaya a la lumbar.',
    ejecucion:
      'Empuja la barra hacia arriba en línea recta, aparta la cabeza atrás lo justo para que pase '
      + 'y termina con la barra sobre la coronilla y las orejas por delante de los brazos. Baja '
      + 'controlando al pecho.',
    fallo:
      'Arquear la lumbar para sacar el peso arriba. Si el pecho se abre hacia el techo, aprieta '
      + 'abdomen y quita kilos: la lumbar no es un músculo de empuje.',
  },

  'press-militar-sentado-con-barra': {
    preparacion:
      'Sentado con respaldo, barra en la parte alta del pecho, agarre justo por fuera de los '
      + 'hombros. Espalda apoyada y pies firmes.',
    ejecucion:
      'Empuja hasta estirar los brazos con la barra sobre la cabeza, y baja al pecho controlando.',
    fallo:
      'Usar el respaldo para arquear la espalda y convertirlo en un press inclinado. La espalda se '
      + 'apoya, no se despega.',
  },

  'press-tras-nuca-con-barra': {
    preparacion:
      'Sólo con movilidad de hombro suficiente. Barra por detrás de la cabeza a la altura de las '
      + 'orejas, agarre ancho, sentado con el tronco vertical.',
    ejecucion:
      'Empuja hacia arriba y baja hasta la altura de las orejas, sin llegar al cuello.',
    fallo:
      'Bajar hasta la nuca forzando la rotación del hombro. Si tienes que adelantar la cabeza para '
      + 'que quepa, haz el press por delante.',
  },

  'press-de-hombros-con-mancuernas': {
    preparacion:
      'Sentado o de pie, mancuernas a la altura de las orejas con los codos algo por delante del '
      + 'cuerpo, no abiertos en cruz. Muñeca apilada sobre el codo.',
    ejecucion:
      'Empuja hacia arriba y algo hacia dentro hasta juntar casi las mancuernas, y baja hasta que '
      + 'los codos queden a la altura de los hombros.',
    fallo:
      'Abrir los codos en línea con las orejas. Adelántalos un poco: el hombro empuja mejor y '
      + 'sufre menos.',
  },

  'press-arnold': {
    preparacion:
      'Sentado, mancuernas delante de la cara con las palmas hacia ti y los codos juntos.',
    ejecucion:
      'Sube girando las palmas hacia fuera hasta acabar con los brazos estirados y las palmas '
      + 'adelante. Baja invirtiendo el giro despacio.',
    fallo:
      'Hacer el giro de golpe al final. El giro acompaña a la subida desde el principio, si no es '
      + 'un press normal con una vuelta de muñeca.',
  },

  'press-de-hombros-en-maquina': {
    preparacion:
      'Asiento a la altura que deje las agarraderas a la altura de los hombros. Espalda apoyada.',
    ejecucion:
      'Empuja hasta casi estirar y baja controlando hasta que el codo quede a la altura del hombro.',
    fallo:
      'Bajar más de lo que la máquina pide buscando estiramiento. En el hombro, bajar de más es '
      + 'donde aparecen las molestias.',
  },

  'press-de-hombros-en-multipower': {
    preparacion:
      'Banco con respaldo dentro del cajón, barra a la altura de la barbilla, topes puestos.',
    ejecucion:
      'Empuja siguiendo la guía y baja al punto de partida.',
    fallo:
      'Sentarse demasiado adelante, lo que obliga a empujar por delante de la cara. Coloca el banco '
      + 'para que la barra pase junto a la nariz.',
  },

  'push-press-con-barra': {
    preparacion:
      'Barra en la parte alta del pecho como en el press militar, pies a la anchura de las caderas '
      + 'y abdomen apretado.',
    ejecucion:
      'Flexiona un poco las rodillas y extiende las piernas de golpe para lanzar la barra; termina '
      + 'el recorrido empujando con los hombros. Baja al pecho amortiguando con las piernas.',
    fallo:
      'Hacer una sentadilla en vez de un impulso corto. El movimiento de piernas es breve y '
      + 'vertical; si bajas mucho, la barra se te va adelante.',
  },

  'press-con-kettlebell': {
    preparacion:
      'Kettlebell en posición de rack: pegada al antebrazo, muñeca recta, codo delante de las '
      + 'costillas. Se apunta por lado.',
    ejecucion:
      'Empuja hacia arriba dejando que la mano gire de forma natural, y baja al rack controlando.',
    fallo:
      'Dejar la muñeca doblada hacia atrás con la kettlebell colgando. Muñeca recta y firme, o el '
      + 'peso acaba en la articulación.',
  },

  'landmine-press': {
    preparacion:
      'Barra anclada por un extremo, la otra punta en la mano a la altura del hombro, de pie con '
      + 'un pie algo adelantado. Se apunta por lado.',
    ejecucion:
      'Empuja adelante y arriba siguiendo el arco de la barra, y vuelve al hombro controlando.',
    fallo:
      'Girar el tronco para llegar más lejos. El pecho queda al frente; lo que empuja es el brazo.',
  },

  'elevaciones-laterales-con-mancuernas': {
    preparacion:
      'De pie, mancuernas a los lados, codos con un ángulo pequeño y fijo, tronco erguido y '
      + 'omóplatos abajo.',
    ejecucion:
      'Sube los brazos por los lados hasta la altura de los hombros, guiando con el codo y no con '
      + 'la mano. Baja despacio, controlando los últimos centímetros.',
    fallo:
      'Balancear el tronco para lanzar las mancuernas. Es el ejercicio con más trampa del gimnasio: '
      + 'con la mitad de peso y sin balanceo el hombro trabaja el doble.',
  },

  'elevaciones-laterales-en-polea': {
    preparacion:
      'Polea baja cruzada por delante del cuerpo, la mano contraria coge el asa, la otra sujeta la '
      + 'máquina. Se apunta por lado.',
    ejecucion:
      'Sube el brazo por el lateral hasta la altura del hombro y baja frenando. La polea mantiene '
      + 'tensión también abajo.',
    fallo:
      'Colocarse demasiado pegado a la polea, con lo que la resistencia desaparece al principio del '
      + 'recorrido. Sepárate un paso.',
  },

  'elevaciones-laterales-en-maquina': {
    preparacion:
      'Asiento a la altura que deje el eje de la máquina a la altura del hombro. Codos apoyados en '
      + 'los soportes.',
    ejecucion:
      'Sube hasta la altura de los hombros, aprieta y baja controlando.',
    fallo:
      'Subir por encima de los hombros. Pasada esa altura entra el trapecio y el deltoides deja de '
      + 'ser el protagonista.',
  },

  'elevaciones-laterales-inclinado': {
    preparacion:
      'Tumbado de lado en un banco inclinado o sujeto a un poste con el cuerpo inclinado, la '
      + 'mancuerna en la mano de arriba. Se apunta por lado.',
    ejecucion:
      'Sube el brazo hasta la vertical y baja despacio. La inclinación pone la parte más dura al '
      + 'principio del recorrido, donde el ejercicio de pie no exige nada.',
    fallo:
      'Peso de las elevaciones normales. Aquí la palanca es peor: baja los kilos.',
  },

  'elevaciones-frontales-con-mancuernas': {
    preparacion:
      'De pie, mancuernas delante de los muslos, palmas hacia el cuerpo, abdomen apretado.',
    ejecucion:
      'Sube un brazo (o los dos) hasta la altura de los hombros con el codo casi estirado, y baja '
      + 'controlando.',
    fallo:
      'Subir por encima de la cabeza con impulso de lumbar. A la altura del hombro ya está hecho el '
      + 'trabajo.',
  },

  'elevaciones-frontales-con-disco': {
    preparacion:
      'Disco cogido por los lados con las dos manos, brazos casi estirados delante de los muslos.',
    ejecucion:
      'Sube el disco hasta la altura de los hombros y baja despacio, sin balancear el tronco.',
    fallo:
      'Coger un disco grande y compensar con la espalda. Con quince o veinte kilos ya se hace duro '
      + 'si no hay trampa.',
  },

  'elevaciones-frontales-en-polea': {
    preparacion:
      'Polea baja por detrás o entre las piernas, barra o asa en las manos, un paso adelante.',
    ejecucion:
      'Sube los brazos al frente hasta la altura de los hombros y baja frenando la vuelta.',
    fallo:
      'Inclinarse atrás al subir. El tronco se mantiene vertical, y el abdomen es el que lo sujeta.',
  },

  'pajaros-con-mancuernas': {
    preparacion:
      'Tronco inclinado adelante con la cadera atrás, o sentado en el borde del banco con el pecho '
      + 'en los muslos. Mancuernas colgando y codos algo doblados.',
    ejecucion:
      'Abre los brazos hacia los lados hasta la altura de los hombros, llevando los codos atrás, y '
      + 'baja despacio.',
    fallo:
      'Tirar con la espalda como si fuera un remo. Si notas los omóplatos apretando fuerte, estás '
      + 'remando: separa las manos en arco, no las lleves atrás.',
  },

  'pajaros-en-maquina': {
    preparacion:
      'Pecho contra el respaldo del peck deck invertido, agarraderas al frente y codos a la altura '
      + 'de los hombros.',
    ejecucion:
      'Abre hacia atrás hasta la línea del cuerpo, aprieta y vuelve controlando.',
    fallo:
      'Buscar recorrido llevando las manos muy atrás. Pasada la línea del cuerpo el trabajo se lo '
      + 'lleva la cápsula del hombro.',
  },

  'pajaros-en-polea-cruzada': {
    preparacion:
      'Poleas altas cruzadas, cada mano coge el asa contraria, un pie adelante y brazos casi '
      + 'estirados.',
    ejecucion:
      'Abre los brazos hacia atrás y afuera hasta formar una cruz, aprieta y vuelve despacio.',
    fallo:
      'Doblar los codos a mitad de serie para poder seguir. Cuando el codo empieza a doblarse, la '
      + 'serie se ha terminado.',
  },

  'face-pull-en-polea': {
    preparacion:
      'Cuerda en la polea a la altura de la cara, agarre con los pulgares hacia atrás, un pie '
      + 'adelante y brazos estirados.',
    ejecucion:
      'Tira la cuerda hacia la cara separando las manos, terminando con los codos altos y las '
      + 'manos a la altura de las orejas. Vuelve controlando.',
    fallo:
      'Tirar con los codos bajos, que lo convierte en un remo. Los codos van a la altura de los '
      + 'hombros o por encima.',
  },

  'remo-al-cuello-con-barra': {
    preparacion:
      'Barra delante de los muslos con agarre algo más ancho que los hombros: el agarre estrecho '
      + 'es el que hace daño.',
    ejecucion:
      'Tira la barra hacia arriba pegada al cuerpo llevando los codos altos, hasta la altura del '
      + 'pecho. Baja controlando.',
    fallo:
      'Subir la barra hasta la barbilla con las manos juntas. Ahí el hombro rota al máximo con '
      + 'carga, y es una receta para el pinzamiento.',
  },

  'remo-al-cuello-en-polea': {
    preparacion:
      'Polea baja con barra o cuerda, de pie cerca del cable, tronco erguido.',
    ejecucion:
      'Tira hacia arriba con los codos altos hasta la altura del pecho y baja despacio.',
    fallo:
      'Alejarse del cable, lo que hace que la barra suba en diagonal y se separe del cuerpo. Pégate '
      + 'a la polea.',
  },

  'elevacion-en-y-en-banco-inclinado': {
    preparacion:
      'Tumbado boca abajo en un banco inclinado a 30 o 45 grados, mancuernas ligeras colgando y '
      + 'pulgares hacia arriba.',
    ejecucion:
      'Sube los brazos en diagonal formando una Y con el cuerpo, aprieta arriba un segundo y baja '
      + 'despacio.',
    fallo:
      'Peso de más. Es un ejercicio de dos a cinco kilos: con más, el tronco se levanta del banco y '
      + 'no queda nada del ejercicio.',
  },

  'rotacion-externa-en-polea': {
    preparacion:
      'Polea a la altura del codo, el brazo pegado al cuerpo con el codo a 90 grados. Puedes poner '
      + 'una toalla entre el codo y las costillas para que no se separe. Se apunta por lado.',
    ejecucion:
      'Gira el antebrazo hacia fuera manteniendo el codo pegado, y vuelve frenando.',
    fallo:
      'Separar el codo del cuerpo y convertirlo en un tirón. Este ejercicio es de rotación: si el '
      + 'codo viaja, no hay rotación.',
  },

  'rotacion-externa-con-banda-elastica': {
    preparacion:
      'Banda anclada a la altura del codo, codo pegado al cuerpo y flexionado a 90 grados.',
    ejecucion:
      'Gira el antebrazo hacia fuera y vuelve controlando. Movimiento pequeño, lento y sin prisa.',
    fallo:
      'Usar una banda dura. El manguito rotador es pequeño: con la banda más blanda ya trabaja.',
  },

  'press-de-hombros-con-banda-elastica': {
    preparacion:
      'De pie sobre el centro de la banda, una punta en cada mano a la altura de los hombros.',
    ejecucion:
      'Empuja hacia arriba hasta estirar los brazos y baja controlando. La banda aprieta más arriba, '
      + 'donde el hombro es fuerte.',
    fallo:
      'Dejar que la banda tire de los brazos abajo de golpe. La bajada se frena igual que con una '
      + 'mancuerna.',
  },

  'flexiones-pica': {
    preparacion:
      'En V invertida con las manos y los pies en el suelo, la cadera arriba y la cabeza mirando '
      + 'entre las manos. Cuanto más vertical la cadera, más peso llevan los hombros.',
    ejecucion:
      'Baja la coronilla hacia el suelo por delante de las manos, y empuja hasta estirar los brazos.',
    fallo:
      'Bajar la cabeza entre las manos como en una flexión normal. La cabeza baja por delante: eso '
      + 'es lo que lo convierte en un ejercicio de hombro.',
  },

  'flexiones-en-vertical': {
    preparacion:
      'En vertical apoyado en la pared, manos algo más anchas que los hombros y abdomen apretado. '
      + 'Sólo si ya aguantas el pino con soltura.',
    ejecucion:
      'Baja la cabeza hacia el suelo controlando y empuja hasta estirar los brazos.',
    fallo:
      'Intentarlas sin dominar antes la posición. Aprende primero a subir y bajar de la pared, y '
      + 'después añade el recorrido.',
  },

  // ─────────────────────────────── Bíceps ───────────────────────────────

  'curl-con-barra': {
    preparacion:
      'De pie, barra con agarre supino a la anchura de los hombros, codos pegados a las costillas '
      + 'y abdomen apretado.',
    ejecucion:
      'Sube la barra doblando el codo, sin mover el hombro adelante, hasta que el antebrazo pase la '
      + 'vertical. Baja despacio hasta estirar del todo.',
    fallo:
      'Balancear el tronco atrás para arrancar el peso. El codo es lo único que se mueve; si la '
      + 'espalda entra, la serie ya acabó.',
  },

  'curl-con-barra-z': {
    preparacion:
      'Igual que con barra recta, pero con la barra Z, que deja las muñecas algo giradas y molesta '
      + 'menos si el curl con barra recta te da tirones en la muñeca.',
    ejecucion:
      'Sube doblando el codo y baja controlando hasta estirar.',
    fallo:
      'Elegir la barra Z por costumbre cuando la recta no te molesta. La recta trabaja algo más el '
      + 'bíceps por la supinación.',
  },

  'curl-con-mancuernas': {
    preparacion:
      'De pie, una mancuerna en cada mano con las palmas al frente, codos pegados al cuerpo.',
    ejecucion:
      'Sube las dos a la vez doblando el codo y aprieta arriba. Baja despacio hasta estirar del '
      + 'todo el brazo.',
    fallo:
      'Adelantar los codos al subir para llegar más arriba. En cuanto el codo viaja hacia delante, '
      + 'el trabajo pasa al hombro.',
  },

  'curl-alterno-con-mancuernas': {
    preparacion:
      'Como el curl con mancuernas, pero subiendo un brazo cada vez. El brazo que espera se queda '
      + 'estirado y quieto. Se apunta por lado.',
    ejecucion:
      'Sube un brazo, aprieta, baja del todo y cambia. Sin prisa: alternar sirve para poder '
      + 'concentrarse en cada lado.',
    fallo:
      'Empezar a subir uno antes de bajar el otro, que convierte el ejercicio en un balanceo '
      + 'continuo con impulso.',
  },

  'curl-martillo': {
    preparacion:
      'Mancuernas con agarre neutro, palmas enfrentadas, como si llevaras dos martillos. Codos '
      + 'pegados.',
    ejecucion:
      'Sube manteniendo la palma hacia dentro todo el recorrido y baja despacio. Trabaja el '
      + 'braquial y el antebrazo además del bíceps.',
    fallo:
      'Girar la muñeca al subir. Si gira, es un curl normal; el martillo mantiene el agarre neutro.',
  },

  'curl-inclinado-con-mancuernas': {
    preparacion:
      'Sentado en un banco inclinado a 45 o 60 grados con los brazos colgando por detrás de la '
      + 'línea del cuerpo. Esa posición es la que estira el bíceps antes de empezar.',
    ejecucion:
      'Sube doblando el codo sin adelantar el hombro, y baja hasta estirar del todo notando el '
      + 'estiramiento.',
    fallo:
      'Encoger los hombros hacia delante para ayudarse. Si el hombro se mueve, se pierde justo lo '
      + 'que aporta la inclinación.',
  },

  'curl-concentrado': {
    preparacion:
      'Sentado, el codo apoyado en la cara interna del muslo y el brazo colgando. Se apunta por '
      + 'lado.',
    ejecucion:
      'Sube la mancuerna hasta el hombro apretando arriba, y baja hasta estirar el brazo del todo.',
    fallo:
      'Empujar con el muslo o mover el tronco. El muslo sólo hace de apoyo.',
  },

  'curl-arana': {
    preparacion:
      'Tumbado boca abajo en un banco inclinado con los brazos colgando en vertical, mancuernas o '
      + 'barra Z en las manos.',
    ejecucion:
      'Sube doblando el codo con el brazo perpendicular al suelo, aprieta arriba y baja despacio.',
    fallo:
      'Separar el pecho del banco para tirar. El pecho se queda apoyado toda la serie.',
  },

  'curl-zottman': {
    preparacion:
      'De pie con mancuernas y agarre supino, codos pegados al cuerpo.',
    ejecucion:
      'Sube con las palmas hacia arriba, gira las manos arriba hasta poner las palmas hacia abajo '
      + 'y baja así, despacio. Vuelve a girar abajo.',
    fallo:
      'Bajar rápido la parte con las palmas hacia abajo. Justo esa bajada es lo que trabaja el '
      + 'antebrazo, y es la razón de hacer este curl.',
  },

  'curl-en-banco-scott-con-barra': {
    preparacion:
      'Brazos apoyados en el pupitre del banco Scott, axilas contra el borde de arriba, barra Z con '
      + 'agarre supino.',
    ejecucion:
      'Sube doblando el codo y baja hasta casi estirar, controlando. El apoyo impide hacer trampa '
      + 'con el hombro: por eso es más duro de lo que parece.',
    fallo:
      'Dejar caer el peso al final de la bajada con el codo estirándose de golpe. El codo es una '
      + 'articulación pequeña y ahí es donde se lesiona.',
  },

  'curl-en-banco-scott-con-mancuerna': {
    preparacion:
      'Un brazo apoyado en el pupitre, mancuerna con agarre supino. Se apunta por lado.',
    ejecucion:
      'Sube doblando el codo, aprieta arriba y baja hasta casi estirar, frenando.',
    fallo:
      'Girar el tronco para ayudar. El apoyo sirve precisamente para que sólo trabaje el brazo.',
  },

  'curl-en-maquina': {
    preparacion:
      'Asiento y pupitre ajustados para que el codo quede alineado con el eje de la máquina, y las '
      + 'axilas apoyadas.',
    ejecucion:
      'Sube hasta arriba, aprieta y baja controlando hasta el estiramiento.',
    fallo:
      'Levantar el culo del asiento en las últimas repeticiones. Ahí se acabó la serie: no hay más '
      + 'que rascar.',
  },

  'curl-en-polea-baja': {
    preparacion:
      'Polea baja con barra o asas, de pie a un paso del cable, codos pegados al cuerpo.',
    ejecucion:
      'Sube doblando el codo y baja controlando. La polea mantiene tensión también abajo, donde la '
      + 'barra ya no exige nada.',
    fallo:
      'Ponerse encima de la polea, con lo que el cable tira en vertical y el ejercicio se parece al '
      + 'de barra. Sepárate un paso para que tire en diagonal.',
  },

  'curl-con-cuerda-en-polea': {
    preparacion:
      'Cuerda en la polea baja, agarre neutro con los pulgares arriba, codos pegados.',
    ejecucion:
      'Sube doblando el codo y separa un poco las puntas de la cuerda arriba, apretando. Baja '
      + 'despacio.',
    fallo:
      'Tirar de la cuerda con los hombros adelantados. El hombro se queda quieto y atrás.',
  },

  'curl-en-polea-alta-a-dos-manos': {
    preparacion:
      'Dos poleas altas con asas, de pie en el centro con los brazos abiertos en cruz a la altura '
      + 'de los hombros.',
    ejecucion:
      'Dobla los codos llevando las manos a las orejas sin bajar los brazos, aprieta y vuelve '
      + 'estirando.',
    fallo:
      'Dejar caer los codos durante la serie. Los brazos se mantienen a la altura del hombro todo el '
      + 'tiempo: es lo que hace que se note tanto.',
  },

  'curl-con-kettlebell': {
    preparacion:
      'Una kettlebell en cada mano o una a dos manos, con la campana colgando por fuera del '
      + 'antebrazo. Codos pegados.',
    ejecucion:
      'Sube doblando el codo con la muñeca recta, y baja despacio.',
    fallo:
      'Dejar que la campana doble la muñeca hacia atrás. Muñeca firme, o el peso lo aguanta el '
      + 'antebrazo y no el bíceps.',
  },

  'curl-con-banda-elastica': {
    preparacion:
      'De pie sobre el centro de la banda, una punta en cada mano con las palmas al frente.',
    ejecucion:
      'Sube doblando el codo hasta arriba, donde la banda aprieta más, y baja frenando.',
    fallo:
      'Soltar la tensión de golpe abajo. La bajada se acompaña; es donde la banda pierde tensión y '
      + 'hay que hacerla lenta a propósito.',
  },

  // ─────────────────────────────── Tríceps ───────────────────────────────

  'extension-de-triceps-en-polea-con-cuerda': {
    preparacion:
      'Polea alta con cuerda, de pie a un paso, tronco algo inclinado, codos pegados a las '
      + 'costillas y pegados ahí todo el ejercicio.',
    ejecucion:
      'Estira los codos hacia abajo y separa las puntas de la cuerda al final, apretando un '
      + 'instante. Vuelve dejando que el antebrazo suba hasta pasar los 90 grados.',
    fallo:
      'Separar los codos del cuerpo y empujar con el hombro y la espalda. Si el tronco se balancea, '
      + 'baja el peso: el codo es lo único que se mueve.',
  },

  'extension-de-triceps-en-polea-con-barra': {
    preparacion:
      'Polea alta con barra recta o Z, agarre prono a la anchura de los hombros, codos pegados al '
      + 'cuerpo.',
    ejecucion:
      'Estira los codos hasta abajo, aprieta y vuelve controlando sin dejar que el codo se separe.',
    fallo:
      'Ayudarse doblando el tronco hacia delante en cada repetición. Eso es un empuje de pecho, no '
      + 'una extensión.',
  },

  'extension-de-triceps-en-polea-agarre-inverso': {
    preparacion:
      'Polea alta con barra y agarre supino (palmas arriba), codos pegados. Peso bastante menor que '
      + 'con agarre prono.',
    ejecucion:
      'Estira el codo hacia abajo manteniendo la muñeca firme, aprieta abajo y vuelve controlando.',
    fallo:
      'Cargar como en la versión prona. El agarre supino es más débil y la muñeca es la primera que '
      + 'protesta.',
  },

  'extension-de-triceps-sobre-la-cabeza-en-polea': {
    preparacion:
      'De espaldas a la polea baja o alta según la máquina, cuerda cogida por encima de la cabeza, '
      + 'codos apuntando adelante y pegados a las orejas.',
    ejecucion:
      'Estira los codos hacia arriba y adelante, y vuelve dejando que el antebrazo baje del todo por '
      + 'detrás de la cabeza, notando el estiramiento.',
    fallo:
      'Abrir los codos hacia los lados al empujar. Los codos apuntan al frente todo el rato: es lo '
      + 'que mantiene el trabajo en el tríceps.',
  },

  'extension-de-triceps-sobre-la-cabeza-con-mancuerna': {
    preparacion:
      'Sentado o de pie, una mancuerna sujeta con las dos manos por detrás de la cabeza, codos '
      + 'apuntando arriba y cerca de las orejas. Costillas abajo.',
    ejecucion:
      'Estira los codos hasta arriba y baja controlando hasta notar el estiramiento del tríceps.',
    fallo:
      'Arquear la lumbar para llegar más atrás. Aprieta el abdomen: lo que se mueve es el codo, no '
      + 'la espalda.',
  },

  'press-frances-con-barra': {
    preparacion:
      'Tumbado en banco plano, barra Z con agarre prono sobre la frente, brazos verticales o algo '
      + 'inclinados hacia la cabeza.',
    ejecucion:
      'Baja la barra hacia la frente o justo por detrás doblando sólo el codo, y estira hasta arriba.',
    fallo:
      'Mover los hombros para convertirlo en un press. El brazo entero se queda quieto; lo único que '
      + 'viaja es el antebrazo.',
  },

  'press-frances-con-mancuernas': {
    preparacion:
      'Tumbado, una mancuerna en cada mano, brazos verticales y palmas enfrentadas.',
    ejecucion:
      'Baja las mancuernas a los lados de la cabeza doblando el codo, y estira arriba. Las '
      + 'mancuernas dejan que la muñeca se coloque como quiera, que es su ventaja.',
    fallo:
      'Dejar que los codos se abran hacia los lados al bajar. Codos apuntando al techo.',
  },

  'rompecraneos-con-barra-z': {
    preparacion:
      'Tumbado con la barra Z sobre la frente y los brazos algo inclinados hacia atrás, para que el '
      + 'tríceps no descanse arriba.',
    ejecucion:
      'Baja la barra por encima de la frente doblando el codo y estira sin bloquear del todo.',
    fallo:
      'Bajar la barra a la nariz con los brazos verticales. El nombre del ejercicio es una '
      + 'advertencia: baja por detrás de la cabeza, no encima de la cara.',
  },

  'jm-press': {
    preparacion:
      'Tumbado, barra con agarre a la anchura de los hombros sobre el pecho: es una mezcla de press '
      + 'estrecho y press frances.',
    ejecucion:
      'Baja la barra hacia la parte alta del pecho o el cuello dejando que los codos vayan adelante, '
      + 'y empuja combinando extensión de codo con empuje.',
    fallo:
      'Intentarlo con peso alto sin haberlo hecho nunca. Es un movimiento raro al principio: '
      + 'apréndelo con poco peso.',
  },

  'patada-de-triceps-con-mancuerna': {
    preparacion:
      'Tronco inclinado con la mano libre apoyada, el brazo que trabaja con el codo pegado al '
      + 'costado y el antebrazo colgando. Se apunta por lado.',
    ejecucion:
      'Estira el codo hacia atrás hasta que el brazo quede recto, aprieta un instante y vuelve '
      + 'despacio.',
    fallo:
      'Mover el hombro arriba y abajo en cada repetición. El brazo se queda paralelo al suelo y lo '
      + 'único que gira es el codo.',
  },

  'patada-de-triceps-en-polea': {
    preparacion:
      'Polea baja con asa, tronco inclinado, codo pegado al costado y a la altura de la espalda. Se '
      + 'apunta por lado.',
    ejecucion:
      'Estira el codo hacia atrás, aprieta y vuelve controlando. La polea da tensión constante, que '
      + 'es lo que le falta a la versión con mancuerna.',
    fallo:
      'Dejar que el codo baje al volver. El codo se queda a su altura; sólo se mueve el antebrazo.',
  },

  'extension-de-triceps-en-maquina': {
    preparacion:
      'Asiento ajustado para que el codo coincida con el eje de la máquina, espalda apoyada y codos '
      + 'apoyados si la máquina los tiene.',
    ejecucion:
      'Estira los codos hasta el final del recorrido, aprieta y vuelve controlando.',
    fallo:
      'No llegar a estirar del todo. En el tríceps, el final del recorrido es justo donde más se '
      + 'trabaja.',
  },

  'fondos-en-banco': {
    preparacion:
      'Manos en el borde de un banco a la anchura de los hombros con los dedos hacia delante, culo '
      + 'cerca del banco y piernas estiradas o dobladas según lo que aguantes.',
    ejecucion:
      'Baja doblando los codos hacia atrás hasta que el brazo forme unos 90 grados, y empuja hasta '
      + 'estirar.',
    fallo:
      'Bajar hasta que los hombros se vayan hacia las orejas. Ahí el hombro trabaja en su posición '
      + 'más incómoda; para en los 90 grados.',
  },

  'fondos-entre-bancos-con-lastre': {
    preparacion:
      'Manos en un banco y talones en otro, con un disco sobre los muslos. Que el disco esté '
      + 'estable antes de empezar.',
    ejecucion:
      'Baja hasta los 90 grados de codo y empuja hasta arriba, con el abdomen apretado.',
    fallo:
      'Poner el disco tan adelante que se caiga a media serie. Se coloca sobre los muslos, cerca de '
      + 'la cadera.',
  },

  'extension-de-triceps-con-banda-elastica': {
    preparacion:
      'Banda anclada arriba, codos pegados al cuerpo, un pie adelante.',
    ejecucion:
      'Estira los codos hacia abajo hasta el final, donde la banda aprieta más, y vuelve frenando.',
    fallo:
      'Colocarse tan cerca del anclaje que la banda no tenga tensión al principio. Retrocede hasta '
      + 'notar tensión desde la primera repetición.',
  },

  // ────────────────────────────── Antebrazo ──────────────────────────────

  'curl-de-muneca-con-barra': {
    preparacion:
      'Sentado con los antebrazos apoyados en los muslos o en un banco y las manos por fuera de la '
      + 'rodilla, palmas hacia arriba, barra en los dedos.',
    ejecucion:
      'Deja que la barra baje hasta los dedos, ciérrala y sube la muñeca hasta el final del '
      + 'recorrido. Aguanta arriba un instante.',
    fallo:
      'Mover el codo para ayudarse. El antebrazo se queda pegado al apoyo; sólo se mueve la muñeca.',
  },

  'curl-de-muneca-inverso-con-barra': {
    preparacion:
      'Igual que el curl de muñeca pero con las palmas hacia abajo, antebrazos apoyados.',
    ejecucion:
      'Sube el dorso de la mano hacia arriba, aprieta y baja despacio. Recorrido corto por '
      + 'naturaleza.',
    fallo:
      'Cargar como en la versión con palmas arriba. Los extensores son mucho más débiles: la mitad '
      + 'de peso o menos.',
  },

  'curl-de-muneca-con-mancuernas': {
    preparacion:
      'Sentado, antebrazos apoyados en los muslos, una mancuerna en cada mano con las palmas arriba.',
    ejecucion:
      'Baja la mancuerna abriendo un poco los dedos, y sube cerrando y flexionando la muñeca.',
    fallo:
      'No abrir los dedos abajo. Ese último centímetro es el que trabaja el agarre además del '
      + 'antebrazo.',
  },

  'curl-inverso-con-barra-z': {
    preparacion:
      'De pie, barra Z con agarre prono (palmas abajo), codos pegados al cuerpo.',
    ejecucion:
      'Sube doblando el codo con la muñeca firme y baja despacio. Trabaja el braquiorradial, que es '
      + 'lo que ensancha el antebrazo por arriba.',
    fallo:
      'Dejar que la muñeca se doble hacia abajo con el peso. Muñeca recta y en línea con el '
      + 'antebrazo.',
  },

  'rodillo-de-muneca': {
    preparacion:
      'De pie con el rodillo a la altura del pecho, brazos estirados al frente, el peso colgando de '
      + 'la cuerda hasta abajo.',
    ejecucion:
      'Enrolla la cuerda girando el rodillo con las muñecas hasta subir el peso, y desenróllalo '
      + 'despacio.',
    fallo:
      'Bajar los brazos cuando arde el hombro. Si no aguantas los brazos arriba, apoya los codos en '
      + 'algo: el ejercicio es de antebrazo, no de hombro.',
  },

  'pronosupinacion-con-mancuerna': {
    preparacion:
      'Sentado con el antebrazo apoyado y la mano por fuera de la rodilla, sujetando la mancuerna '
      + 'por un extremo. Se apunta por lado.',
    ejecucion:
      'Gira la muñeca de palma arriba a palma abajo y al contrario, despacio y controlando en las '
      + 'dos direcciones.',
    fallo:
      'Ir rápido. El recorrido es corto y lo que trabaja es el control; a toda prisa no hace nada.',
  },

  'pinza-de-agarre': {
    preparacion:
      'Discos lisos apretados entre los dedos y el pulgar, o la pinza del gimnasio. De pie con los '
      + 'brazos colgando. Se apunta el tiempo que aguantas.',
    ejecucion:
      'Aprieta y aguanta sin que el disco resbale, hasta que el agarre falle.',
    fallo:
      'Apoyar el disco en la pierna sin darse cuenta. El peso cuelga libre o no cuenta.',
  },

  'colgarse-de-la-barra': {
    preparacion:
      'Colgado de la barra con las dos manos y los brazos estirados, hombros activos y cuerpo '
      + 'quieto. Se apunta el tiempo.',
    ejecucion:
      'Aguanta colgado respirando tranquilo hasta que el agarre falle. Sirve para el agarre y de '
      + 'paso descarga la espalda.',
    fallo:
      'Usar correas. Aquí lo que se entrena es precisamente la mano.',
  },

  // ───────────────────────────── Cuádriceps ─────────────────────────────

  'sentadilla-con-barra': {
    preparacion:
      'Barra sobre los trapecios (alta) o sobre la parte de atrás de los hombros (baja), pies a la '
      + 'anchura de los hombros con las puntas algo hacia fuera. Pecho alto, abdomen apretado y '
      + 'mirada al frente. Comprueba la altura del rack y pon los topes de seguridad.',
    ejecucion:
      'Baja llevando la cadera atrás y las rodillas adelante a la vez, hasta que el muslo pase de la '
      + 'paralela si tu movilidad lo permite. Sube empujando el suelo con todo el pie, sin que las '
      + 'rodillas se cierren hacia dentro.',
    fallo:
      'Que los talones se despeguen y las rodillas se metan hacia dentro. Suele ser falta de '
      + 'movilidad de tobillo: separa un poco más los pies, abre las puntas, y si hace falta usa '
      + 'zapatilla con algo de tacón.',
  },

  'sentadilla-frontal': {
    preparacion:
      'Barra sobre los deltoides delanteros, apoyada en el hueco de la garganta y sujeta con los '
      + 'codos altos. Los dedos sólo acompañan. Tronco vertical.',
    ejecucion:
      'Baja manteniendo los codos arriba y el tronco lo más vertical posible, y sube empujando el '
      + 'suelo. Al ir el peso delante, trabaja más el cuádriceps y menos la espalda.',
    fallo:
      'Dejar caer los codos. En cuanto bajan, la barra rueda adelante y se te cae; los codos apuntan '
      + 'al frente y hacia arriba todo el rato.',
  },

  'sentadilla-zercher': {
    preparacion:
      'Barra en el hueco de los codos, pegada al cuerpo, brazos cruzados. Ponte una toalla si '
      + 'molesta. Pies algo más abiertos que en la sentadilla normal.',
    ejecucion:
      'Baja con el tronco vertical hasta abajo y sube empujando el suelo, con el abdomen muy '
      + 'apretado.',
    fallo:
      'Cargar demasiado la primera vez. Aquí el límite no son las piernas: son los codos y el '
      + 'abdomen.',
  },

  'sentadilla-en-multipower': {
    preparacion:
      'Barra en la guía sobre los hombros, pies algo adelantados respecto a la barra. Topes puestos '
      + 'a la altura de tu punto más bajo.',
    ejecucion:
      'Baja controlando por la guía hasta que el muslo pase la paralela, y sube empujando el suelo.',
    fallo:
      'Adelantar tanto los pies que la rodilla quede muy por detrás. Es cómodo y carga la lumbar; '
      + 'con los pies un poco adelantados basta.',
  },

  'sentadilla-goblet-con-kettlebell': {
    preparacion:
      'Kettlebell sujeta por las asas contra el pecho, codos abajo, pies a la anchura de los '
      + 'hombros. Es la mejor sentadilla para aprender el movimiento.',
    ejecucion:
      'Baja entre las rodillas manteniendo el pecho alto y los codos por dentro, y sube empujando el '
      + 'suelo.',
    fallo:
      'Separar la kettlebell del pecho. En cuanto se aleja, tira de ti hacia delante.',
  },

  'sentadilla-bulgara-con-mancuernas': {
    preparacion:
      'Un pie sobre un banco por detrás, el otro a un paso largo por delante. Mancuernas colgando a '
      + 'los lados. Se apunta por lado.',
    ejecucion:
      'Baja doblando la pierna de delante hasta que el muslo llegue a la paralela, con el tronco '
      + 'algo inclinado si quieres más glúteo o vertical si quieres más cuádriceps. Sube empujando '
      + 'el suelo con el pie de delante.',
    fallo:
      'Poner el pie de delante demasiado cerca del banco, lo que manda la rodilla muy adelante y '
      + 'hace que el pie de atrás lleve el peso. Da un paso más largo.',
  },

  'sentadilla-bulgara-con-barra': {
    preparacion:
      'Barra sobre los hombros, un pie en el banco por detrás y el otro adelantado. Se apunta por '
      + 'lado. Requiere más equilibrio que con mancuernas.',
    ejecucion:
      'Baja hasta la paralela y sube empujando con la pierna de delante, sin balancearte.',
    fallo:
      'Cargar con barra sin dominarla antes con mancuernas. Con la barra arriba, perder el '
      + 'equilibrio es peor.',
  },

  'sentadilla-hack-en-maquina': {
    preparacion:
      'Espalda y hombros bien apoyados, pies a media altura de la plataforma y algo separados. '
      + 'Quita los seguros antes de bajar.',
    ejecucion:
      'Baja controlando hasta que el muslo pase la paralela y sube empujando con todo el pie, sin '
      + 'bloquear la rodilla de golpe arriba.',
    fallo:
      'Poner los pies muy arriba en la plataforma, lo que quita cuádriceps y carga la rodilla en '
      + 'ángulos raros. Pies a media plataforma.',
  },

  'sentadilla-en-maquina-pendular': {
    preparacion:
      'Espalda apoyada, pies en la plataforma según lo que quieras trabajar: más arriba, más glúteo; '
      + 'más abajo, más cuádriceps.',
    ejecucion:
      'Baja siguiendo el arco de la máquina hasta abajo y sube empujando. El movimiento guiado deja '
      + 'llegar más abajo sin miedo.',
    fallo:
      'Levantar los talones al bajar. Si pasa, sube un poco los pies en la plataforma.',
  },

  'sentadilla-en-maquina-de-cinturon': {
    preparacion:
      'Cinturón en la cadera, no en la cintura, y cadena tensa antes de empezar. Pies a la anchura '
      + 'de los hombros.',
    ejecucion:
      'Baja con el tronco vertical y sube empujando el suelo. Al colgar el peso de la cadera, la '
      + 'espalda no lleva nada: es la sentadilla para días en los que la lumbar está tocada.',
    fallo:
      'Ponerse el cinturón en la cintura. Va sobre las crestas de la cadera, o se sube y aprieta las '
      + 'costillas.',
  },

  'sentadilla-sissy': {
    preparacion:
      'De pie, sujeto a algo con una mano, talones elevados si quieres. Rodillas juntas.',
    ejecucion:
      'Deja caer las rodillas hacia delante inclinando el tronco atrás en línea con los muslos, y '
      + 'sube. Estira el cuádriceps como pocos ejercicios.',
    fallo:
      'Hacerlas con la rodilla dolorida o sin calentar. Es el ejercicio que más exige a la rodilla '
      + 'del catálogo: empieza con poco recorrido.',
  },

  'sentadilla-libre': {
    preparacion:
      'Pies a la anchura de los hombros, brazos al frente para equilibrar, pecho alto.',
    ejecucion:
      'Baja hasta abajo del todo manteniendo los talones en el suelo y sube empujando. Sirve para '
      + 'calentar y para aprender el recorrido.',
    fallo:
      'Bajar rápido y rebotar abajo. Aunque no haya peso, el recorrido se controla.',
  },

  'sentadilla-con-salto': {
    preparacion:
      'Como una sentadilla libre, pero con la intención de saltar. Al principio de la sesión, con '
      + 'las piernas frescas.',
    ejecucion:
      'Baja media sentadilla y salta lo más alto que puedas; cae con las rodillas algo dobladas y '
      + 'encadena la siguiente amortiguando.',
    fallo:
      'Caer con las piernas rígidas. La caída se amortigua doblando: es donde se hace daño la '
      + 'rodilla.',
  },

  'sentadilla-isometrica-en-pared': {
    preparacion:
      'Espalda pegada a la pared, rodillas a 90 grados y pies debajo de las rodillas. Se apunta el '
      + 'tiempo.',
    ejecucion:
      'Aguanta la posición sin apoyar las manos en los muslos, respirando tranquilo, hasta que el '
      + 'cuádriceps diga basta.',
    fallo:
      'Ir subiendo poco a poco sin darse cuenta. Si la rodilla se abre más de 90 grados, el reloj no '
      + 'cuenta.',
  },

  'sentadilla-a-una-pierna-pistol': {
    preparacion:
      'De pie sobre una pierna, la otra estirada al frente, brazos adelante para equilibrar. Se '
      + 'apunta por lado. Si no llegas, sujétate a una anilla o baja a un cajón.',
    ejecucion:
      'Baja controlando hasta abajo manteniendo el talón en el suelo y la otra pierna sin tocar, y '
      + 'sube empujando.',
    fallo:
      'Intentarla entera sin movilidad de tobillo. Empieza bajando a un cajón alto y ve bajando la '
      + 'altura.',
  },

  'sentadilla-con-banda-elastica': {
    preparacion:
      'Banda por debajo de los pies y sobre los hombros, o una banda pequeña por encima de las '
      + 'rodillas para que te obligue a abrirlas.',
    ejecucion:
      'Baja hasta la paralela y sube empujando el suelo y abriendo las rodillas contra la banda.',
    fallo:
      'Dejar que la banda cierre las rodillas hacia dentro. La banda está ahí para que las abras, no '
      + 'para que te venza.',
  },

  'prensa-de-piernas-45': {
    preparacion:
      'Espalda y cadera pegadas al respaldo, pies a la anchura de los hombros a media plataforma. '
      + 'Quita los seguros con las piernas ya empujando.',
    ejecucion:
      'Baja hasta que las rodillas lleguen cerca del pecho sin que la cadera se despegue del '
      + 'respaldo, y empuja sin bloquear las rodillas de golpe.',
    fallo:
      'Bajar tanto que la cadera se levante y la lumbar se redondee. Ese es el punto exacto donde se '
      + 'lesiona la espalda en la prensa: para justo antes.',
  },

  'prensa-de-piernas-horizontal': {
    preparacion:
      'Sentado con la espalda apoyada, pies a la anchura de los hombros en la plataforma.',
    ejecucion:
      'Empuja hasta casi estirar y vuelve controlando hasta donde la cadera siga apoyada.',
    fallo:
      'Agarrarse a las asas y tirar del tronco. Las manos sólo sujetan.',
  },

  'prensa-de-piernas-vertical': {
    preparacion:
      'Tumbado bajo la plataforma, cadera pegada al asiento, pies arriba a la anchura de los '
      + 'hombros. Comprueba dos veces los seguros: aquí el peso está justo encima.',
    ejecucion:
      'Baja controlando hasta que las rodillas se acerquen al pecho y empuja hacia arriba.',
    fallo:
      'Bajar hasta que la cadera se despegue. En esta versión la lumbar es lo primero que se '
      + 'redondea.',
  },

  'prensa-de-piernas-a-una-pierna': {
    preparacion:
      'Un pie en el centro de la plataforma, el otro apoyado en el suelo o al lado. Cadera pegada al '
      + 'respaldo. Se apunta por lado.',
    ejecucion:
      'Baja controlando y empuja con la pierna sin dejar que la rodilla se meta hacia dentro.',
    fallo:
      'Poner el pie descentrado, lo que hace que la plataforma suba torcida. Céntralo antes de '
      + 'empezar.',
  },

  'extension-de-cuadriceps-en-maquina': {
    preparacion:
      'Asiento y respaldo ajustados para que la rodilla coincida con el eje de la máquina y el '
      + 'rodillo quede sobre el tobillo, no sobre la espinilla.',
    ejecucion:
      'Estira las rodillas hasta arriba, aprieta un segundo y baja controlando sin dejar que las '
      + 'placas descansen.',
    fallo:
      'Lanzar el peso con un tirón y dejarlo caer. Con la rodilla estirada y el peso lejos, la '
      + 'palanca es enorme: el tirón se lo lleva la articulación.',
  },

  'extension-de-cuadriceps-a-una-pierna': {
    preparacion:
      'Igual que a dos piernas pero con una sola. Se apunta por lado. Sirve para igualar diferencias '
      + 'entre piernas.',
    ejecucion:
      'Estira la rodilla hasta arriba, aprieta y baja despacio.',
    fallo:
      'Girar la cadera para ayudarse. La cadera se queda cuadrada en el asiento.',
  },

  'zancadas-con-mancuernas': {
    preparacion:
      'De pie con una mancuerna en cada mano, pies juntos, pecho alto. Se apunta por lado.',
    ejecucion:
      'Da un paso largo adelante y baja hasta que la rodilla de atrás casi toque el suelo y el muslo '
      + 'de delante quede paralelo. Empuja con la pierna de delante para volver.',
    fallo:
      'Dar un paso corto, con lo que la rodilla de delante se adelanta al pie y toda la carga va a '
      + 'la rodilla. Paso largo.',
  },

  'zancadas-con-barra': {
    preparacion:
      'Barra sobre los hombros como en la sentadilla, pies juntos. Se apunta por lado.',
    ejecucion:
      'Paso largo adelante, baja hasta la paralela y vuelve empujando con la pierna de delante, '
      + 'manteniendo el tronco vertical.',
    fallo:
      'Inclinar el tronco adelante al bajar. Con la barra arriba eso descoloca el peso y te desequi'
      + 'libra.',
  },

  'zancadas-caminando': {
    preparacion:
      'Mancuernas a los lados, espacio libre por delante para varios pasos. Se apunta por lado.',
    ejecucion:
      'Avanza dando zancadas largas, bajando hasta la paralela en cada paso y empujando para pasar a '
      + 'la siguiente sin pararte del todo.',
    fallo:
      'Ir mirando al suelo con el tronco caído. Mirada al frente y pecho alto, o la espalda acaba '
      + 'llevando la serie.',
  },

  'zancadas-inversas': {
    preparacion:
      'Mancuernas a los lados, pies juntos. Se apunta por lado. Es la versión más amable con la '
      + 'rodilla que las zancadas hacia delante.',
    ejecucion:
      'Da un paso largo hacia atrás, baja hasta que la rodilla de atrás casi toque el suelo y vuelve '
      + 'empujando con la pierna de delante, que no se ha movido.',
    fallo:
      'Dejar caer la rodilla de atrás contra el suelo. Se baja hasta casi tocar, controlando.',
  },

  'subida-al-cajon-con-mancuernas': {
    preparacion:
      'Cajón a la altura de la rodilla o algo menos, mancuernas a los lados, un pie entero encima '
      + 'del cajón. Se apunta por lado.',
    ejecucion:
      'Sube empujando sólo con la pierna de arriba hasta quedarte de pie en el cajón, y baja '
      + 'controlando con la misma pierna.',
    fallo:
      'Impulsarse con la pierna de abajo dando un salto. Si necesitas el impulso, baja la altura del '
      + 'cajón.',
  },

  // ─────────────────────────── Isquiotibiales ───────────────────────────

  'peso-muerto-rumano-con-barra': {
    preparacion:
      'De pie con la barra en las manos, agarre prono a la anchura de los hombros, rodillas apenas '
      + 'dobladas y fijas. Pecho alto y espalda recta: aquí la espalda no se redondea nunca.',
    ejecucion:
      'Baja la barra rozando los muslos echando la cadera atrás, hasta notar el estiramiento en la '
      + 'parte de atrás del muslo, normalmente a media espinilla. Sube estirando la cadera y '
      + 'apretando el glúteo arriba.',
    fallo:
      'Doblar las rodillas y convertirlo en un peso muerto convencional. El rumano se define por eso: '
      + 'la rodilla casi no se mueve y lo que trabaja es la cadera.',
  },

  'peso-muerto-rumano-con-mancuernas': {
    preparacion:
      'Una mancuerna en cada mano por delante de los muslos, rodillas apenas dobladas, espalda recta.',
    ejecucion:
      'Baja las mancuernas pegadas a las piernas llevando la cadera atrás, y sube estirando la cadera.',
    fallo:
      'Separar las mancuernas del cuerpo. Cuanto más lejos van del muslo, más carga la lumbar.',
  },

  'peso-muerto-rumano-en-multipower': {
    preparacion:
      'Barra en la guía a la altura de la cadera, de pie con los pies debajo, rodillas casi '
      + 'estiradas.',
    ejecucion:
      'Baja siguiendo la guía llevando la cadera atrás hasta notar el estiramiento, y sube estirando '
      + 'la cadera.',
    fallo:
      'Ponerse lejos de la guía, con lo que la barra baja separada del cuerpo. Pégate a la barra.',
  },

  'peso-muerto-rumano-a-una-pierna': {
    preparacion:
      'De pie sobre una pierna con la otra algo atrás, una mancuerna en la mano contraria o en las '
      + 'dos. Se apunta por lado.',
    ejecucion:
      'Baja el tronco llevando la pierna libre atrás hasta formar una T, con la cadera cuadrada y la '
      + 'espalda recta. Sube apretando el glúteo.',
    fallo:
      'Abrir la cadera de la pierna que sube. La cadera se queda mirando al suelo: si se abre, el '
      + 'isquio deja de estirarse.',
  },

  'peso-muerto-rigido-con-barra': {
    preparacion:
      'Barra en las manos con las piernas completamente estiradas y los pies juntos o casi. Es la '
      + 'versión más exigente para el isquio y la que menos peso admite.',
    ejecucion:
      'Baja la barra con las piernas rectas hasta donde llegue la flexibilidad sin redondear la '
      + 'espalda, y sube estirando la cadera.',
    fallo:
      'Bajar hasta el suelo a base de redondear la espalda. Hasta donde llegue el isquio; ni un '
      + 'centímetro más.',
  },

  'curl-femoral-tumbado-en-maquina': {
    preparacion:
      'Tumbado boca abajo con la rodilla justo en el borde del banco y el rodillo sobre el tendón de '
      + 'Aquiles, no sobre el gemelo. Cadera pegada al banco.',
    ejecucion:
      'Dobla las rodillas llevando los talones al glúteo, aprieta arriba y baja controlando hasta '
      + 'casi estirar.',
    fallo:
      'Levantar la cadera del banco para llegar más arriba. Si la cadera se levanta, baja el peso.',
  },

  'curl-femoral-sentado-en-maquina': {
    preparacion:
      'Sentado con la espalda apoyada, el rodillo sobre la parte de atrás del tobillo y el rodillo '
      + 'de los muslos bien ajustado. Con la cadera flexionada el isquio empieza estirado, y por eso '
      + 'esta versión se nota distinta.',
    ejecucion:
      'Dobla las rodillas hasta el final, aprieta y vuelve controlando.',
    fallo:
      'No ajustar el rodillo de los muslos, con lo que las piernas se levantan y se pierde la mitad '
      + 'del recorrido.',
  },

  'curl-femoral-de-pie-en-maquina': {
    preparacion:
      'De pie apoyado en el soporte, una pierna sujeta y la otra con el rodillo detrás del tobillo. '
      + 'Se apunta por lado.',
    ejecucion:
      'Dobla la rodilla llevando el talón al glúteo, aprieta y baja despacio.',
    fallo:
      'Mover la cadera adelante y atrás. La cadera se queda pegada al soporte; sólo se dobla la '
      + 'rodilla.',
  },

  'curl-femoral-con-banda-elastica': {
    preparacion:
      'Banda anclada baja por detrás y enganchada en el tobillo, tumbado boca abajo o de pie.',
    ejecucion:
      'Dobla la rodilla contra la banda hasta arriba y vuelve frenando la tensión.',
    fallo:
      'Dejar que la banda estire la pierna de golpe. La vuelta es la parte que más trabaja el isquio.',
  },

  'curl-nordico': {
    preparacion:
      'De rodillas con los tobillos sujetos por un compañero, una máquina o algo firme. Cuerpo en '
      + 'línea desde las rodillas a la cabeza.',
    ejecucion:
      'Deja caer el cuerpo adelante lo más despacio posible frenando con los isquios, y usa las manos '
      + 'para amortiguar y empujar de vuelta.',
    fallo:
      'Doblar la cadera al caer. El cuerpo baja recto como una tabla; si la cadera se dobla, el isquio '
      + 'ya no frena nada.',
  },

  'curl-femoral-con-fitball': {
    preparacion:
      'Tumbado boca arriba con los talones en la pelota y la cadera levantada, cuerpo en línea desde '
      + 'los hombros a los talones.',
    ejecucion:
      'Rueda la pelota hacia el glúteo doblando las rodillas manteniendo la cadera arriba, y estira '
      + 'despacio.',
    fallo:
      'Dejar caer la cadera al estirar las piernas. La cadera se queda arriba durante toda la serie.',
  },

  'elevacion-gluteo-femoral-ghr': {
    preparacion:
      'Rodillas en el apoyo, tobillos entre los rodillos y cuerpo en línea. Ajusta la distancia para '
      + 'que la rodilla quede justo detrás de la almohadilla.',
    ejecucion:
      'Baja el cuerpo adelante controlando con los isquios y sube tirando con ellos, sin doblar la '
      + 'cadera.',
    fallo:
      'Ayudarse doblando la cadera en la subida. Si no sale entero, apoya las manos y ve ganando '
      + 'recorrido.',
  },

  'buenos-dias-con-barra': {
    preparacion:
      'Barra sobre los hombros como en la sentadilla, pies a la anchura de las caderas, rodillas '
      + 'apenas dobladas. Empieza con la barra vacía: es un movimiento que engaña.',
    ejecucion:
      'Inclina el tronco adelante llevando la cadera atrás, con la espalda recta, hasta notar el '
      + 'estiramiento del isquio. Sube estirando la cadera.',
    fallo:
      'Bajar más de lo que la espalda aguanta recta. En cuanto la lumbar se redondea con la barra en '
      + 'los hombros, el riesgo se dispara.',
  },

  // ─────────────────────────────── Glúteos ───────────────────────────────

  'hip-thrust-con-barra': {
    preparacion:
      'Espalda alta apoyada en el banco, barra sobre la cadera con una almohadilla, pies a la '
      + 'anchura de los hombros con las rodillas a 90 grados cuando estés arriba. Barbilla metida.',
    ejecucion:
      'Empuja el suelo con los talones y sube la cadera hasta que el cuerpo forme una línea de los '
      + 'hombros a las rodillas, apretando el glúteo arriba un segundo. Baja controlando.',
    fallo:
      'Subir a base de arquear la lumbar en vez de apretar el glúteo. Mete la barbilla, aprieta el '
      + 'abdomen y para donde el glúteo llegue.',
  },

  'hip-thrust-en-maquina': {
    preparacion:
      'Cinturón o almohadilla sobre la cadera, espalda apoyada y pies firmes con las rodillas a 90 '
      + 'grados en el punto alto.',
    ejecucion:
      'Empuja la cadera arriba hasta extender del todo, aprieta y baja controlando.',
    fallo:
      'Recorrido corto con mucho peso. El glúteo trabaja arriba: si no llegas a extender la cadera, '
      + 'el ejercicio se queda a medias.',
  },

  'hip-thrust-a-una-pierna': {
    preparacion:
      'Espalda alta en el banco, una pierna apoyada y la otra levantada o estirada. Se apunta por '
      + 'lado.',
    ejecucion:
      'Sube la cadera con una sola pierna hasta la extensión completa, apretando arriba, y baja '
      + 'despacio.',
    fallo:
      'Dejar caer la cadera de un lado. Las dos crestas de la cadera suben a la misma altura.',
  },

  'puente-de-gluteo': {
    preparacion:
      'Tumbado boca arriba, rodillas dobladas, pies a la anchura de las caderas cerca del glúteo, '
      + 'brazos al lado.',
    ejecucion:
      'Sube la cadera apretando el glúteo hasta formar una línea entre hombros y rodillas, aguanta un '
      + 'segundo y baja sin apoyar del todo.',
    fallo:
      'Empujar con la punta del pie. El empuje sale del talón y del medio del pie.',
  },

  'puente-de-gluteo-con-barra': {
    preparacion:
      'Tumbado en el suelo con la barra sobre la cadera y una almohadilla, rodillas dobladas y pies '
      + 'apoyados.',
    ejecucion:
      'Sube la cadera hasta extender del todo, aprieta y baja controlando hasta rozar el suelo.',
    fallo:
      'Empezar sin colocar bien la almohadilla. Con la barra directa sobre la cadera no hay serie que '
      + 'aguante.',
  },

  'patada-de-gluteo-en-maquina': {
    preparacion:
      'Apoyado en el soporte con el tronco algo inclinado, una pierna en la plataforma o el rodillo. '
      + 'Se apunta por lado.',
    ejecucion:
      'Empuja la pierna hacia atrás estirando la cadera, aprieta el glúteo al final y vuelve despacio.',
    fallo:
      'Arquear la lumbar para llegar más atrás. El recorrido lo pone la cadera; la espalda se queda '
      + 'quieta.',
  },

  'patada-de-gluteo-en-polea': {
    preparacion:
      'Polea baja con tobillera, de frente a la máquina y agarrado al chasis, tronco algo inclinado. '
      + 'Se apunta por lado.',
    ejecucion:
      'Lleva la pierna atrás con la rodilla algo doblada, aprieta el glúteo y vuelve controlando.',
    fallo:
      'Subir la pierna todo lo que dé la espalda. Cuando la lumbar empieza a arquearse, el recorrido '
      + 'se ha terminado.',
  },

  'patada-de-gluteo-con-banda-elastica': {
    preparacion:
      'Banda anclada baja y enganchada al tobillo, o en cuadrupedia con la banda en el pie. Se apunta '
      + 'por lado.',
    ejecucion:
      'Empuja la pierna atrás contra la banda, aprieta el glúteo y vuelve frenando.',
    fallo:
      'Compensar con la lumbar cuando la banda aprieta mucho. Mejor banda más blanda y cadera quieta.',
  },

  'extension-de-cadera-en-maquina': {
    preparacion:
      'Según la máquina, tronco apoyado y pierna en el rodillo con la cadera flexionada.',
    ejecucion:
      'Estira la cadera empujando hacia atrás, aprieta el glúteo al final y vuelve controlando.',
    fallo:
      'Usar la lumbar para terminar el recorrido. Si la espalda se arquea, el glúteo ya no da más.',
  },

  'pull-through-en-polea': {
    preparacion:
      'Polea baja con cuerda, de espaldas a la máquina y con la cuerda entre las piernas, un paso '
      + 'adelante, cadera atrás.',
    ejecucion:
      'Sube estirando la cadera hasta ponerte de pie apretando el glúteo, y baja llevando la cadera '
      + 'atrás con la espalda recta.',
    fallo:
      'Tirar con los brazos. Los brazos son una cuerda más: el movimiento sale de la cadera.',
  },

  'sentadilla-sumo-con-mancuerna': {
    preparacion:
      'Pies muy abiertos con las puntas hacia fuera, una mancuerna colgando entre las piernas con las '
      + 'dos manos. Pecho alto.',
    ejecucion:
      'Baja entre las piernas manteniendo el tronco vertical y las rodillas abiertas, y sube '
      + 'apretando glúteo y aductores.',
    fallo:
      'Dejar que las rodillas se cierren hacia dentro. La rodilla mira a la punta del pie todo el '
      + 'recorrido.',
  },

  'hiperextension-inversa': {
    preparacion:
      'Tumbado boca abajo en el banco romano o en un banco alto, cadera en el borde, agarrado con las '
      + 'manos y piernas colgando.',
    ejecucion:
      'Sube las piernas juntas estirando la cadera hasta la línea del cuerpo, aprieta el glúteo y baja '
      + 'controlando.',
    fallo:
      'Subir las piernas por encima de la línea del cuerpo con impulso. Eso sólo lo aguanta la lumbar.',
  },

  'maquina-de-gluteo-de-pie': {
    preparacion:
      'De pie con el tronco apoyado en el soporte y el pie en la plataforma o el rodillo. Se apunta '
      + 'por lado.',
    ejecucion:
      'Empuja hacia atrás y arriba estirando la cadera, aprieta y vuelve controlando.',
    fallo:
      'Despegar el tronco del soporte para tirar con la espalda. El apoyo está para no hacer eso.',
  },

  // ────────────────────────────── Aductores ──────────────────────────────

  'aduccion-de-cadera-en-maquina': {
    preparacion:
      'Sentado con la espalda apoyada y las piernas abiertas en los soportes, en el punto en el que '
      + 'notas estiramiento pero no tirón. Ajusta la apertura de inicio: es lo que casi nadie mira.',
    ejecucion:
      'Junta las piernas apretando, aguanta un segundo con ellas juntas y vuelve abriendo despacio '
      + 'hasta el estiramiento.',
    fallo:
      'Abrir de golpe al final de la serie y dejar que el peso estire la ingle. Los aductores se '
      + 'lesionan justo así.',
  },

  'aduccion-de-cadera-en-polea': {
    preparacion:
      'Polea baja con tobillera en la pierna de dentro, de lado a la máquina, agarrado a algo para el '
      + 'equilibrio. Se apunta por lado.',
    ejecucion:
      'Lleva la pierna cruzando por delante de la otra, aprieta y vuelve controlando la apertura.',
    fallo:
      'Balancear la pierna con impulso. Se lleva y se trae, sin lanzar.',
  },

  'aduccion-con-banda-elastica': {
    preparacion:
      'Banda anclada a un lado a la altura del tobillo, enganchada al tobillo de la pierna de dentro. '
      + 'Se apunta por lado.',
    ejecucion:
      'Junta la pierna contra la banda hasta cruzar la línea del cuerpo y vuelve frenando.',
    fallo:
      'Girar el pie hacia fuera para llegar más lejos. La punta del pie mira al frente.',
  },

  'sentadilla-cosaco': {
    preparacion:
      'Pies muy separados, manos delante para equilibrar. Se apunta por lado. Empieza sin peso: pide '
      + 'movilidad de cadera y tobillo.',
    ejecucion:
      'Desplaza el peso a un lado doblando esa rodilla hasta abajo, con la otra pierna estirada y la '
      + 'punta del pie hacia arriba. Vuelve al centro empujando.',
    fallo:
      'Bajar más de lo que da la cadera y acabar con la espalda redondeada. Baja hasta donde el pecho '
      + 'siga alto.',
  },

  'zancada-lateral-con-mancuernas': {
    preparacion:
      'De pie con mancuernas a los lados, pies juntos. Se apunta por lado.',
    ejecucion:
      'Da un paso largo lateral y baja doblando esa rodilla, con la otra pierna estirada y el pecho '
      + 'alto. Empuja para volver al centro.',
    fallo:
      'Doblar las dos rodillas y convertirlo en una sentadilla abierta. Una pierna trabaja y la otra '
      + 'se queda estirada.',
  },

  'plancha-copenhague': {
    preparacion:
      'De lado con el antebrazo apoyado en el suelo y la pierna de arriba apoyada en un banco por la '
      + 'cara interna del muslo o del tobillo. Se apunta el tiempo, por lado.',
    ejecucion:
      'Sube la cadera y mantén el cuerpo en línea apretando la pierna de arriba contra el banco. '
      + 'Aguanta respirando tranquilo.',
    fallo:
      'Empezar apoyando el tobillo. Empieza apoyando la rodilla o medio muslo, que la versión con el '
      + 'tobillo es muy exigente para la ingle.',
  },

  // ────────────────────────────── Abductores ──────────────────────────────

  'abduccion-de-cadera-en-maquina': {
    preparacion:
      'Sentado con la espalda apoyada y las piernas juntas en los soportes. Si te inclinas un poco '
      + 'adelante trabajas más el glúteo medio; erguido, más el tensor.',
    ejecucion:
      'Abre las piernas hasta el final del recorrido, aprieta un segundo y cierra despacio.',
    fallo:
      'Ayudarse dando tirones con el tronco. La espalda se queda apoyada y quieta.',
  },

  'abduccion-de-cadera-en-polea': {
    preparacion:
      'Polea baja con tobillera en la pierna de fuera, de lado a la máquina y agarrado para el '
      + 'equilibrio. Se apunta por lado.',
    ejecucion:
      'Abre la pierna hacia el lado sin girar la cadera, aprieta arriba y vuelve controlando.',
    fallo:
      'Inclinar el tronco al lado contrario para subir más la pierna. El tronco se queda vertical.',
  },

  'abduccion-de-cadera-tumbado': {
    preparacion:
      'Tumbado de lado, cuerpo en línea, la pierna de abajo algo doblada para estabilizar. Se apunta '
      + 'por lado.',
    ejecucion:
      'Sube la pierna de arriba estirada con la punta del pie mirando al frente o algo hacia abajo, y '
      + 'baja despacio.',
    fallo:
      'Girar la cadera atrás y subir la pierna adelante. Así trabaja el cuádriceps: la cadera se '
      + 'queda apilada.',
  },

  'paso-lateral-con-banda-elastica': {
    preparacion:
      'Banda pequeña por encima de las rodillas o en los tobillos, media sentadilla y pies a la '
      + 'anchura de los hombros.',
    ejecucion:
      'Da pasos laterales manteniendo la tensión de la banda y sin juntar del todo los pies, con la '
      + 'cadera baja todo el rato.',
    fallo:
      'Ponerse de pie entre pasos. La cadera se queda baja: en cuanto te yergues, el glúteo descansa.',
  },

  'elevacion-de-cadera-lateral': {
    preparacion:
      'De lado, apoyado en el antebrazo y con las rodillas dobladas o las piernas estiradas. Se '
      + 'apunta por lado.',
    ejecucion:
      'Sube la cadera del suelo hasta poner el cuerpo en línea, aprieta el costado y baja controlando '
      + 'sin apoyar del todo.',
    fallo:
      'Rotar el tronco al subir. El pecho mira al frente durante todo el recorrido.',
  },

  // ─────────────────────────────── Gemelos ───────────────────────────────

  'elevacion-de-talones-de-pie-en-maquina': {
    preparacion:
      'Hombros bajo las almohadillas, la parte delantera del pie en el escalón con los talones al '
      + 'aire, piernas estiradas.',
    ejecucion:
      'Baja el talón todo lo que dé hasta notar el estiramiento, y sube hasta la punta del pie '
      + 'apretando arriba un segundo. Despacio: el gemelo responde al recorrido completo, no al '
      + 'rebote.',
    fallo:
      'Hacer botes rápidos de dos dedos de recorrido. El tendón rebota, el músculo no trabaja.',
  },

  'elevacion-de-talones-sentado-en-maquina': {
    preparacion:
      'Sentado con las almohadillas sobre las rodillas y la parte delantera del pie en el escalón. Con '
      + 'la rodilla doblada trabaja más el sóleo, que es el que sostiene todo el día.',
    ejecucion:
      'Baja el talón hasta el estiramiento y sube hasta arriba, apretando.',
    fallo:
      'Recorrido corto por llevar mucho peso. Baja los kilos y baja el talón.',
  },

  'elevacion-de-talones-en-prensa': {
    preparacion:
      'En la prensa con la parte delantera del pie en el borde de la plataforma y las piernas casi '
      + 'estiradas. Seguros puestos, porque los pies pueden resbalar.',
    ejecucion:
      'Empuja con la punta del pie estirando el tobillo y vuelve dejando bajar el talón hasta el '
      + 'estiramiento.',
    fallo:
      'Poner tan poco pie en la plataforma que resbale. Que apoye toda la almohadilla del pie.',
  },

  'elevacion-de-talones-en-multipower': {
    preparacion:
      'Barra sobre los hombros en la guía y un escalón o disco bajo la punta de los pies.',
    ejecucion:
      'Sube a la punta del pie, aprieta arriba y baja el talón hasta el estiramiento.',
    fallo:
      'Doblar las rodillas para ayudarse. Las piernas se quedan estiradas: si se doblan, es un salto.',
  },

  'elevacion-de-talones-con-mancuernas': {
    preparacion:
      'De pie con una mancuerna en cada mano y la punta de los pies en un escalón o disco.',
    ejecucion:
      'Sube a la punta y baja el talón hasta el estiramiento, controlando.',
    fallo:
      'Perder el equilibrio y acortar el recorrido. Apóyate en la pared con un dedo si hace falta.',
  },

  'elevacion-de-talones-a-una-pierna': {
    preparacion:
      'De pie sobre una pierna con la punta del pie en un escalón, sujeto a algo con una mano. Se '
      + 'apunta por lado.',
    ejecucion:
      'Sube a la punta del pie hasta arriba, aprieta y baja el talón hasta el estiramiento.',
    fallo:
      'Empujar con la mano que se apoya. La mano sólo equilibra.',
  },

  'elevacion-de-talones-tipo-burro': {
    preparacion:
      'Tronco inclinado adelante con la cadera flexionada, hombros bajo la almohadilla y la punta de '
      + 'los pies en el escalón. Con el isquio estirado el gemelo trabaja distinto.',
    ejecucion:
      'Sube a la punta del pie apretando arriba y baja el talón hasta el estiramiento.',
    fallo:
      'Redondear la espalda al inclinarse. Cadera atrás y espalda recta.',
  },

  'flexion-dorsal-de-tobillo-con-banda': {
    preparacion:
      'Sentado con la banda anclada delante y enganchada en el empeine, pierna estirada.',
    ejecucion:
      'Tira la punta del pie hacia la espinilla contra la banda, aprieta y vuelve despacio. Es el '
      + 'músculo de delante de la espinilla, el que casi nadie entrena y el que evita más de un '
      + 'tropiezo.',
    fallo:
      'Mover la pierna entera en vez del tobillo. La rodilla se queda quieta.',
  },

  // ─────────────────────────────── Abdomen ───────────────────────────────

  'plancha': {
    preparacion:
      'Antebrazos en el suelo con los codos justo debajo de los hombros, pies a la anchura de las '
      + 'caderas. Cuerpo en línea recta de la cabeza a los talones. Se apunta el tiempo.',
    ejecucion:
      'Aprieta glúteo y abdomen como si fueras a recibir un puñetazo, mete un poco la cadera y '
      + 'respira sin soltar la tensión. Cuando la cadera empieza a caer, la serie ha terminado.',
    fallo:
      'Aguantar minutos con la cadera hundida mirando el reloj. Treinta segundos bien apretado valen '
      + 'más que tres minutos colgando de la lumbar.',
  },

  'plancha-lateral': {
    preparacion:
      'De lado con el codo debajo del hombro, pies apilados o escalonados, cuerpo en línea. Se apunta '
      + 'el tiempo, por lado.',
    ejecucion:
      'Sube la cadera hasta poner el cuerpo recto y aguanta sin dejarla caer, con el cuello relajado.',
    fallo:
      'Rotar el pecho hacia el suelo. El pecho mira al frente; si rota, apoya la rodilla de abajo y '
      + 'baja la exigencia.',
  },

  'plancha-con-lastre': {
    preparacion:
      'En posición de plancha con un disco sobre la espalda alta, colocado por alguien o antes de '
      + 'subir. Se apuntan los kilos y el tiempo.',
    ejecucion:
      'Aguanta con el cuerpo en línea y el abdomen apretado, respirando corto.',
    fallo:
      'Ponerse peso antes de aguantar bien la plancha normal. El disco sólo hace más evidente la '
      + 'cadera caída.',
  },

  'encogimientos': {
    preparacion:
      'Tumbado boca arriba con las rodillas dobladas y las manos en el pecho o al lado de la cabeza, '
      + 'sin tirar del cuello.',
    ejecucion:
      'Enrolla la columna despegando los hombros del suelo llevando las costillas hacia la cadera, y '
      + 'baja controlando. El recorrido es corto a propósito.',
    fallo:
      'Tirar de la cabeza con las manos. Si el cuello se dobla antes que el abdomen, cruza las manos '
      + 'sobre el pecho.',
  },

  'encogimientos-abdominales-en-maquina': {
    preparacion:
      'Sentado con la espalda apoyada, el pecho contra la almohadilla y las manos en las agarraderas. '
      + 'Ajusta la altura para que el movimiento salga del abdomen y no de la cadera.',
    ejecucion:
      'Enrolla el tronco hacia delante acercando las costillas a la cadera, aprieta y vuelve '
      + 'controlando.',
    fallo:
      'Tirar con los brazos y la cadera. Las manos sólo sujetan; lo que se acorta es la distancia '
      + 'entre esternón y ombligo.',
  },

  'encogimientos-en-polea-arrodillado': {
    preparacion:
      'De rodillas de espaldas a la polea alta, la cuerda sujeta a los lados de la cabeza y los codos '
      + 'cerca. Cadera quieta.',
    ejecucion:
      'Enrolla el tronco llevando los codos hacia los muslos, aprieta abajo y vuelve controlando sin '
      + 'perder la tensión.',
    fallo:
      'Hacerlo con la cadera, como una reverencia. La cadera se queda en su sitio y lo que se dobla '
      + 'es la columna.',
  },

  'encogimientos-inversos': {
    preparacion:
      'Tumbado boca arriba con las manos al lado del cuerpo o agarrado por detrás de la cabeza, '
      + 'rodillas dobladas hacia el pecho.',
    ejecucion:
      'Despega la cadera del suelo llevando las rodillas hacia la cara, y baja controlando sin apoyar '
      + 'del todo.',
    fallo:
      'Lanzar las piernas con impulso. Sube poco y despacio: es un movimiento pequeño.',
  },

  'elevacion-de-piernas-colgado': {
    preparacion:
      'Colgado de la barra con los hombros activos, piernas juntas y estiradas.',
    ejecucion:
      'Sube las piernas juntas hasta la altura de la cadera o más, enrollando un poco la pelvis al '
      + 'final. Baja controlando sin balancearte.',
    fallo:
      'Coger balanceo y usarlo para subir. Si te columpias, dobla las rodillas y haz la versión más '
      + 'fácil hasta controlar.',
  },

  'elevacion-de-rodillas-en-paralelas': {
    preparacion:
      'Apoyado en las paralelas o en el soporte de codos, cuerpo colgado y hombros firmes.',
    ejecucion:
      'Sube las rodillas hacia el pecho enrollando la pelvis al final, y baja despacio.',
    fallo:
      'Subir sólo las rodillas dejando la cadera quieta. El trabajo del abdomen está justo en ese '
      + 'último gesto de enrollar la pelvis.',
  },

  'elevacion-de-piernas-tumbado': {
    preparacion:
      'Tumbado boca arriba, manos bajo el glúteo o al lado, piernas estiradas y lumbar pegada al '
      + 'suelo.',
    ejecucion:
      'Sube las piernas juntas hasta la vertical y bájalas despacio hasta donde puedas mantener la '
      + 'lumbar pegada al suelo.',
    fallo:
      'Bajar las piernas hasta el suelo arqueando la lumbar. El límite es la espalda, no las piernas: '
      + 'si se despega, no bajes tanto.',
  },

  'punta-de-pies-a-la-barra': {
    preparacion:
      'Colgado de la barra con los hombros activos y algo de tensión en el cuerpo. Requiere movilidad '
      + 'y control del balanceo.',
    ejecucion:
      'Sube las piernas juntas y estiradas hasta tocar la barra con los pies, y baja controlando '
      + 'usando el balanceo justo para enlazar.',
    fallo:
      'Intentarlo sin dominar la elevación de piernas a la altura de la cadera. Es el paso previo, y '
      + 'sin él esto sale a base de columpio.',
  },

  'rueda-abdominal': {
    preparacion:
      'De rodillas con la rueda delante, brazos estirados, abdomen y glúteo apretados y la cadera '
      + 'algo metida.',
    ejecucion:
      'Rueda hacia delante todo lo que puedas manteniendo la línea del cuerpo, y vuelve tirando con '
      + 'el abdomen. Empieza con poco recorrido.',
    fallo:
      'Ir tan lejos que la lumbar se arquee. El recorrido acaba donde la cadera empieza a caer, y ese '
      + 'punto es tuyo, no del que hay en el vídeo.',
  },

  'bicicleta-abdominal': {
    preparacion:
      'Tumbado boca arriba, manos junto a la cabeza sin tirar, piernas levantadas con las rodillas '
      + 'dobladas.',
    ejecucion:
      'Lleva un codo hacia la rodilla contraria girando el tronco, estirando la otra pierna, y '
      + 'alterna despacio.',
    fallo:
      'Ir a toda velocidad tirando del cuello. Es un ejercicio lento: el giro sale de las costillas, '
      + 'no de los brazos.',
  },

  'giro-ruso-con-disco': {
    preparacion:
      'Sentado con las rodillas dobladas y el tronco algo inclinado atrás, un disco en las manos.',
    ejecucion:
      'Gira el tronco de un lado al otro llevando el disco cerca del cuerpo, con el movimiento saliendo '
      + 'de las costillas y no de los brazos.',
    fallo:
      'Mover sólo los brazos de lado a lado con el tronco quieto. Si el pecho no gira, el oblicuo no '
      + 'trabaja.',
  },

  'giro-ruso-con-balon-medicinal': {
    preparacion:
      'Sentado con el tronco inclinado atrás y el balón en las manos. Los pies pueden estar en el '
      + 'suelo o levantados.',
    ejecucion:
      'Gira el tronco a un lado, toca el suelo con el balón si llegas, y gira al otro. Controlado.',
    fallo:
      'Redondear la espalda por completo. El pecho se mantiene alto aunque el tronco esté inclinado.',
  },

  'lenador-en-polea': {
    preparacion:
      'Polea alta o baja con asa o cuerda, de lado a la máquina, pies firmes y brazos estirados. Se '
      + 'apunta por lado.',
    ejecucion:
      'Lleva las manos en diagonal cruzando el cuerpo, de arriba a abajo o de abajo a arriba, girando '
      + 'el tronco y dejando que el pie de atrás pivote. Vuelve controlando.',
    fallo:
      'Hacerlo sólo con los brazos. El movimiento nace en la cadera y el tronco; los brazos van de '
      + 'pasajeros.',
  },

  'press-pallof-en-polea': {
    preparacion:
      'Polea a la altura del pecho, de lado, las dos manos en el asa contra el esternón, pies a la '
      + 'anchura de los hombros. Se apunta por lado.',
    ejecucion:
      'Estira los brazos al frente aguantando que el cable te gire, mantén un segundo y vuelve al '
      + 'pecho. El ejercicio es no girar.',
    fallo:
      'Dejar que el tronco rote al estirar los brazos. Si giras, baja el peso: aquí no hay recorrido '
      + 'que valga sin control.',
  },

  'rotacion-de-tronco-en-maquina': {
    preparacion:
      'Sentado con las piernas bien fijadas y el tronco contra los soportes. Empieza con poco peso: '
      + 'la columna gira poco por diseño. Se apunta por lado.',
    ejecucion:
      'Gira el tronco despacio hasta el final del recorrido cómodo y vuelve controlando.',
    fallo:
      'Cargar mucho y girar a lo bruto. Es una de las máquinas donde más fácil es hacerse daño en la '
      + 'zona lumbar.',
  },

  'bandera-dragon': {
    preparacion:
      'Tumbado en un banco agarrado por detrás de la cabeza con las dos manos, cuerpo recto. Es un '
      + 'ejercicio avanzado: antes hay que aguantar el hollow hold.',
    ejecucion:
      'Sube el cuerpo entero recto desde los hombros y bájalo despacio sin que la cadera se doble ni '
      + 'la lumbar se arquee.',
    fallo:
      'Doblar la cadera para que salga. Mejor recorrido corto con el cuerpo recto que uno largo '
      + 'doblado.',
  },

  'hollow-hold': {
    preparacion:
      'Tumbado boca arriba, lumbar pegada al suelo, brazos y piernas estirados y levantados del suelo. '
      + 'Se apunta el tiempo.',
    ejecucion:
      'Aguanta con la lumbar pegada al suelo y la forma de barca, respirando corto. Si la espalda se '
      + 'despega, sube más las piernas o dobla las rodillas.',
    fallo:
      'Aguantar con la lumbar arqueada. Es el error que convierte un buen ejercicio de abdomen en uno '
      + 'malo de espalda.',
  },

  'escalador': {
    preparacion:
      'En posición de plancha alta con las manos debajo de los hombros y el cuerpo en línea. Se apunta '
      + 'el tiempo.',
    ejecucion:
      'Lleva una rodilla al pecho y cambia, alternando rápido pero sin que la cadera suba y baje.',
    fallo:
      'Levantar la cadera para poder ir más rápido. Ritmo que puedas mantener con la cadera quieta.',
  },

  'abdominales-v': {
    preparacion:
      'Tumbado boca arriba, brazos estirados por detrás de la cabeza y piernas estiradas.',
    ejecucion:
      'Sube tronco y piernas a la vez buscando tocar los pies con las manos, formando una V, y baja '
      + 'controlando sin apoyar del todo.',
    fallo:
      'Usar el impulso de los brazos para subir. Si hace falta, dobla las rodillas y haz el recorrido '
      + 'entero de forma controlada.',
  },

  'abdominales-con-lastre': {
    preparacion:
      'Tumbado con las rodillas dobladas y un disco sujeto contra el pecho o por detrás de la cabeza '
      + 'si puedes con más.',
    ejecucion:
      'Enrolla el tronco despegando los hombros y baja controlando, sin soltar el disco del pecho.',
    fallo:
      'Poner el disco detrás de la cabeza y tirar del cuello con él. Empieza con el disco en el pecho.',
  },

  'bicho-muerto': {
    preparacion:
      'Tumbado boca arriba con los brazos hacia el techo y las rodillas dobladas a 90 grados. Lumbar '
      + 'pegada al suelo.',
    ejecucion:
      'Estira un brazo por detrás de la cabeza y la pierna contraria a la vez, sin que la lumbar se '
      + 'despegue, y vuelve. Alterna despacio.',
    fallo:
      'Perder el contacto de la lumbar con el suelo al estirar. Ese contacto es el ejercicio; si se '
      + 'pierde, estira menos.',
  },

  'vacio-abdominal': {
    preparacion:
      'De pie, a cuatro patas o tumbado, con el estómago vacío. Se apunta el tiempo.',
    ejecucion:
      'Suelta todo el aire y mete el ombligo hacia dentro y hacia arriba como si quisieras pegarlo a '
      + 'la columna. Aguanta sin respirar unos segundos, suelta y repite.',
    fallo:
      'Hacerlo después de comer. Es incómodo y no sale; se hace en ayunas o lejos de las comidas.',
  },

  'abdominal-en-maquina-de-rodillos': {
    preparacion:
      'Sentado o de rodillas según la máquina, apoyos ajustados para que el movimiento salga de doblar '
      + 'el tronco.',
    ejecucion:
      'Enrolla el tronco contra la resistencia, aprieta abajo y vuelve controlando.',
    fallo:
      'Empujar con las piernas o los brazos. Si el abdomen no es el que más se queja, algo está mal '
      + 'ajustado.',
  },

  // ─────────────────────────────── Lumbares ───────────────────────────────

  'hiperextensiones-en-banco-romano': {
    preparacion:
      'Almohadilla justo por debajo de la cadera para que puedas doblarte por ahí, tobillos sujetos, '
      + 'cuerpo recto y brazos cruzados en el pecho.',
    ejecucion:
      'Baja el tronco doblando la cadera con la espalda recta, hasta notar el estiramiento, y sube '
      + 'hasta la línea del cuerpo apretando el glúteo. Ni un grado más arriba.',
    fallo:
      'Subir hasta arquearse hacia atrás. Ahí se comprime la lumbar sin ganar nada: el recorrido acaba '
      + 'cuando el cuerpo está recto.',
  },

  'hiperextensiones-con-lastre': {
    preparacion:
      'Igual que sin lastre, con un disco cruzado sobre el pecho. Empieza con cinco o diez kilos.',
    ejecucion:
      'Baja doblando la cadera con la espalda recta y sube hasta la línea del cuerpo.',
    fallo:
      'Sujetar el disco por detrás de la cabeza. La palanca se dispara y la lumbar lo paga.',
  },

  'extension-lumbar-en-maquina': {
    preparacion:
      'Sentado con la espalda apoyada en el respaldo móvil y el cinturón puesto si lo tiene. Ajusta el '
      + 'recorrido antes de empezar.',
    ejecucion:
      'Empuja hacia atrás con la espalda hasta el final del recorrido, aguanta un instante y vuelve '
      + 'controlando.',
    fallo:
      'Empujar con las piernas. En esta máquina lo único que se mueve es el tronco.',
  },

  'superman': {
    preparacion:
      'Tumbado boca abajo con los brazos estirados adelante y las piernas estiradas.',
    ejecucion:
      'Sube brazos y piernas a la vez unos centímetros apretando glúteo y lumbares, aguanta un segundo '
      + 'y baja despacio.',
    fallo:
      'Subir todo lo posible echando la cabeza atrás. Es un movimiento pequeño y el cuello sigue la '
      + 'línea de la espalda.',
  },

  'sujecion-de-peso-muerto': {
    preparacion:
      'Barra cargada en el suelo, agarre firme, y levántala como un peso muerto normal. Se apuntan los '
      + 'kilos y el tiempo.',
    ejecucion:
      'Quédate de pie sujetando la barra con la espalda recta, los hombros atrás y el abdomen '
      + 'apretado, hasta que el agarre o la espalda digan basta.',
    fallo:
      'Aguantar con los hombros caídos y la espalda redondeada. En cuanto la postura se rompe, se deja '
      + 'la barra.',
  },

  // ──────────────────────────────── Cuello ────────────────────────────────

  'flexion-de-cuello-con-disco': {
    preparacion:
      'Tumbado boca arriba en un banco con la cabeza fuera, un disco ligero sobre la frente sujeto con '
      + 'una toalla y las manos.',
    ejecucion:
      'Baja la cabeza atrás despacio y sube metiendo la barbilla al pecho. Recorrido corto y muy '
      + 'controlado.',
    fallo:
      'Poner peso. El cuello se entrena con kilos ridículos y muchas repeticiones lentas; con un disco '
      + 'de dos kilos y medio sobra para empezar.',
  },

  'extension-de-cuello-con-disco': {
    preparacion:
      'Tumbado boca abajo con la cabeza fuera del banco, un disco ligero sobre la nuca sujeto con una '
      + 'toalla.',
    ejecucion:
      'Baja la barbilla hacia el pecho y sube la cabeza hasta la línea del cuerpo, despacio.',
    fallo:
      'Llegar al final del recorrido con un tirón. En el cuello, cualquier movimiento brusco es mala '
      + 'idea.',
  },

  'flexion-de-cuello-con-banda-elastica': {
    preparacion:
      'Banda anclada a la altura de la cabeza y apoyada en la frente o la nuca según la dirección, con '
      + 'una toalla de por medio.',
    ejecucion:
      'Mueve la cabeza contra la banda en un recorrido corto y vuelve frenando.',
    fallo:
      'Elegir una banda dura. La más blanda del cajón es la que toca.',
  },

  'cuello-en-maquina': {
    preparacion:
      'Sentado con la almohadilla apoyada en la frente o la nuca según el ejercicio, espalda apoyada.',
    ejecucion:
      'Mueve la cabeza en el recorrido de la máquina, despacio, y vuelve controlando.',
    fallo:
      'Cargar como si fuera cualquier otra máquina. Sube de kilo en kilo.',
  },

  // ────────────────────────── Cuerpo completo ──────────────────────────

  'cargada-de-fuerza': {
    preparacion:
      'Barra en el suelo sobre la mitad del pie, agarre por fuera de las piernas, cadera atrás, '
      + 'espalda recta y hombros sobre la barra. Es un movimiento técnico: apréndelo con la barra '
      + 'vacía.',
    ejecucion:
      'Tira de la barra pegada al cuerpo, y cuando pase la rodilla extiende cadera, rodillas y '
      + 'tobillos de golpe. Métete debajo girando los codos y recibe la barra en los hombros con las '
      + 'rodillas algo dobladas.',
    fallo:
      'Tirar con los brazos desde el principio. Los brazos son cuerdas hasta la extensión de cadera; '
      + 'si tiras antes, la barra se aleja y ya no hay cargada.',
  },

  'cargada-y-envion': {
    preparacion:
      'Igual que la cargada, con espacio libre por encima. Es el movimiento más técnico del catálogo: '
      + 'sin alguien que te mire, ve muy despacio con el peso.',
    ejecucion:
      'Carga la barra a los hombros, ponte firme, y con un impulso corto de piernas empuja la barra '
      + 'sobre la cabeza hasta estirar los brazos. Baja al hombro amortiguando y al suelo con control.',
    fallo:
      'Encadenar las dos partes sin estabilizarse en el medio. Se carga, se recupera la postura y '
      + 'entonces se empuja.',
  },

  'arrancada-con-barra': {
    preparacion:
      'Agarre muy ancho, barra sobre la mitad del pie, cadera atrás y espalda recta. Pide mucha '
      + 'movilidad de hombro.',
    ejecucion:
      'Tira de la barra pegada al cuerpo y extiende cadera y piernas de golpe; métete debajo recibiendo '
      + 'la barra con los brazos estirados sobre la cabeza y sube.',
    fallo:
      'Hacerla con peso antes de tener la movilidad para sujetar la barra encima con los brazos '
      + 'estirados. Practica esa posición vacía primero.',
  },

  'arrancada-con-mancuerna': {
    preparacion:
      'Mancuerna en el suelo entre los pies, cadera atrás, espalda recta, una mano en el mango. Se '
      + 'apunta por lado.',
    ejecucion:
      'Tira de la mancuerna pegada al cuerpo extendiendo la cadera con fuerza y termina con el brazo '
      + 'estirado sobre la cabeza. Baja controlando.',
    fallo:
      'Levantarla a fuerza de hombro. El impulso viene de la cadera; el brazo sólo guía.',
  },

  'cargada-con-mancuernas': {
    preparacion:
      'Dos mancuernas en el suelo o colgando, cadera atrás, espalda recta.',
    ejecucion:
      'Extiende la cadera con fuerza y sube las mancuernas hasta los hombros, metiéndote debajo. Baja '
      + 'controlando.',
    fallo:
      'Curvar la espalda al bajarlas al suelo. La bajada se hace con la misma técnica que la subida.',
  },

  'thruster-con-barra': {
    preparacion:
      'Barra en la parte alta del pecho con los codos altos, pies a la anchura de los hombros.',
    ejecucion:
      'Haz una sentadilla frontal completa y, al subir, aprovecha el impulso para empujar la barra '
      + 'sobre la cabeza en un solo movimiento continuo. Baja al pecho y encadena.',
    fallo:
      'Parar entre la sentadilla y el empuje. El thruster es un movimiento seguido: la barra sale '
      + 'lanzada por las piernas.',
  },

  'thruster-con-mancuernas': {
    preparacion:
      'Mancuernas en los hombros con las palmas hacia dentro, pies a la anchura de los hombros.',
    ejecucion:
      'Sentadilla completa y, al subir, empuja las mancuernas sobre la cabeza en un movimiento '
      + 'continuo. Baja a los hombros.',
    fallo:
      'Dejar caer las mancuernas sobre los hombros al bajar. Se acompañan doblando un poco las '
      + 'rodillas.',
  },

  'swing-con-kettlebell': {
    preparacion:
      'Kettlebell un palmo por delante de los pies, pies a la anchura de los hombros, cadera atrás, '
      + 'espalda recta y brazos largos. Es un movimiento de cadera, no de hombro.',
    ejecucion:
      'Lleva la kettlebell entre las piernas como si pasaras un balón hacia atrás y extiende la cadera '
      + 'con fuerza para lanzarla al frente hasta la altura del pecho. Deja que vuelva y encadena.',
    fallo:
      'Levantar la kettlebell con los brazos como si fuera una elevación frontal. Si los hombros se '
      + 'cansan antes que el glúteo, estás haciendo otro ejercicio.',
  },

  'swing-a-una-mano-con-kettlebell': {
    preparacion:
      'Como el swing normal pero con una mano, la otra libre a un lado para equilibrar. Se apunta por '
      + 'lado.',
    ejecucion:
      'Mismo movimiento de cadera, dejando que el hombro rote un poco de forma natural y sin que el '
      + 'tronco gire.',
    fallo:
      'Dejar que el tronco rote con cada balanceo. El abdomen aprieta para mantener el pecho al frente.',
  },

  'tiron-alto-con-kettlebell': {
    preparacion:
      'Como en el swing, kettlebell por delante de los pies y cadera atrás.',
    ejecucion:
      'Lanza la kettlebell con la cadera y, cuando llegue arriba, tira del codo hacia atrás llevando la '
      + 'mano al pecho con el codo alto. Devuelve al swing y encadena.',
    fallo:
      'Tirar con el brazo antes de que la cadera termine. Primero la cadera, después el codo.',
  },

  'turkish-get-up': {
    preparacion:
      'Tumbado boca arriba con la kettlebell arriba en un brazo estirado, esa rodilla doblada y el pie '
      + 'en el suelo, el otro brazo y pierna abiertos en diagonal. Se apunta por lado. Aprende el '
      + 'recorrido sin peso o con un zapato en la mano.',
    ejecucion:
      'Levántate por pasos —codo, mano, puente de cadera, rodilla atrás, de pie— sin dejar de mirar la '
      + 'kettlebell y con el brazo siempre vertical. Baja deshaciendo el camino.',
    fallo:
      'Ir con prisa. Cada repetición son treinta segundos bien empleados; la prisa aquí es cómo se cae '
      + 'una kettlebell sobre uno mismo.',
  },

  'devil-press': {
    preparacion:
      'Dos mancuernas en el suelo, de pie detrás de ellas. Es de los ejercicios más duros del '
      + 'catálogo: elige poco peso.',
    ejecucion:
      'Agáchate, apoya las manos en las mancuernas y haz un burpee con flexión; al levantarte, sube las '
      + 'mancuernas de un tirón hasta encima de la cabeza. Baja controlando y encadena.',
    fallo:
      'Redondear la espalda al tirar de las mancuernas del suelo cansado. Si la técnica se rompe, para '
      + 'la serie.',
  },

  'man-maker': {
    preparacion:
      'Dos mancuernas en el suelo, en posición de plancha con las manos sobre ellas.',
    ejecucion:
      'Flexión, remo con un brazo, remo con el otro, salto a la posición de cuclillas, cargada y press '
      + 'sobre la cabeza. Vuelve al suelo y repite.',
    fallo:
      'Dejar que la cadera gire en los remos. Abre los pies para hacer la base más ancha y aprieta el '
      + 'abdomen.',
  },

  'burpees': {
    preparacion:
      'De pie, espacio libre delante. Marca antes si vas a tocar el pecho en el suelo o sólo bajar.',
    ejecucion:
      'Agáchate, apoya las manos, salta atrás a plancha, baja el pecho, sube, salta adelante y salta '
      + 'arriba con las manos por encima. Encadena a un ritmo que puedas mantener.',
    fallo:
      'Dejar caer la cadera al bajar al suelo cuando llega el cansancio. Aprieta el abdomen aunque '
      + 'vayas más lento.',
  },

  'wall-ball': {
    preparacion:
      'De pie frente a la pared con el balón contra el pecho, a un paso, con una marca de altura como '
      + 'referencia.',
    ejecucion:
      'Sentadilla completa y, al subir, lanza el balón a la marca con el impulso de las piernas. '
      + 'Recíbelo amortiguando y encadena la siguiente sentadilla.',
    fallo:
      'Lanzar sólo con los brazos y quedarse a medias en la sentadilla. Las piernas lanzan; los brazos '
      + 'guían.',
  },

  'slam-ball': {
    preparacion:
      'De pie con el balón (de los que no rebotan) por encima de la cabeza, pies a la anchura de los '
      + 'hombros.',
    ejecucion:
      'Lanza el balón contra el suelo con toda la fuerza doblando la cadera, y recógelo para la '
      + 'siguiente. Es un ejercicio de potencia: pocas repeticiones y a tope.',
    fallo:
      'Lanzar sólo con los brazos y la espalda redondeada. El golpe sale de la cadera y del abdomen.',
  },

  'cuerdas-de-batalla': {
    preparacion:
      'Una punta de cuerda en cada mano, media sentadilla, pecho alto y brazos algo doblados. Se apunta '
      + 'el tiempo.',
    ejecucion:
      'Haz ondas alternas o a la vez, moviendo los brazos rápido y manteniendo la posición de las '
      + 'piernas, hasta que se acabe el tiempo.',
    fallo:
      'Ponerse de pie y mover sólo los brazos. La posición baja es la mitad del ejercicio.',
  },

  'paseo-del-granjero': {
    preparacion:
      'Una mancuerna o kettlebell pesada en cada mano, de pie, hombros atrás y pecho alto. Se apuntan '
      + 'los kilos y el tiempo o la distancia.',
    ejecucion:
      'Camina con pasos cortos y firmes, el tronco erguido y el abdomen apretado, sin balancear los '
      + 'pesos.',
    fallo:
      'Andar con los hombros caídos hacia delante. El agarre falla antes, y la espalda acaba cargada.',
  },

  'empuje-de-trineo': {
    preparacion:
      'Manos en las asas del trineo, brazos estirados o codos doblados, cuerpo inclinado adelante en '
      + 'línea. Se apuntan los kilos y el tiempo.',
    ejecucion:
      'Empuja con pasos cortos y potentes manteniendo la línea del cuerpo, sin dejar que la cadera se '
      + 'hunda.',
    fallo:
      'Empujar con los brazos doblándolos y estirándolos. Los brazos sujetan; empujan las piernas.',
  },

  'arrastre-de-trineo': {
    preparacion:
      'Arnés o correas en las manos, de espaldas o de frente al trineo según la variante, tronco '
      + 'inclinado. Se apuntan los kilos y el tiempo.',
    ejecucion:
      'Camina o corre tirando con pasos firmes, manteniendo la tensión constante en la correa.',
    fallo:
      'Dar tirones para arrancar el trineo. Tensión constante: los tirones se los lleva la lumbar.',
  },

  'muscle-up': {
    preparacion:
      'Colgado de la barra o las anillas con agarre firme. Requiere dominar antes las dominadas al '
      + 'pecho y los fondos.',
    ejecucion:
      'Tira explosivo llevando el pecho a la barra, pasa los codos por encima girando las muñecas y '
      + 'termina empujando hasta estirar los brazos. Baja controlando.',
    fallo:
      'Intentarlo a base de balanceo sin la fuerza de tirón necesaria. Primero dominadas al esternón, '
      + 'después el muscle-up.',
  },

  'escalada-de-cuerda': {
    preparacion:
      'De pie bajo la cuerda con las manos altas. Se cuentan subidas.',
    ejecucion:
      'Tira con los brazos mientras enganchas la cuerda con los pies para empujar; sube alternando '
      + 'brazos y pies. Baja controlando, sin deslizarte.',
    fallo:
      'Bajar deslizándose. Además de quemaduras, es como se llega abajo más rápido de lo previsto.',
  },

  'salto-al-cajon': {
    preparacion:
      'Cajón estable a una altura que domines, a un paso. Prueba primero una altura baja.',
    ejecucion:
      'Baja media sentadilla, salta y cae con los dos pies enteros en el cajón, con las rodillas algo '
      + 'dobladas. Baja del cajón andando, no saltando.',
    fallo:
      'Bajar de un salto para encadenar rápido. Es donde se rompen los tendones de Aquiles: se baja '
      + 'paso a paso.',
  },

  'salto-vertical': {
    preparacion:
      'De pie con espacio libre, brazos sueltos. Al principio de la sesión, con las piernas frescas.',
    ejecucion:
      'Baja media sentadilla, lanza los brazos arriba y salta lo más alto posible. Cae amortiguando y '
      + 'recupera antes del siguiente.',
    fallo:
      'Hacer muchas repeticiones seguidas. Es un ejercicio de calidad: pocos saltos, descansados y a '
      + 'tope.',
  },

  'salto-de-longitud-sin-carrera': {
    preparacion:
      'De pie tras una línea, pies a la anchura de las caderas, espacio libre delante.',
    ejecucion:
      'Baja media sentadilla, lanza los brazos y salta lo más lejos que puedas, cayendo con los dos '
      + 'pies y las rodillas dobladas.',
    fallo:
      'Caer con las piernas rígidas buscando un centímetro más. El aterrizaje se amortigua siempre.',
  },

  // ──────────────────────────────── Cardio ────────────────────────────────

  'cinta-de-correr': {
    preparacion:
      'Engancha la pinza de seguridad antes de arrancar y empieza andando. Se apuntan distancia y '
      + 'tiempo.',
    ejecucion:
      'Corre mirando al frente, con la zancada natural y los brazos sueltos, sin agarrarte a las '
      + 'barras. Sube la velocidad poco a poco y baja igual al terminar.',
    fallo:
      'Agarrarse al manillar mientras se corre. Cambia la postura, quita trabajo y falsea las calorías '
      + 'que marca la máquina.',
  },

  'caminata-inclinada-en-cinta': {
    preparacion:
      'Inclinación entre el 8 y el 15 por ciento y velocidad de paseo rápido. Se apuntan distancia y '
      + 'tiempo.',
    ejecucion:
      'Camina erguido sin agarrarte, dejando que el glúteo trabaje la subida. Es la forma más cómoda '
      + 'de meter cardio sin castigar las articulaciones.',
    fallo:
      'Agarrarse a las barras e inclinarse hacia atrás. Con eso la pendiente ya no la subes tú.',
  },

  'bicicleta-estatica': {
    preparacion:
      'Sillín a la altura de la cadera: con el pedal abajo, la rodilla queda casi estirada. Se apuntan '
      + 'distancia y tiempo.',
    ejecucion:
      'Pedalea con un ritmo constante, empujando y tirando de forma redonda, con la espalda cómoda y '
      + 'sin bloquear los codos.',
    fallo:
      'Sillín demasiado bajo. Es la causa número uno de rodillas doloridas en bicicleta.',
  },

  'bicicleta-de-spinning': {
    preparacion:
      'Sillín a la altura de la cadera y manillar a una distancia que no te obligue a estirarte. '
      + 'Correas de los pedales ajustadas.',
    ejecucion:
      'Alterna sentado y de pie según el bloque, con resistencia suficiente para que la pedalada no '
      + 'sea a lo loco.',
    fallo:
      'Pedalear rapidísimo sin resistencia. Sin carga, las piernas rebotan en el sillín y no se '
      + 'entrena nada.',
  },

  'assault-bike': {
    preparacion:
      'Sillín a la altura de la cadera, manos en los brazos móviles. Se apuntan distancia (o calorías) '
      + 'y tiempo.',
    ejecucion:
      'Empuja y tira con los brazos a la vez que pedaleas. Cuanto más fuerte vas, más resistencia hace '
      + 'el aire: se acelera de forma progresiva.',
    fallo:
      'Salir a tope en los primeros diez segundos. Esta máquina castiga como pocas el salir demasiado '
      + 'rápido.',
  },

  'eliptica': {
    preparacion:
      'Pies enteros en las plataformas y manos en los brazos móviles. Se apuntan distancia y tiempo.',
    ejecucion:
      'Mueve piernas y brazos con un ritmo constante y el tronco erguido, sin apoyar el peso en las '
      + 'manos.',
    fallo:
      'Colgarse de los brazos fijos y dejar que las piernas vayan solas. La resistencia se sube y el '
      + 'cuerpo se mantiene erguido.',
  },

  'remo-ergometro': {
    preparacion:
      'Correas por la parte ancha del pie, agarre relajado, empieza con las rodillas dobladas y los '
      + 'brazos estirados. Se apuntan distancia y tiempo.',
    ejecucion:
      'El orden es piernas, tronco, brazos al tirar; y brazos, tronco, piernas al volver. Empuja con '
      + 'las piernas, no tires con la espalda.',
    fallo:
      'Empezar tirando con los brazos. El remo es un ochenta por ciento piernas: si acabas con la '
      + 'espalda molida, el orden está invertido.',
  },

  'skierg': {
    preparacion:
      'De pie frente a la máquina con las asas arriba, pies a la anchura de las caderas. Se apuntan '
      + 'distancia y tiempo.',
    ejecucion:
      'Tira hacia abajo doblando la cadera y el abdomen, terminando con las manos junto a los muslos, '
      + 'y vuelve arriba estirando.',
    fallo:
      'Tirar sólo con los brazos. El tirón sale de la cadera y del abdomen, como un remo de pie.',
  },

  'escaladora-de-peldanos': {
    preparacion:
      'Sube con cuidado a la máquina antes de arrancarla y ajusta una velocidad que puedas mantener. '
      + 'Se apunta el tiempo.',
    ejecucion:
      'Sube erguido pisando el escalón entero, sin agarrarte al pasamanos más que para el equilibrio.',
    fallo:
      'Apoyarse en los brazos y dejar caer el peso en el pasamanos. Baja la velocidad y suelta las '
      + 'manos.',
  },

  'comba': {
    preparacion:
      'Cuerda a tu medida: pisando el centro, los mangos llegan a las axilas. Codos pegados al cuerpo. '
      + 'Se apunta el tiempo.',
    ejecucion:
      'Salta con los pies juntos unos centímetros, girando la cuerda con las muñecas y no con los '
      + 'brazos, cayendo con la punta del pie.',
    fallo:
      'Saltar alto y con los brazos abiertos. Se salta lo justo para que pase la cuerda.',
  },

  'correr-al-aire-libre': {
    preparacion:
      'Calzado en condiciones y ruta pensada. Se apuntan distancia y tiempo.',
    ejecucion:
      'Corre a un ritmo en el que puedas hablar si la sesión es larga, con el tronco erguido y la '
      + 'zancada bajo el cuerpo.',
    fallo:
      'Subir el volumen de kilómetros de golpe. La mayoría de las lesiones de correr salen de aumentar '
      + 'demasiado deprisa, no de la técnica.',
  },

  'bicicleta-al-aire-libre': {
    preparacion:
      'Bici revisada y sillín a la altura de la cadera. Se apuntan distancia y tiempo.',
    ejecucion:
      'Pedalea con una cadencia cómoda, cambiando de desarrollo para no ir siempre a fuerza bruta.',
    fallo:
      'Ir siempre con el plato grande. La cadencia alta cansa menos las rodillas.',
  },

  'natacion': {
    preparacion:
      'Gafas y gorro, y un calentamiento suave de hombros. Se apuntan distancia y tiempo.',
    ejecucion:
      'Nada con un ritmo constante, respirando cada dos o tres brazadas según el estilo, con el cuerpo '
      + 'lo más horizontal posible.',
    fallo:
      'Nadar siempre a crol a tope sin técnica. Alterna estilos y ritmos: los hombros lo agradecen.',
  },

  'senderismo': {
    preparacion:
      'Calzado con agarre, agua y una ruta acorde a tu forma. Se apuntan distancia y tiempo.',
    ejecucion:
      'Camina a paso constante, acortando la zancada en las subidas y controlando las bajadas, que es '
      + 'donde se castigan las rodillas.',
    fallo:
      'Bajar corriendo y a saltos. La bajada es la parte que deja las piernas doloridas dos días.',
  },

  'caminar': {
    preparacion:
      'Sin más preparación que salir. Se apuntan distancia y tiempo.',
    ejecucion:
      'Camina a paso vivo, erguido y con los brazos sueltos. Es el cardio que más se sostiene en el '
      + 'tiempo porque no cuesta recuperarse de él.',
    fallo:
      'Menospreciarlo. Media hora al día suma más al año que un plan ambicioso que se abandona en dos '
      + 'semanas.',
  },
};

/**
 * La técnica de un ejercicio, si la hay.
 *
 * Los ejercicios que crea el usuario no la tienen, y eso es normal: la interfaz enseña lo que
 * hay y no un hueco vacío.
 */
export function tecnicaDe(id: string): Tecnica | undefined {
  return TECNICA[id];
}

/**
 * A dónde mandar a alguien que quiere ver el ejercicio en movimiento.
 *
 * Es una búsqueda en YouTube por el nombre, y no un vídeo concreto, a conciencia: un
 * identificador de vídeo escrito hoy a mano es un enlace roto dentro de un año —los vídeos se
 * borran, los canales se cierran— y no hay forma de comprobar desde aquí que un identificador
 * inventado apunte a algo real. Una búsqueda por el nombre del ejercicio siempre lleva a algo,
 * y encima ordenado por lo que la gente ve de verdad.
 *
 * Si algún día se elige un vídeo concreto para un ejercicio, se pone en su ficha y esta función
 * lo devuelve en lugar de la búsqueda.
 */
export function videoDe(nombre: string, id?: string): string {
  const fijado = id ? TECNICA[id]?.video : undefined;
  if (fijado) return fijado;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${nombre} técnica`)}`;
}
