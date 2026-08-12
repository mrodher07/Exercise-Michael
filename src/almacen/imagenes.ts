/**
 * Las fotos de las comidas.
 *
 * Se guardan como `Blob` en su propia base de IndexedDB, no dentro del registro de la
 * comida: así una comida sigue pesando un kilobyte y el listado del día se puede leer
 * entero sin arrastrar las fotos a memoria.
 *
 * Al entrar se **reescalan**. Una foto de móvil ronda los cuatro o cinco megas y aquí no
 * sirve de nada ese detalle: se ve en un cuadrado de cien píxeles y se manda a estimar
 * calorías, para lo que sobra con el lado largo a 1024. Sin reescalar, veinte comidas
 * llenarían la cuota del navegador y la subida al modelo tardaría lo que no hace falta.
 */

export interface Foto {
  id: string;
  creadaEn: string;
  anchura: number;
  altura: number;
  bytes: number;
  tipo: string;
  datos: Blob;
}

export type FotoInfo = Omit<Foto, 'datos'>;

const BD = 'fitlog-imagenes';
const VERSION = 1;
const TIENDA = 'fotos';

/** Lado máximo tras reescalar. Suficiente para verla y para que el modelo la entienda. */
export const LADO_MAXIMO = 1024;
/** Por encima de esto ni se intenta leer el archivo. */
export const BYTES_MAXIMOS_ENTRADA = 25 * 1024 * 1024;

export const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'];

let promesaBD: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (promesaBD) return promesaBD;
  promesaBD = new Promise((resolver, rechazar) => {
    const s = indexedDB.open(BD, VERSION);
    s.onupgradeneeded = () => {
      const bd = s.result;
      if (!bd.objectStoreNames.contains(TIENDA)) {
        bd.createObjectStore(TIENDA, { keyPath: 'id' });
      }
    };
    s.onsuccess = () => resolver(s.result);
    s.onerror = () => rechazar(s.error);
  });
  return promesaBD;
}

function pedir<T>(modo: IDBTransactionMode, fn: (t: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return abrir().then(
    (bd) =>
      new Promise<T>((resolver, rechazar) => {
        const tx = bd.transaction(TIENDA, modo);
        const solicitud = fn(tx.objectStore(TIENDA));
        solicitud.onsuccess = () => resolver(solicitud.result);
        solicitud.onerror = () => rechazar(solicitud.error);
      }),
  );
}

/**
 * Reescala a JPEG con el lado largo en `LADO_MAXIMO`.
 *
 * Se pasa por `createImageBitmap`, que es lo que sabe leer el HEIC de un iPhone y respeta
 * la orientación de la foto — sin eso, media foto hecha en vertical se guarda tumbada.
 */
async function reescalar(archivo: Blob): Promise<{ blob: Blob; anchura: number; altura: number }> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const anchura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const lienzo = document.createElement('canvas');
  lienzo.width = anchura;
  lienzo.height = altura;
  const contexto = lienzo.getContext('2d');
  if (!contexto) throw new Error('El navegador no deja dibujar en un lienzo.');
  contexto.drawImage(bitmap, 0, 0, anchura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolver) =>
    // 0,82 de calidad: por encima se nota el peso y no se nota la mejora.
    lienzo.toBlob(resolver, 'image/jpeg', 0.82),
  );
  if (!blob) throw new Error('No se ha podido convertir la foto.');
  return { blob, anchura, altura };
}

export async function guardarFoto(id: string, archivo: Blob): Promise<Foto> {
  if (archivo.size > BYTES_MAXIMOS_ENTRADA) {
    throw new Error('La foto pesa demasiado. Prueba con una más pequeña.');
  }
  const { blob, anchura, altura } = await reescalar(archivo);
  const foto: Foto = {
    id,
    creadaEn: new Date().toISOString(),
    anchura,
    altura,
    bytes: blob.size,
    tipo: 'image/jpeg',
    datos: blob,
  };
  await pedir('readwrite', (t) => t.put(foto));
  return foto;
}

export function obtenerFoto(id: string): Promise<Foto | undefined> {
  return pedir('readonly', (t) => t.get(id));
}

export function borrarFoto(id: string): Promise<void> {
  return pedir('readwrite', (t) => t.delete(id)).then(() => undefined);
}

export async function listarFotos(): Promise<FotoInfo[]> {
  const todas = await pedir<Foto[]>('readonly', (t) => t.getAll());
  return todas
    .map(({ datos: _datos, ...info }) => info)
    .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

export async function vaciarFotos(): Promise<void> {
  await pedir('readwrite', (t) => t.clear());
}

/** Cuánto ocupan todas las fotos. Se muestra en Ajustes, junto a la opción de borrarlas. */
export async function bytesOcupados(): Promise<number> {
  const fotos = await listarFotos();
  return fotos.reduce((total, f) => total + f.bytes, 0);
}

/**
 * La foto como URL para un `<img>`. **Quien la pida tiene que revocarla** al desmontar:
 * cada `createObjectURL` retiene el Blob en memoria hasta que se revoca, y una lista de
 * comidas con scroll infinito se come la RAM del móvil en unos minutos.
 */
export async function urlDeFoto(id: string): Promise<string | null> {
  const foto = await obtenerFoto(id);
  return foto ? URL.createObjectURL(foto.datos) : null;
}

/** La foto en base64 sin la cabecera `data:`, que es como la quiere la API del modelo. */
export async function base64DeFoto(id: string): Promise<{ base64: string; tipo: string } | null> {
  const foto = await obtenerFoto(id);
  if (!foto) return null;
  return { base64: await base64DeBlob(foto.datos), tipo: foto.tipo };
}

export function base64DeBlob(blob: Blob): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => {
      const texto = String(lector.result);
      resolver(texto.slice(texto.indexOf(',') + 1));
    };
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(blob);
  });
}
