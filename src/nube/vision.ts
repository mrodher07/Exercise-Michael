/**
 * Estimar una comida a partir de una foto.
 *
 * La foto se manda a un modelo con visión y vuelve una lista de alimentos con su peso
 * aproximado y sus macros por 100 g. Eso último es importante: se piden **por 100 g**, no
 * el total del plato, para que lo estimado entre en el catálogo con la misma forma que
 * todo lo demás y se pueda corregir el peso sin recalcular nada a mano.
 *
 * ## Lo que esto es y lo que no
 *
 * Es una **estimación a partir de una imagen plana**. No hay báscula, no se ve el aceite
 * que lleva el sofrito ni si el arroz está hecho con mantequilla, y el volumen de un plato
 * en una foto es una conjetura razonable, no una medida. Por eso todo lo que sale de aquí
 * llega a la aplicación marcado como estimado, con la confianza que el propio modelo
 * declara, y se puede editar antes de guardar. Para pesar la avena del desayuno, la
 * báscula sigue siendo mejor; esto es para la comida de un restaurante, que es justo la
 * que uno no apunta nunca porque da pereza.
 *
 * ## Dónde vive la clave
 *
 * Dos caminos, y el orden importa:
 *
 *  1. **Un proxy propio** (`ajustes.vision.proxy`). La clave se queda en el servidor y al
 *     navegador sólo baja el resultado. Es lo recomendado, y `api/vision.ts` es justo eso:
 *     una función que se despliega junto a la aplicación.
 *  2. **Una clave guardada en el dispositivo** (`ajustes.vision.clave`). Sirve para usar
 *     esto sin montar nada, y tiene una pega que conviene decir sin adornos: la clave
 *     viaja en el JavaScript de la página y cualquier script que llegue a ejecutarse ahí
 *     podría leerla. En un móvil o un portátil personal es un riesgo asumible; en un
 *     equipo compartido, no.
 *
 * Sin ninguno de los dos, la estimación por foto está apagada — la foto se guarda igual y
 * los alimentos se pueden apuntar a mano.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Categoria } from '../datos/alimentos';
import { CATEGORIAS } from '../datos/alimentos';
import type { AjustesVision } from '../almacen/almacen';

/** Un alimento reconocido en la foto. Los macros van por 100 g; el peso, en total. */
export interface AlimentoEstimado {
  nombre: string;
  categoria: Categoria;
  /** Gramos que el modelo cree que hay en el plato. */
  gramos: number;
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export interface Estimacion {
  esComida: boolean;
  descripcion: string;
  confianza: 'alta' | 'media' | 'baja';
  alimentos: AlimentoEstimado[];
  /** Lo que el modelo no ha podido ver y cambiaría la cuenta: aceite, salsas, azúcar. */
  aviso: string;
}

const MODELO = 'claude-opus-5';

/**
 * El esquema de la respuesta.
 *
 * Va con salida estructurada en vez de pedir «devuelve un JSON» y confiar: así la
 * respuesta *no puede* venir con un campo de menos ni un número escrito como texto, y no
 * hace falta el `try { JSON.parse } catch` con reintentos que acaba apareciendo siempre
 * que se deja el formato al azar.
 */
const ESQUEMA = {
  type: 'object',
  properties: {
    esComida: {
      type: 'boolean',
      description: 'Falso si en la imagen no hay comida ni bebida.',
    },
    descripcion: {
      type: 'string',
      description: 'El plato en pocas palabras, como lo diría alguien. Ej.: «Pollo al horno con patatas».',
    },
    confianza: {
      type: 'string',
      enum: ['alta', 'media', 'baja'],
      description:
        'Alta: alimentos claros y porción evidente. Media: se reconoce pero el peso es dudoso. Baja: falta información para algo mejor que un orden de magnitud.',
    },
    alimentos: {
      type: 'array',
      description: 'Un elemento por alimento distinguible. Los ingredientes de un guiso van juntos como plato, no uno por uno.',
      items: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre en español, en singular y sin marca.' },
          categoria: { type: 'string', enum: CATEGORIAS },
          gramos: { type: 'number', description: 'Peso total estimado en el plato, en gramos (o ml si es bebida).' },
          kcal: { type: 'number', description: 'Calorías por 100 g de este alimento.' },
          proteinas: { type: 'number', description: 'Gramos de proteína por 100 g.' },
          carbohidratos: { type: 'number', description: 'Gramos de hidratos por 100 g.' },
          grasas: { type: 'number', description: 'Gramos de grasa por 100 g.' },
        },
        required: ['nombre', 'categoria', 'gramos', 'kcal', 'proteinas', 'carbohidratos', 'grasas'],
        additionalProperties: false,
      },
    },
    aviso: {
      type: 'string',
      description:
        'Lo que no se ve en la foto y cambiaría la cuenta (aceite del guiso, salsa por debajo, azúcar de la bebida). Cadena vacía si no hay nada que advertir.',
    },
  },
  required: ['esComida', 'descripcion', 'confianza', 'alimentos', 'aviso'],
  additionalProperties: false,
} as const;

const INSTRUCCIONES = `Estimas el contenido nutricional de comida a partir de fotografías, para una aplicación de registro de comidas en español de España.

Cómo trabajar la foto:

- Busca referencias de tamaño antes de dar un peso: el diámetro del plato, un cubierto, una lata, una mano. Un plato llano ronda los 26 cm y uno hondo los 22; un vaso de agua, 250 ml. Sin ninguna referencia, di que la confianza es baja en vez de afinar un número que no puedes afinar.
- Los macros son POR 100 g del alimento, valores de tabla estándar. Los gramos son el total que ves en el plato. No mezcles las dos cosas.
- Separa lo que se puede pesar por separado (el filete, la guarnición, el pan). Un guiso, una crema o una salsa ya mezclada va como un solo plato: dividirla en ingredientes finge una precisión que la foto no da.
- Cuenta lo que se ve pero también lo que un plato así lleva de serie: si algo está frito o salteado, lleva aceite; si es un plato de restaurante, suele llevar más grasa y sal de lo que parece. Cuando eso sea lo que más incertidumbre añade, dilo en el aviso.
- Si la foto está a medias (una fuente para compartir, un plato ya empezado), estima lo que hay en la imagen, no la ración entera.
- Si no hay comida, pon esComida en falso, deja la lista de alimentos vacía y explica en descripcion qué se ve.

Sobre el tono: quien lee esto está apuntando lo que ha comido, no pidiendo consejo. Describe y estima. Nada de valoraciones sobre si el plato es sano, ni sugerencias de mejora, ni comentarios sobre las calorías.`;

export function visionDisponible(vision: AjustesVision): boolean {
  return Boolean(vision.proxy.trim() || vision.clave.trim());
}

/**
 * Estima la comida de una foto.
 *
 * `base64` es la imagen sin la cabecera `data:` (lo que devuelve `base64DeFoto`). `nota`
 * es lo que el usuario haya querido añadir a mano —«sin aceite», «es media ración»—, que
 * es la información que la foto no tiene y sí arregla la estimación.
 */
export async function estimarComida(
  vision: AjustesVision,
  base64: string,
  tipo: string,
  nota?: string,
): Promise<Estimacion> {
  if (vision.proxy.trim()) return porProxy(vision.proxy.trim(), base64, tipo, nota);
  if (vision.clave.trim()) return porApiDirecta(vision.clave.trim(), base64, tipo, nota);
  throw new Error(
    'La estimación por foto no está configurada. Ve a Ajustes y pon un servidor propio o una clave de la API.',
  );
}

async function porProxy(
  url: string,
  base64: string,
  tipo: string,
  nota?: string,
): Promise<Estimacion> {
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ base64, tipo, nota }),
  });
  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '');
    throw new Error(`El servidor de estimación ha respondido ${respuesta.status}. ${texto}`.trim());
  }
  return validar(await respuesta.json());
}

async function porApiDirecta(
  clave: string,
  base64: string,
  tipo: string,
  nota?: string,
): Promise<Estimacion> {
  const cliente = new Anthropic({
    apiKey: clave,
    // Sin esto el SDK se niega a funcionar en el navegador, y con razón: la clave queda
    // al alcance de la página. Está aquí a propósito y explicado arriba; el camino
    // recomendado sigue siendo el proxy.
    dangerouslyAllowBrowser: true,
  });

  const respuesta = await cliente.messages.create({
    model: MODELO,
    // Holgado porque el modelo razona antes de responder y `max_tokens` cuenta las dos
    // cosas: con un límite justo la respuesta se cortaría a mitad del JSON.
    max_tokens: 8000,
    system: INSTRUCCIONES,
    output_config: {
      format: { type: 'json_schema', schema: ESQUEMA },
      effort: 'medium',
    },
    messages: [{ role: 'user', content: contenidoDelMensaje(base64, tipo, nota) }],
  });

  if (respuesta.stop_reason === 'refusal') {
    throw new Error('El modelo no ha querido analizar esta imagen. Apunta la comida a mano.');
  }

  const texto = respuesta.content.find((bloque) => bloque.type === 'text');
  if (!texto || texto.type !== 'text') {
    throw new Error('La respuesta ha llegado vacía. Prueba otra vez.');
  }
  return validar(JSON.parse(texto.text));
}

/** El mensaje que ve el modelo: la imagen primero y la petición después. */
export function contenidoDelMensaje(base64: string, tipo: string, nota?: string) {
  const limpia = nota?.trim();
  return [
    {
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: tipo as 'image/jpeg' | 'image/png' | 'image/webp',
        data: base64,
      },
    },
    {
      type: 'text' as const,
      text: limpia
        ? `Estima lo que hay en esta comida. El usuario añade: «${limpia}».`
        : 'Estima lo que hay en esta comida.',
    },
  ];
}

export const ESQUEMA_ESTIMACION = ESQUEMA;
export const INSTRUCCIONES_ESTIMACION = INSTRUCCIONES;
export const MODELO_ESTIMACION = MODELO;

/**
 * Comprueba lo que ha llegado antes de dejarlo entrar.
 *
 * La salida estructurada garantiza la forma, no que los números tengan sentido: un peso
 * negativo o unas calorías absurdas cuadran con el esquema y estropearían el resumen del
 * día. Se descarta lo imposible y se recorta lo desmedido en vez de rechazar la
 * estimación entera, que dejaría al usuario sin nada.
 */
function validar(datos: unknown): Estimacion {
  if (!datos || typeof datos !== 'object') throw new Error('La estimación no se entiende.');
  const bruto = datos as Record<string, unknown>;

  const alimentos = Array.isArray(bruto.alimentos) ? bruto.alimentos : [];
  const limpios: AlimentoEstimado[] = [];

  for (const posible of alimentos) {
    if (!posible || typeof posible !== 'object') continue;
    const a = posible as Record<string, unknown>;
    const nombre = typeof a.nombre === 'string' ? a.nombre.trim() : '';
    if (!nombre) continue;

    const gramos = numeroEnRango(a.gramos, 0, 5000);
    if (gramos === null || gramos <= 0) continue;

    // 900 kcal/100 g es aceite puro: por encima de eso no existe alimento.
    const kcal = numeroEnRango(a.kcal, 0, 900) ?? 0;
    limpios.push({
      nombre,
      categoria: (CATEGORIAS as string[]).includes(String(a.categoria))
        ? (a.categoria as Categoria)
        : 'Platos',
      gramos: Math.round(gramos),
      kcal,
      proteinas: numeroEnRango(a.proteinas, 0, 100) ?? 0,
      carbohidratos: numeroEnRango(a.carbohidratos, 0, 100) ?? 0,
      grasas: numeroEnRango(a.grasas, 0, 100) ?? 0,
    });
  }

  const confianza = bruto.confianza;
  return {
    esComida: bruto.esComida !== false && limpios.length > 0,
    descripcion: typeof bruto.descripcion === 'string' ? bruto.descripcion.trim() : '',
    confianza: confianza === 'alta' || confianza === 'baja' ? confianza : 'media',
    alimentos: limpios,
    aviso: typeof bruto.aviso === 'string' ? bruto.aviso.trim() : '',
  };
}

function numeroEnRango(valor: unknown, minimo: number, maximo: number): number | null {
  const n = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isFinite(n)) return null;
  return Math.min(maximo, Math.max(minimo, Math.round(n * 10) / 10));
}
