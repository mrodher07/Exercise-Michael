/**
 * Rutinas: el plan de la semana.
 *
 * Una rutina tiene **días**, no una lista plana de ejercicios, porque así se entrena de
 * verdad: «Torso / Pierna», «Empuje / Tirón / Pierna». Con una lista plana habría que
 * crear cinco rutinas y no se podrían ver como un plan.
 *
 * Lo que se escribe aquí es una intención, no un registro: las repeticiones se guardan
 * como texto («8-10», «al fallo») porque una rutina se apunta como se habla. El número
 * exacto se pone al hacer la serie, que es donde sí tiene que ser un número.
 */

import { useState } from 'react';
import type { Ejercicio } from '../datos/ejercicios';
import type { DiaDeRutina, PlantillaEjercicio, Rutina } from '../almacen/almacen';
import { almacen } from '../almacen/almacen';
import { nuevoId } from './estado';
import { SelectorDeEjercicios } from './Selector';
import { Campo, Hoja, Interruptor, Numero, Panel, Seccion, Vacio, contar } from './Piezas';
import {
  IconoCopia,
  IconoEstrella,
  IconoLapiz,
  IconoLista,
  IconoMas,
  IconoPapelera,
} from './Iconos';

export function VistaRutinas({
  rutinas,
  catalogo,
  porId,
  descansoPorDefecto,
  guardar,
  borrar,
  avisar,
}: {
  rutinas: Rutina[];
  catalogo: Ejercicio[];
  porId: Map<string, Ejercicio>;
  descansoPorDefecto: number;
  guardar: (r: Rutina) => void;
  borrar: (r: Rutina) => Promise<void>;
  avisar: (texto: string) => void;
}) {
  const [editando, setEditando] = useState<Rutina | null>(null);

  const crear = () => {
    const rutina = almacen.rutinaVacia();
    guardar(rutina);
    setEditando(rutina);
  };

  const duplicar = (rutina: Rutina) => {
    const copia: Rutina = {
      ...rutina,
      id: nuevoId(),
      nombre: `${rutina.nombre} (copia)`,
      favorita: false,
      // Los días y sus ejercicios también son nuevos: si compartieran id, editar la copia
      // tocaría la original.
      dias: rutina.dias.map((dia) => ({
        ...dia,
        id: nuevoId(),
        ejercicios: dia.ejercicios.map((e) => ({ ...e })),
      })),
    };
    guardar(copia);
    avisar('Rutina duplicada');
  };

  return (
    <>
      <Seccion titulo="Rutinas" accion="Crear" onAccion={crear}>
        {rutinas.length === 0 ? (
          <div className="panel">
            <Vacio
              icono={<IconoLista />}
              titulo="Sin rutinas"
              accion={
                <button type="button" className="accion primaria" onClick={crear}>
                  <IconoMas />
                  Crear la primera
                </button>
              }
            >
              Una rutina es un plan con días. Al empezar a entrenar podrás elegir un día y
              tendrás los ejercicios puestos.
            </Vacio>
          </div>
        ) : (
          <div className="pila">
            {rutinas.map((rutina) => (
              <Panel
                key={rutina.id}
                titulo={
                  <span className="fila" style={{ gap: 6 }}>
                    {rutina.favorita && <IconoEstrella />}
                    {rutina.nombre}
                  </span>
                }
                resumen={contar(rutina.dias.length, 'día', 'días', 'vacía')}
                abierto={false}
              >
                <div className="pila">
                  {rutina.descripcion && <p className="pequeno tenue">{rutina.descripcion}</p>}

                  {rutina.dias.map((dia) => (
                    <div key={dia.id} className="panel apagado">
                      <div className="gruesa">{dia.nombre}</div>
                      {dia.ejercicios.length === 0 ? (
                        <p className="pequeno debil">Sin ejercicios.</p>
                      ) : (
                        <ul className="pequeno tenue" style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                          {dia.ejercicios.map((plantilla, i) => (
                            <li key={i}>
                              {porId.get(plantilla.ejercicioId)?.nombre ?? plantilla.ejercicioId} ·{' '}
                              {plantilla.series}×{plantilla.reps}
                              {plantilla.peso ? ` · ${plantilla.peso} kg` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  <div className="acciones">
                    <button
                      type="button"
                      className="accion pequena"
                      onClick={() => setEditando(rutina)}
                    >
                      <IconoLapiz />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="accion pequena fantasma"
                      onClick={() => duplicar(rutina)}
                    >
                      <IconoCopia />
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className="accion pequena fantasma"
                      onClick={() => guardar({ ...rutina, favorita: !rutina.favorita })}
                    >
                      <IconoEstrella />
                      {rutina.favorita ? 'Quitar de favoritas' : 'Favorita'}
                    </button>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </Seccion>

      {editando && (
        <EditorDeRutina
          rutina={rutinas.find((r) => r.id === editando.id) ?? editando}
          catalogo={catalogo}
          porId={porId}
          descansoPorDefecto={descansoPorDefecto}
          onGuardar={guardar}
          onBorrar={async (rutina) => {
            await borrar(rutina);
            setEditando(null);
            avisar('Rutina borrada');
          }}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  );
}

function EditorDeRutina({
  rutina,
  catalogo,
  porId,
  descansoPorDefecto,
  onGuardar,
  onBorrar,
  onCerrar,
}: {
  rutina: Rutina;
  catalogo: Ejercicio[];
  porId: Map<string, Ejercicio>;
  descansoPorDefecto: number;
  onGuardar: (r: Rutina) => void;
  onBorrar: (r: Rutina) => Promise<void>;
  onCerrar: () => void;
}) {
  const [añadiendoA, setAñadiendoA] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const cambiar = (cambios: Partial<Rutina>) => onGuardar({ ...rutina, ...cambios });

  const cambiarDia = (diaId: string, cambios: Partial<DiaDeRutina>) =>
    cambiar({ dias: rutina.dias.map((d) => (d.id === diaId ? { ...d, ...cambios } : d)) });

  const cambiarPlantilla = (diaId: string, indice: number, cambios: Partial<PlantillaEjercicio>) => {
    const dia = rutina.dias.find((d) => d.id === diaId);
    if (!dia) return;
    cambiarDia(diaId, {
      ejercicios: dia.ejercicios.map((e, i) => (i === indice ? { ...e, ...cambios } : e)),
    });
  };

  const añadir = (diaId: string, elegidos: Ejercicio[]) => {
    const dia = rutina.dias.find((d) => d.id === diaId);
    if (!dia) return;
    cambiarDia(diaId, {
      ejercicios: [
        ...dia.ejercicios,
        ...elegidos.map((e) => ({
          ejercicioId: e.id,
          series: 3,
          reps: e.medida === 'tiempo' ? '30 s' : '8-10',
          descanso: descansoPorDefecto,
        })),
      ],
    });
    setAñadiendoA(null);
  };

  return (
    <>
      <Hoja
        titulo="Editar rutina"
        ancha
        onCerrar={onCerrar}
        pie={
          confirmando ? (
            <>
              <button type="button" className="accion" onClick={() => setConfirmando(false)}>
                No, dejarla
              </button>
              <button type="button" className="accion peligro" onClick={() => onBorrar(rutina)}>
                Sí, borrar rutina
              </button>
            </>
          ) : (
            <>
              <button type="button" className="accion peligro" onClick={() => setConfirmando(true)}>
                <IconoPapelera />
                Borrar
              </button>
              <button type="button" className="accion primaria" onClick={onCerrar}>
                Hecho
              </button>
            </>
          )
        }
      >
        <div className="pila">
          <Campo etiqueta="Nombre">
            <input
              className="entrada"
              value={rutina.nombre}
              onChange={(e) => cambiar({ nombre: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Descripción" pista="Para acordarte de para qué era esta rutina.">
            <textarea
              value={rutina.descripcion ?? ''}
              placeholder="Cuatro días, fuerza, ocho semanas."
              onChange={(e) => cambiar({ descripcion: e.target.value })}
            />
          </Campo>

          <Interruptor
            texto="Favorita"
            pista="Sale primero y aparece desplegada al empezar a entrenar."
            activo={Boolean(rutina.favorita)}
            onCambiar={(v) => cambiar({ favorita: v })}
          />

          <hr className="linea-fina" />

          {rutina.dias.map((dia, indiceDia) => (
            <div key={dia.id} className="panel apagado pila">
              <div className="fila">
                <input
                  className="entrada"
                  value={dia.nombre}
                  aria-label="Nombre del día"
                  onChange={(e) => cambiarDia(dia.id, { nombre: e.target.value })}
                />
                {rutina.dias.length > 1 && (
                  <button
                    type="button"
                    className="accion fantasma icono peligro"
                    aria-label={`Quitar ${dia.nombre}`}
                    onClick={() => cambiar({ dias: rutina.dias.filter((d) => d.id !== dia.id) })}
                  >
                    <IconoPapelera />
                  </button>
                )}
              </div>

              {dia.ejercicios.length === 0 && (
                <p className="pequeno debil">
                  Todavía no hay ejercicios en {dia.nombre.toLowerCase()}.
                </p>
              )}

              {dia.ejercicios.map((plantilla, indice) => (
                <div key={`${plantilla.ejercicioId}-${indice}`} className="panel pila junta">
                  <div className="fila">
                    <span className="gruesa pequeno corta">
                      {porId.get(plantilla.ejercicioId)?.nombre ?? plantilla.ejercicioId}
                    </span>
                    <span className="hueco" />
                    <button
                      type="button"
                      className="accion fantasma icono"
                      aria-label="Quitar del día"
                      onClick={() =>
                        cambiarDia(dia.id, {
                          ejercicios: dia.ejercicios.filter((_, i) => i !== indice),
                        })
                      }
                    >
                      <IconoPapelera />
                    </button>
                  </div>

                  <div className="rejilla auto">
                    <Campo etiqueta="Series">
                      <Numero
                        valor={plantilla.series}
                        onCambiar={(v) => cambiarPlantilla(dia.id, indice, { series: v ?? 1 })}
                      />
                    </Campo>
                    <Campo etiqueta="Reps">
                      <input
                        className="entrada numero"
                        value={plantilla.reps}
                        placeholder="8-10"
                        onChange={(e) => cambiarPlantilla(dia.id, indice, { reps: e.target.value })}
                      />
                    </Campo>
                    <Campo etiqueta="Peso (kg)">
                      <Numero
                        valor={plantilla.peso}
                        placeholder="—"
                        onCambiar={(v) => cambiarPlantilla(dia.id, indice, { peso: v })}
                      />
                    </Campo>
                    <Campo etiqueta="Descanso (s)">
                      <Numero
                        valor={plantilla.descanso}
                        onCambiar={(v) =>
                          cambiarPlantilla(dia.id, indice, { descanso: v ?? descansoPorDefecto })
                        }
                      />
                    </Campo>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="accion pequena entera"
                onClick={() => setAñadiendoA(dia.id)}
              >
                <IconoMas />
                Añadir ejercicios a {dia.nombre}
              </button>

              {indiceDia === rutina.dias.length - 1 && (
                <button
                  type="button"
                  className="accion pequena fantasma entera"
                  onClick={() =>
                    cambiar({
                      dias: [
                        ...rutina.dias,
                        {
                          id: nuevoId(),
                          nombre: `Día ${rutina.dias.length + 1}`,
                          ejercicios: [],
                        },
                      ],
                    })
                  }
                >
                  <IconoMas />
                  Añadir otro día
                </button>
              )}
            </div>
          ))}
        </div>
      </Hoja>

      {añadiendoA && (
        <SelectorDeEjercicios
          catalogo={catalogo}
          titulo="Añadir a la rutina"
          onElegir={(elegidos) => añadir(añadiendoA, elegidos)}
          onCerrar={() => setAñadiendoA(null)}
        />
      )}
    </>
  );
}
