import { describe, expect, it } from 'vitest';
import {
  EJERCICIOS,
  EQUIPOS,
  GRUPOS,
  catalogoCon,
  coincide,
  idDeNombre,
  type Ejercicio,
} from './ejercicios';

describe('el catálogo de ejercicios', () => {
  /**
   * Esta es la prueba que importa de verdad de este archivo.
   *
   * El id sale del nombre, y los entrenos guardados apuntan al id. Dos ejercicios con el
   * mismo nombre —pasó con «Encogimientos en máquina», que es a la vez la máquina de
   * trapecio y la de abdominales— comparten id, y con él comparten historial y récords:
   * las series de uno aparecen como si fueran del otro. No se ve al mirar la lista y no
   * hay forma de arreglarlo después sin tocar los datos ya guardados.
   */
  it('no tiene ids repetidos', () => {
    const porId = new Map<string, string[]>();
    for (const e of EJERCICIOS) {
      porId.set(e.id, [...(porId.get(e.id) ?? []), `${e.nombre} (${e.grupo})`]);
    }
    const repetidos = [...porId.entries()].filter(([, lista]) => lista.length > 1);
    expect(repetidos).toEqual([]);
  });

  it('no tiene nombres repetidos', () => {
    const nombres = EJERCICIOS.map((e) => e.nombre);
    expect(nombres.length - new Set(nombres).size).toBe(0);
  });

  it('el id se puede reconstruir a partir del nombre', () => {
    for (const e of EJERCICIOS) expect(e.id).toBe(idDeNombre(e.nombre));
  });

  it('quita los acentos al hacer el id', () => {
    expect(idDeNombre('Elevación de talones de pie en máquina')).toBe(
      'elevacion-de-talones-de-pie-en-maquina',
    );
  });

  it('todos los grupos y equipos están en las listas de filtros', () => {
    for (const e of EJERCICIOS) {
      expect(GRUPOS).toContain(e.grupo);
      expect(EQUIPOS).toContain(e.equipo);
      for (const s of e.secundarios) expect(GRUPOS).toContain(s);
    }
  });

  it('ningún ejercicio se cuenta a sí mismo como grupo secundario', () => {
    for (const e of EJERCICIOS) expect(e.secundarios).not.toContain(e.grupo);
  });

  it('cubre todos los grupos musculares', () => {
    for (const grupo of GRUPOS) {
      expect(EJERCICIOS.some((e) => e.grupo === grupo)).toBe(true);
    }
  });
});

describe('la búsqueda', () => {
  const press = EJERCICIOS.find((e) => e.id === 'press-inclinado-con-mancuernas')!;

  it('encuentra por trozos sueltos, sin orden ni acentos', () => {
    expect(coincide(press, 'press incl mancu')).toBe(true);
    expect(coincide(press, 'mancuernas press')).toBe(true);
    expect(coincide(press, 'sentadilla')).toBe(false);
  });

  it('busca también por grupo y por material', () => {
    expect(coincide(press, 'pecho')).toBe(true);
    expect(coincide(press, 'mancuernas')).toBe(true);
  });

  it('sin búsqueda entra todo', () => {
    expect(coincide(press, '   ')).toBe(true);
  });
});

describe('el catálogo con ejercicios propios', () => {
  const mio: Ejercicio = {
    id: 'mi-maquina',
    nombre: 'Mi máquina',
    grupo: 'Pecho',
    equipo: 'máquina',
    secundarios: [],
    medida: 'peso-reps',
    unilateral: false,
  };

  it('pone los propios delante: son los que uno hace de verdad', () => {
    expect(catalogoCon([mio])[0].id).toBe('mi-maquina');
  });

  it('un propio con el id de uno de casa lo sustituye, no lo duplica', () => {
    const suplantador = { ...mio, id: 'press-de-banca-con-barra' };
    const catalogo = catalogoCon([suplantador]);
    expect(catalogo.filter((e) => e.id === 'press-de-banca-con-barra')).toHaveLength(1);
    expect(catalogo[0].propio).toBe(true);
  });
});
