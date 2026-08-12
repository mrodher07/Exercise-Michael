/**
 * Los gráficos, en SVG y a mano.
 *
 * Sin librería: son dos formas —columnas y una línea— y cualquier librería de gráficos
 * pesa más que toda la aplicación, además de traer su propio criterio visual que habría
 * que pelear para que se pareciese a esto.
 *
 * Las reglas que siguen los dos, y que no son estéticas:
 *
 *  · **Los colores salen de las variables del tema** (`--serie-1`…), que están validadas
 *    contra el fondo de cada tema: banda de luminosidad, contraste y separación entre
 *    series contiguas también con daltonismo. No se escribe un color a pelo aquí.
 *  · **Un solo eje.** Nunca dos escalas en el mismo gráfico: dos medidas de magnitudes
 *    distintas son dos gráficos, no dos ejes.
 *  · **El texto no lleva el color del dato.** Las barras y la línea llevan el color; las
 *    etiquetas y los números van en color de texto. Un verde claro es ilegible como texto
 *    sobre fondo claro, y la identidad ya la da la marca de color que está al lado.
 *  · **Se etiqueta poco.** Un número sobre cada punto es ruido que nadie lee: se etiqueta
 *    el máximo, el último valor o el que se está señalando, y el resto lo cuenta el eje.
 *  · **Se puede señalar.** Un gráfico en pantalla es interactivo por definición, así que
 *    los dos llevan globo al pasar por encima o al tocar.
 */

import { useState } from 'react';
import { useAncho } from './estado';

/** Escala redondeada hacia arriba: los ejes se leen mejor en 0 / 500 / 1000. */
function escalaBonita(maximo: number): { techo: number; pasos: number[] } {
  if (maximo <= 0) return { techo: 1, pasos: [0, 1] };
  const magnitud = 10 ** Math.floor(Math.log10(maximo));
  const normalizado = maximo / magnitud;
  const redondeo = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10;
  const techo = redondeo * magnitud;
  return { techo, pasos: [0, techo / 2, techo] };
}

const ALTO = 168;
const MARGEN = { arriba: 18, derecha: 6, abajo: 24, izquierda: 42 };

export interface Punto {
  /** Identificador estable de la columna o del punto. */
  clave: string;
  /** Lo que se lee bajo el eje. Corto: «L», «12 ago». */
  etiqueta: string;
  /** Lo que se lee en el globo, más largo: «Semana del 10 de agosto». */
  detalle?: string;
  valor: number;
}

/**
 * Columnas. Una sola serie, así que no lleva leyenda: el título ya dice qué se pinta.
 *
 * `objetivo` dibuja una línea de referencia — las calorías del día, las series por semana
 * que uno se ha propuesto. Es una línea fina y discreta a propósito: es referencia, no dato.
 */
export function Columnas({
  titulo,
  subtitulo,
  datos,
  formato,
  objetivo,
  etiquetaObjetivo,
}: {
  titulo?: string;
  subtitulo?: string;
  datos: Punto[];
  formato: (n: number) => string;
  objetivo?: number;
  etiquetaObjetivo?: string;
}) {
  const { referencia, ancho } = useAncho<HTMLDivElement>();
  const [señalada, setSeñalada] = useState<number | null>(null);

  const maximo = Math.max(...datos.map((d) => d.valor), objetivo ?? 0);
  const { techo, pasos } = escalaBonita(maximo);
  const anchoUtil = Math.max(0, ancho - MARGEN.izquierda - MARGEN.derecha);
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const banda = datos.length > 0 ? anchoUtil / datos.length : 0;
  // Tope de 24 px: una columna más gruesa que eso llena el hueco y se come el aire que
  // separa unas de otras. El resto de la banda es ese aire, no un error de cálculo.
  const anchoBarra = Math.max(4, Math.min(24, banda - 8));
  const y = (valor: number) => MARGEN.arriba + altoUtil * (1 - valor / techo);

  // Se etiqueta la columna más alta, que es la que cuenta la historia; el resto, al señalar.
  const indiceMaximo = datos.reduce((mejor, d, i) => (d.valor > datos[mejor].valor ? i : mejor), 0);
  const activa = señalada ?? (datos.length > 0 && datos[indiceMaximo].valor > 0 ? indiceMaximo : null);
  const punto = señalada !== null ? datos[señalada] : null;

  return (
    <div className="grafico" ref={referencia}>
      {titulo && <span className="titulo">{titulo}</span>}
      {subtitulo && <span className="subtitulo">{subtitulo}</span>}

      {ancho > 0 && (
        <svg height={ALTO} role="img" aria-label={titulo ?? 'Gráfico de columnas'}>
          {/* Rejilla: fina, continua y un paso por detrás del fondo. */}
          {pasos.map((paso) => (
            <g key={paso}>
              <line
                x1={MARGEN.izquierda}
                x2={ancho - MARGEN.derecha}
                y1={y(paso)}
                y2={y(paso)}
                stroke="var(--rejilla)"
                strokeWidth="1"
              />
              <text
                x={MARGEN.izquierda - 8}
                y={y(paso) + 4}
                textAnchor="end"
                fontSize="10.5"
                fill="var(--texto-debil)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formato(paso)}
              </text>
            </g>
          ))}

          {objetivo !== undefined && objetivo > 0 && (
            <line
              x1={MARGEN.izquierda}
              x2={ancho - MARGEN.derecha}
              y1={y(objetivo)}
              y2={y(objetivo)}
              stroke="var(--acento)"
              strokeWidth="1.5"
              strokeDasharray="1 0"
              opacity="0.55"
            />
          )}

          {datos.map((d, i) => {
            const centro = MARGEN.izquierda + banda * i + banda / 2;
            const alto = d.valor > 0 ? Math.max(2, altoUtil * (d.valor / techo)) : 0;
            const radio = Math.min(4, anchoBarra / 2);
            const arriba = MARGEN.arriba + altoUtil - alto;
            const izq = centro - anchoBarra / 2;
            return (
              <g key={d.clave}>
                {alto > 0 && (
                  /* Esquinas de arriba redondeadas y base cuadrada: la columna nace de la
                     línea de cero y no debe parecer que flota. */
                  <path
                    d={`M${izq} ${MARGEN.arriba + altoUtil}
                        L${izq} ${arriba + radio}
                        Q${izq} ${arriba} ${izq + radio} ${arriba}
                        L${izq + anchoBarra - radio} ${arriba}
                        Q${izq + anchoBarra} ${arriba} ${izq + anchoBarra} ${arriba + radio}
                        L${izq + anchoBarra} ${MARGEN.arriba + altoUtil} Z`}
                    fill="var(--serie-1)"
                    opacity={señalada === null || señalada === i ? 1 : 0.45}
                  />
                )}
                {activa === i && d.valor > 0 && (
                  <text
                    x={centro}
                    y={arriba - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="var(--texto)"
                  >
                    {formato(d.valor)}
                  </text>
                )}
                <text
                  x={centro}
                  y={ALTO - 8}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="var(--texto-debil)"
                >
                  {d.etiqueta}
                </text>
                {/* La zona sensible ocupa la banda entera, no la columna: en un móvil hay
                    que poder acertar con el dedo en una barra de seis píxeles. */}
                <rect
                  x={MARGEN.izquierda + banda * i}
                  y={MARGEN.arriba}
                  width={banda}
                  height={altoUtil}
                  fill="transparent"
                  onPointerEnter={() => setSeñalada(i)}
                  onPointerDown={() => setSeñalada(i)}
                  onPointerLeave={() => setSeñalada(null)}
                />
              </g>
            );
          })}

          <line
            x1={MARGEN.izquierda}
            x2={ancho - MARGEN.derecha}
            y1={MARGEN.arriba + altoUtil}
            y2={MARGEN.arriba + altoUtil}
            stroke="var(--eje)"
            strokeWidth="1"
          />
        </svg>
      )}

      {punto && (
        <div
          className="globo"
          style={{
            left: MARGEN.izquierda + banda * (señalada ?? 0) + banda / 2,
            top: y(punto.valor),
          }}
        >
          <div className="titulo">{punto.detalle ?? punto.etiqueta}</div>
          <div className="linea">
            <i style={{ background: 'var(--serie-1)', width: 9, height: 9, borderRadius: 3 }} />
            <b>{formato(punto.valor)}</b>
          </div>
        </div>
      )}

      {objetivo !== undefined && objetivo > 0 && etiquetaObjetivo && (
        <div className="leyenda">
          <span>
            <i style={{ background: 'var(--acento)' }} />
            {etiquetaObjetivo}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Una línea. Para lo que cambia poco a poco: el peso corporal, un ejercicio a lo largo de
 * los meses.
 *
 * Lleva mira vertical y globo porque una línea sin poder señalar obliga a adivinar a qué
 * fecha corresponde el pico, que es justo lo que se quiere saber.
 */
export function Linea({
  titulo,
  subtitulo,
  datos,
  formato,
  unidad,
}: {
  titulo?: string;
  subtitulo?: string;
  datos: Punto[];
  formato: (n: number) => string;
  unidad?: string;
}) {
  const { referencia, ancho } = useAncho<HTMLDivElement>();
  const [señalado, setSeñalado] = useState<number | null>(null);

  const valores = datos.map((d) => d.valor);
  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  // El peso corporal se mueve dos kilos en dos meses: si el eje arrancara en cero, la
  // línea sería plana y no se vería nada. Se encuadra el recorrido con un margen.
  const holgura = Math.max((maximo - minimo) * 0.25, maximo * 0.02, 0.5);
  const techo = maximo + holgura;
  const suelo = Math.max(0, minimo - holgura);

  const anchoUtil = Math.max(0, ancho - MARGEN.izquierda - MARGEN.derecha);
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const x = (i: number) => MARGEN.izquierda + (datos.length > 1 ? (anchoUtil * i) / (datos.length - 1) : anchoUtil / 2);
  const y = (valor: number) =>
    MARGEN.arriba + altoUtil * (1 - (valor - suelo) / Math.max(0.0001, techo - suelo));

  const trazo = datos.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(d.valor)}`).join(' ');
  const area = `${trazo} L${x(datos.length - 1)} ${MARGEN.arriba + altoUtil} L${x(0)} ${
    MARGEN.arriba + altoUtil
  } Z`;
  const ejes = [suelo, (suelo + techo) / 2, techo];
  const punto = señalado !== null ? datos[señalado] : null;
  const ultimo = datos.length - 1;

  return (
    <div className="grafico" ref={referencia}>
      {titulo && <span className="titulo">{titulo}</span>}
      {subtitulo && <span className="subtitulo">{subtitulo}</span>}

      {ancho > 0 && datos.length > 0 && (
        <svg
          height={ALTO}
          role="img"
          aria-label={titulo ?? 'Gráfico de línea'}
          onPointerLeave={() => setSeñalado(null)}
          onPointerMove={(e) => {
            const caja = e.currentTarget.getBoundingClientRect();
            const relativo = e.clientX - caja.left - MARGEN.izquierda;
            const paso = datos.length > 1 ? anchoUtil / (datos.length - 1) : anchoUtil;
            const i = Math.round(relativo / paso);
            setSeñalado(Math.max(0, Math.min(datos.length - 1, i)));
          }}
        >
          {ejes.map((paso) => (
            <g key={paso}>
              <line
                x1={MARGEN.izquierda}
                x2={ancho - MARGEN.derecha}
                y1={y(paso)}
                y2={y(paso)}
                stroke="var(--rejilla)"
                strokeWidth="1"
              />
              <text
                x={MARGEN.izquierda - 8}
                y={y(paso) + 4}
                textAnchor="end"
                fontSize="10.5"
                fill="var(--texto-debil)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formato(paso)}
              </text>
            </g>
          ))}

          {/* El relleno es un velo del 10 %, no un bloque de color: da cuerpo a la línea
              sin competir con ella. */}
          <path d={area} fill="var(--serie-1)" opacity="0.1" />
          <path
            d={trazo}
            fill="none"
            stroke="var(--serie-1)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {señalado !== null && (
            <line
              x1={x(señalado)}
              x2={x(señalado)}
              y1={MARGEN.arriba}
              y2={MARGEN.arriba + altoUtil}
              stroke="var(--eje)"
              strokeWidth="1"
            />
          )}

          {/* El punto final lleva un anillo del color del fondo para que se lea aunque
              caiga encima de la línea o de la rejilla. */}
          {[ultimo, ...(señalado !== null && señalado !== ultimo ? [señalado] : [])].map((i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(datos[i].valor)}
              r="4.5"
              fill="var(--serie-1)"
              stroke="var(--panel)"
              strokeWidth="2"
            />
          ))}

          {datos.length > 1 && (
            <>
              <text x={x(0)} y={ALTO - 8} textAnchor="start" fontSize="10.5" fill="var(--texto-debil)">
                {datos[0].etiqueta}
              </text>
              <text
                x={x(ultimo)}
                y={ALTO - 8}
                textAnchor="end"
                fontSize="10.5"
                fill="var(--texto-debil)"
              >
                {datos[ultimo].etiqueta}
              </text>
            </>
          )}
        </svg>
      )}

      {punto && (
        <div className="globo" style={{ left: x(señalado ?? 0), top: y(punto.valor) }}>
          <div className="titulo">{punto.detalle ?? punto.etiqueta}</div>
          <div className="linea">
            <i style={{ background: 'var(--serie-1)', width: 9, height: 9, borderRadius: 3 }} />
            <b>
              {formato(punto.valor)}
              {unidad ? ` ${unidad}` : ''}
            </b>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Barras horizontales para comparar categorías: series por grupo muscular.
 *
 * Con nombres largos (“Isquiotibiales”) las columnas verticales obligan a girar el texto o
 * a abreviarlo; en horizontal el nombre se lee de corrido. El valor va en la punta.
 */
export function Barras({
  datos,
  formato,
  objetivo,
}: {
  datos: Punto[];
  formato: (n: number) => string;
  /** Referencia por categoría, si la hay: «diez series por semana». */
  objetivo?: number;
}) {
  const maximo = Math.max(...datos.map((d) => d.valor), objetivo ?? 0, 1);
  return (
    <div className="pila junta">
      {datos.map((d) => (
        <div key={d.clave} className="fila" style={{ gap: 10 }}>
          <span className="pequeno corta" style={{ flex: '0 0 110px' }}>
            {d.etiqueta}
          </span>
          <div style={{ flex: 1, position: 'relative', height: 14 }}>
            <div
              style={{
                position: 'absolute',
                inset: '3px 0',
                background: 'var(--panel-hueco)',
                borderRadius: 'var(--redondo)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 3,
                bottom: 3,
                left: 0,
                width: `${(d.valor / maximo) * 100}%`,
                background: 'var(--serie-1)',
                borderRadius: 'var(--redondo)',
                minWidth: d.valor > 0 ? 4 : 0,
              }}
            />
            {objetivo !== undefined && objetivo > 0 && objetivo <= maximo && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(objetivo / maximo) * 100}%`,
                  width: 1.5,
                  background: 'var(--eje)',
                }}
              />
            )}
          </div>
          <span className="pequeno numeros gruesa" style={{ flex: '0 0 34px', textAlign: 'right' }}>
            {formato(d.valor)}
          </span>
        </div>
      ))}
    </div>
  );
}
