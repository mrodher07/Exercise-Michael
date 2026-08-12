/**
 * El servidor de estimación por foto.
 *
 * Es el camino recomendado para usar la estimación: la clave de la API vive aquí, en una
 * variable de entorno del servidor, y al navegador sólo baja el resultado. Se despliega
 * junto a la aplicación como función sin servidor (Vercel, Netlify y compañía leen esta
 * carpeta `api/` sin configuración) y en Ajustes se pone su URL — normalmente
 * `/api/vision`, si vive en el mismo dominio.
 *
 * La alternativa —guardar la clave en el dispositivo— está en `src/nube/vision.ts` y
 * funciona sin desplegar nada, pero deja la clave al alcance de la página. Con esto no.
 *
 * Variables de entorno:
 *
 *   ANTHROPIC_API_KEY   La clave. Obligatoria.
 *   VISION_ORIGEN       Origen autorizado para el CORS (ej.: https://midominio.com).
 *                       Si no se pone, sólo se aceptan peticiones del mismo origen, que
 *                       es lo correcto cuando la aplicación y esta función comparten
 *                       dominio: así una página cualquiera no puede gastar tu cuota.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  ESQUEMA_ESTIMACION,
  INSTRUCCIONES_ESTIMACION,
  MODELO_ESTIMACION,
  contenidoDelMensaje,
} from '../src/nube/vision';

/** Lo mínimo de la petición y la respuesta que usamos, sin atarnos a un proveedor. */
interface Peticion {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface Respuesta {
  status: (codigo: number) => Respuesta;
  setHeader: (nombre: string, valor: string) => void;
  json: (cuerpo: unknown) => void;
  end: () => void;
}

/** Una foto reescalada ronda los 200 KB; en base64, un tercio más. 8 MB sobra. */
const BYTES_MAXIMOS = 8 * 1024 * 1024;

const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

export default async function handler(peticion: Peticion, respuesta: Respuesta): Promise<void> {
  const origen = process.env.VISION_ORIGEN;
  if (origen) {
    respuesta.setHeader('Access-Control-Allow-Origin', origen);
    respuesta.setHeader('Access-Control-Allow-Headers', 'content-type');
    respuesta.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }

  if (peticion.method === 'OPTIONS') {
    respuesta.status(204).end();
    return;
  }

  if (peticion.method !== 'POST') {
    respuesta.status(405).json({ error: 'Sólo se admite POST.' });
    return;
  }

  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) {
    // El servidor está mal configurado; no es culpa de quien llama, y conviene que el
    // mensaje lo diga para no ir a buscar el problema en el móvil.
    respuesta.status(500).json({ error: 'Falta ANTHROPIC_API_KEY en el servidor.' });
    return;
  }

  const cuerpo = (typeof peticion.body === 'string' ? JSON.parse(peticion.body) : peticion.body) as
    | { base64?: unknown; tipo?: unknown; nota?: unknown }
    | undefined;

  const base64 = typeof cuerpo?.base64 === 'string' ? cuerpo.base64 : '';
  const tipo = typeof cuerpo?.tipo === 'string' ? cuerpo.tipo : 'image/jpeg';
  const nota = typeof cuerpo?.nota === 'string' ? cuerpo.nota.slice(0, 500) : undefined;

  if (!base64) {
    respuesta.status(400).json({ error: 'Falta la imagen.' });
    return;
  }
  if (base64.length > BYTES_MAXIMOS) {
    respuesta.status(413).json({ error: 'La imagen pesa demasiado.' });
    return;
  }
  if (!TIPOS.includes(tipo)) {
    respuesta.status(415).json({ error: `Formato no admitido: ${tipo}.` });
    return;
  }

  try {
    const cliente = new Anthropic({ apiKey: clave });
    const mensaje = await cliente.messages.create({
      model: MODELO_ESTIMACION,
      max_tokens: 8000,
      system: INSTRUCCIONES_ESTIMACION,
      output_config: {
        format: { type: 'json_schema', schema: ESQUEMA_ESTIMACION },
        effort: 'medium',
      },
      messages: [{ role: 'user', content: contenidoDelMensaje(base64, tipo, nota) }],
    });

    if (mensaje.stop_reason === 'refusal') {
      respuesta.status(422).json({ error: 'El modelo no ha querido analizar esta imagen.' });
      return;
    }

    const texto = mensaje.content.find((bloque) => bloque.type === 'text');
    if (!texto || texto.type !== 'text') {
      respuesta.status(502).json({ error: 'La respuesta del modelo ha llegado vacía.' });
      return;
    }

    // Se devuelve el JSON tal cual: quien lo recibe (`src/nube/vision.ts`) ya lo valida,
    // y así hay un único sitio donde se decide qué números son aceptables.
    respuesta.status(200).json(JSON.parse(texto.text));
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido.';
    // El detalle se queda en el registro del servidor; al cliente sólo lo que le sirve.
    console.error('[vision]', mensaje);
    const status = error instanceof Anthropic.RateLimitError ? 429 : 502;
    respuesta.status(status).json({
      error:
        status === 429
          ? 'Se ha alcanzado el límite de peticiones. Prueba en un momento.'
          : 'No se ha podido estimar la comida.',
    });
  }
}
