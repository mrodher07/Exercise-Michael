import { describe, expect, it } from 'vitest';
import {
  gastoBasal,
  gastoDiario,
  kcalDeMacros,
  macrosDeRacion,
  objetivoCalculado,
  redondearMacros,
  repartoEnPorcentaje,
  restante,
  sumar,
  tomaPorLaHora,
  type DatosPersona,
} from './nutricion';

const pollo = { kcal: 165, proteinas: 31, carbohidratos: 0, grasas: 3.6 };

describe('macros de una ración', () => {
  it('el catálogo está por 100 g y se escala a lo comido', () => {
    const m = redondearMacros(macrosDeRacion(pollo, 200));
    expect(m).toEqual({ kcal: 330, proteinas: 62, carbohidratos: 0, grasas: 7 });
  });

  it('una ración de cero gramos no aporta nada', () => {
    expect(macrosDeRacion(pollo, 0)).toEqual({
      kcal: 0,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
    });
  });

  it('suma varias raciones', () => {
    const total = redondearMacros(sumar(macrosDeRacion(pollo, 100), macrosDeRacion(pollo, 50)));
    expect(total.proteinas).toBe(47);
  });
});

describe('calorías de los macros', () => {
  it('la grasa aporta más del doble por gramo', () => {
    expect(kcalDeMacros({ proteinas: 0, carbohidratos: 0, grasas: 10 })).toBe(90);
    expect(kcalDeMacros({ proteinas: 10, carbohidratos: 0, grasas: 0 })).toBe(40);
  });

  it('el reparto en porcentaje suma cien salvo por el redondeo', () => {
    const r = repartoEnPorcentaje({ kcal: 0, proteinas: 100, carbohidratos: 100, grasas: 44 });
    expect(r.proteinas + r.carbohidratos + r.grasas).toBeGreaterThanOrEqual(99);
    expect(r.proteinas + r.carbohidratos + r.grasas).toBeLessThanOrEqual(100);
  });

  it('un día sin comer no divide por cero', () => {
    expect(repartoEnPorcentaje({ kcal: 0, proteinas: 0, carbohidratos: 0, grasas: 0 })).toEqual({
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
    });
  });
});

describe('gasto y objetivo', () => {
  const persona: DatosPersona = {
    sexo: 'hombre',
    edad: 24,
    altura: 178,
    peso: 75,
    actividad: 'moderada',
    meta: 'mantener',
  };

  it('calcula el gasto en reposo con Mifflin-St Jeor', () => {
    // 10×75 + 6,25×178 − 5×24 + 5 = 1747,5 → 1748
    expect(gastoBasal(persona)).toBe(1748);
  });

  it('la mujer tiene un término distinto', () => {
    expect(gastoBasal({ ...persona, sexo: 'mujer' })).toBe(1582);
  });

  it('la actividad multiplica el gasto en reposo', () => {
    expect(gastoDiario(persona)).toBe(Math.round(1748 * 1.55));
  });

  it('no inventa datos que faltan', () => {
    expect(gastoBasal({ ...persona, altura: undefined })).toBeNull();
    expect(objetivoCalculado({ actividad: 'moderada', meta: 'perder' })).toBeNull();
  });

  it('perder peso baja las calorías y ganar las sube', () => {
    const mantener = objetivoCalculado(persona)!;
    const perder = objetivoCalculado({ ...persona, meta: 'perder' })!;
    const ganar = objetivoCalculado({ ...persona, meta: 'ganar' })!;
    expect(perder.kcal).toBeLessThan(mantener.kcal);
    expect(ganar.kcal).toBeGreaterThan(mantener.kcal);
  });

  it('fija la proteína por kilo de peso, no por porcentaje', () => {
    const objetivo = objetivoCalculado(persona)!;
    expect(objetivo.proteinas).toBe(Math.round(75 * 1.8));
    // Y el reparto sigue cuadrando con las calorías del objetivo.
    expect(kcalDeMacros(objetivo)).toBeCloseTo(objetivo.kcal, -1);
  });

  it('en un déficit agresivo los hidratos no bajan de cero', () => {
    const objetivo = objetivoCalculado({ ...persona, peso: 120, meta: 'perder' })!;
    expect(objetivo.carbohidratos).toBeGreaterThanOrEqual(0);
  });
});

describe('lo que queda del día', () => {
  it('en negativo cuando se pasa del objetivo', () => {
    const queda = restante(
      { kcal: 2000, proteinas: 150, carbohidratos: 200, grasas: 60 },
      { kcal: 2200, proteinas: 100, carbohidratos: 250, grasas: 70 },
    );
    expect(queda.kcal).toBe(-200);
    expect(queda.proteinas).toBe(50);
  });
});

describe('toma por la hora', () => {
  it('reparte el día en tomas', () => {
    expect(tomaPorLaHora(8)).toBe('desayuno');
    expect(tomaPorLaHora(14)).toBe('comida');
    expect(tomaPorLaHora(21)).toBe('cena');
  });
});
