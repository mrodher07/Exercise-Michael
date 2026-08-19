/**
 * Ejercicios: el catálogo y lo que uno ha hecho con cada uno.
 *
 * Vale para dos cosas distintas y por eso está junto: mirar qué hay —«¿qué máquinas de
 * espalda existen?»— y mirar tu propia historia con un ejercicio —«¿cuánto hice la última
 * vez en prensa?»—. Lo segundo es lo que se consulta de verdad, así que cada ejercicio
 * que se ha entrenado alguna vez lleva su marca a la vista en la lista.
 *
 * También se pueden crear ejercicios propios: la máquina rara de tu gimnasio, ese
 * accesorio que nadie llama igual. Los tuyos van primero en la lista.
 */

import { useMemo, useState } from 'react';
import {
  EQUIPOS,
  GRUPOS,
  coincide,
  idDeNombre,
  type Ejercicio,
  type Equipo,
  type Grupo,
  type Medida as FormaDeMedir,
} from '../datos/ejercicios';
import { historialDe, recordsDe, type Entreno } from '../motor/entreno';
import { fechaRelativa, formatoFecha } from '../motor/fechas';
import { Linea } from './Graficos';
import {
  Buscador,
  Campo,
  Chips,
  Cifra,
  Hoja,
  Interruptor,
  Seccion,
  Vacio,
  contar,
  kilos,
} from './Piezas';
import { IconoBuscar, IconoChispa, IconoMas, IconoPapelera, IconoPesa } from './Iconos';
import { FichaDeTecnica } from './Tecnica';

const TOPE = 60;

const FORMAS: { id: FormaDeMedir; texto: string }[] = [
  { id: 'peso-reps', texto: 'Peso y reps' },
  { id: 'reps', texto: 'Solo reps' },
  { id: 'tiempo', texto: 'Tiempo' },
  { id: 'peso-tiempo', texto: 'Peso y tiempo' },
  { id: 'distancia-tiempo', texto: 'Distancia' },
];

export function VistaEjercicios({
  catalogo,
  entrenos,
  deCasa,
  guardarPropio,
  borrarPropio,
  avisar,
}: {
  catalogo: Ejercicio[];
  entrenos: Entreno[];
  deCasa: number;
  guardarPropio: (e: Ejercicio) => void;
  borrarPropio: (e: Ejercicio) => Promise<void>;
  avisar: (texto: string) => void;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [soloEntrenados, setSoloEntrenados] = useState(false);
  const [abierto, setAbierto] = useState<Ejercicio | null>(null);
  const [creando, setCreando] = useState(false);

  /** Cuántas veces se ha hecho cada ejercicio. Se calcula una vez, no por fila. */
  const veces = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const entreno of entrenos) {
      if (entreno.fin === null) continue;
      const enEsteEntreno = new Set(entreno.ejercicios.map((l) => l.ejercicioId));
      for (const id of enEsteEntreno) cuenta.set(id, (cuenta.get(id) ?? 0) + 1);
    }
    return cuenta;
  }, [entrenos]);

  const filtrados = useMemo(
    () =>
      catalogo.filter(
        (e) =>
          (!grupo || e.grupo === grupo) &&
          (!equipo || e.equipo === equipo) &&
          (!soloEntrenados || (veces.get(e.id) ?? 0) > 0) &&
          coincide(e, busqueda),
      ),
    [catalogo, grupo, equipo, soloEntrenados, veces, busqueda],
  );

  return (
    <>
      <Seccion titulo="Ejercicios">
        <div className="pila">
          <Buscador valor={busqueda} onCambiar={setBusqueda} etiqueta="Buscar ejercicio" />
          <Chips opciones={GRUPOS} elegida={grupo} onElegir={setGrupo} todas="Todos los grupos" />
          <Chips opciones={EQUIPOS} elegida={equipo} onElegir={setEquipo} todas="Todo el material" />
          <div className="fila suelta">
            <button
              type="button"
              className="chip"
              aria-pressed={soloEntrenados}
              onClick={() => setSoloEntrenados((s) => !s)}
            >
              Solo los que he hecho
            </button>
            <span className="hueco" />
            <button type="button" className="accion pequena" onClick={() => setCreando(true)}>
              <IconoMas />
              Crear
            </button>
          </div>
          <p className="pequeno debil">
            {filtrados.length === catalogo.length
              ? `${catalogo.length} ejercicios (${deCasa} del catálogo y ${
                  catalogo.length - deCasa
                } tuyos)`
              : `${filtrados.length} de ${catalogo.length}`}
          </p>
        </div>
      </Seccion>

      {filtrados.length === 0 ? (
        <div className="panel">
          <Vacio icono={<IconoBuscar />} titulo="Nada coincide">
            Quita algún filtro, o créalo tú si es una máquina que no está.
          </Vacio>
        </div>
      ) : (
        <div className="panel hueco">
          <div className="lista">
            {filtrados.slice(0, TOPE).map((ejercicio) => {
              const hechas = veces.get(ejercicio.id) ?? 0;
              return (
                <button
                  key={ejercicio.id}
                  type="button"
                  className="fila-lista"
                  onClick={() => setAbierto(ejercicio)}
                >
                  <span className={`marca-icono${hechas > 0 ? ' acento' : ''}`}>
                    <IconoPesa />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="nombre">{ejercicio.nombre}</span>
                    <span className="meta">
                      {ejercicio.grupo} · {ejercicio.equipo}
                      {ejercicio.propio && ' · tuyo'}
                    </span>
                  </span>
                  {hechas > 0 && (
                    <span className="valor pequeno debil">
                      {hechas}
                      {hechas === 1 ? ' vez' : ' veces'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filtrados.length > TOPE && (
        <p className="pequeno debil centrado" style={{ marginTop: 10 }}>
          Se muestran {TOPE} de {filtrados.length}. Afina la búsqueda para ver el resto.
        </p>
      )}

      {abierto && (
        <FichaDeEjercicio
          ejercicio={abierto}
          entrenos={entrenos}
          onCerrar={() => setAbierto(null)}
          onBorrar={
            abierto.propio
              ? async () => {
                  await borrarPropio(abierto);
                  setAbierto(null);
                  avisar('Ejercicio borrado');
                }
              : undefined
          }
        />
      )}

      {creando && (
        <CrearEjercicio
          catalogo={catalogo}
          onCerrar={() => setCreando(false)}
          onCrear={(ejercicio) => {
            guardarPropio(ejercicio);
            setCreando(false);
            avisar(`«${ejercicio.nombre}» añadido`);
          }}
        />
      )}
    </>
  );
}

/** La ficha de un ejercicio: sus récords y cómo ha ido evolucionando. */
function FichaDeEjercicio({
  ejercicio,
  entrenos,
  onCerrar,
  onBorrar,
}: {
  ejercicio: Ejercicio;
  entrenos: Entreno[];
  onCerrar: () => void;
  onBorrar?: () => Promise<void>;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const records = useMemo(() => recordsDe(entrenos, ejercicio.id), [entrenos, ejercicio.id]);
  const historial = useMemo(() => historialDe(entrenos, ejercicio.id), [entrenos, ejercicio.id]);

  /* Se pinta el máximo estimado y no el peso a secas: es lo que permite comparar una serie
     de 100×2 con otra de 90×5, que de otro modo parecerían un retroceso. */
  const puntos = historial
    .filter((h) => h.mejor.estimado !== null)
    .map((h) => ({
      clave: h.fecha,
      etiqueta: `${h.fecha.slice(8, 10)}/${h.fecha.slice(5, 7)}`,
      detalle: `${formatoFecha(h.fecha)} · ${kilos(h.mejor.peso)} kg × ${h.mejor.reps}`,
      valor: h.mejor.estimado as number,
    }));

  return (
    <Hoja
      titulo={ejercicio.nombre}
      onCerrar={onCerrar}
      pie={
        onBorrar ? (
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
              Borrar ejercicio
            </button>
          )
        ) : undefined
      }
    >
      <div className="pila">
        <div className="fila suelta">
          <span className="etiqueta-pill">{ejercicio.grupo}</span>
          <span className="etiqueta-pill">{ejercicio.equipo}</span>
          {ejercicio.unilateral && <span className="etiqueta-pill">Por lado</span>}
          {ejercicio.secundarios.map((s) => (
            <span key={s} className="etiqueta-pill">
              + {s}
            </span>
          ))}
        </div>

        {/* La técnica va antes que las marcas y abierta si nunca lo has hecho: quien abre la
            ficha de un ejercicio que no ha hecho nunca viene a ver cómo se hace, no a mirar un
            historial vacío. Si ya lo has entrenado, se pliega y manda lo tuyo. */}
        <FichaDeTecnica ejercicio={ejercicio} abierto={records.vecesEntrenado === 0} />

        {records.vecesEntrenado === 0 ? (
          <Vacio icono={<IconoPesa />} titulo="Nunca lo has hecho">
            En cuanto lo apuntes en un entreno, aquí aparecerán tus marcas y su evolución.
          </Vacio>
        ) : (
          <>
            <div className="rejilla auto">
              <Cifra
                etiqueta="Más peso"
                valor={records.mejorPeso ? kilos(records.mejorPeso.peso) : '—'}
                unidad="kg"
                delta={
                  records.mejorPeso
                    ? `${records.mejorPeso.reps} reps · ${fechaRelativa(records.mejorPeso.fecha)}`
                    : undefined
                }
              />
              <Cifra
                etiqueta="Máximo estimado"
                valor={records.mejorEstimado?.estimado ? kilos(records.mejorEstimado.estimado) : '—'}
                unidad="kg"
                delta={
                  records.mejorEstimado
                    ? `de ${kilos(records.mejorEstimado.peso)}×${records.mejorEstimado.reps}`
                    : undefined
                }
              />
              <Cifra
                etiqueta="Más reps"
                valor={records.masRepeticiones?.reps ?? '—'}
                delta={
                  records.masRepeticiones
                    ? `con ${kilos(records.masRepeticiones.peso)} kg`
                    : undefined
                }
              />
              <Cifra etiqueta="Veces" valor={records.vecesEntrenado} />
            </div>

            {puntos.length > 1 && (
              <div className="panel apagado">
                <Linea
                  titulo="Máximo estimado"
                  subtitulo="Convierte cada serie a un equivalente de una repetición, para poder comparar series de distintas reps."
                  datos={puntos}
                  formato={(n) => kilos(n)}
                  unidad="kg"
                />
              </div>
            )}

            <div className="desplazable panel hueco">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Mejor serie</th>
                    <th>Series</th>
                    <th>Volumen</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historial].reverse().slice(0, 20).map((h) => (
                    <tr key={h.fecha}>
                      <td>{formatoFecha(h.fecha)}</td>
                      <td>
                        {kilos(h.mejor.peso)}×{h.mejor.reps}
                      </td>
                      <td>{h.series}</td>
                      <td>{Math.round(h.volumen)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Hoja>
  );
}

function CrearEjercicio({
  catalogo,
  onCrear,
  onCerrar,
}: {
  catalogo: Ejercicio[];
  onCrear: (e: Ejercicio) => void;
  onCerrar: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState<Grupo>('Pecho');
  const [equipo, setEquipo] = useState<Equipo>('máquina');
  const [medida, setMedida] = useState<FormaDeMedir>('peso-reps');
  const [unilateral, setUnilateral] = useState(false);

  const id = idDeNombre(nombre);
  const repetido = id !== '' && catalogo.some((e) => e.id === id);

  return (
    <Hoja
      titulo="Crear ejercicio"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="accion" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="accion primaria"
            disabled={nombre.trim().length < 3 || repetido}
            onClick={() =>
              onCrear({
                id,
                nombre: nombre.trim(),
                grupo,
                equipo,
                medida,
                unilateral,
                secundarios: [],
                propio: true,
              })
            }
          >
            <IconoChispa />
            Crear
          </button>
        </>
      }
    >
      <div className="pila">
        <Campo
          etiqueta="Nombre"
          pista={
            repetido
              ? 'Ya existe un ejercicio con ese nombre.'
              : 'Como lo llames tú: es lo que vas a buscar luego.'
          }
        >
          <input
            className="entrada"
            value={nombre}
            placeholder="Prensa inclinada del gimnasio nuevo"
            onChange={(e) => setNombre(e.target.value)}
          />
        </Campo>

        <Campo etiqueta="Grupo muscular">
          <select className="entrada" value={grupo} onChange={(e) => setGrupo(e.target.value as Grupo)}>
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Material">
          <select
            className="entrada"
            value={equipo}
            onChange={(e) => setEquipo(e.target.value as Equipo)}
          >
            {EQUIPOS.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          etiqueta="Qué se apunta de cada serie"
          pista="Decide los huecos que verás al entrenar. Una plancha no tiene repeticiones y la cinta no tiene peso."
        >
          <select
            className="entrada"
            value={medida}
            onChange={(e) => setMedida(e.target.value as FormaDeMedir)}
          >
            {FORMAS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.texto}
              </option>
            ))}
          </select>
        </Campo>

        <Interruptor
          texto="Se hace un lado a la vez"
          pista="Las series se apuntan por lado, como en el remo con mancuerna."
          activo={unilateral}
          onCambiar={setUnilateral}
        />

        <p className="pequeno debil">
          {contar(catalogo.length, 'ejercicio', 'ejercicios')} en el buscador. Si el que
          quieres ya está con otro nombre, mejor usa ese: así el historial no se parte en dos.
        </p>
      </div>
    </Hoja>
  );
}
