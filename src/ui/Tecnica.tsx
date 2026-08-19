/**
 * Cómo se hace el ejercicio.
 *
 * Vive en su propia pieza porque se enseña en dos sitios: en la ficha del ejercicio, donde uno
 * mira antes de meterlo en una rutina, y —en la app de Android— en medio del entreno.
 *
 * Del vídeo: el botón abre una búsqueda en YouTube con el nombre del ejercicio. No se incrusta
 * un reproductor ni se fija un vídeo concreto a propósito. Un vídeo concreto es un enlace roto
 * en cuanto su autor lo borra, y no hay forma de comprobar desde aquí que siga vivo; la
 * búsqueda por el nombre siempre lleva a algo, y encima a lo que la gente ve ahora.
 */

import type { Ejercicio } from '../datos/ejercicios';
import { tecnicaDe, videoDe } from '../datos/tecnica';
import { Panel } from './Piezas';

export function FichaDeTecnica({
  ejercicio,
  abierto = false,
}: {
  ejercicio: Ejercicio;
  abierto?: boolean;
}) {
  const tecnica = tecnicaDe(ejercicio.id);
  const enlace = videoDe(ejercicio.nombre, ejercicio.id);

  if (!tecnica) {
    /* Un ejercicio creado por el usuario no trae explicación escrita, pero el vídeo sí sirve. */
    return (
      <div className="panel">
        <p className="texto-tecnica">
          Este ejercicio lo has creado tú, así que no trae explicación. El vídeo busca por su
          nombre.
        </p>
        <BotonDeVideo enlace={enlace} />
      </div>
    );
  }

  return (
    <Panel titulo="Cómo se hace" resumen={abierto ? undefined : 'técnica'} abierto={abierto}>
      <div className="pila">
        <ParteDeTecnica titulo="Colocación" texto={tecnica.preparacion} />
        <ParteDeTecnica titulo="Movimiento" texto={tecnica.ejecucion} />
        <ParteDeTecnica titulo="El fallo típico" texto={tecnica.fallo} aviso />
        <BotonDeVideo enlace={enlace} />
      </div>
    </Panel>
  );
}

function ParteDeTecnica({
  titulo,
  texto,
  aviso = false,
}: {
  titulo: string;
  texto: string;
  /** El fallo se pinta con el color de aviso: es lo que hay que leer si sólo se lee una cosa. */
  aviso?: boolean;
}) {
  return (
    <div>
      <h4 className={`titulo-tecnica${aviso ? ' aviso' : ''}`}>{titulo}</h4>
      <p className="texto-tecnica">{texto}</p>
    </div>
  );
}

function BotonDeVideo({ enlace }: { enlace: string }) {
  return (
    <a className="accion video" href={enlace} target="_blank" rel="noreferrer noopener">
      Ver vídeo del ejercicio
    </a>
  );
}
