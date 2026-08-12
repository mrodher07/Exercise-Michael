/**
 * Todo lo que se guarda, y cómo se guarda.
 *
 * La interfaz es asíncrona de principio a fin. Hoy todo es local, pero cuando llegue la
 * sincronización sólo habrá que cambiar esta implementación y no a quien la usa; por lo
 * mismo cada registro lleva `id` y `actualizadoEn` desde el primer día — añadirlos después,
 * con entrenos ya guardados, obliga a una migración que no apetece hacer.
 */

import { nuevoId, transaccion, vaciarTodo } from './bd';
import type { Entreno } from '../motor/entreno';
import type { Ejercicio } from '../datos/ejercicios';
import type { Alimento } from '../datos/alimentos';
import type { Actividad, Macros, Meta, Sexo, Toma } from '../motor/nutricion';
import { borrarFoto, vaciarFotos } from './imagenes';
import { claveDia } from '../motor/fechas';

export type { Entreno };

// ─────────────────────────── Rutinas ───────────────────────────

/**
 * Un ejercicio dentro de una rutina: lo que uno *pretende* hacer.
 *
 * Las repeticiones son texto (`'8-10'`, `'al fallo'`) y no un número porque una rutina se
 * escribe como se habla. El número exacto se apunta al hacer la serie, que es donde sí
 * tiene que ser un número.
 */
export interface PlantillaEjercicio {
  ejercicioId: string;
  series: number;
  reps: string;
  peso?: number;
  descanso: number;
  notas?: string;
}

/**
 * Un día de la rutina. Una rutina tiene varios días porque así se entrena: «Torso /
 * Pierna», «Empuje / Tirón / Pierna». Guardarlo como una lista plana de ejercicios
 * obligaría a crear cinco rutinas distintas y a no poder verlas como un plan.
 */
export interface DiaDeRutina {
  id: string;
  nombre: string;
  ejercicios: PlantillaEjercicio[];
}

export interface Rutina {
  id: string;
  actualizadoEn: string;
  nombre: string;
  descripcion?: string;
  dias: DiaDeRutina[];
  /** Se muestra primero y se propone al empezar a entrenar. */
  favorita?: boolean;
}

// ─────────────────────────── Comidas ───────────────────────────

export interface LineaDeComida {
  alimentoId: string;
  gramos: number;
}

export interface Comida {
  id: string;
  actualizadoEn: string;
  fecha: string;
  toma: Toma;
  hora: string;
  lineas: LineaDeComida[];
  /** Foto de la comida, si se registró con la cámara. */
  fotoId?: string | null;
  /**
   * Los macros los estimó el modelo a partir de la foto y no se han confirmado a mano.
   * Se marca en la interfaz: una estimación y un peso medido en la báscula no son lo
   * mismo, y quien lo lee tiene derecho a saber cuál está viendo.
   */
  estimada?: boolean;
  /** Lo segura que dijo estar la estimación. */
  confianza?: 'alta' | 'media' | 'baja';
  notas?: string;
}

// ─────────────────────────── Medidas ───────────────────────────

/** Peso y perímetros. Todo opcional: se apunta lo que se mide ese día, no todo. */
export interface Medida {
  id: string;
  actualizadoEn: string;
  fecha: string;
  peso?: number;
  grasa?: number;
  musculo?: number;
  cintura?: number;
  pecho?: number;
  brazo?: number;
  pierna?: number;
  cadera?: number;
  notas?: string;
}

// ─────────────────────────── Ajustes ───────────────────────────

export interface AjustesVision {
  /**
   * URL de un servidor propio que hable con el modelo. Es la opción recomendada: la clave
   * se queda en el servidor y nunca baja al navegador. `api/vision.ts` es exactamente eso.
   */
  proxy: string;
  /**
   * Clave de la API guardada en este dispositivo, para usar la estimación sin montar
   * servidor. Cómoda y con una pega que hay que saber: cualquier script que llegue a
   * ejecutarse en la página podría leerla. Si el móvil o el portátil no son sólo tuyos,
   * mejor el proxy.
   */
  clave: string;
}

export interface Ajustes {
  id: 'ajustes';
  actualizadoEn: string;
  nombre?: string;
  tema: string;
  sexo?: Sexo;
  edad?: number;
  altura?: number;
  actividad: Actividad;
  meta: Meta;
  /** Objetivo puesto a mano. Si es `null`, se calcula con los datos de la persona. */
  objetivoManual: Macros | null;
  descansoPorDefecto: number;
  /** Avisar cuando acabe el descanso. */
  avisoDescanso: boolean;
  vision: AjustesVision;
}

export const AJUSTES_POR_DEFECTO: Ajustes = {
  id: 'ajustes',
  actualizadoEn: new Date(0).toISOString(),
  tema: 'oscuro',
  actividad: 'moderada',
  meta: 'mantener',
  objetivoManual: null,
  descansoPorDefecto: 90,
  avisoDescanso: true,
  vision: { proxy: '', clave: '' },
};

// ─────────────────────────── El almacén ───────────────────────────

function marcar<T extends { actualizadoEn: string }>(registro: T): T {
  return { ...registro, actualizadoEn: new Date().toISOString() };
}

export const almacen = {
  // Entrenos ─ del más reciente al más antiguo, que es como se leen.
  async listarEntrenos(): Promise<Entreno[]> {
    const todos = await transaccion<Entreno[]>('entrenos', 'readonly', (a) => a.getAll());
    return todos.sort((a, b) => b.comienzo.localeCompare(a.comienzo));
  },

  async guardarEntreno(entreno: Entreno): Promise<Entreno> {
    const marcado = marcar(entreno);
    await transaccion('entrenos', 'readwrite', (a) => a.put(marcado));
    return marcado;
  },

  async borrarEntreno(id: string): Promise<void> {
    await transaccion('entrenos', 'readwrite', (a) => a.delete(id));
  },

  entrenoVacio(nombre = 'Entreno libre'): Entreno {
    const ahora = new Date();
    return {
      id: nuevoId(),
      actualizadoEn: ahora.toISOString(),
      fecha: claveDia(ahora),
      nombre,
      rutinaId: null,
      diaId: null,
      comienzo: ahora.toISOString(),
      fin: null,
      ejercicios: [],
    };
  },

  // Rutinas ─ las favoritas primero, después por nombre.
  async listarRutinas(): Promise<Rutina[]> {
    const todas = await transaccion<Rutina[]>('rutinas', 'readonly', (a) => a.getAll());
    return todas.sort(
      (a, b) =>
        Number(Boolean(b.favorita)) - Number(Boolean(a.favorita)) ||
        a.nombre.localeCompare(b.nombre),
    );
  },

  async guardarRutina(rutina: Rutina): Promise<Rutina> {
    const marcada = marcar(rutina);
    await transaccion('rutinas', 'readwrite', (a) => a.put(marcada));
    return marcada;
  },

  async borrarRutina(id: string): Promise<void> {
    await transaccion('rutinas', 'readwrite', (a) => a.delete(id));
  },

  rutinaVacia(nombre = 'Rutina nueva'): Rutina {
    return {
      id: nuevoId(),
      actualizadoEn: new Date().toISOString(),
      nombre,
      dias: [{ id: nuevoId(), nombre: 'Día 1', ejercicios: [] }],
    };
  },

  /**
   * Ejercicios propios. El catálogo de casa no se guarda —vive en el código— así que aquí
   * sólo están los que ha escrito el usuario, y `catalogoCon` los pone delante.
   */
  async listarEjercicios(): Promise<Ejercicio[]> {
    const todos = await transaccion<Ejercicio[]>('ejercicios', 'readonly', (a) => a.getAll());
    return todos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  },

  async guardarEjercicio(ejercicio: Ejercicio): Promise<Ejercicio> {
    const guardado = { ...ejercicio, propio: true };
    await transaccion('ejercicios', 'readwrite', (a) => a.put(guardado));
    return guardado;
  },

  async borrarEjercicio(id: string): Promise<void> {
    await transaccion('ejercicios', 'readwrite', (a) => a.delete(id));
  },

  // Comidas
  async listarComidas(): Promise<Comida[]> {
    const todas = await transaccion<Comida[]>('comidas', 'readonly', (a) => a.getAll());
    return todas.sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`));
  },

  async guardarComida(comida: Comida): Promise<Comida> {
    const marcada = marcar(comida);
    await transaccion('comidas', 'readwrite', (a) => a.put(marcada));
    return marcada;
  },

  /** Borrar una comida se lleva su foto: si no, quedan megas huérfanos que nadie ve. */
  async borrarComida(comida: Comida): Promise<void> {
    await transaccion('comidas', 'readwrite', (a) => a.delete(comida.id));
    if (comida.fotoId) await borrarFoto(comida.fotoId);
  },

  // Alimentos propios ─ los que ha escrito el usuario o han salido de una foto.
  async listarAlimentos(): Promise<Alimento[]> {
    const todos = await transaccion<Alimento[]>('alimentos', 'readonly', (a) => a.getAll());
    return todos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  },

  async guardarAlimento(alimento: Alimento): Promise<Alimento> {
    const guardado: Alimento = {
      ...alimento,
      propio: true,
      actualizadoEn: new Date().toISOString(),
    };
    await transaccion('alimentos', 'readwrite', (a) => a.put(guardado));
    return guardado;
  },

  async borrarAlimento(id: string): Promise<void> {
    await transaccion('alimentos', 'readwrite', (a) => a.delete(id));
  },

  // Medidas ─ de la más reciente a la más antigua.
  async listarMedidas(): Promise<Medida[]> {
    const todas = await transaccion<Medida[]>('medidas', 'readonly', (a) => a.getAll());
    return todas.sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  async guardarMedida(medida: Medida): Promise<Medida> {
    const marcada = marcar(medida);
    await transaccion('medidas', 'readwrite', (a) => a.put(marcada));
    return marcada;
  },

  async borrarMedida(id: string): Promise<void> {
    await transaccion('medidas', 'readwrite', (a) => a.delete(id));
  },

  // Ajustes ─ un único registro con id fijo.
  async leerAjustes(): Promise<Ajustes> {
    const guardados = await transaccion<Ajustes | undefined>('ajustes', 'readonly', (a) =>
      a.get('ajustes'),
    );
    // Se fusiona con los valores por defecto para que añadir un ajuste nuevo no rompa
    // los que ya estaban guardados sin ese campo.
    return {
      ...AJUSTES_POR_DEFECTO,
      ...guardados,
      vision: { ...AJUSTES_POR_DEFECTO.vision, ...guardados?.vision },
    };
  },

  async guardarAjustes(ajustes: Ajustes): Promise<Ajustes> {
    const marcados = marcar({ ...ajustes, id: 'ajustes' as const });
    await transaccion('ajustes', 'readwrite', (a) => a.put(marcados));
    return marcados;
  },

  nuevoId,

  /** Todo lo guardado, en un objeto listo para exportar a un archivo. */
  async exportar(): Promise<string> {
    const [entrenos, rutinas, ejercicios, comidas, alimentos, medidas, ajustes] = await Promise.all([
      this.listarEntrenos(),
      this.listarRutinas(),
      this.listarEjercicios(),
      this.listarComidas(),
      this.listarAlimentos(),
      this.listarMedidas(),
      this.leerAjustes(),
    ]);
    // La clave de la API no se exporta: una copia de seguridad acaba en la nube, en el
    // correo o en un chat, y una clave dentro de un JSON que viaja así está regalada.
    const { vision: _vision, ...ajustesSinClaves } = ajustes;
    return JSON.stringify(
      {
        version: 1,
        exportadoEn: new Date().toISOString(),
        entrenos,
        rutinas,
        ejercicios,
        comidas,
        alimentos,
        medidas,
        ajustes: ajustesSinClaves,
      },
      null,
      2,
    );
  },

  /**
   * Restaura una copia. No borra lo que hay: fusiona por id, y en caso de choque gana lo
   * más recientemente tocado. Así importar dos veces la misma copia no duplica nada, y
   * traer la copia del móvil al ordenador no se lleva por delante lo de aquí.
   */
  async importar(json: string): Promise<{ [k: string]: number }> {
    const datos = JSON.parse(json) as Record<string, unknown>;
    const cuenta: Record<string, number> = {};

    const fusionar = async (
      tienda: 'entrenos' | 'rutinas' | 'ejercicios' | 'comidas' | 'alimentos' | 'medidas',
      registros: { id: string; actualizadoEn?: string }[],
    ) => {
      let n = 0;
      for (const registro of registros) {
        if (!registro?.id) continue;
        const previo = await transaccion<{ actualizadoEn?: string } | undefined>(
          tienda,
          'readonly',
          (a) => a.get(registro.id),
        );
        if (previo && (previo.actualizadoEn ?? '') > (registro.actualizadoEn ?? '')) continue;
        await transaccion(tienda, 'readwrite', (a) => a.put(registro));
        n += 1;
      }
      cuenta[tienda] = n;
    };

    if (Array.isArray(datos.entrenos)) await fusionar('entrenos', datos.entrenos);
    if (Array.isArray(datos.rutinas)) await fusionar('rutinas', datos.rutinas);
    if (Array.isArray(datos.ejercicios)) await fusionar('ejercicios', datos.ejercicios);
    if (Array.isArray(datos.comidas)) await fusionar('comidas', datos.comidas);
    if (Array.isArray(datos.alimentos)) await fusionar('alimentos', datos.alimentos);
    if (Array.isArray(datos.medidas)) await fusionar('medidas', datos.medidas);

    return cuenta;
  },

  /** Empezar de cero: se va todo, fotos incluidas. */
  async borrarTodo(): Promise<void> {
    await vaciarTodo();
    await vaciarFotos();
  },
};
