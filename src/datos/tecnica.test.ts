import { describe, expect, it } from 'vitest';
import { EJERCICIOS } from './ejercicios';
import { TECNICA, tecnicaDe, videoDe } from './tecnica';

describe('la técnica de los ejercicios', () => {
  it('todos los ejercicios del catálogo tienen técnica', () => {
    const sinTecnica = EJERCICIOS.filter((e) => !TECNICA[e.id]).map((e) => `${e.nombre} (${e.id})`);
    expect(sinTecnica).toEqual([]);
  });

  it('no sobra ninguna técnica', () => {
    // Una técnica cuyo id ya no está en el catálogo es texto muerto que nadie va a ver, y
    // normalmente significa que alguien renombró un ejercicio y se dejó esto atrás.
    const ids = new Set(EJERCICIOS.map((e) => e.id));
    const huerfanas = Object.keys(TECNICA).filter((id) => !ids.has(id));
    expect(huerfanas).toEqual([]);
  });

  it('ninguna ficha está a medias', () => {
    const incompletas = Object.entries(TECNICA)
      .filter(([, t]) => !t.preparacion.trim() || !t.ejecucion.trim() || !t.fallo.trim())
      .map(([id]) => id);
    expect(incompletas).toEqual([]);
  });

  it('las tres partes son frases, no etiquetas sueltas', () => {
    // Un mínimo de longitud atrapa el relleno del tipo «Ver vídeo» o «Pendiente».
    const cortas = Object.entries(TECNICA)
      .filter(([, t]) => t.preparacion.length < 40 || t.ejecucion.length < 40 || t.fallo.length < 40)
      .map(([id]) => id);
    expect(cortas).toEqual([]);
  });

  it('acaban en punto', () => {
    const sinPunto = Object.entries(TECNICA)
      .filter(([, t]) => ![t.preparacion, t.ejecucion, t.fallo].every((x) => x.endsWith('.')))
      .map(([id]) => id);
    expect(sinPunto).toEqual([]);
  });

  it('no hay espacios dobles', () => {
    const dobles = Object.entries(TECNICA)
      .filter(([, t]) => [t.preparacion, t.ejecucion, t.fallo].some((x) => x.includes('  ')))
      .map(([id]) => id);
    expect(dobles).toEqual([]);
  });

  it('no se ha pegado ninguna palabra al unir las líneas', () => {
    // El texto se escribe en varias líneas unidas con `+`, y el error clásico es comerse el
    // espacio del final: «la barraal pecho». Eso no se ve leyendo por encima, pero deja una
    // palabra larguísima, y en español pasar de diecisiete letras es rarísimo.
    const pegadas: string[] = [];
    for (const [id, t] of Object.entries(TECNICA)) {
      for (const campo of [t.preparacion, t.ejecucion, t.fallo]) {
        for (const palabra of campo.split(/[\s,.;:()—«»]+/)) {
          if (palabra.length > 17) pegadas.push(`${id}: ${palabra}`);
        }
      }
    }
    expect(pegadas).toEqual([]);
  });

  it('tecnicaDe devuelve la ficha y no revienta con un id que no existe', () => {
    expect(tecnicaDe('press-de-banca-con-barra')?.preparacion).toContain('Tumbado');
    expect(tecnicaDe('un-ejercicio-que-me-he-inventado')).toBeUndefined();
  });

  it('el vídeo es una búsqueda con el nombre del ejercicio', () => {
    const url = videoDe('Press de banca con barra');
    expect(url).toContain('youtube.com/results');
    expect(decodeURIComponent(url)).toContain('Press de banca con barra técnica');
  });

  it('si una ficha fija un vídeo, se usa ese', () => {
    const id = Object.keys(TECNICA)[0];
    TECNICA[id].video = 'https://ejemplo.test/v';
    expect(videoDe('lo que sea', id)).toBe('https://ejemplo.test/v');
    delete TECNICA[id].video;
  });
});
