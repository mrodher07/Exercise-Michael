/**
 * Fechas y duraciones.
 *
 * Todo se guarda en horario **local** con el formato `AAAA-MM-DD`, no en UTC. Parece un
 * detalle y no lo es: una cena a las once de la noche en España es «hoy» para quien la
 * cena, pero ya es mañana en UTC. Guardarlo en UTC movería media cena al día siguiente y
 * el resumen del día saldría mal.
 */

export type ClaveDia = string;

/** `AAAA-MM-DD` de una fecha, en local. */
export function claveDia(fecha: Date = new Date()): ClaveDia {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function hoy(): ClaveDia {
  return claveDia();
}

/** De `AAAA-MM-DD` a `Date` a mediodía local: así ningún cambio de hora la mueve de día. */
export function fechaDeClave(clave: ClaveDia): Date {
  const [a, m, d] = clave.split('-').map(Number);
  return new Date(a, m - 1, d, 12, 0, 0);
}

export function sumarDias(clave: ClaveDia, dias: number): ClaveDia {
  const f = fechaDeClave(clave);
  f.setDate(f.getDate() + dias);
  return claveDia(f);
}

/** Las claves de los últimos `n` días, de más antigua a hoy. */
export function ultimosDias(n: number, desde: ClaveDia = hoy()): ClaveDia[] {
  return Array.from({ length: n }, (_, i) => sumarDias(desde, i - (n - 1)));
}

/** El lunes de la semana a la que pertenece la fecha. La semana empieza en lunes. */
export function lunesDe(clave: ClaveDia): ClaveDia {
  const f = fechaDeClave(clave);
  // getDay() da 0 para domingo; aquí el domingo es el séptimo día, no el primero.
  const dia = (f.getDay() + 6) % 7;
  return sumarDias(clave, -dia);
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function nombreDelDia(clave: ClaveDia): string {
  return DIAS[(fechaDeClave(clave).getDay() + 6) % 7];
}

export function inicialDelDia(clave: ClaveDia): string {
  return DIAS_CORTOS[(fechaDeClave(clave).getDay() + 6) % 7];
}

/** «12 de agosto». Con año sólo si no es el corriente, que es lo que se lee peor de más. */
export function formatoFecha(clave: ClaveDia): string {
  const f = fechaDeClave(clave);
  const mismoAno = f.getFullYear() === new Date().getFullYear();
  return `${f.getDate()} de ${MESES[f.getMonth()]}${mismoAno ? '' : ` de ${f.getFullYear()}`}`;
}

/** «Hoy», «Ayer» o la fecha. En una lista de entrenos es lo primero que se busca. */
export function fechaRelativa(clave: ClaveDia): string {
  if (clave === hoy()) return 'Hoy';
  if (clave === sumarDias(hoy(), -1)) return 'Ayer';
  if (clave === sumarDias(hoy(), 1)) return 'Mañana';
  const dias = diasEntre(clave, hoy());
  if (dias > 1 && dias < 7) return nombreDelDia(clave);
  return formatoFecha(clave);
}

export function diasEntre(a: ClaveDia, b: ClaveDia): number {
  const ms = fechaDeClave(b).getTime() - fechaDeClave(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** `1:05:09` o `5:09`. La hora sólo aparece cuando existe. */
export function formatoDuracion(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dosCifras = (n: number) => `${n}`.padStart(2, '0');
  return h > 0 ? `${h}:${dosCifras(m)}:${dosCifras(seg)}` : `${m}:${dosCifras(seg)}`;
}

/** «1 h 12 min», para leer de un vistazo la duración de un entreno. */
export function duracionLarga(segundos: number): string {
  const min = Math.round(segundos / 60);
  // Un entreno de cuarenta segundos no duró «0 min», que además parece un error.
  if (min < 1) return 'menos de 1 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${h} h` : `${h} h ${resto} min`;
}

/**
 * «45 s», «30 min», «1 h 5 min»: la duración de una serie, corta y sin adornos.
 *
 * Distinta de `duracionLarga`, que es para un entreno entero y nunca baja del minuto. Aquí sí
 * hacen falta los segundos: una plancha dura cuarenta y cinco.
 */
export function duracionCorta(segundos: number): string {
  const dosCifras = (n: number) => `${n}`.padStart(2, '0');
  const s = segundos < 0 ? 0 : segundos;
  if (s < 60) return `${s} s`;
  const min = Math.floor(s / 60);
  const resto = s % 60;
  if (min < 60) return resto === 0 ? `${min} min` : `${min}:${dosCifras(resto)} min`;
  const h = Math.floor(min / 60);
  const minutos = min % 60;
  return minutos === 0 ? `${h} h` : `${h} h ${minutos} min`;
}

export function horaDe(iso: string): string {
  const f = new Date(iso);
  return `${f.getHours()}:${`${f.getMinutes()}`.padStart(2, '0')}`;
}

/** Segundos entre dos instantes ISO. Si no hay fin, hasta ahora. */
export function segundosEntre(comienzo: string, fin: string | null): number {
  const desde = new Date(comienzo).getTime();
  const hasta = fin ? new Date(fin).getTime() : Date.now();
  return Math.max(0, Math.round((hasta - desde) / 1000));
}
