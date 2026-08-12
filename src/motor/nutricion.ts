/**
 * Los números de la comida: macros de una ración, totales del día y objetivos.
 *
 * Todo el catálogo está **por 100 g**, que es como viene en las etiquetas, y aquí se
 * convierte a lo que se ha comido de verdad. Los alimentos que se cuentan por unidades
 * (un huevo, una rebanada) también guardan su peso en gramos, para que no haya dos
 * sistemas de medida conviviendo.
 */

export interface Macros {
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export const MACROS_CERO: Macros = { kcal: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

/** Lo que aporta cada gramo de macronutriente. La grasa más del doble que el resto. */
export const KCAL_POR_GRAMO = { proteinas: 4, carbohidratos: 4, grasas: 9 } as const;

export function kcalDeMacros(m: Omit<Macros, 'kcal'>): number {
  return Math.round(
    m.proteinas * KCAL_POR_GRAMO.proteinas +
      m.carbohidratos * KCAL_POR_GRAMO.carbohidratos +
      m.grasas * KCAL_POR_GRAMO.grasas,
  );
}

/** Lo mínimo que necesita el cálculo; el alimento guardado tiene más campos. */
export interface AlimentoBase {
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export function macrosDeRacion(alimento: AlimentoBase, gramos: number): Macros {
  const factor = gramos / 100;
  return {
    kcal: alimento.kcal * factor,
    proteinas: alimento.proteinas * factor,
    carbohidratos: alimento.carbohidratos * factor,
    grasas: alimento.grasas * factor,
  };
}

export function sumar(...macros: Macros[]): Macros {
  return macros.reduce(
    (total, m) => ({
      kcal: total.kcal + m.kcal,
      proteinas: total.proteinas + m.proteinas,
      carbohidratos: total.carbohidratos + m.carbohidratos,
      grasas: total.grasas + m.grasas,
    }),
    { ...MACROS_CERO },
  );
}

export function redondearMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    proteinas: Math.round(m.proteinas),
    carbohidratos: Math.round(m.carbohidratos),
    grasas: Math.round(m.grasas),
  };
}

/** Qué porcentaje de las calorías viene de cada macro. Suma 100 salvo por redondeo. */
export function repartoEnPorcentaje(m: Macros): { proteinas: number; carbohidratos: number; grasas: number } {
  const kcal =
    m.proteinas * KCAL_POR_GRAMO.proteinas +
    m.carbohidratos * KCAL_POR_GRAMO.carbohidratos +
    m.grasas * KCAL_POR_GRAMO.grasas;
  if (kcal <= 0) return { proteinas: 0, carbohidratos: 0, grasas: 0 };
  return {
    proteinas: Math.round((m.proteinas * KCAL_POR_GRAMO.proteinas * 100) / kcal),
    carbohidratos: Math.round((m.carbohidratos * KCAL_POR_GRAMO.carbohidratos * 100) / kcal),
    grasas: Math.round((m.grasas * KCAL_POR_GRAMO.grasas * 100) / kcal),
  };
}

export type Sexo = 'hombre' | 'mujer';
export type Actividad = 'sedentario' | 'ligera' | 'moderada' | 'alta' | 'muy alta';
export type Meta = 'perder' | 'mantener' | 'ganar';

/**
 * Cuánto multiplica el gasto basal cada nivel de actividad.
 *
 * Son los factores de siempre. Conviene quedarse corto al elegir: casi todo el mundo se
 * pone «alta» contando el entreno, cuando lo que mide esto es el día entero —el trabajo,
 * los recados, andar— y una hora de gimnasio no convierte en activo un día de oficina.
 */
export const FACTOR_ACTIVIDAD: Record<Actividad, number> = {
  sedentario: 1.2,
  ligera: 1.375,
  moderada: 1.55,
  alta: 1.725,
  'muy alta': 1.9,
};

export const AJUSTE_META: Record<Meta, number> = {
  perder: -0.2,
  mantener: 0,
  ganar: 0.12,
};

export interface DatosPersona {
  sexo?: Sexo;
  edad?: number;
  /** Centímetros. */
  altura?: number;
  /** Kilos. */
  peso?: number;
  actividad: Actividad;
  meta: Meta;
}

/**
 * Gasto en reposo por Mifflin-St Jeor, que es la que menos se equivoca de las que se
 * pueden calcular con una cinta métrica y una báscula. Devuelve `null` si faltan datos:
 * antes se inventaba una altura media y el resultado parecía fiable sin serlo.
 */
export function gastoBasal(p: DatosPersona): number | null {
  if (!p.sexo || !p.edad || !p.altura || !p.peso) return null;
  const base = 10 * p.peso + 6.25 * p.altura - 5 * p.edad;
  return Math.round(p.sexo === 'hombre' ? base + 5 : base - 161);
}

export function gastoDiario(p: DatosPersona): number | null {
  const basal = gastoBasal(p);
  if (basal === null) return null;
  return Math.round(basal * FACTOR_ACTIVIDAD[p.actividad]);
}

/**
 * El objetivo del día a partir de los datos de la persona.
 *
 * El reparto no es un porcentaje redondo cualquiera: la proteína se fija **por kilo de
 * peso** (1,8 g, que es lo razonable para quien entrena con pesas) porque es lo que hay
 * que asegurar; la grasa se lleva el 25 % de las calorías, que es el suelo por debajo del
 * cual no conviene bajar; y los hidratos son lo que queda, que es exactamente el papel
 * que hacen: el combustible ajustable.
 */
export function objetivoCalculado(p: DatosPersona): Macros | null {
  const gasto = gastoDiario(p);
  if (gasto === null || !p.peso) return null;

  const kcal = Math.round(gasto * (1 + AJUSTE_META[p.meta]));
  const proteinas = Math.round(p.peso * 1.8);
  const grasas = Math.round((kcal * 0.25) / KCAL_POR_GRAMO.grasas);
  const kcalRestantes =
    kcal - proteinas * KCAL_POR_GRAMO.proteinas - grasas * KCAL_POR_GRAMO.grasas;
  const carbohidratos = Math.max(0, Math.round(kcalRestantes / KCAL_POR_GRAMO.carbohidratos));

  return { kcal, proteinas, carbohidratos, grasas };
}

/** Cuánto falta —o cuánto sobra, en negativo— para llegar al objetivo. */
export function restante(objetivo: Macros, comido: Macros): Macros {
  return {
    kcal: Math.round(objetivo.kcal - comido.kcal),
    proteinas: Math.round(objetivo.proteinas - comido.proteinas),
    carbohidratos: Math.round(objetivo.carbohidratos - comido.carbohidratos),
    grasas: Math.round(objetivo.grasas - comido.grasas),
  };
}

export function porcentajeDeObjetivo(comido: number, objetivo: number): number {
  if (objetivo <= 0) return 0;
  return Math.round((comido / objetivo) * 100);
}

export type Toma = 'desayuno' | 'almuerzo' | 'comida' | 'merienda' | 'cena' | 'otro';

export const TOMAS: { id: Toma; nombre: string; icono: string }[] = [
  { id: 'desayuno', nombre: 'Desayuno', icono: '☕' },
  { id: 'almuerzo', nombre: 'Almuerzo', icono: '🍎' },
  { id: 'comida', nombre: 'Comida', icono: '🍽️' },
  { id: 'merienda', nombre: 'Merienda', icono: '🥪' },
  { id: 'cena', nombre: 'Cena', icono: '🌙' },
  { id: 'otro', nombre: 'Otro', icono: '🍫' },
];

/** A qué toma pertenece, por la hora. Es una propuesta: se puede cambiar a mano. */
export function tomaPorLaHora(hora: number = new Date().getHours()): Toma {
  if (hora < 11) return 'desayuno';
  if (hora < 13) return 'almuerzo';
  if (hora < 16) return 'comida';
  if (hora < 19) return 'merienda';
  if (hora < 24) return 'cena';
  return 'otro';
}
