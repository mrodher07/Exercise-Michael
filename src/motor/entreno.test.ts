import { describe, expect, it } from 'vitest';
import {
  historialDe,
  mejorSerie,
  recordsBatidos,
  recordsDe,
  seriesHechas,
  seriesPorGrupo,
  ultimaVezDe,
  unaRepeticionMaxima,
  volumenDeEntreno,
  type Entreno,
  type SerieRegistrada,
} from './entreno';
import { EJERCICIOS } from '../datos/ejercicios';
import { lunesDe } from './fechas';
import { volumenPorSemana } from './entreno';

function serie(peso: number, reps: number, extra: Partial<SerieRegistrada> = {}): SerieRegistrada {
  return { peso, reps, hecha: true, tipo: 'normal', ...extra };
}

function entreno(fecha: string, ejercicioId: string, series: SerieRegistrada[]): Entreno {
  return {
    id: `e-${fecha}-${ejercicioId}`,
    actualizadoEn: `${fecha}T12:00:00.000Z`,
    fecha,
    nombre: 'Entreno',
    rutinaId: null,
    diaId: null,
    comienzo: `${fecha}T10:00:00.000Z`,
    fin: `${fecha}T11:00:00.000Z`,
    ejercicios: [{ id: 'l1', ejercicioId, descanso: 90, series }],
  };
}

describe('volumen', () => {
  it('multiplica kilos por repeticiones', () => {
    const e = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5), serie(80, 5)]);
    expect(volumenDeEntreno(e)).toBe(800);
  });

  it('no cuenta el calentamiento', () => {
    const e = entreno('2026-08-10', 'press-de-banca-con-barra', [
      serie(40, 10, { tipo: 'calentamiento' }),
      serie(80, 5),
    ]);
    expect(volumenDeEntreno(e)).toBe(400);
    expect(seriesHechas(e)).toBe(1);
  });

  it('no cuenta lo que no está marcado como hecho', () => {
    const e = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5, { hecha: false })]);
    expect(volumenDeEntreno(e)).toBe(0);
  });

  it('agrupa el volumen por semanas naturales', () => {
    // 10 de agosto de 2026 es lunes; el 16, domingo de la misma semana.
    const semana = volumenPorSemana(
      [
        entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5)]),
        entreno('2026-08-16', 'press-de-banca-con-barra', [serie(80, 5)]),
        entreno('2026-08-17', 'press-de-banca-con-barra', [serie(80, 5)]),
      ],
      lunesDe,
    );
    expect(semana).toEqual([
      { semana: '2026-08-10', volumen: 800, entrenos: 2 },
      { semana: '2026-08-17', volumen: 400, entrenos: 1 },
    ]);
  });
});

describe('máximo a una repetición', () => {
  it('con una repetición es el propio peso', () => {
    expect(unaRepeticionMaxima(100, 1)).toBe(100);
  });

  it('sube con las repeticiones', () => {
    expect(unaRepeticionMaxima(100, 5)).toBeCloseTo(116.7, 1);
  });

  it('no estima por encima de doce repeticiones, donde la fórmula ya no vale', () => {
    expect(unaRepeticionMaxima(100, 13)).toBeNull();
  });

  it('descarta series sin peso o sin repeticiones', () => {
    expect(unaRepeticionMaxima(0, 5)).toBeNull();
    expect(unaRepeticionMaxima(100, 0)).toBeNull();
  });
});

describe('mejor serie', () => {
  it('elige por máximo estimado, no por kilos', () => {
    const mejor = mejorSerie([serie(100, 1), serie(90, 5)], '2026-08-10');
    // 90 × 5 estima 105, más que 100 × 1.
    expect(mejor?.peso).toBe(90);
  });

  it('a igualdad de estimación se queda con la de más peso', () => {
    const mejor = mejorSerie([serie(100, 3), serie(110, 1)], '2026-08-10');
    expect(mejor?.peso).toBe(110);
  });
});

describe('récords', () => {
  const entrenos = [
    entreno('2026-08-03', 'press-de-banca-con-barra', [serie(80, 6)]),
    entreno('2026-08-10', 'press-de-banca-con-barra', [serie(100, 2), serie(90, 4)]),
    entreno('2026-08-12', 'sentadilla-con-barra', [serie(120, 5)]),
  ];

  it('guarda el mejor peso y las veces entrenado', () => {
    const r = recordsDe(entrenos, 'press-de-banca-con-barra');
    expect(r.mejorPeso?.peso).toBe(100);
    expect(r.vecesEntrenado).toBe(2);
    expect(r.ultimaVez).toBe('2026-08-10');
  });

  it('el mejor volumen de sesión suma todas las series de esa sesión', () => {
    const r = recordsDe(entrenos, 'press-de-banca-con-barra');
    // 100×2 + 90×4 = 560, más que los 480 de la sesión de una sola serie.
    expect(r.mejorVolumenDeSesion).toEqual({ volumen: 560, fecha: '2026-08-10' });
  });

  it('no mezcla ejercicios distintos', () => {
    expect(recordsDe(entrenos, 'sentadilla-con-barra').mejorPeso?.peso).toBe(120);
  });

  it('el historial va de la sesión más antigua a la más reciente', () => {
    const h = historialDe(entrenos, 'press-de-banca-con-barra');
    expect(h.map((x) => x.fecha)).toEqual(['2026-08-03', '2026-08-10']);
  });
});

describe('última vez', () => {
  it('devuelve las series de la sesión más reciente', () => {
    const previo = ultimaVezDe(
      [
        entreno('2026-08-03', 'press-de-banca-con-barra', [serie(80, 8)]),
        entreno('2026-08-10', 'press-de-banca-con-barra', [serie(85, 8)]),
      ],
      'press-de-banca-con-barra',
    );
    expect(previo?.fecha).toBe('2026-08-10');
    expect(previo?.series[0].peso).toBe(85);
  });

  it('no se cuenta a sí mismo: el entreno en curso no es «la última vez»', () => {
    const enCurso = entreno('2026-08-12', 'press-de-banca-con-barra', [serie(95, 5)]);
    const previo = ultimaVezDe(
      [entreno('2026-08-10', 'press-de-banca-con-barra', [serie(85, 8)]), enCurso],
      'press-de-banca-con-barra',
      enCurso.id,
    );
    expect(previo?.fecha).toBe('2026-08-10');
  });
});

describe('récords batidos', () => {
  const previo = entreno('2026-08-03', 'press-de-banca-con-barra', [serie(80, 8)]);

  it('avisa cuando se sube el peso máximo', () => {
    const hoy = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(85, 8)]);
    const batidos = recordsBatidos(hoy, [previo, hoy]);
    expect(batidos).toEqual([
      { ejercicioId: 'press-de-banca-con-barra', tipo: 'peso', antes: 80, ahora: 85 },
    ]);
  });

  it('no se compara consigo mismo', () => {
    const hoy = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 8)]);
    expect(recordsBatidos(hoy, [previo, hoy])).toEqual([]);
  });

  it('la primera vez que se hace un ejercicio no cuenta como récord', () => {
    const hoy = entreno('2026-08-10', 'sentadilla-con-barra', [serie(100, 5)]);
    expect(recordsBatidos(hoy, [previo, hoy])).toEqual([]);
  });

  it('con el mismo peso, más repeticiones también es récord', () => {
    const hoy = entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 10)]);
    const batidos = recordsBatidos(hoy, [previo, hoy]);
    expect(batidos[0].tipo).toBe('estimado');
  });
});

describe('series por grupo', () => {
  it('cuenta media serie a los grupos secundarios', () => {
    const cuenta = seriesPorGrupo(
      [entreno('2026-08-10', 'press-de-banca-con-barra', [serie(80, 5), serie(80, 5)])],
      [...EJERCICIOS],
    );
    expect(cuenta.Pecho).toBe(2);
    // El press de banca lleva tríceps y hombros de refuerzo.
    expect(cuenta['Tríceps']).toBe(1);
    expect(cuenta.Hombros).toBe(1);
  });

  it('ignora ejercicios que ya no están en el catálogo', () => {
    const cuenta = seriesPorGrupo(
      [entreno('2026-08-10', 'ejercicio-que-ya-no-existe', [serie(80, 5)])],
      [...EJERCICIOS],
    );
    expect(Object.keys(cuenta)).toHaveLength(0);
  });
});
