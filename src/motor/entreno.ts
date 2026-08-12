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
