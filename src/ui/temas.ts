/**
 * Temas visuales.
 *
 * Cada tema es un bloque de variables CSS en `estilos.css` bajo `:root[data-tema='<id>']`.
 * Aquí sólo vive el catálogo: qué temas hay, cómo se llaman y en qué orden se ofrecen.
 *
 * **Añadir uno cuesta más que escribir sus colores.** Los cuatro tonos de las series de
 * los gráficos (`--serie-1` a `--serie-4`) están validados contra la superficie concreta
 * de cada tema: se comprueba que caben en la banda de luminosidad, que dos series
 * contiguas se distinguen también con daltonismo y que contrastan con el fondo. Un tema
 * nuevo cambia el fondo, así que hay que volver a pasar esa validación y quedarse con un
 * orden que la apruebe, no elegir cuatro colores bonitos. Mientras eso no esté hecho, dos
 * temas bien resueltos valen más que seis a medias.
 */

export interface Tema {
  id: string;
  nombre: string;
  descripcion: string;
  /** Símbolo para el selector. */
  icono: string;
  /** Le dice al navegador si los controles nativos van en claro u oscuro. */
  esquema: 'dark' | 'light';
}

export const TEMAS: readonly Tema[] = [
  {
    id: 'oscuro',
    nombre: 'Oscuro',
    descripcion: 'El de casa. Para el gimnasio de noche y para no deslumbrar entre series.',
    icono: '☾',
    esquema: 'dark',
  },
  {
    id: 'claro',
    nombre: 'Claro',
    descripcion: 'Para entrenar a plena luz, que es donde peor se ve una pantalla.',
    icono: '☀',
    esquema: 'light',
  },
];

export const TEMA_POR_DEFECTO = 'oscuro';

export function temaDe(id: string): Tema {
  return TEMAS.find((t) => t.id === id) ?? TEMAS[0];
}

/** Aplica el tema al documento. */
export function aplicarTema(id: string): void {
  const tema = temaDe(id);
  document.documentElement.dataset.tema = tema.id;
  // La barra del navegador en el móvil también se pinta: si no, queda una franja blanca
  // encima de una aplicación oscura y canta.
  const color = tema.esquema === 'dark' ? '#0d0d0d' : '#f9f9f7';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}
