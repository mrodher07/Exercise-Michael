import { describe, expect, it } from 'vitest';
import { almacen } from './almacen';
import type { Entreno, SerieRegistrada } from '../motor/entreno';

/** Una serie hecha, que es la que cuenta. */
const serie = (s: Partial<SerieRegistrada>): SerieRegistrada => ({
  peso: undefined,
  reps: undefined,
  segundos: undefined,
  distancia: undefined,
  rpe: undefined,
  hecha: true,
  tipo: 'normal',
  ...s,
});

const entrenoCon = (series: SerieRegistrada[], extra: Partial<Entreno> = {}): Entreno => ({
  id: 'e1',
  actualizadoEn: '2026-08-19T11:00:00.000Z',
  fecha: '2026-08-19',
  nombre: 'Torso libre',
  comienzo: '2026-08-19T10:00:00.000Z',
  fin: '2026-08-19T11:00:00.000Z',
  rutinaId: null,
  diaId: null,
  notas: undefined,
  sensacion: undefined,
  ejercicios: [
    { id: 'l1', ejercicioId: 'press-de-banca-con-barra', series, descanso: 90, notas: undefined },
  ],
  ...extra,
});

describe('un entreno convertido en rutina', () => {
  it('las repeticiones iguales salen como un número', () => {
    const dia = almacen.diaDesdeEntreno(
      entrenoCon([serie({ peso: 80, reps: 8 }), serie({ peso: 80, reps: 8 })]),
    );
    expect(dia.ejercicios[0]).toMatchObject({ series: 2, reps: '8', peso: 80 });
  });

  it('las repeticiones distintas salen como un rango, con el peso más alto', () => {
    const dia = almacen.diaDesdeEntreno(
      entrenoCon([serie({ peso: 80, reps: 10 }), serie({ peso: 85, reps: 6 })]),
    );
    expect(dia.ejercicios[0]).toMatchObject({ reps: '6-10', peso: 85 });
  });

  it('el calentamiento y lo no marcado no entran', () => {
    const dia = almacen.diaDesdeEntreno(
      entrenoCon([
        serie({ peso: 40, reps: 12, tipo: 'calentamiento' }),
        serie({ peso: 80, reps: 8 }),
        serie({ peso: 80, reps: 8 }),
        serie({ peso: 100, reps: 1, hecha: false }),
      ]),
    );
    expect(dia.ejercicios[0]).toMatchObject({ series: 2, reps: '8', peso: 80 });
  });

  it('si no se marcó nada se copian todas, en vez de devolver un día vacío', () => {
    const dia = almacen.diaDesdeEntreno(
      entrenoCon([serie({ peso: 60, reps: 10, hecha: false }), serie({ peso: 60, reps: 9, hecha: false })]),
    );
    expect(dia.ejercicios[0]).toMatchObject({ series: 2, reps: '9-10' });
  });

  it('un isométrico se apunta en tiempo y sin peso', () => {
    const dia = almacen.diaDesdeEntreno(entrenoCon([serie({ segundos: 45 }), serie({ segundos: 60 })]));
    expect(dia.ejercicios[0]).toMatchObject({ reps: '1 min', peso: undefined });
  });

  it('el peso corporal sin lastre no propone peso', () => {
    const dia = almacen.diaDesdeEntreno(entrenoCon([serie({ reps: 8 }), serie({ reps: 6 })]));
    expect(dia.ejercicios[0]).toMatchObject({ reps: '6-8', peso: undefined });
  });

  it('el descanso y las notas de la línea se conservan', () => {
    const entreno = entrenoCon([serie({ peso: 80, reps: 8 })]);
    entreno.ejercicios[0].descanso = 180;
    entreno.ejercicios[0].notas = 'con pausa';
    const dia = almacen.diaDesdeEntreno(entreno);
    expect(dia.ejercicios[0]).toMatchObject({ descanso: 180, notas: 'con pausa' });
  });

  it('la rutina nueva se llama como el entreno y tiene un día', () => {
    const rutina = almacen.rutinaDesdeEntreno(entrenoCon([serie({ peso: 80, reps: 8 })]));
    expect(rutina.nombre).toBe('Torso libre');
    expect(rutina.dias).toHaveLength(1);
    expect(rutina.dias[0].nombre).toBe('Día 1');
  });

  it('cada rutina y cada día nacen con id propio', () => {
    // Si compartieran id, editar una tocaría la otra.
    const a = almacen.rutinaDesdeEntreno(entrenoCon([serie({ peso: 80, reps: 8 })]));
    const b = almacen.rutinaDesdeEntreno(entrenoCon([serie({ peso: 80, reps: 8 })]));
    expect(a.id).not.toBe(b.id);
    expect(a.dias[0].id).not.toBe(b.dias[0].id);
  });
});
