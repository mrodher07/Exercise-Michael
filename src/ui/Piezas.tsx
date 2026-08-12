/**
 * Las piezas que se repiten por toda la aplicación.
 *
 * Están aquí y no en cada vista para que un cambio de criterio —cómo se ve un panel
 * plegado, dónde van los botones de una hoja— se haga una vez. Todas son tontas: reciben
 * lo que tienen que pintar y no saben nada de entrenos ni de comidas.
 */

import { useEffect, type ReactNode } from 'react';
import { IconoBuscar, IconoCruz } from './Iconos';

/** «1 serie», «3 series», «ninguna». El plural se hace bien porque estos resúmenes se
 * leen constantemente y un «1 series» canta. */
export function contar(n: number, singular: string, plural: string, vacio = 'ninguna'): string {
  if (n === 0) return vacio;
  return `${n} ${n === 1 ? singular : plural}`;
}

/**
 * La explicación de una sección, plegada.
 *
 * Los textos que explican cómo se calcula algo hacen falta —nadie adivina qué es un
 * máximo estimado— pero se leen **una vez**. Delante de los controles, a partir de la
 * segunda visita son cinco líneas que hay que saltarse para llegar a lo que vienes a
 * hacer. Aquí ocupan una línea hasta que alguien pregunta.
 */
export function Ayuda({ children }: { children: ReactNode }) {
  return (
    <details className="ayuda-plegable">
      <summary>Cómo se calcula</summary>
      <div>{children}</div>
    </details>
  );
}

/** Un panel que se puede plegar. Está abierto lo que se usa. */
export function Panel({
  titulo,
  resumen,
  abierto = true,
  ayuda,
  children,
}: {
  titulo: ReactNode;
  /** Lo que se lee sin abrir: «3 series», «sin comidas». */
  resumen?: ReactNode;
  abierto?: boolean;
  ayuda?: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className="panel plegable" open={abierto}>
      <summary>
        <span>{titulo}</span>
        {resumen !== undefined && <span className="resumen">{resumen}</span>}
      </summary>
      {ayuda && <Ayuda>{ayuda}</Ayuda>}
      {children}
    </details>
  );
}

export function Seccion({
  titulo,
  accion,
  onAccion,
  children,
}: {
  titulo: string;
  accion?: string;
  onAccion?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="seccion">
      <h2 className="titulo">
        {titulo}
        {accion && onAccion && (
          <button type="button" onClick={onAccion}>
            {accion}
          </button>
        )}
      </h2>
      {children}
    </section>
  );
}

/**
 * Una cifra con su etiqueta.
 *
 * El número va en cifras proporcionales y no tabulares: a este tamaño, `tabular-nums` da
 * a cada dígito el ancho de un cero y un «121» se ve suelto y raro. Las tabulares se
 * reservan para columnas que tienen que alinearse.
 */
export function Cifra({
  etiqueta,
  valor,
  unidad,
  delta,
  signoDelta,
}: {
  etiqueta: string;
  valor: ReactNode;
  unidad?: string;
  delta?: string;
  /** Si subir es bueno o malo. Sin esto, el verde y el rojo son una apuesta. */
  signoDelta?: 'buena' | 'mala' | 'neutra';
}) {
  return (
    <div className="cifra">
      <span className="etiqueta">{etiqueta}</span>
      <span className="num">
        {valor}
        {unidad && <small>{unidad}</small>}
      </span>
      {delta && <span className={`delta ${signoDelta ?? 'neutra'}`}>{delta}</span>}
    </div>
  );
}

/** Barra de progreso hacia un objetivo. Pasado el objetivo cambia de color, no desborda. */
export function Medidor({ hecho, objetivo }: { hecho: number; objetivo: number }) {
  const porcentaje = objetivo > 0 ? (hecho / objetivo) * 100 : 0;
  const clase = porcentaje > 105 ? 'pasado' : porcentaje >= 95 ? 'cumplido' : '';
  return (
    <div className="medidor">
      <span className={clase} style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }} />
    </div>
  );
}

export function Vacio({
  icono,
  titulo,
  children,
  accion,
}: {
  icono?: ReactNode;
  titulo: string;
  children?: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <div className="vacio">
      {icono}
      <span className="titulo">{titulo}</span>
      {children && <p>{children}</p>}
      {accion}
    </div>
  );
}

export function Buscador({
  valor,
  onCambiar,
  etiqueta,
}: {
  valor: string;
  onCambiar: (v: string) => void;
  etiqueta: string;
}) {
  return (
    <div className="buscador">
      <IconoBuscar />
      <input
        type="search"
        className="entrada"
        value={valor}
        placeholder={etiqueta}
        aria-label={etiqueta}
        onChange={(e) => onCambiar(e.target.value)}
      />
    </div>
  );
}

export function Chips<T extends string>({
  opciones,
  elegida,
  onElegir,
  todas = 'Todo',
  envuelve,
}: {
  opciones: readonly T[];
  /** `null` significa «todas». */
  elegida: T | null;
  onElegir: (o: T | null) => void;
  todas?: string;
  envuelve?: boolean;
}) {
  return (
    <div className={`chips${envuelve ? ' envuelve' : ''}`}>
      <button
        type="button"
        className="chip"
        aria-pressed={elegida === null}
        onClick={() => onElegir(null)}
      >
        {todas}
      </button>
      {opciones.map((o) => (
        <button
          key={o}
          type="button"
          className="chip"
          aria-pressed={elegida === o}
          onClick={() => onElegir(elegida === o ? null : o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Segmentado<T extends string>({
  opciones,
  elegida,
  onElegir,
}: {
  opciones: { id: T; texto: string }[];
  elegida: T;
  onElegir: (o: T) => void;
}) {
  return (
    <div className="segmentado">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={elegida === o.id}
          onClick={() => onElegir(o.id)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/**
 * Un diálogo. Hoja que sube desde abajo en el móvil, centrado en el ordenador.
 *
 * Cierra con Escape y al tocar fuera, y mientras está abierto el fondo no hace scroll —
 * en el móvil, sin eso, se arrastra la página de detrás y se pierde el sitio donde
 * estabas.
 */
export function Hoja({
  titulo,
  onCerrar,
  pie,
  ancha,
  children,
}: {
  titulo: string;
  onCerrar: () => void;
  pie?: ReactNode;
  ancha?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPulsar);
    const desbordeAntes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = desbordeAntes;
    };
  }, [onCerrar]);

  return (
    <div
      className="velo"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className={`hoja${ancha ? ' ancha' : ''}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <header>
          <span>{titulo}</span>
          <span className="hueco" />
          <button type="button" className="accion fantasma icono" onClick={onCerrar} aria-label="Cerrar">
            <IconoCruz />
          </button>
        </header>
        <div className="cuerpo-hoja">{children}</div>
        {pie && <footer>{pie}</footer>}
      </div>
    </div>
  );
}

export function Campo({
  etiqueta,
  pista,
  children,
}: {
  etiqueta: string;
  pista?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="campo">
      <span>{etiqueta}</span>
      {children}
      {pista && <span className="pista">{pista}</span>}
    </label>
  );
}

/**
 * Un número que se escribe a mano.
 *
 * `inputMode="decimal"` saca el teclado numérico en el móvil, que es donde se apunta un
 * peso entre series. El campo vacío es `undefined` y no `0`: no es lo mismo «no lo he
 * apuntado» que «he levantado cero kilos», y contarlo como cero estropea las medias.
 */
export function Numero({
  valor,
  onCambiar,
  paso = 'any',
  placeholder,
  etiqueta,
  className = 'entrada numero',
}: {
  valor: number | undefined;
  onCambiar: (v: number | undefined) => void;
  paso?: string;
  placeholder?: string;
  etiqueta?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={paso}
      className={className}
      value={valor ?? ''}
      placeholder={placeholder}
      aria-label={etiqueta}
      onChange={(e) => {
        const texto = e.target.value;
        onCambiar(texto === '' ? undefined : Number(texto));
      }}
    />
  );
}

export function Interruptor({
  texto,
  pista,
  activo,
  onCambiar,
}: {
  texto: string;
  pista?: string;
  activo: boolean;
  onCambiar: (v: boolean) => void;
}) {
  return (
    <label className="interruptor">
      <input type="checkbox" checked={activo} onChange={(e) => onCambiar(e.target.checked)} />
      <span>
        <span className="texto">{texto}</span>
        {pista && <span className="pista">{pista}</span>}
      </span>
    </label>
  );
}

/** Redondea para mostrar: sin decimales si es grande, con uno si es pequeño. */
export function cifra(n: number, decimales = 0): string {
  return n.toLocaleString('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** Kilos con un decimal sólo cuando lo tiene: «80» y «82,5». */
export function kilos(n: number): string {
  return Number.isInteger(n) ? cifra(n) : cifra(n, 1);
}

/** Los kilos de volumen se leen mejor en toneladas cuando pasan del millar. */
export function volumenCorto(kg: number): string {
  if (kg >= 1000) return `${cifra(kg / 1000, 1)} t`;
  return `${cifra(kg)} kg`;
}
