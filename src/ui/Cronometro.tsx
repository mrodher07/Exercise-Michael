/**
 * El cronómetro de descanso.
 *
 * Arranca solo al marcar una serie como hecha, que es cuando empieza el descanso de
 * verdad: obligar a pulsar un botón aparte hace que nadie lo use a partir de la tercera
 * serie.
 *
 * Cuenta con la **hora de fin**, no restando un segundo cada segundo. Es la diferencia
 * entre que funcione y que no: en el móvil, al apagar la pantalla o cambiar de aplicación
 * el navegador congela los temporizadores, y un contador que va restando se queda
 * exactamente donde estaba. Guardando cuándo termina, al volver el descanso está donde
 * tiene que estar.
 */

import { useEffect, useRef, useState } from 'react';
import { formatoDuracion } from '../motor/fechas';
import { IconoMas, IconoCruz } from './Iconos';

export function Descanso({
  finEn,
  total,
  onCambiar,
  onCerrar,
  avisar,
}: {
  /** Instante en el que acaba, en milisegundos. */
  finEn: number;
  /** Lo que duraba el descanso completo, para pintar la barra. */
  total: number;
  onCambiar: (nuevoFin: number) => void;
  onCerrar: () => void;
  avisar: boolean;
}) {
  const [ahora, setAhora] = useState(() => Date.now());
  const yaAvisado = useRef(false);

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(reloj);
  }, []);

  const quedan = Math.max(0, Math.round((finEn - ahora) / 1000));

  useEffect(() => {
    if (quedan > 0) {
      yaAvisado.current = false;
      return;
    }
    if (yaAvisado.current || !avisar) return;
    yaAvisado.current = true;
    // Vibración corta. No hay sonido a propósito: en un gimnasio no se oye, y en casa a
    // las siete de la mañana no se agradece.
    navigator.vibrate?.([120, 60, 120]);
  }, [quedan, avisar]);

  const porcentaje = total > 0 ? (quedan / total) * 100 : 0;

  return (
    <div className="descanso" role="timer" aria-live="off">
      <span className="tiempo">{quedan > 0 ? formatoDuracion(quedan) : '¡Ya!'}</span>
      <div className="barra">
        <span style={{ width: `${porcentaje}%` }} />
      </div>
      <button
        type="button"
        className="accion"
        onClick={() => onCambiar(Math.max(Date.now(), finEn) + 30_000)}
        aria-label="Treinta segundos más"
      >
        <IconoMas />
        30 s
      </button>
      <button type="button" className="accion icono" onClick={onCerrar} aria-label="Saltar descanso">
        <IconoCruz />
      </button>
    </div>
  );
}
