/**
 * El buscador de ejercicios.
 *
 * El catálogo pasa de doscientos cincuenta, así que una lista sin filtrar no sirve: se
 * busca por texto, por grupo muscular y por equipamiento, y esos dos últimos son los
 * filtros que de verdad se usan en un gimnasio —«hoy toca espalda» y «la máquina de remo
 * está ocupada»—.
 *
 * Deja elegir **varios de una vez**: al empezar un entreno se meten cinco o seis
 * ejercicios seguidos, y cerrar y volver a abrir el buscador por cada uno es media docena
 * de toques de más.
 */

import { useMemo, useState } from 'react';
import {
  EQUIPOS,
  GRUPOS,
  coincide,
  type Ejercicio,
  type Equipo,
  type Grupo,
} from '../datos/ejercicios';
import { Buscador, Chips, Hoja, Vacio, contar } from './Piezas';
import { IconoBuscar, IconoVisto } from './Iconos';

/** Cuántos se pintan de una vez. Más allá, nadie baja: se afina la búsqueda. */
const TOPE = 80;

export function SelectorDeEjercicios({
  catalogo,
  onElegir,
  onCerrar,
  titulo = 'Añadir ejercicios',
}: {
  catalogo: Ejercicio[];
  /** Se llama al confirmar, con todos los elegidos y en el orden en que se marcaron. */
  onElegir: (ejercicios: Ejercicio[]) => void;
  onCerrar: () => void;
  titulo?: string;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [elegidos, setElegidos] = useState<string[]>([]);

  const filtrados = useMemo(
    () =>
      catalogo.filter(
        (e) =>
          (!grupo || e.grupo === grupo) &&
          (!equipo || e.equipo === equipo) &&
          coincide(e, busqueda),
      ),
    [catalogo, grupo, equipo, busqueda],
  );

  const alternar = (id: string) =>
    setElegidos((antes) => (antes.includes(id) ? antes.filter((x) => x !== id) : [...antes, id]));

  const confirmar = () => {
    const porId = new Map(catalogo.map((e) => [e.id, e]));
    onElegir(elegidos.map((id) => porId.get(id)).filter((e): e is Ejercicio => Boolean(e)));
  };

  return (
    <Hoja
      titulo={titulo}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="accion" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="accion primaria"
            disabled={elegidos.length === 0}
            onClick={confirmar}
          >
            Añadir {elegidos.length > 0 && `(${elegidos.length})`}
          </button>
        </>
      }
    >
      <div className="pila">
        <Buscador valor={busqueda} onCambiar={setBusqueda} etiqueta="Buscar ejercicio" />
        <Chips opciones={GRUPOS} elegida={grupo} onElegir={setGrupo} todas="Todos los grupos" />
        <Chips opciones={EQUIPOS} elegida={equipo} onElegir={setEquipo} todas="Todo el material" />

        <p className="pequeno debil">
          {filtrados.length === catalogo.length
            ? `${catalogo.length} ejercicios`
            : `${filtrados.length} de ${catalogo.length}`}
          {elegidos.length > 0 && ` · ${contar(elegidos.length, 'elegido', 'elegidos', '')}`}
        </p>

        {filtrados.length === 0 ? (
          <Vacio icono={<IconoBuscar />} titulo="Nada coincide">
            Prueba con menos filtros, o créalo tú desde la pestaña de Ejercicios.
          </Vacio>
        ) : (
          <div className="panel hueco">
            <div className="lista">
              {filtrados.slice(0, TOPE).map((e) => {
                const marcado = elegidos.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    className="fila-lista"
                    onClick={() => alternar(e.id)}
                    aria-pressed={marcado}
                  >
                    <span className={`marca-icono${marcado ? ' acento' : ''}`}>
                      {marcado ? <IconoVisto /> : e.grupo.slice(0, 1)}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="nombre">{e.nombre}</span>
                      <span className="meta">
                        {e.grupo} · {e.equipo}
                        {e.unilateral && ' · a un lado'}
                        {e.propio && ' · tuyo'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filtrados.length > TOPE && (
          <p className="pequeno debil centrado">
            Se muestran {TOPE} de {filtrados.length}. Afina la búsqueda para ver el resto.
          </p>
        )}
      </div>
    </Hoja>
  );
}
