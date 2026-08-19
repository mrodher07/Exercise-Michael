import { describe, expect, it } from 'vitest';
import {
  claveDia,
  diasEntre,
  duracionCorta,
  duracionLarga,
  formatoDuracion,
  fechaDeClave,
  lunesDe,
  nombreDelDia,
  segundosEntre,
  sumarDias,
  ultimosDias,
} from './fechas';

describe('claves de día', () => {
  it('usa el día local, no el de UTC', () => {
    // 23:30 del 12 de agosto en local ya es el 13 en UTC; para quien cena, es el 12.
    const noche = new Date(2026, 7, 12, 23, 30);
    expect(claveDia(noche)).toBe('2026-08-12');
  });

  it('rellena mes y día con dos cifras', () => {
    expect(claveDia(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('ida y vuelta sin perder el día', () => {
    expect(claveDia(fechaDeClave('2026-03-29'))).toBe('2026-03-29');
  });

  it('suma y resta días cruzando el cambio de mes', () => {
    expect(sumarDias('2026-08-31', 1)).toBe('2026-09-01');
    expect(sumarDias('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('cuenta los días entre dos fechas', () => {
    expect(diasEntre('2026-08-10', '2026-08-17')).toBe(7);
    expect(diasEntre('2026-08-17', '2026-08-10')).toBe(-7);
  });
});

describe('semanas', () => {
  it('la semana empieza en lunes', () => {
    // 2026-08-12 es miércoles.
    expect(nombreDelDia('2026-08-12')).toBe('Miércoles');
    expect(lunesDe('2026-08-12')).toBe('2026-08-10');
  });

  it('el domingo pertenece a la semana que acaba, no a la que empieza', () => {
    expect(nombreDelDia('2026-08-16')).toBe('Domingo');
    expect(lunesDe('2026-08-16')).toBe('2026-08-10');
  });

  it('un lunes es su propio lunes', () => {
    expect(lunesDe('2026-08-10')).toBe('2026-08-10');
  });
});

describe('últimos días', () => {
  it('acaba en la fecha dada y va de más antiguo a más reciente', () => {
    expect(ultimosDias(3, '2026-08-12')).toEqual(['2026-08-10', '2026-08-11', '2026-08-12']);
  });
});

describe('duraciones', () => {
  it('la hora sólo aparece cuando existe', () => {
    expect(formatoDuracion(309)).toBe('5:09');
    expect(formatoDuracion(3909)).toBe('1:05:09');
  });

  it('no cuenta hacia atrás', () => {
    expect(formatoDuracion(-5)).toBe('0:00');
  });

  it('en texto largo redondea a minutos', () => {
    expect(duracionLarga(4320)).toBe('1 h 12 min');
    expect(duracionLarga(3600)).toBe('1 h');
    expect(duracionLarga(600)).toBe('10 min');
  });

  it('no dice «0 min», que parece un error', () => {
    // 40 s ya redondea a un minuto; por debajo de medio minuto es cuando saldría un cero.
    expect(duracionLarga(40)).toBe('1 min');
    expect(duracionLarga(20)).toBe('menos de 1 min');
  });

  it('mide entre dos instantes', () => {
    expect(segundosEntre('2026-08-12T10:00:00.000Z', '2026-08-12T11:30:00.000Z')).toBe(5400);
  });
});

describe('duración corta', () => {
  it('por debajo del minuto, segundos', () => {
    expect(duracionCorta(45)).toBe('45 s');
  });

  it('minutos justos y minutos con resto', () => {
    expect(duracionCorta(1800)).toBe('30 min');
    expect(duracionCorta(1830)).toBe('30:30 min');
  });

  it('a partir de la hora, horas', () => {
    expect(duracionCorta(3600)).toBe('1 h');
    expect(duracionCorta(3900)).toBe('1 h 5 min');
  });
});
