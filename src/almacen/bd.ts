/**
 * La base de datos local, sobre IndexedDB.
 *
 * Se usa IndexedDB y no `localStorage` por dos razones que se notan enseguida: el
 * historial de entrenos y comidas de un año son megas, no kilobytes, y `localStorage`
 * ronda los cinco; y las fotos de las comidas se guardan como `Blob`, que en
 * `localStorage` habría que meter en base64 —un tercio más de tamaño— y volver a
 * descodificar cada vez que se pinta la lista.
 *
 * Aquí sólo vive lo genérico: abrir la base y hacer una transacción. Cada colección pone
 * sus reglas en `almacen.ts`. Las imágenes tienen su propia base (`imagenes.ts`), porque
 * un `Blob` de dos megas no debe compartir almacén con registros de un kilobyte.
 */

export const TIENDAS = [
  'entrenos',
  'rutinas',
  'ejercicios',
  'comidas',
  'alimentos',
  'medidas',
  'ajustes',
] as const;
export type Tienda = (typeof TIENDAS)[number];

const BD = 'fitlog';
/**
 * La versión de la base. `onupgradeneeded` crea sólo lo que falta, así que subirla no
 * toca nada de lo que ya hay guardado: añadir una colección más adelante es sumar uno
 * aquí y su nombre en `TIENDAS`.
 */
const VERSION = 1;

let promesaBD: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (promesaBD) return promesaBD;
  promesaBD = new Promise((resolver, rechazar) => {
    const solicitud = indexedDB.open(BD, VERSION);
    solicitud.onupgradeneeded = () => {
      const bd = solicitud.result;
      for (const tienda of TIENDAS) {
        if (!bd.objectStoreNames.contains(tienda)) {
          const almacen = bd.createObjectStore(tienda, { keyPath: 'id' });
          // Casi todo se consulta por fecha: «el día de hoy», «esta semana».
          if (tienda === 'entrenos' || tienda === 'comidas' || tienda === 'medidas') {
            almacen.createIndex('porFecha', 'fecha');
          }
        }
      }
    };
    solicitud.onsuccess = () => resolver(solicitud.result);
    solicitud.onerror = () => rechazar(solicitud.error);
  });
  return promesaBD;
}

export function transaccion<T>(
  tienda: Tienda,
  modo: IDBTransactionMode,
  fn: (almacen: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrir().then(
    (bd) =>
      new Promise<T>((resolver, rechazar) => {
        const tx = bd.transaction(tienda, modo);
        const solicitud = fn(tx.objectStore(tienda));
        solicitud.onsuccess = () => resolver(solicitud.result);
        solicitud.onerror = () => rechazar(solicitud.error);
      }),
  );
}

/** Un id nuevo. `randomUUID` no existe en contextos sin HTTPS, de ahí la reserva. */
export function nuevoId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

/** Borra todo lo guardado. Lo usa «empezar de cero» en Ajustes. */
export async function vaciarTodo(): Promise<void> {
  for (const tienda of TIENDAS) {
    await transaccion(tienda, 'readwrite', (a) => a.clear());
  }
}
