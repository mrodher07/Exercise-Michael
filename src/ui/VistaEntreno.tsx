/**
 * Entrenar: el entreno en curso y el historial.
 *
 * Es la pantalla que se usa **de pie, con una mano y con prisa**, entre series, y eso manda
 * en todas las decisiones de aquí:
 *
 *  · Apuntar una serie son dos números y un toque. Nada de abrir un diálogo por serie.
 *  · Debajo de cada ejercicio se ve **lo que se hizo la última vez**. Es lo primero que se
 *    mira para decidir si hoy toca subir, y tenerlo delante evita el viaje al historial.
 *  · Marcar la serie como hecha arranca el descanso solo. Es cuando empieza de verdad.
 *  · No hay botón de guardar. Se guarda al escribir, con un retardo pequeño, porque un
 *    entreno perdido por no darle a guardar no se recupera.
 */

import { useEffect, useMemo, useState } from 'react';
import type { Ejercicio, Medida as FormaDeMedir } from '../datos/ejercicios';
import { CAMPOS_DE_MEDIDA } from '../datos/ejercicios';
import {
  duracionEnSegundos,
  mejorSerie,
  recordsBatidos,
  seriesHechas,
  serieVacia,
  ultimaVezDe,
  volumenDeEntreno,
  type Entreno,
  type EjercicioDelEntreno,
  type SerieRegistrada,
  type TipoDeSerie,
} from '../motor/entreno';
import { duracionLarga, fechaRelativa, formatoDuracion, horaDe } from '../motor/fechas';
import type { Ajustes, Rutina } from '../almacen/almacen';
import { almacen } from '../almacen/almacen';
import { nuevoId } from './estado';
import { SelectorDeEjercicios } from './Selector';
import {
  Campo,
  Cifra,
  Hoja,
  Numero,
  Panel,
  Seccion,
  Vacio,
  contar,
  kilos,
  volumenCorto,
} from './Piezas';
import {
  IconoBandera,
  IconoChispa,
  IconoJugar,
  IconoLapiz,
  IconoMas,
  IconoPapelera,
  IconoPesa,
  IconoReloj,
  IconoVisto,
} from './Iconos';

interface Props {
  entrenos: Entreno[];
  enCurso: Entreno | null;
  rutinas: Rutina[];
  catalogo: Ejercicio[];
  porId: Map<string, Ejercicio>;
  ajustes: Ajustes;
  guardar: (e: Entreno) => void;
  guardarYa: (e: Entreno) => Promise<void>;
  borrar: (e: Entreno) => Promise<void>;
  avisar: (texto: string) => void;
  onDescansar: (segundos: number) => void;
}

export function VistaEntreno(props: Props) {
  return props.enCurso ? (
    <EnCurso {...props} entreno={props.enCurso} />
  ) : (
    <SinEntreno {...props} />
  );
}

// ─────────────────────────── Sin entreno: empezar o repasar ───────────────────────────

function SinEntreno({ entrenos, rutinas, porId, ajustes, guardar, borrar }: Props) {
  const [abierto, setAbierto] = useState<Entreno | null>(null);
  const hechos = entrenos.filter((e) => e.fin !== null);

  const empezar = (nombre: string, rutina?: Rutina, dia?: Rutina['dias'][number]) => {
    const entreno = almacen.entrenoVacio(nombre);
    entreno.rutinaId = rutina?.id ?? null;
    entreno.diaId = dia?.id ?? null;
    entreno.ejercicios = (dia?.ejercicios ?? []).map((plantilla) => ({
      id: nuevoId(),
      ejercicioId: plantilla.ejercicioId,
      descanso: plantilla.descanso || ajustes.descansoPorDefecto,
      notas: plantilla.notas,
      // Las series nacen vacías y sin marcar: la plantilla dice cuántas van, no que ya
      // estén hechas. El peso propuesto se rellena para no teclearlo, pero se puede pisar.
      series: Array.from({ length: Math.max(1, plantilla.series) }, () => ({
        ...serieVacia(),
        peso: plantilla.peso,
      })),
    }));
    void almacen.guardarEntreno(entreno).then(() => guardar(entreno));
  };

  return (
    <>
      <Seccion titulo="Empezar">
        <div className="panel pila">
          <button
            type="button"
            className="accion primaria grande entera"
            onClick={() => empezar('Entreno libre')}
          >
            <IconoJugar />
            Entreno libre
          </button>
          <p className="pequeno debil">
            Sin plan: se van añadiendo ejercicios sobre la marcha. Para seguir una rutina,
            elige uno de sus días.
          </p>
        </div>

        {rutinas.length > 0 &&
          rutinas.map((rutina) => (
            <Panel
              key={rutina.id}
              titulo={rutina.nombre}
              resumen={contar(rutina.dias.length, 'día', 'días', 'vacía')}
              abierto={Boolean(rutina.favorita)}
            >
              <div className="pila junta">
                {rutina.dias.map((dia) => (
                  <button
                    key={dia.id}
                    type="button"
                    className="accion entera"
                    onClick={() => empezar(`${rutina.nombre} · ${dia.nombre}`, rutina, dia)}
                  >
                    <IconoJugar />
                    {dia.nombre}
                    <span className="hueco" />
                    <span className="pequeno debil">
                      {contar(dia.ejercicios.length, 'ejercicio', 'ejercicios', 'vacío')}
                    </span>
                  </button>
                ))}
              </div>
            </Panel>
          ))}
      </Seccion>

      <Seccion titulo={`Historial · ${contar(hechos.length, 'entreno', 'entrenos', 'ninguno')}`}>
        {hechos.length === 0 ? (
          <div className="panel">
            <Vacio icono={<IconoPesa />} titulo="Todavía no hay entrenos">
              Dale a «Entreno libre» y añade el primer ejercicio. Lo que apuntes hoy es con
              lo que se comparará lo de la semana que viene.
            </Vacio>
          </div>
        ) : (
          <div className="panel hueco">
            <div className="lista">
              {hechos.slice(0, 40).map((entreno) => (
                <button
                  key={entreno.id}
                  type="button"
                  className="fila-lista"
                  onClick={() => setAbierto(entreno)}
                >
                  <span className="marca-icono acento">
                    <IconoPesa />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="nombre">{entreno.nombre}</span>
                    <span className="meta">
                      {fechaRelativa(entreno.fecha)} · {contar(seriesHechas(entreno), 'serie', 'series')}
                      {' · '}
                      {duracionLarga(duracionEnSegundos(entreno))}
                    </span>
                  </span>
                  <span className="valor">{volumenCorto(volumenDeEntreno(entreno))}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Seccion>

      {abierto && (
        <DetalleDeEntreno
          entreno={abierto}
          porId={porId}
          onCerrar={() => setAbierto(null)}
          onBorrar={async () => {
            await borrar(abierto);
            setAbierto(null);
          }}
        />
      )}
    </>
  );
}

function DetalleDeEntreno({
  entreno,
  porId,
  onCerrar,
  onBorrar,
}: {
  entreno: Entreno;
  porId: Map<string, Ejercicio>;
  onCerrar: () => void;
  onBorrar: () => Promise<void>;
}) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <Hoja
      titulo={entreno.nombre}
      onCerrar={onCerrar}
      pie={
        confirmando ? (
          <>
            <button type="button" className="accion" onClick={() => setConfirmando(false)}>
              No, dejarlo
            </button>
            <button type="button" className="accion peligro" onClick={onBorrar}>
              Sí, borrar
            </button>
          </>
        ) : (
          <button type="button" className="accion peligro" onClick={() => setConfirmando(true)}>
            <IconoPapelera />
            Borrar entreno
          </button>
        )
      }
    >
      <div className="pila">
        <p className="pequeno debil">
          {fechaRelativa(entreno.fecha)} a las {horaDe(entreno.comienzo)} ·{' '}
          {duracionLarga(duracionEnSegundos(entreno))}
        </p>

        <div className="rejilla auto">
          <Cifra etiqueta="Series" valor={seriesHechas(entreno)} />
          <Cifra etiqueta="Volumen" valor={volumenCorto(volumenDeEntreno(entreno))} />
          <Cifra etiqueta="Ejercicios" valor={entreno.ejercicios.length} />
        </div>

        {entreno.notas && <p className="tenue pequeno">{entreno.notas}</p>}

        {entreno.ejercicios.map((linea) => {
          const ejercicio = porId.get(linea.ejercicioId);
          const hechas = linea.series.filter((s) => s.hecha);
          return (
            <div key={linea.id} className="panel apagado">
              <div className="gruesa">{ejercicio?.nombre ?? linea.ejercicioId}</div>
              {hechas.length === 0 ? (
                <p className="pequeno debil">Ninguna serie marcada.</p>
              ) : (
                <div className="desplazable">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Serie</th>
                        <th>Peso</th>
                        <th>Reps</th>
                        <th>RPE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hechas.map((s, i) => (
                        <tr key={i}>
                          <td>
                            {s.tipo === 'calentamiento' ? 'Calent.' : i + 1}
                            {s.tipo === 'fallo' && ' · al fallo'}
                          </td>
                          <td>{s.peso !== undefined ? `${kilos(s.peso)} kg` : '—'}</td>
                          <td>{s.reps ?? (s.segundos ? `${s.segundos} s` : '—')}</td>
                          <td>{s.rpe ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {linea.notas && <p className="pequeno debil">{linea.notas}</p>}
            </div>
          );
        })}
      </div>
    </Hoja>
  );
}

// ─────────────────────────── En curso ───────────────────────────

function EnCurso({
  entreno,
  entrenos,
  catalogo,
  porId,
  ajustes,
  guardar,
  guardarYa,
  borrar,
  avisar,
  onDescansar,
}: Props & { entreno: Entreno }) {
  const [eligiendo, setEligiendo] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [descartando, setDescartando] = useState(false);

  const cambiar = (cambios: Partial<Entreno>) => guardar({ ...entreno, ...cambios });

  const cambiarLinea = (id: string, cambios: Partial<EjercicioDelEntreno>) =>
    cambiar({
      ejercicios: entreno.ejercicios.map((l) => (l.id === id ? { ...l, ...cambios } : l)),
    });

  const añadir = (elegidos: Ejercicio[]) => {
    cambiar({
      ejercicios: [
        ...entreno.ejercicios,
        ...elegidos.map((e) => ({
          id: nuevoId(),
          ejercicioId: e.id,
          descanso: ajustes.descansoPorDefecto,
          series: [serieVacia()],
        })),
      ],
    });
    setEligiendo(false);
  };

  const terminar = async () => {
    const cerrado: Entreno = { ...entreno, fin: new Date().toISOString() };
    await guardarYa(cerrado);
    const batidos = recordsBatidos(cerrado, entrenos);
    setCerrando(false);
    if (batidos.length > 0) {
      const primero = porId.get(batidos[0].ejercicioId)?.nombre ?? 'un ejercicio';
      avisar(
        batidos.length === 1
          ? `¡Récord en ${primero}!`
          : `¡${batidos.length} récords, empezando por ${primero}!`,
      );
    } else {
      avisar(`Entreno guardado · ${contar(seriesHechas(cerrado), 'serie', 'series')}`);
    }
  };

  const series = seriesHechas(entreno);
  const volumen = volumenDeEntreno(entreno);

  return (
    <>
      <Seccion titulo="En curso">
        <div className="panel pila">
          <input
            className="entrada"
            value={entreno.nombre}
            aria-label="Nombre del entreno"
            onChange={(e) => cambiar({ nombre: e.target.value })}
          />
          <div className="rejilla auto">
            <Cifra etiqueta="Tiempo" valor={<Reloj desde={entreno.comienzo} />} />
            <Cifra etiqueta="Series" valor={series} />
            <Cifra etiqueta="Volumen" valor={volumenCorto(volumen)} />
          </div>
        </div>
      </Seccion>

      {entreno.ejercicios.length === 0 && (
        <div className="panel">
          <Vacio
            icono={<IconoPesa />}
            titulo="Sin ejercicios"
            accion={
              <button type="button" className="accion primaria" onClick={() => setEligiendo(true)}>
                <IconoMas />
                Añadir ejercicios
              </button>
            }
          >
            Busca por grupo muscular o por la máquina que tengas libre.
          </Vacio>
        </div>
      )}

      <div className="pila">
        {entreno.ejercicios.map((linea, indice) => (
          <LineaDeEjercicio
            key={linea.id}
            linea={linea}
            ejercicio={porId.get(linea.ejercicioId)}
            entrenos={entrenos}
            entrenoId={entreno.id}
            primera={indice === 0}
            onCambiar={(cambios) => cambiarLinea(linea.id, cambios)}
            onQuitar={() =>
              cambiar({ ejercicios: entreno.ejercicios.filter((l) => l.id !== linea.id) })
            }
            onSubir={
              indice === 0
                ? undefined
                : () => {
                    const orden = [...entreno.ejercicios];
                    [orden[indice - 1], orden[indice]] = [orden[indice], orden[indice - 1]];
                    cambiar({ ejercicios: orden });
                  }
            }
            onDescansar={onDescansar}
          />
        ))}
      </div>

      {entreno.ejercicios.length > 0 && (
        <div className="pila" style={{ marginTop: 14 }}>
          <button type="button" className="accion entera" onClick={() => setEligiendo(true)}>
            <IconoMas />
            Añadir ejercicio
          </button>

          <Campo etiqueta="Notas del entreno">
            <textarea
              value={entreno.notas ?? ''}
              placeholder="Cómo ha ido, molestias, lo que sea."
              onChange={(e) => cambiar({ notas: e.target.value })}
            />
          </Campo>

          <button
            type="button"
            className="accion primaria grande entera"
            onClick={() => setCerrando(true)}
          >
            <IconoBandera />
            Terminar entreno
          </button>
          <button
            type="button"
            className="accion fantasma entera peligro"
            onClick={() => setDescartando(true)}
          >
            Descartar
          </button>
        </div>
      )}

      {eligiendo && (
        <SelectorDeEjercicios
          catalogo={catalogo}
          onElegir={añadir}
          onCerrar={() => setEligiendo(false)}
        />
      )}

      {cerrando && (
        <Hoja
          titulo="Terminar entreno"
          onCerrar={() => setCerrando(false)}
          pie={
            <>
              <button type="button" className="accion" onClick={() => setCerrando(false)}>
                Seguir entrenando
              </button>
              <button type="button" className="accion primaria" onClick={terminar}>
                Terminar
              </button>
            </>
          }
        >
          <div className="pila">
            <p className="tenue">
              {contar(series, 'serie hecha', 'series hechas')} y {volumenCorto(volumen)} de volumen
              en {duracionLarga(duracionEnSegundos(entreno))}.
            </p>
            {entreno.ejercicios.some((l) => l.series.every((s) => !s.hecha)) && (
              <p className="aviso">
                Hay ejercicios sin ninguna serie marcada. Se guardan igual, pero no cuentan
                para el volumen ni para los récords.
              </p>
            )}
            <Campo etiqueta="¿Cómo ha ido?" pista="Sirve para leer el historial de un vistazo.">
              <div className="segmentado">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={entreno.sensacion === n}
                    onClick={() => cambiar({ sensacion: n })}
                  >
                    {['Muy mal', 'Flojo', 'Normal', 'Bien', 'Genial'][n - 1]}
                  </button>
                ))}
              </div>
            </Campo>
          </div>
        </Hoja>
      )}

      {descartando && (
        <Hoja
          titulo="Descartar entreno"
          onCerrar={() => setDescartando(false)}
          pie={
            <>
              <button type="button" className="accion" onClick={() => setDescartando(false)}>
                No, seguir
              </button>
              <button
                type="button"
                className="accion peligro"
                onClick={async () => {
                  await borrar(entreno);
                  setDescartando(false);
                  avisar('Entreno descartado');
                }}
              >
                Sí, descartar
              </button>
            </>
          }
        >
          <p className="tenue">
            Se borra todo lo apuntado en este entreno y no se puede recuperar.
          </p>
        </Hoja>
      )}
    </>
  );
}

/** El tiempo que lleva el entreno. Va aparte para que su latido no repinte la pantalla. */
function Reloj({ desde }: { desde: string }) {
  const [, setLatido] = useState(0);
  useEffect(() => {
    const reloj = setInterval(() => setLatido((n) => n + 1), 1000);
    return () => clearInterval(reloj);
  }, []);
  return <>{formatoDuracion(Math.round((Date.now() - new Date(desde).getTime()) / 1000))}</>;
}

// ─────────────────────────── Una línea del entreno ───────────────────────────

/**
 * Los dos huecos que se piden por serie según cómo se mida el ejercicio.
 *
 * Una plancha no tiene repeticiones y la cinta no tiene peso: pedir siempre «kg» y «reps»
 * obligaría a escribir ceros en la mitad de los huecos, y esos ceros luego cuentan como
 * datos y estropean las medias.
 */
function huecosDe(medida: FormaDeMedir): { clave: keyof SerieRegistrada; pista: string }[] {
  const campos = CAMPOS_DE_MEDIDA[medida];
  const huecos: { clave: keyof SerieRegistrada; pista: string }[] = [];
  if (campos.distancia) huecos.push({ clave: 'distancia', pista: 'km' });
  if (campos.peso) huecos.push({ clave: 'peso', pista: medida === 'reps' ? 'lastre' : 'kg' });
  if (campos.reps) huecos.push({ clave: 'reps', pista: 'reps' });
  if (campos.tiempo) huecos.push({ clave: 'segundos', pista: medida === 'distancia-tiempo' ? 'min' : 'seg' });
  return huecos.slice(0, 2);
}

/** El orden en el que rota el tipo de serie al tocar su número. */
const TIPOS: TipoDeSerie[] = ['normal', 'calentamiento', 'fallo', 'descendente'];

const NOMBRE_TIPO: Record<TipoDeSerie, string> = {
  normal: 'Serie normal',
  calentamiento: 'Calentamiento (no cuenta para el volumen)',
  fallo: 'Al fallo',
  descendente: 'Serie descendente',
};

function LineaDeEjercicio({
  linea,
  ejercicio,
  entrenos,
  entrenoId,
  primera,
  onCambiar,
  onQuitar,
  onSubir,
  onDescansar,
}: {
  linea: EjercicioDelEntreno;
  ejercicio: Ejercicio | undefined;
  entrenos: Entreno[];
  entrenoId: string;
  primera: boolean;
  onCambiar: (cambios: Partial<EjercicioDelEntreno>) => void;
  onQuitar: () => void;
  onSubir?: () => void;
  onDescansar: (segundos: number) => void;
}) {
  const [ajustando, setAjustando] = useState(false);
  const medida = ejercicio?.medida ?? 'peso-reps';
  const huecos = huecosDe(medida);

  const ultima = useMemo(
    () => ultimaVezDe(entrenos, linea.ejercicioId, entrenoId),
    [entrenos, linea.ejercicioId, entrenoId],
  );

  const cambiarSerie = (indice: number, cambios: Partial<SerieRegistrada>) =>
    onCambiar({
      series: linea.series.map((s, i) => (i === indice ? { ...s, ...cambios } : s)),
    });

  const marcar = (indice: number) => {
    const serie = linea.series[indice];
    const hecha = !serie.hecha;
    cambiarSerie(indice, { hecha });
    // El descanso empieza al marcar, no antes: es cuando de verdad empieza. Y no se
    // arranca al desmarcar, que suele ser una corrección.
    if (hecha && serie.tipo !== 'calentamiento') onDescansar(linea.descanso);
  };

  /** Copia la última serie: repetir peso y reps es lo normal, y así es un toque. */
  const añadirSerie = () => {
    const anterior = [...linea.series].reverse().find((s) => s.tipo !== 'calentamiento');
    onCambiar({
      series: [
        ...linea.series,
        {
          ...serieVacia(),
          peso: anterior?.peso,
          reps: anterior?.reps,
          segundos: anterior?.segundos,
          distancia: anterior?.distancia,
        },
      ],
    });
  };

  const mejor = mejorSerie(linea.series, 'hoy');

  return (
    <div className="panel pila">
      <div className="fila">
        <span style={{ minWidth: 0 }}>
          <div className="gruesa corta">{ejercicio?.nombre ?? linea.ejercicioId}</div>
          <div className="meta pequeno debil">
            {ejercicio ? `${ejercicio.grupo} · ${ejercicio.equipo}` : 'Ejercicio no encontrado'}
            {ejercicio?.unilateral && ' · por lado'}
          </div>
        </span>
        <span className="hueco" />
        {onSubir && (
          <button
            type="button"
            className="accion fantasma icono"
            onClick={onSubir}
            aria-label="Subir en la lista"
            title="Subir"
          >
            ↑
          </button>
        )}
        <button
          type="button"
          className="accion fantasma icono"
          onClick={() => setAjustando(true)}
          aria-label="Ajustes del ejercicio"
        >
          <IconoLapiz />
        </button>
      </div>

      {ultima && (
        <p className="pequeno debil">
          <IconoReloj /> {fechaRelativa(ultima.fecha)}:{' '}
          {ultima.series
            .slice(0, 4)
            .map((s) =>
              s.peso && s.reps
                ? `${kilos(s.peso)}×${s.reps}`
                : s.reps
                  ? `${s.reps} reps`
                  : s.segundos
                    ? `${s.segundos} s`
                    : '—',
            )
            .join(' · ')}
        </p>
      )}

      <div className="serie-cabecera">
        <span>#</span>
        {huecos.map((h) => (
          <span key={String(h.clave)}>{h.pista}</span>
        ))}
        {huecos.length < 2 && <span />}
        <span>RPE</span>
        <span />
      </div>

      {linea.series.map((serie, indice) => {
        // El número de la serie no cuenta los calentamientos: la «primera serie» es la
        // primera que va en serio, que es la que se compara con la semana pasada.
        const numero =
          linea.series.slice(0, indice + 1).filter((s) => s.tipo !== 'calentamiento').length;
        return (
          <div key={indice} className={`serie${serie.tipo === 'calentamiento' ? ' calentamiento' : ''}`}>
            <button
              type="button"
              className="indice"
              title={NOMBRE_TIPO[serie.tipo]}
              onClick={() =>
                cambiarSerie(indice, {
                  tipo: TIPOS[(TIPOS.indexOf(serie.tipo) + 1) % TIPOS.length],
                })
              }
            >
              {serie.tipo === 'calentamiento' ? 'C' : serie.tipo === 'fallo' ? 'F' : numero}
            </button>

            {huecos.map((hueco) => {
              // El cardio se apunta en minutos porque nadie cuenta media hora en segundos;
              // por dentro se guardan segundos como en todo lo demás.
              const enMinutos = hueco.clave === 'segundos' && medida === 'distancia-tiempo';
              const bruto = serie[hueco.clave] as number | undefined;
              return (
                <Numero
                  key={String(hueco.clave)}
                  valor={enMinutos && bruto !== undefined ? Math.round(bruto / 60) : bruto}
                  etiqueta={`${hueco.pista} de la serie ${numero}`}
                  placeholder={hueco.pista}
                  onCambiar={(v) =>
                    cambiarSerie(indice, {
                      [hueco.clave]: v === undefined ? undefined : enMinutos ? v * 60 : v,
                    } as Partial<SerieRegistrada>)
                  }
                />
              );
            })}
            {huecos.length < 2 && <span />}

            <Numero
              valor={serie.rpe}
              etiqueta={`RPE de la serie ${numero}`}
              placeholder="–"
              onCambiar={(v) => cambiarSerie(indice, { rpe: v })}
            />

            <button
              type="button"
              className="visto"
              aria-pressed={serie.hecha}
              aria-label={`Marcar la serie ${numero} como hecha`}
              onClick={() => marcar(indice)}
            >
              <IconoVisto />
            </button>
          </div>
        );
      })}

      <div className="acciones">
        <button type="button" className="accion pequena" onClick={añadirSerie}>
          <IconoMas />
          Serie
        </button>
        {linea.series.length > 1 && (
          <button
            type="button"
            className="accion pequena fantasma"
            onClick={() => onCambiar({ series: linea.series.slice(0, -1) })}
          >
            Quitar última
          </button>
        )}
        <span className="hueco" />
        {mejor && (
          <span className="etiqueta-pill">
            <IconoChispa />
            {kilos(mejor.peso)}×{mejor.reps}
            {mejor.estimado ? ` · ~${kilos(mejor.estimado)} kg` : ''}
          </span>
        )}
      </div>

      {ajustando && (
        <Hoja
          titulo={ejercicio?.nombre ?? 'Ejercicio'}
          onCerrar={() => setAjustando(false)}
          pie={
            <>
              <button
                type="button"
                className="accion peligro"
                onClick={() => {
                  onQuitar();
                  setAjustando(false);
                }}
              >
                <IconoPapelera />
                Quitar del entreno
              </button>
              <button type="button" className="accion primaria" onClick={() => setAjustando(false)}>
                Hecho
              </button>
            </>
          }
        >
          <div className="pila">
            <Campo
              etiqueta="Descanso entre series"
              pista="Se pone en marcha al marcar una serie como hecha."
            >
              <div className="segmentado">
                {[60, 90, 120, 180, 240].map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={linea.descanso === s}
                    onClick={() => onCambiar({ descanso: s })}
                  >
                    {s < 120 ? `${s} s` : `${s / 60} min`}
                  </button>
                ))}
              </div>
            </Campo>

            <Campo etiqueta="Notas del ejercicio" pista="Altura del asiento, agarre, molestias…">
              <textarea
                value={linea.notas ?? ''}
                onChange={(e) => onCambiar({ notas: e.target.value })}
              />
            </Campo>

            {!primera && (
              <p className="pequeno debil">
                Toca el número de una serie para cambiar su tipo: normal, calentamiento, al
                fallo o descendente. El calentamiento no cuenta para el volumen.
              </p>
            )}
          </div>
        </Hoja>
      )}
    </div>
  );
}
