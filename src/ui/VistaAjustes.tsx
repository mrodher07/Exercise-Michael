/**
 * Ajustes: lo que se toca una vez y ya.
 *
 * Nada de lo de aquí hace falta para empezar a usar la aplicación — el tema, el descanso
 * por defecto y las copias de seguridad tienen valores razonables desde el primer día — y
 * por eso esta pantalla va la última.
 */

import { useRef, useState } from 'react';
import { almacen, type Ajustes } from '../almacen/almacen';
import { TEMAS } from './temas';
import { Campo, Hoja, Interruptor, Numero, Panel, Seccion, Segmentado } from './Piezas';
import { IconoPapelera } from './Iconos';

export function VistaAjustes({
  ajustes,
  cambiar,
  deCasa,
  propios,
  entrenos,
  onRecargar,
  avisar,
}: {
  ajustes: Ajustes;
  cambiar: (cambios: Partial<Ajustes>) => void;
  deCasa: number;
  propios: number;
  entrenos: number;
  /** Se llama después de importar o borrar: el estado en memoria ya no vale. */
  onRecargar: () => Promise<void>;
  avisar: (texto: string) => void;
}) {
  const [borrando, setBorrando] = useState(false);
  const [importando, setImportando] = useState<string | null>(null);
  const archivo = useRef<HTMLInputElement | null>(null);

  const exportar = async () => {
    const json = await almacen.exportar();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `fitlog-${new Date().toISOString().slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
    avisar('Copia descargada');
  };

  const importar = async (texto: string) => {
    try {
      const cuenta = await almacen.importar(texto);
      await onRecargar();
      const total = Object.values(cuenta).reduce((t, n) => t + n, 0);
      avisar(total > 0 ? `Importados ${total} registros` : 'No había nada nuevo que importar');
    } catch {
      avisar('Ese archivo no se entiende');
    }
    setImportando(null);
  };

  return (
    <>
      <Seccion titulo="Ajustes">
        <div className="panel pila">
          <Campo etiqueta="Tu nombre" pista="Sale en el saludo. Nada más.">
            <input
              className="entrada"
              value={ajustes.nombre ?? ''}
              placeholder="Sin poner"
              onChange={(e) => cambiar({ nombre: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Tema">
            <Segmentado
              opciones={TEMAS.map((t) => ({ id: t.id, texto: `${t.icono}  ${t.nombre}` }))}
              elegida={ajustes.tema}
              onElegir={(tema) => cambiar({ tema })}
            />
          </Campo>
          <p className="pequeno debil">
            {TEMAS.find((t) => t.id === ajustes.tema)?.descripcion}
          </p>
        </div>
      </Seccion>

      <Seccion titulo="Entreno">
        <div className="panel pila">
          <Campo
            etiqueta="Descanso por defecto (segundos)"
            pista="Se usa en los ejercicios nuevos. Cada uno puede llevar el suyo."
          >
            <Numero
              valor={ajustes.descansoPorDefecto}
              paso="15"
              className="entrada"
              onCambiar={(v) => cambiar({ descansoPorDefecto: v ?? 90 })}
            />
          </Campo>

          <Interruptor
            texto="Vibrar al acabar el descanso"
            pista="Sin sonido: en un gimnasio no se oye, y en casa a las siete de la mañana no se agradece."
            activo={ajustes.avisoDescanso}
            onCambiar={(v) => cambiar({ avisoDescanso: v })}
          />
        </div>
      </Seccion>

      <Seccion titulo="Tus datos">
        <Panel
          titulo="Copias de seguridad"
          resumen={`${entrenos} entrenos`}
          abierto={false}
          ayuda={
            <p>
              Todo se guarda <strong>en este dispositivo</strong>, dentro del navegador. No hay
              cuenta ni servidor, así que nadie más ve tus entrenos — y por lo mismo, si borras
              los datos del navegador o cambias de móvil, se van contigo. La copia es un archivo
              JSON que puedes guardar donde quieras y traer al otro dispositivo.
            </p>
          }
        >
          <div className="pila">
            <button type="button" className="accion entera" onClick={exportar}>
              Descargar copia
            </button>

            <button
              type="button"
              className="accion entera"
              onClick={() => archivo.current?.click()}
            >
              Restaurar desde un archivo
            </button>
            <input
              ref={archivo}
              type="file"
              accept="application/json,.json"
              className="solo-lectores"
              onChange={async (e) => {
                const elegido = e.target.files?.[0];
                e.target.value = '';
                if (elegido) setImportando(await elegido.text());
              }}
            />

            <p className="pequeno debil">
              Al restaurar no se borra nada: se fusiona por registro y, si algo choca, gana lo
              más recientemente tocado. Importar dos veces la misma copia no duplica entrenos.
            </p>

            <hr className="linea-fina" />

            <button
              type="button"
              className="accion peligro entera"
              onClick={() => setBorrando(true)}
            >
              <IconoPapelera />
              Empezar de cero
            </button>
          </div>
        </Panel>

        <p className="pequeno debil centrado">
          {deCasa} ejercicios en el catálogo
          {propios > 0 && ` y ${propios} tuyos`}.
        </p>
      </Seccion>

      {importando !== null && (
        <Hoja
          titulo="Restaurar copia"
          onCerrar={() => setImportando(null)}
          pie={
            <>
              <button type="button" className="accion" onClick={() => setImportando(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="accion primaria"
                onClick={() => void importar(importando)}
              >
                Restaurar
              </button>
            </>
          }
        >
          <p className="tenue">
            Se añadirá lo que traiga el archivo a lo que ya tienes. Nada se borra.
          </p>
        </Hoja>
      )}

      {borrando && (
        <Hoja
          titulo="Empezar de cero"
          onCerrar={() => setBorrando(false)}
          pie={
            <>
              <button type="button" className="accion" onClick={() => setBorrando(false)}>
                No, dejarlo
              </button>
              <button
                type="button"
                className="accion peligro"
                onClick={async () => {
                  await almacen.borrarTodo();
                  await onRecargar();
                  setBorrando(false);
                  avisar('Todo borrado');
                }}
              >
                Sí, borrar todo
              </button>
            </>
          }
        >
          <div className="pila">
            <p className="tenue">
              Se borran los entrenos, las rutinas, los ejercicios que hayas creado y las
              medidas. No se puede deshacer.
            </p>
            <p className="aviso">
              Si quieres poder volver atrás, descarga primero una copia y guárdala en otro
              sitio.
            </p>
          </div>
        </Hoja>
      )}
    </>
  );
}
