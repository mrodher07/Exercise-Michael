/**
 * El estado de la aplicación: las colecciones guardadas y cómo se tocan.
 *
 * Todas las colecciones se comportan igual —listar, guardar, borrar— así que en vez de
 * cinco ganchos casi idénticos hay uno genérico. Lo único que las distingue es de dónde
 * salen y cómo se ordenan, y eso se le pasa por parámetro.
 *
 * Se guarda **con retardo**. Escribir en IndexedDB en cada pulsación de tecla mientras se
 * apunta una serie a mitad del entreno es escribir cincuenta veces para guardar un
 * número; con 400 ms de espera se escribe una vez y la interfaz responde igual, porque el
 * estado en memoria se actualiza en el acto y la base va detrás.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AJUSTES_POR_DEFECTO,
  almacen,
  type Ajustes,
  type Comida,
  type Entreno,
  type Medida,
  type Rutina,
} from '../almacen/almacen';
import { nuevoId } from '../almacen/bd';
import { catalogoCon, EJERCICIOS, type Ejercicio } from '../datos/ejercicios';
import { catalogoDeAlimentos, type Alimento } from '../datos/alimentos';

export { nuevoId };

const RETARDO_GUARDADO = 400;

/**
 * Los guardados que esperan su turno, de todas las colecciones.
 *
 * El retardo evita escribir cincuenta veces mientras se teclea un peso, pero abre una
 * ventana de 400 ms en la que lo último escrito sólo está en memoria. Si en ese momento se
 * cambia de aplicación, se bloquea el móvil o se cierra la pestaña, ese cambio se pierde —y
 * la promesa de esta aplicación es justamente que no hay que darle a guardar—.
 *
 * Así que al ocultarse la página se vacía todo lo pendiente de golpe. `visibilitychange` es
 * el evento que hay que usar en el móvil: `beforeunload` no se dispara de forma fiable
 * cuando el sistema se lleva la aplicación al fondo, que es justo el caso que importa.
 */
const vaciadores = new Set<() => void>();

if (typeof document !== 'undefined') {
  const vaciarTodos = () => {
    for (const vaciar of vaciadores) vaciar();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') vaciarTodos();
  });
  window.addEventListener('pagehide', vaciarTodos);
}

/** Registra un vaciador mientras el gancho esté vivo. */
function useVaciadoAlSalir(vaciar: () => void) {
  const ultimo = useRef(vaciar);
  ultimo.current = vaciar;
  useEffect(() => {
    const envoltorio = () => ultimo.current();
    vaciadores.add(envoltorio);
    return () => {
      vaciadores.delete(envoltorio);
    };
  }, []);
}

interface Coleccion<T> {
  registros: T[];
  cargando: boolean;
  guardar: (registro: T) => void;
  /** Guarda ya, sin esperar el retardo. Para cuando el usuario cierra algo. */
  guardarYa: (registro: T) => Promise<void>;
  borrar: (registro: T) => Promise<void>;
  recargar: () => Promise<void>;
}

function useColeccion<T extends { id: string }>(
  listar: () => Promise<T[]>,
  escribir: (registro: T) => Promise<T>,
  eliminar: (registro: T) => Promise<void>,
): Coleccion<T> {
  const [registros, setRegistros] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  /** Lo que está esperando a escribirse: su temporizador y el registro tal cual quedó. */
  const pendientes = useRef(
    new Map<string, { temporizador: ReturnType<typeof setTimeout>; registro: T }>(),
  );

  const recargar = useCallback(async () => {
    setRegistros(await listar());
    setCargando(false);
  }, [listar]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const vaciar = useCallback(() => {
    for (const { temporizador, registro } of pendientes.current.values()) {
      clearTimeout(temporizador);
      void escribir(registro);
    }
    pendientes.current.clear();
  }, [escribir]);

  useVaciadoAlSalir(vaciar);

  // Al desmontar también: cambiar de sección no debe perder lo último escrito.
  useEffect(() => () => vaciar(), [vaciar]);

  const enMemoria = useCallback((registro: T) => {
    setRegistros((antes) => {
      const i = antes.findIndex((r) => r.id === registro.id);
      return i >= 0 ? antes.map((r) => (r.id === registro.id ? registro : r)) : [registro, ...antes];
    });
  }, []);

  const guardar = useCallback(
    (registro: T) => {
      enMemoria(registro);
      const previo = pendientes.current.get(registro.id);
      if (previo) clearTimeout(previo.temporizador);
      pendientes.current.set(registro.id, {
        registro,
        temporizador: setTimeout(() => {
          pendientes.current.delete(registro.id);
          void escribir(registro);
        }, RETARDO_GUARDADO),
      });
    },
    [enMemoria, escribir],
  );

  const guardarYa = useCallback(
    async (registro: T) => {
      const previo = pendientes.current.get(registro.id);
      if (previo) clearTimeout(previo.temporizador);
      pendientes.current.delete(registro.id);
      enMemoria(registro);
      await escribir(registro);
    },
    [enMemoria, escribir],
  );

  const borrar = useCallback(
    async (registro: T) => {
      const previo = pendientes.current.get(registro.id);
      if (previo) clearTimeout(previo.temporizador);
      pendientes.current.delete(registro.id);
      setRegistros((antes) => antes.filter((r) => r.id !== registro.id));
      await eliminar(registro);
    },
    [eliminar],
  );

  return { registros, cargando, guardar, guardarYa, borrar, recargar };
}

const listarEntrenos = () => almacen.listarEntrenos();
const guardarEntreno = (e: Entreno) => almacen.guardarEntreno(e);
const borrarEntreno = (e: Entreno) => almacen.borrarEntreno(e.id);

export function useEntrenos() {
  const coleccion = useColeccion(listarEntrenos, guardarEntreno, borrarEntreno);
  return useMemo(
    () => ({
      ...coleccion,
      entrenos: coleccion.registros,
      /**
       * El entreno en curso es el que no tiene fin. Sale de los propios datos y no de una
       * variable aparte: así no puede haber dos versiones de la verdad, que es lo que se
       * queda descolgado en cuanto algo falla a medias.
       */
      enCurso: coleccion.registros.find((e) => e.fin === null) ?? null,
    }),
    [coleccion],
  );
}

const listarRutinas = () => almacen.listarRutinas();
const guardarRutina = (r: Rutina) => almacen.guardarRutina(r);
const borrarRutina = (r: Rutina) => almacen.borrarRutina(r.id);

export function useRutinas() {
  const coleccion = useColeccion(listarRutinas, guardarRutina, borrarRutina);
  return { ...coleccion, rutinas: coleccion.registros };
}

const listarComidas = () => almacen.listarComidas();
const guardarComida = (c: Comida) => almacen.guardarComida(c);
const borrarComida = (c: Comida) => almacen.borrarComida(c);

export function useComidas() {
  const coleccion = useColeccion(listarComidas, guardarComida, borrarComida);
  return { ...coleccion, comidas: coleccion.registros };
}

const listarMedidas = () => almacen.listarMedidas();
const guardarMedida = (m: Medida) => almacen.guardarMedida(m);
const borrarMedida = (m: Medida) => almacen.borrarMedida(m.id);

export function useMedidas() {
  const coleccion = useColeccion(listarMedidas, guardarMedida, borrarMedida);
  return { ...coleccion, medidas: coleccion.registros };
}

const listarAlimentos = () => almacen.listarAlimentos();
const guardarAlimento = (a: Alimento) => almacen.guardarAlimento(a);
const borrarAlimento = (a: Alimento) => almacen.borrarAlimento(a.id);

/**
 * Los alimentos: el catálogo de casa más los que ha ido registrando el usuario.
 *
 * `catalogo` es lo que ve el buscador y lleva los propios delante, porque son los que uno
 * come de verdad. `porId` existe porque cada línea de cada comida necesita resolver su
 * alimento, y recorrer una lista de trescientos por cada línea de cada día es trabajo
 * tirado a la basura.
 */
export function useAlimentos() {
  const coleccion = useColeccion(listarAlimentos, guardarAlimento, borrarAlimento);
  const catalogo = useMemo(() => catalogoDeAlimentos(coleccion.registros), [coleccion.registros]);
  const porId = useMemo(() => new Map(catalogo.map((a) => [a.id, a])), [catalogo]);
  return { ...coleccion, propios: coleccion.registros, catalogo, porId };
}

const listarEjercicios = () => almacen.listarEjercicios();
const guardarEjercicio = (e: Ejercicio) => almacen.guardarEjercicio(e);
const borrarEjercicio = (e: Ejercicio) => almacen.borrarEjercicio(e.id);

/**
 * Los ejercicios: el catálogo de casa más los que ha escrito el usuario.
 *
 * `porId` es un mapa y no una búsqueda en la lista porque cada serie de cada entreno tiene
 * que resolver su ejercicio: con doscientos cincuenta en el catálogo y treinta series en
 * pantalla, recorrer la lista cada vez es trabajo tirado.
 */
export function useEjercicios() {
  const coleccion = useColeccion(listarEjercicios, guardarEjercicio, borrarEjercicio);
  const catalogo = useMemo(() => catalogoCon(coleccion.registros), [coleccion.registros]);
  const porId = useMemo(() => new Map(catalogo.map((e) => [e.id, e])), [catalogo]);
  return { ...coleccion, propios: coleccion.registros, catalogo, porId, deCasa: EJERCICIOS.length };
}

/**
 * Los ajustes.
 *
 * Van aparte de las colecciones porque son un único registro y porque se leen antes de
 * pintar nada —el tema es un ajuste—. Mientras cargan se usan los valores por defecto,
 * que es lo que evita el parpadeo de tema claro a oscuro al abrir la aplicación.
 */
export function useAjustes() {
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const pendiente = useRef<{ temporizador: ReturnType<typeof setTimeout>; ajustes: Ajustes } | null>(
    null,
  );

  useEffect(() => {
    void almacen.leerAjustes().then((guardados) => {
      setAjustes(guardados);
      setCargando(false);
    });
  }, []);

  const vaciar = useCallback(() => {
    if (!pendiente.current) return;
    clearTimeout(pendiente.current.temporizador);
    void almacen.guardarAjustes(pendiente.current.ajustes);
    pendiente.current = null;
  }, []);

  useVaciadoAlSalir(vaciar);

  /**
   * El guardado se programa fuera del actualizador de estado a propósito. React llama al
   * actualizador más de una vez en desarrollo, y meter ahí un efecto —programar un
   * temporizador— hace que el número de escrituras dependa de cuántas veces decida
   * llamarlo. Aquí se calcula el valor nuevo, se programa una escritura y ya.
   */
  const cambiar = useCallback((cambios: Partial<Ajustes>) => {
    setAjustes((antes) => {
      const nuevos = { ...antes, ...cambios };
      if (pendiente.current) clearTimeout(pendiente.current.temporizador);
      pendiente.current = {
        ajustes: nuevos,
        temporizador: setTimeout(() => {
          pendiente.current = null;
          void almacen.guardarAjustes(nuevos);
        }, RETARDO_GUARDADO),
      };
      return nuevos;
    });
  }, []);

  const recargar = useCallback(async () => {
    setAjustes(await almacen.leerAjustes());
  }, []);

  return { ajustes, cargando, cambiar, recargar };
}

/**
 * Un aviso corto que se va solo.
 *
 * Es para confirmar lo que ya ha pasado —«Entreno guardado», «Récord de press de banca»—,
 * nunca para preguntar nada: se va en tres segundos y una pregunta que desaparece sola no
 * es una pregunta.
 */
export function useNota() {
  const [nota, setNota] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avisar = useCallback((texto: string) => {
    setNota(texto);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setNota(null), 3000);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  return { nota, avisar };
}

/** Mide el ancho de un elemento. Los gráficos necesitan píxeles de verdad, no porcentajes. */
export function useAncho<T extends HTMLElement>() {
  const referencia = useRef<T | null>(null);
  const [ancho, setAncho] = useState(0);

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => {
      setAncho(entrada.contentRect.width);
    });
    observador.observe(elemento);
    setAncho(elemento.getBoundingClientRect().width);
    return () => observador.disconnect();
  }, []);

  return { referencia, ancho };
}
