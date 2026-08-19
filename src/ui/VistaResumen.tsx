/**
 * Resumen: en qué punto estoy.
 *
 * Se abre veinte veces al día y casi siempre para responder a una de estas dos preguntas:
 * «¿he entrenado ya esta semana?» y «¿voy más o menos que la anterior?». Todo lo que hay
 * aquí contesta a una de las dos; lo demás vive en Progreso, que es donde se va a mirar
 * despacio.
 */

import type { Ejercicio, Grupo } from '../datos/ejercicios';
import {
  duracionEnSegundos,
  seriesHechas,
  resumenDeCardio,
  seriesPorGrupo,
  volumenDeEntreno,
  volumenPorSemana,
  type Entreno,
} from '../motor/entreno';
import { claveDia, diasEntre, duracionLarga, fechaRelativa, hoy, lunesDe, sumarDias } from '../motor/fechas';
import { Barras, Columnas } from './Graficos';
import { Cifra, Panel, Seccion, Vacio, cifra, contar, volumenCorto } from './Piezas';
import { IconoJugar, IconoPesa } from './Iconos';

/**
 * Series semanales por grupo a partir de las cuales un grupo está bien atendido.
 *
 * Diez es el número que se repite en la literatura de hipertrofia como suelo razonable
 * para un grupo que se quiere hacer crecer. Aquí es sólo una **referencia** en el gráfico,
 * no un objetivo que la aplicación exija: quien esté haciendo fuerza pura, rehabilitación
 * o un mantenimiento va a estar por debajo a propósito, y eso no es un fallo.
 */
const SERIES_DE_REFERENCIA = 10;

export function VistaResumen({
  entrenos,
  catalogo,
  onIrAEntrenar,
}: {
  entrenos: Entreno[];
  catalogo: Ejercicio[];
  onIrAEntrenar: () => void;
}) {
  const hechos = entrenos.filter((e) => e.fin !== null);
  const lunes = lunesDe(hoy());
  const lunesPasado = sumarDias(lunes, -7);

  const deEstaSemana = hechos.filter((e) => e.fecha >= lunes);
  const deLaPasada = hechos.filter((e) => e.fecha >= lunesPasado && e.fecha < lunes);

  const volumenSemana = deEstaSemana.reduce((t, e) => t + volumenDeEntreno(e), 0);
  const volumenPasada = deLaPasada.reduce((t, e) => t + volumenDeEntreno(e), 0);
  const seriesSemana = deEstaSemana.reduce((t, e) => t + seriesHechas(e), 0);

  const porSemana = volumenPorSemana(hechos, lunesDe).slice(-8);
  const cardio = resumenDeCardio(deEstaSemana, catalogo);
  const porGrupo = seriesPorGrupo(deEstaSemana, catalogo);

  const gruposOrdenados = (Object.entries(porGrupo) as [Grupo, number][])
    .filter(([, series]) => series > 0)
    .sort((a, b) => b[1] - a[1]);

  const ultimo = hechos[0];
  const diasSinEntrenar = ultimo ? diasEntre(ultimo.fecha, claveDia()) : null;

  if (hechos.length === 0) {
    return (
      <Seccion titulo="Resumen">
        <div className="panel">
          <Vacio
            icono={<IconoPesa />}
            titulo="Aquí no hay nada todavía"
            accion={
              <button type="button" className="accion primaria" onClick={onIrAEntrenar}>
                <IconoJugar />
                Empezar a entrenar
              </button>
            }
          >
            En cuanto guardes el primer entreno, esta pantalla empieza a contarte cómo va la
            semana y a comparar con la anterior.
          </Vacio>
        </div>
      </Seccion>
    );
  }

  return (
    <>
      <Seccion titulo="Esta semana">
        <div className="rejilla auto">
          <Cifra
            etiqueta="Entrenos"
            valor={deEstaSemana.length}
            delta={
              deLaPasada.length > 0
                ? `${deEstaSemana.length - deLaPasada.length >= 0 ? '+' : ''}${
                    deEstaSemana.length - deLaPasada.length
                  } vs semana pasada`
                : undefined
            }
            signoDelta={deEstaSemana.length >= deLaPasada.length ? 'buena' : 'neutra'}
          />
          <Cifra etiqueta="Series" valor={seriesSemana} />
          <Cifra
            etiqueta="Volumen"
            valor={volumenCorto(volumenSemana)}
            delta={
              volumenPasada > 0
                ? `${volumenSemana >= volumenPasada ? '+' : ''}${cifra(
                    ((volumenSemana - volumenPasada) / volumenPasada) * 100,
                  )} %`
                : undefined
            }
            signoDelta={volumenSemana >= volumenPasada ? 'buena' : 'neutra'}
          />
          <Cifra
            etiqueta="Último entreno"
            valor={diasSinEntrenar === 0 ? 'Hoy' : `Hace ${diasSinEntrenar} d`}
          />
          {/* El cardio sólo sale si lo hay: cuando existe es la mitad de lo que hiciste esa
              semana, y cuando no, un «0 min» fijo sería un reproche semanal. */}
          {cardio.hayAlgo && (
            <>
              <Cifra
                etiqueta="Cardio"
                valor={cardio.minutos}
                unidad="min"
                delta={contar(cardio.sesiones, 'sesión', 'sesiones')}
              />
              <Cifra
                etiqueta={cardio.kilometros > 0 ? 'Distancia' : 'Calorías'}
                valor={cardio.kilometros > 0 ? cifra(cardio.kilometros, 1) : cardio.calorias}
                unidad={cardio.kilometros > 0 ? 'km' : 'kcal'}
                delta={
                  cardio.kilometros > 0 && cardio.calorias > 0
                    ? `${cifra(cardio.calorias)} kcal`
                    : undefined
                }
              />
            </>
          )}
        </div>
      </Seccion>

      {porSemana.length > 1 && (
        <Seccion titulo="Volumen por semana">
          <div className="panel">
            <Columnas
              subtitulo="Kilos levantados por semana, sin contar calentamientos."
              datos={porSemana.map((s) => ({
                clave: s.semana,
                etiqueta: s.semana.slice(8, 10) + '/' + s.semana.slice(5, 7),
                detalle: `Semana del ${s.semana.slice(8, 10)}/${s.semana.slice(5, 7)} · ${contar(
                  s.entrenos,
                  'entreno',
                  'entrenos',
                )}`,
                valor: Math.round(s.volumen),
              }))}
              formato={(n) => (n >= 1000 ? `${cifra(n / 1000, 1)} t` : cifra(n))}
            />
          </div>
        </Seccion>
      )}

      {gruposOrdenados.length > 0 && (
        <Seccion titulo="Series por grupo esta semana">
          <Panel
            titulo="Reparto"
            resumen={contar(gruposOrdenados.length, 'grupo', 'grupos')}
            ayuda={
              <>
                <p>
                  Cuenta las series hechas de cada grupo, sin calentamientos. Lo que un
                  ejercicio trabaja de refuerzo suma <strong>media serie</strong>: el press de
                  banca hace algo por el tríceps, pero no lo mismo que una extensión en polea.
                </p>
                <p style={{ marginTop: 8 }}>
                  La línea marca {SERIES_DE_REFERENCIA} series, que es el suelo que se suele
                  citar para hacer crecer un grupo. Es una referencia, no un deber: en fuerza
                  pura o en mantenimiento se está por debajo a propósito.
                </p>
              </>
            }
          >
            <Barras
              datos={gruposOrdenados.map(([grupo, series]) => ({
                clave: grupo,
                etiqueta: grupo,
                valor: series,
              }))}
              formato={(n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))}
              objetivo={SERIES_DE_REFERENCIA}
            />
          </Panel>
        </Seccion>
      )}

      <Seccion titulo="Últimos entrenos">
        <div className="panel hueco">
          <div className="lista">
            {hechos.slice(0, 4).map((entreno) => (
              <div key={entreno.id} className="fila-lista quieta">
                <span className="marca-icono acento">
                  <IconoPesa />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="nombre">{entreno.nombre}</span>
                  <span className="meta">
                    {fechaRelativa(entreno.fecha)} ·{' '}
                    {contar(seriesHechas(entreno), 'serie', 'series')} ·{' '}
                    {duracionLarga(duracionEnSegundos(entreno))}
                  </span>
                </span>
                <span className="valor">{volumenCorto(volumenDeEntreno(entreno))}</span>
              </div>
            ))}
          </div>
        </div>
      </Seccion>
    </>
  );
}
