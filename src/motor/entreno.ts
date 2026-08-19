/**
 * Los números de un entreno: volumen, series, récords y reparto por grupo muscular.
 *
 * Está separado de la interfaz y no depende de ella: son funciones puras sobre los datos
 * guardados, y por eso se pueden probar (`entreno.test.ts`) sin abrir un navegador. Es
 * donde conviene tener cuidado, porque un récord mal calculado se nota — se compara con
 * lo que uno cree que levantó la semana pasada.
 */

import type { Ejercicio, Grupo } from '../datos/ejercicios';
import { segundosEntre } from './fechas';

export interface SerieRegistrada {
  /** Kilos de la serie. Con peso corporal es el lastre. */
  peso?: number;
  reps?: number;
  /** Isométricos y cardio. */
  segundos?: number;
  /** Kilómetros. */
  distancia?: number;
  /**
   * Las calorías que dice la máquina de cardio.
   *
   * Se guardan porque es el número que la gente apunta de una cinta o una bici, y porque sin
   * él una sesión de cardio no deja rastro en las estadísticas: no tiene kilos ni
   * repeticiones. Que la máquina las calcule a ojo no lo hace inútil: sirve para comparar la
   * misma máquina consigo misma de una semana a otra.
   */
  calorias?: number;
  /** Esfuerzo percibido, 1 a 10. */
  rpe?: number;
  /** Marcada como hecha. Lo que no está hecho no cuenta para nada. */
  hecha: boolean;
  tipo: TipoDeSerie;
}

/**
 * El calentamiento se apunta pero **no** cuenta como volumen: si contara, subir el peso
 * poco a poco antes de la serie fuerte inflaría el total y las gráficas dirían que se
 * entrena más cada semana cuando lo único que ha cambiado es el calentamiento.
 */
export type TipoDeSerie = 'normal' | 'calentamiento' | 'fallo' | 'descendente';

export interface EjercicioDelEntreno {
  /** Id de esta línea, no del ejercicio: el mismo ejercicio puede repetirse en un entreno. */
  id: string;
  ejercicioId: string;
  notas?: string;
  /** Descanso entre series, en segundos. */
  descanso: number;
  series: SerieRegistrada[];
}

export interface Entreno {
  id: string;
  actualizadoEn: string;
  /** `AAAA-MM-DD` local. */
  fecha: string;
  nombre: string;
  rutinaId: string | null;
  diaId: string | null;
  comienzo: string;
  /**
   * Cuándo se cerró. **`null` significa que está en curso**, y de ahí sale el entreno
   * activo: no hace falta guardar en otro sitio «cuál estoy haciendo ahora», que es lo
   * que se queda desincronizado en cuanto algo falla a medias.
   */
  fin: string | null;
  notas?: string;
  /** Cómo ha ido, de 1 a 5. */
  sensacion?: number;
  /**
   * Dónde se entrenó: «Gimnasio», «Casa», «Aire libre» o lo que uno escriba.
   *
   * Va en el entreno y no en cada ejercicio porque una sesión ocurre en un sitio: marcarlo
   * ejercicio a ejercicio sería repetir el mismo dato ocho veces para que nunca cambie. Es
   * texto libre y no una lista cerrada porque «Gimnasio de la uni» y «Parque de casa de mis
   * padres» son respuestas legítimas, y una lista de tres opciones obliga a mentir.
   */
  lugar?: string;
  ejercicios: EjercicioDelEntreno[];
}

export function serieVacia(tipo: TipoDeSerie = 'normal'): SerieRegistrada {
  return { hecha: false, tipo };
}

export function estaEnCurso(e: Entreno): boolean {
  return e.fin === null;
}

/** Sólo cuentan las series hechas que no son de calentamiento. */
export function serieCuenta(s: SerieRegistrada): boolean {
  return s.hecha && s.tipo !== 'calentamiento';
}

/** Kilos × repeticiones de una serie. Lo que no tiene las dos cosas no suma volumen. */
export function volumenDeSerie(s: SerieRegistrada): number {
  if (!serieCuenta(s)) return 0;
  return (s.peso ?? 0) * (s.reps ?? 0);
}

export function volumenDeEjercicio(e: EjercicioDelEntreno): number {
  return e.series.reduce((total, s) => total + volumenDeSerie(s), 0);
}

export function volumenDeEntreno(e: Entreno): number {
  return e.ejercicios.reduce((total, x) => total + volumenDeEjercicio(x), 0);
}

export function seriesHechas(e: Entreno): number {
  return e.ejercicios.reduce((n, x) => n + x.series.filter(serieCuenta).length, 0);
}

export function repeticionesTotales(e: Entreno): number {
  return e.ejercicios.reduce(
    (n, x) => n + x.series.filter(serieCuenta).reduce((r, s) => r + (s.reps ?? 0), 0),
    0,
  );
}

export function duracionEnSegundos(e: Entreno): number {
  return segundosEntre(e.comienzo, e.fin);
}

/**
 * Estimación del máximo a una repetición por la fórmula de Epley.
 *
 * Es una estimación, no una medida: por encima de unas diez repeticiones se va, así que
 * se devuelve `null` en vez de un número bonito y falso. Vale para comparar progreso
 * entre series de distintas repeticiones, que es para lo que se usa aquí.
 */
export function unaRepeticionMaxima(peso: number, reps: number): number | null {
  if (peso <= 0 || reps <= 0 || reps > 12) return null;
  if (reps === 1) return peso;
  return Math.round(peso * (1 + reps / 30) * 10) / 10;
}

export interface Marca {
  peso: number;
  reps: number;
  /** Máximo estimado, si la serie está en el rango en el que la fórmula se sostiene. */
  estimado: number | null;
  fecha: string;
}

/** La mejor serie de una lista, por máximo estimado; a igualdad, la de más peso. */
export function mejorSerie(series: SerieRegistrada[], fecha: string): Marca | null {
  let mejor: Marca | null = null;
  for (const s of series) {
    if (!serieCuenta(s) || !s.peso || !s.reps) continue;
    const candidata: Marca = {
      peso: s.peso,
      reps: s.reps,
      estimado: unaRepeticionMaxima(s.peso, s.reps),
      fecha,
    };
    const valor = candidata.estimado ?? candidata.peso;
    const actual = mejor ? mejor.estimado ?? mejor.peso : -1;
    if (valor > actual || (valor === actual && candidata.peso > (mejor?.peso ?? 0))) {
      mejor = candidata;
    }
  }
  return mejor;
}

export interface Records {
  mejorPeso: Marca | null;
  mejorEstimado: Marca | null;
  masRepeticiones: Marca | null;
  mejorVolumenDeSesion: { volumen: number; fecha: string } | null;
  vecesEntrenado: number;
  ultimaVez: string | null;
}

/** Los récords de un ejercicio a lo largo de todo el historial. */
export function recordsDe(entrenos: Entreno[], ejercicioId: string): Records {
  const r: Records = {
    mejorPeso: null,
    mejorEstimado: null,
    masRepeticiones: null,
    mejorVolumenDeSesion: null,
    vecesEntrenado: 0,
    ultimaVez: null,
  };

  for (const entreno of entrenos) {
    const lineas = entreno.ejercicios.filter((x) => x.ejercicioId === ejercicioId);
    if (lineas.length === 0) continue;

    const series = lineas.flatMap((l) => l.series).filter(serieCuenta);
    if (series.length === 0) continue;

    r.vecesEntrenado += 1;
    if (!r.ultimaVez || entreno.fecha > r.ultimaVez) r.ultimaVez = entreno.fecha;

    const volumen = lineas.reduce((t, l) => t + volumenDeEjercicio(l), 0);
    if (volumen > 0 && (!r.mejorVolumenDeSesion || volumen > r.mejorVolumenDeSesion.volumen)) {
      r.mejorVolumenDeSesion = { volumen, fecha: entreno.fecha };
    }

    for (const s of series) {
      if (!s.peso || !s.reps) continue;
      const marca: Marca = {
        peso: s.peso,
        reps: s.reps,
        estimado: unaRepeticionMaxima(s.peso, s.reps),
        fecha: entreno.fecha,
      };
      if (!r.mejorPeso || marca.peso > r.mejorPeso.peso) r.mejorPeso = marca;
      if (marca.estimado && (!r.mejorEstimado || marca.estimado > (r.mejorEstimado.estimado ?? 0))) {
        r.mejorEstimado = marca;
      }
      if (!r.masRepeticiones || marca.reps > r.masRepeticiones.reps) r.masRepeticiones = marca;
    }
  }

  return r;
}

/**
 * Series por grupo muscular.
 *
 * Es la cuenta que de verdad sirve para planificar una semana —más que el tonelaje, que
 * sube solo al cambiar de ejercicio—. Lo que un ejercicio trabaja de refuerzo cuenta
 * **media serie**: el press de banca hace algo por el tríceps, pero no lo mismo que una
 * extensión en polea, y contarlo entero diría que los tríceps están cubiertos cuando no
 * se han tocado.
 */
export function seriesPorGrupo(
  entrenos: Entreno[],
  catalogo: Ejercicio[],
): Partial<Record<Grupo, number>> {
  const porId = new Map(catalogo.map((e) => [e.id, e]));
  const cuenta: Partial<Record<Grupo, number>> = {};

  for (const entreno of entrenos) {
    for (const linea of entreno.ejercicios) {
      const ejercicio = porId.get(linea.ejercicioId);
      if (!ejercicio) continue;
      const series = linea.series.filter(serieCuenta).length;
      if (series === 0) continue;
      cuenta[ejercicio.grupo] = (cuenta[ejercicio.grupo] ?? 0) + series;
      for (const secundario of ejercicio.secundarios) {
        cuenta[secundario] = (cuenta[secundario] ?? 0) + series / 2;
      }
    }
  }

  return cuenta;
}

/** Volumen por semana, de la más antigua a la más reciente. Para la gráfica de progreso. */
export function volumenPorSemana(
  entrenos: Entreno[],
  lunesDe: (fecha: string) => string,
): { semana: string; volumen: number; entrenos: number }[] {
  const porSemana = new Map<string, { volumen: number; entrenos: number }>();
  for (const e of entrenos) {
    if (estaEnCurso(e)) continue;
    const clave = lunesDe(e.fecha);
    const actual = porSemana.get(clave) ?? { volumen: 0, entrenos: 0 };
    actual.volumen += volumenDeEntreno(e);
    actual.entrenos += 1;
    porSemana.set(clave, actual);
  }
  return [...porSemana.entries()]
    .map(([semana, datos]) => ({ semana, ...datos }))
    .sort((a, b) => a.semana.localeCompare(b.semana));
}

/** El historial de un ejercicio: una entrada por sesión, con su mejor serie. */
export function historialDe(
  entrenos: Entreno[],
  ejercicioId: string,
): { fecha: string; mejor: Marca; volumen: number; series: number }[] {
  const salida: { fecha: string; mejor: Marca; volumen: number; series: number }[] = [];
  for (const entreno of entrenos) {
    const lineas = entreno.ejercicios.filter((x) => x.ejercicioId === ejercicioId);
    if (lineas.length === 0) continue;
    const series = lineas.flatMap((l) => l.series);
    const mejor = mejorSerie(series, entreno.fecha);
    if (!mejor) continue;
    salida.push({
      fecha: entreno.fecha,
      mejor,
      volumen: lineas.reduce((t, l) => t + volumenDeEjercicio(l), 0),
      series: series.filter(serieCuenta).length,
    });
  }
  return salida.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export interface RecordBatido {
  ejercicioId: string;
  tipo: 'peso' | 'estimado' | 'reps';
  /** Lo que había antes. `null` si es la primera vez que se hace el ejercicio. */
  antes: number | null;
  ahora: number;
}

/**
 * Qué récords ha batido un entreno.
 *
 * Se compara contra el historial **sin contar este entreno**: si se comparara contra todo,
 * la propia serie que acaba de hacerse ya sería el récord y nunca se batiría nada.
 *
 * La primera vez que se hace un ejercicio no cuenta como récord. Técnicamente lo es —no
 * había nada antes— pero avisar de que has batido tu récord de una máquina que estrenas
 * hoy convierte el aviso en ruido, y a la tercera vez ya nadie lo lee.
 */
export function recordsBatidos(entreno: Entreno, historial: Entreno[]): RecordBatido[] {
  const otros = historial.filter((e) => e.id !== entreno.id && !estaEnCurso(e));
  const batidos: RecordBatido[] = [];
  const vistos = new Set<string>();

  for (const linea of entreno.ejercicios) {
    if (vistos.has(linea.ejercicioId)) continue;
    vistos.add(linea.ejercicioId);

    const series = entreno.ejercicios
      .filter((l) => l.ejercicioId === linea.ejercicioId)
      .flatMap((l) => l.series);
    const mejor = mejorSerie(series, entreno.fecha);
    if (!mejor) continue;

    const previos = recordsDe(otros, linea.ejercicioId);
    if (previos.vecesEntrenado === 0) continue;

    if (mejor.peso > (previos.mejorPeso?.peso ?? 0)) {
      batidos.push({
        ejercicioId: linea.ejercicioId,
        tipo: 'peso',
        antes: previos.mejorPeso?.peso ?? null,
        ahora: mejor.peso,
      });
      continue;
    }
    if (mejor.estimado && mejor.estimado > (previos.mejorEstimado?.estimado ?? 0)) {
      batidos.push({
        ejercicioId: linea.ejercicioId,
        tipo: 'estimado',
        antes: previos.mejorEstimado?.estimado ?? null,
        ahora: mejor.estimado,
      });
      continue;
    }
    if (mejor.reps > (previos.masRepeticiones?.reps ?? 0)) {
      batidos.push({
        ejercicioId: linea.ejercicioId,
        tipo: 'reps',
        antes: previos.masRepeticiones?.reps ?? null,
        ahora: mejor.reps,
      });
    }
  }

  return batidos;
}

/**
 * Qué se hizo la última vez con este ejercicio, para poder repetirlo o subirle algo.
 * Es lo primero que se mira al empezar una serie, así que se busca hacia atrás desde el
 * entreno más reciente.
 */
export function ultimaVezDe(
  entrenos: Entreno[],
  ejercicioId: string,
  excluirEntrenoId?: string,
): { fecha: string; series: SerieRegistrada[] } | null {
  const ordenados = [...entrenos]
    .filter((e) => e.id !== excluirEntrenoId && !estaEnCurso(e))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  for (const entreno of ordenados) {
    const series = entreno.ejercicios
      .filter((x) => x.ejercicioId === ejercicioId)
      .flatMap((x) => x.series)
      .filter(serieCuenta);
    if (series.length > 0) return { fecha: entreno.fecha, series };
  }
  return null;
}

// ─────────────────────────── Cardio ───────────────────────────

export interface ResumenDeCardio {
  /** Ejercicios de cardio hechos, no entrenos: dos máquinas el mismo día son dos. */
  sesiones: number;
  segundos: number;
  kilometros: number;
  calorias: number;
  minutos: number;
  hayAlgo: boolean;
}

/**
 * Suma el cardio de unos entrenos.
 *
 * Hace falta porque el volumen —kilos por repeticiones— deja el cardio en cero: media hora de
 * cinta no tiene kilos ni repeticiones, así que sin esto una semana de bici aparecía en el
 * resumen como una semana sin entrenar.
 */
export function resumenDeCardio(entrenos: Entreno[], catalogo: Ejercicio[]): ResumenDeCardio {
  const deCardio = new Set(catalogo.filter((e) => e.grupo === 'Cardio').map((e) => e.id));

  let sesiones = 0;
  let segundos = 0;
  let kilometros = 0;
  let calorias = 0;

  for (const entreno of entrenos) {
    for (const linea of entreno.ejercicios) {
      if (!deCardio.has(linea.ejercicioId)) continue;
      const hechas = linea.series.filter(serieCuenta);
      if (hechas.length === 0) continue;
      sesiones++;
      for (const s of hechas) {
        segundos += s.segundos ?? 0;
        kilometros += s.distancia ?? 0;
        calorias += s.calorias ?? 0;
      }
    }
  }

  return {
    sesiones,
    segundos,
    kilometros,
    calorias,
    minutos: Math.round(segundos / 60),
    hayAlgo: sesiones > 0,
  };
}

/**
 * La velocidad media de una serie de cardio, en km/h, o `null` si no da para calcularla.
 *
 * Se calcula y no se apunta: pedirla sería pedir un número que ya está en los otros dos, y uno
 * más que rellenar entre jadeos.
 */
export function velocidadDe(serie: SerieRegistrada): number | null {
  const km = serie.distancia;
  const seg = serie.segundos;
  if (!km || !seg || km <= 0 || seg <= 0) return null;
  return km / (seg / 3600);
}

/** El ritmo medio en minutos por kilómetro, como `5:30`. Es como se lee al correr o remar. */
export function ritmoDe(serie: SerieRegistrada): string | null {
  const km = serie.distancia;
  const seg = serie.segundos;
  if (!km || !seg || km <= 0 || seg <= 0) return null;
  const porKm = seg / km;
  const minutos = Math.floor(porKm / 60);
  const restoSegundos = Math.round(porKm % 60);
  /* Los 60 segundos redondeados hacia arriba son 5:60, que no existe. */
  if (restoSegundos === 60) return `${minutos + 1}:00`;
  return `${minutos}:${String(restoSegundos).padStart(2, '0')}`;
}

/**
 * Cuántos entrenos se hicieron en cada sitio, de más a menos.
 *
 * Los entrenos sin lugar apuntado no salen: inventarles un «sin sitio» llenaría el gráfico de
 * una barra que sólo dice que antes no se apuntaba.
 */
export function entrenosPorLugar(entrenos: Entreno[]): { lugar: string; entrenos: number }[] {
  const cuenta = new Map<string, number>();
  for (const entreno of entrenos) {
    const lugar = entreno.lugar?.trim();
    if (!lugar) continue;
    cuenta.set(lugar, (cuenta.get(lugar) ?? 0) + 1);
  }
  return [...cuenta.entries()]
    .map(([lugar, n]) => ({ lugar, entrenos: n }))
    .sort((a, b) => b.entrenos - a.entrenos || a.lugar.localeCompare(b.lugar));
}

/** Los sitios ya usados, del más reciente al más antiguo, para proponerlos sin escribir. */
export function lugaresUsados(entrenos: Entreno[]): string[] {
  const vistos: string[] = [];
  const ordenados = [...entrenos].sort((a, b) => b.comienzo.localeCompare(a.comienzo));
  for (const entreno of ordenados) {
    const lugar = entreno.lugar?.trim();
    if (!lugar) continue;
    if (!vistos.some((x) => x.toLowerCase() === lugar.toLowerCase())) vistos.push(lugar);
  }
  return vistos;
}
