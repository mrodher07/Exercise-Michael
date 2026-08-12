/**
 * Progreso: lo que se mira despacio, sentado y una vez por semana.
 *
 * Está separado del Resumen a propósito. El Resumen contesta «¿cómo va la semana?» de un
 * vistazo; aquí se viene a comparar meses, ver si un grupo se está quedando corto o
 * repasar los récords. Son dos usos distintos y mezclarlos convierte la primera pantalla
 * en un panel de control que hay que leer entero.
 */

import { useMemo, useState } from 'react';
import type { Ejercicio, Grupo } from '../datos/ejercicios';
import {
  recordsDe,
  seriesHechas,
  seriesPorGrupo,
  volumenDeEntreno,
  volumenPorSemana,
  type Entreno,
} from '../motor/entreno';
import type { Medida } from '../almacen/almacen';
import { claveDia, formatoFecha, hoy, lunesDe, sumarDias } from '../motor/fechas';
import { Barras, Columnas, Linea } from './Graficos';
import {
  Campo,
  Cifra,
  Hoja,
  Numero,
  Panel,
  Seccion,
  Segmentado,
  Vacio,
  cifra,
  contar,
  kilos,
  volumenCorto,
} from './Piezas';
import { IconoBalanza, IconoChispa, IconoMas, IconoPapelera, IconoProgreso } from './Iconos';
import { nuevoId } from './estado';

type Pestaña = 'volumen' | 'grupos' | 'records' | 'cuerpo';

const PESTAÑAS: { id: Pestaña; texto: string }[] = [
  { id: 'volumen', texto: 'Volumen' },
  { id: 'grupos', texto: 'Grupos' },
  { id: 'records', texto: 'Récords' },
  { id: 'cuerpo', texto: 'Cuerpo' },
];

export function VistaProgreso({
  entrenos,
  catalogo,
  porId,
  medidas,
  guardarMedida,
  borrarMedida,
  avisar,
}: {
  entrenos: Entreno[];
  catalogo: Ejercicio[];
  porId: Map<string, Ejercicio>;
  medidas: Medida[];
  guardarMedida: (m: Medida) => void;
  borrarMedida: (m: Medida) => Promise<void>;
  avisar: (texto: string) => void;
}) {
  const [pestaña, setPestaña] = useState<Pestaña>('volumen');
  const hechos = useMemo(() => entrenos.filter((e) => e.fin !== null), [entrenos]);

  return (
    <>
      <Seccion titulo="Progreso">
        <Segmentado opciones={PESTAÑAS} elegida={pestaña} onElegir={setPestaña} />
      </Seccion>

      {pestaña === 'volumen' && <Volumen entrenos={hechos} />}
      {pestaña === 'grupos' && <Grupos entrenos={hechos} catalogo={catalogo} />}
      {pestaña === 'records' && <Records entrenos={hechos} porId={porId} />}
      {pestaña === 'cuerpo' && (
        <Cuerpo
          medidas={medidas}
          guardarMedida={guardarMedida}
          borrarMedida={borrarMedida}
          avisar={avisar}
        />
      )}
    </>
  );
}

function Volumen({ entrenos }: { entrenos: Entreno[] }) {
  const porSemana = volumenPorSemana(entrenos, lunesDe);
  const ultimas = porSemana.slice(-12);
  const total = entrenos.reduce((t, e) => t + volumenDeEntreno(e), 0);
  const series = entrenos.reduce((t, e) => t + seriesHechas(e), 0);

  if (entrenos.length === 0) {
    return (
      <div className="panel">
        <Vacio icono={<IconoProgreso />} titulo="Sin datos todavía">
          Con dos o tres entrenos guardados esta pantalla empieza a tener sentido.
        </Vacio>
      </div>
    );
  }

  return (
    <>
      <Seccion titulo="Desde el principio">
        <div className="rejilla auto">
          <Cifra etiqueta="Entrenos" valor={entrenos.length} />
          <Cifra etiqueta="Series" valor={cifra(series)} />
          <Cifra etiqueta="Volumen total" valor={volumenCorto(total)} />
          <Cifra
            etiqueta="Media por entreno"
            valor={volumenCorto(Math.round(total / entrenos.length))}
          />
        </div>
      </Seccion>

      {ultimas.length > 1 && (
        <Seccion titulo="Últimas semanas">
          <Panel
            titulo="Volumen por semana"
            resumen={contar(ultimas.length, 'semana', 'semanas')}
            ayuda={
              <p>
                Kilos × repeticiones de todas las series hechas, sin contar calentamientos.
                Sube al levantar más peso, al hacer más repeticiones o al añadir series — es
                una medida de <em>cuánto trabajo</em> has hecho, no de lo fuerte que eres. Para
                eso están los récords.
              </p>
            }
          >
            <Columnas
              datos={ultimas.map((s) => ({
                clave: s.semana,
                etiqueta: `${s.semana.slice(8, 10)}/${s.semana.slice(5, 7)}`,
                detalle: `Semana del ${formatoFecha(s.semana)} · ${contar(
                  s.entrenos,
                  'entreno',
                  'entrenos',
                )}`,
                valor: Math.round(s.volumen),
              }))}
              formato={(n) => (n >= 1000 ? `${cifra(n / 1000, 1)} t` : cifra(n))}
            />
          </Panel>
        </Seccion>
      )}
    </>
  );
}

function Grupos({ entrenos, catalogo }: { entrenos: Entreno[]; catalogo: Ejercicio[] }) {
  const [semanas, setSemanas] = useState<'1' | '4'>('4');
  const desde = sumarDias(lunesDe(hoy()), semanas === '1' ? 0 : -21);
  const enRango = entrenos.filter((e) => e.fecha >= desde);
  const cuenta = seriesPorGrupo(enRango, catalogo);
  const divisor = semanas === '1' ? 1 : 4;

  const ordenados = (Object.entries(cuenta) as [Grupo, number][])
    .filter(([, series]) => series > 0)
    .map(([grupo, series]) => ({ grupo, series: series / divisor }))
    .sort((a, b) => b.series - a.series);

  return (
    <Seccion titulo="Series por grupo">
      <div className="pila">
        <Segmentado
          opciones={[
            { id: '1' as const, texto: 'Esta semana' },
            { id: '4' as const, texto: 'Media de 4 semanas' },
          ]}
          elegida={semanas}
          onElegir={setSemanas}
        />

        {ordenados.length === 0 ? (
          <div className="panel">
            <Vacio icono={<IconoProgreso />} titulo="Nada en este periodo" />
          </div>
        ) : (
          <Panel
            titulo="Reparto"
            resumen={contar(ordenados.length, 'grupo', 'grupos')}
            ayuda={
              <>
                <p>
                  Series hechas de cada grupo, sin calentamientos. El trabajo secundario suma
                  media serie: el press de banca hace algo por el tríceps, pero no lo mismo que
                  una extensión en polea, y contarlo entero diría que los tríceps están
                  cubiertos cuando no se han tocado.
                </p>
                <p style={{ marginTop: 8 }}>
                  Sirve para ver desequilibrios —diez series de pecho y dos de espalda— más que
                  para llegar a un número concreto.
                </p>
              </>
            }
          >
            <Barras
              datos={ordenados.map((o) => ({
                clave: o.grupo,
                etiqueta: o.grupo,
                valor: Math.round(o.series * 10) / 10,
              }))}
              formato={(n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))}
              objetivo={10}
            />
          </Panel>
        )}
      </div>
    </Seccion>
  );
}

function Records({ entrenos, porId }: { entrenos: Entreno[]; porId: Map<string, Ejercicio> }) {
  const filas = useMemo(() => {
    const ids = new Set(entrenos.flatMap((e) => e.ejercicios.map((l) => l.ejercicioId)));
    return [...ids]
      .map((id) => ({ id, nombre: porId.get(id)?.nombre ?? id, records: recordsDe(entrenos, id) }))
      .filter((f) => f.records.mejorPeso !== null)
      .sort(
        (a, b) =>
          (b.records.mejorEstimado?.estimado ?? b.records.mejorPeso?.peso ?? 0) -
          (a.records.mejorEstimado?.estimado ?? a.records.mejorPeso?.peso ?? 0),
      );
  }, [entrenos, porId]);

  if (filas.length === 0) {
    return (
      <div className="panel">
        <Vacio icono={<IconoChispa />} titulo="Todavía no hay marcas">
          Los récords salen de las series con peso y repeticiones. Apunta unas cuantas y
          vuelve.
        </Vacio>
      </div>
    );
  }

  return (
    <Seccion titulo={`Récords · ${contar(filas.length, 'ejercicio', 'ejercicios')}`}>
      <Panel
        titulo="Tus marcas"
        resumen={`${filas.length}`}
        ayuda={
          <p>
            El <strong>máximo estimado</strong> convierte una serie a su equivalente de una
            repetición con la fórmula de Epley, para poder comparar 100×2 con 90×5. Por encima
            de doce repeticiones la fórmula deja de valer y no se estima nada, en vez de dar un
            número bonito y falso.
          </p>
        }
      >
        <div className="desplazable">
          <table className="tabla">
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Más peso</th>
                <th>Máx. estimado</th>
                <th>Veces</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>{f.nombre}</td>
                  <td>
                    {f.records.mejorPeso ? `${kilos(f.records.mejorPeso.peso)}×${f.records.mejorPeso.reps}` : '—'}
                  </td>
                  <td>
                    {f.records.mejorEstimado?.estimado
                      ? `${kilos(f.records.mejorEstimado.estimado)} kg`
                      : '—'}
                  </td>
                  <td>{f.records.vecesEntrenado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Seccion>
  );
}

function Cuerpo({
  medidas,
  guardarMedida,
  borrarMedida,
  avisar,
}: {
  medidas: Medida[];
  guardarMedida: (m: Medida) => void;
  borrarMedida: (m: Medida) => Promise<void>;
  avisar: (texto: string) => void;
}) {
  const [apuntando, setApuntando] = useState(false);

  const conPeso = [...medidas]
    .filter((m) => m.peso !== undefined)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const ultima = conPeso[conPeso.length - 1];
  const primera = conPeso[0];

  return (
    <>
      <Seccion titulo="Cuerpo" accion="Apuntar" onAccion={() => setApuntando(true)}>
        {conPeso.length === 0 ? (
          <div className="panel">
            <Vacio
              icono={<IconoBalanza />}
              titulo="Sin medidas"
              accion={
                <button type="button" className="accion primaria" onClick={() => setApuntando(true)}>
                  <IconoMas />
                  Apuntar la primera
                </button>
              }
            >
              El peso y los perímetros cuentan cosas que el volumen del entreno no cuenta.
              Pésate siempre a la misma hora: si no, el ruido del día tapa el cambio real.
            </Vacio>
          </div>
        ) : (
          <>
            <div className="rejilla auto">
              <Cifra
                etiqueta="Peso actual"
                valor={kilos(ultima.peso as number)}
                unidad="kg"
                delta={
                  conPeso.length > 1
                    ? `${
                        (ultima.peso as number) - (primera.peso as number) >= 0 ? '+' : ''
                      }${kilos((ultima.peso as number) - (primera.peso as number))} kg desde el principio`
                    : undefined
                }
                signoDelta="neutra"
              />
              {ultima.grasa !== undefined && (
                <Cifra etiqueta="Grasa" valor={kilos(ultima.grasa)} unidad="%" />
              )}
              {ultima.cintura !== undefined && (
                <Cifra etiqueta="Cintura" valor={kilos(ultima.cintura)} unidad="cm" />
              )}
              <Cifra etiqueta="Registros" valor={medidas.length} />
            </div>

            {conPeso.length > 1 && (
              <div className="panel">
                <Linea
                  titulo="Peso corporal"
                  subtitulo="El eje no arranca en cero a propósito: si lo hiciera, dos kilos de cambio se verían como una línea plana."
                  datos={conPeso.map((m) => ({
                    clave: m.id,
                    etiqueta: `${m.fecha.slice(8, 10)}/${m.fecha.slice(5, 7)}`,
                    detalle: formatoFecha(m.fecha),
                    valor: m.peso as number,
                  }))}
                  formato={(n) => kilos(Math.round(n * 10) / 10)}
                  unidad="kg"
                />
              </div>
            )}

            <div className="panel hueco">
              <div className="lista">
                {medidas.slice(0, 20).map((m) => (
                  <div key={m.id} className="fila-lista quieta">
                    <span className="marca-icono">
                      <IconoBalanza />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="nombre">{formatoFecha(m.fecha)}</span>
                      <span className="meta">
                        {[
                          m.peso !== undefined && `${kilos(m.peso)} kg`,
                          m.grasa !== undefined && `${kilos(m.grasa)} % grasa`,
                          m.cintura !== undefined && `cintura ${kilos(m.cintura)} cm`,
                          m.brazo !== undefined && `brazo ${kilos(m.brazo)} cm`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="accion fantasma icono"
                      aria-label={`Borrar la medida del ${formatoFecha(m.fecha)}`}
                      onClick={() => void borrarMedida(m)}
                    >
                      <IconoPapelera />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Seccion>

      {apuntando && (
        <ApuntarMedida
          onGuardar={(medida) => {
            guardarMedida(medida);
            setApuntando(false);
            avisar('Medida apuntada');
          }}
          onCerrar={() => setApuntando(false)}
        />
      )}
    </>
  );
}

function ApuntarMedida({
  onGuardar,
  onCerrar,
}: {
  onGuardar: (m: Medida) => void;
  onCerrar: () => void;
}) {
  const [medida, setMedida] = useState<Medida>({
    id: nuevoId(),
    actualizadoEn: new Date().toISOString(),
    fecha: claveDia(),
  });

  const cambiar = (cambios: Partial<Medida>) => setMedida((antes) => ({ ...antes, ...cambios }));
  const algoQueGuardar = [
    medida.peso,
    medida.grasa,
    medida.musculo,
    medida.cintura,
    medida.pecho,
    medida.brazo,
    medida.pierna,
    medida.cadera,
  ].some((v) => v !== undefined);

  return (
    <Hoja
      titulo="Apuntar medida"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="accion" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="accion primaria"
            disabled={!algoQueGuardar}
            onClick={() => onGuardar(medida)}
          >
            Guardar
          </button>
        </>
      }
    >
      <div className="pila">
        <Campo etiqueta="Fecha">
          <input
            type="date"
            className="entrada"
            value={medida.fecha}
            onChange={(e) => cambiar({ fecha: e.target.value })}
          />
        </Campo>

        <p className="pequeno debil">
          Rellena solo lo que te hayas medido hoy. Lo que quede vacío no se guarda: no es lo
          mismo «no me lo he medido» que «mide cero».
        </p>

        <div className="rejilla dos">
          <Campo etiqueta="Peso (kg)">
            <Numero valor={medida.peso} paso="0.1" onCambiar={(v) => cambiar({ peso: v })} />
          </Campo>
          <Campo etiqueta="Grasa (%)">
            <Numero valor={medida.grasa} paso="0.1" onCambiar={(v) => cambiar({ grasa: v })} />
          </Campo>
          <Campo etiqueta="Cintura (cm)">
            <Numero valor={medida.cintura} paso="0.5" onCambiar={(v) => cambiar({ cintura: v })} />
          </Campo>
          <Campo etiqueta="Pecho (cm)">
            <Numero valor={medida.pecho} paso="0.5" onCambiar={(v) => cambiar({ pecho: v })} />
          </Campo>
          <Campo etiqueta="Brazo (cm)">
            <Numero valor={medida.brazo} paso="0.5" onCambiar={(v) => cambiar({ brazo: v })} />
          </Campo>
          <Campo etiqueta="Pierna (cm)">
            <Numero valor={medida.pierna} paso="0.5" onCambiar={(v) => cambiar({ pierna: v })} />
          </Campo>
        </div>

        <Campo etiqueta="Notas">
          <textarea
            value={medida.notas ?? ''}
            placeholder="En ayunas, después de entrenar…"
            onChange={(e) => cambiar({ notas: e.target.value })}
          />
        </Campo>
      </div>
    </Hoja>
  );
}
