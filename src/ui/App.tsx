import { useEffect, useState } from 'react';
import {
  useAjustes,
  useEjercicios,
  useEntrenos,
  useMedidas,
  useNota,
  useRutinas,
} from './estado';
import { aplicarTema } from './temas';
import { Descanso } from './Cronometro';
import { VistaResumen } from './VistaResumen';
import { VistaEntreno } from './VistaEntreno';
import { VistaEjercicios } from './VistaEjercicios';
import { VistaRutinas } from './VistaRutinas';
import { VistaProgreso } from './VistaProgreso';
import { VistaAjustes } from './VistaAjustes';
import {
  IconoAjustes,
  IconoLista,
  IconoPesa,
  IconoProgreso,
  IconoResumen,
} from './Iconos';
import './estilos.css';

/**
 * Las cinco secciones. **No cambian nunca**, ni haya entreno en curso ni no lo haya: una
 * barra que aparece y desaparece obliga a mirarla cada vez en lugar de aprendérsela.
 *
 * El orden va de dentro afuera, y en el móvil eso importa porque el pulgar llega antes a
 * lo de la izquierda:
 *
 *   1. Resumen: cómo va la semana. Es a lo que se entra veinte veces al día.
 *   2. Entrenar: el entreno de ahora mismo y el historial.
 *   3. Ejercicios y Rutinas: el material con el que se construye un entreno.
 *   4. Progreso: lo que se mira sentado, una vez por semana.
 *   5. Ajustes: lo que se toca una vez.
 */
type Seccion = 'resumen' | 'entrenar' | 'ejercicios' | 'rutinas' | 'progreso' | 'ajustes';

const SECCIONES: { id: Seccion; texto: string; Icono: (p: { titulo?: string }) => JSX.Element }[] = [
  { id: 'resumen', texto: 'Resumen', Icono: IconoResumen },
  { id: 'entrenar', texto: 'Entrenar', Icono: IconoPesa },
  { id: 'ejercicios', texto: 'Ejercicios', Icono: IconoLista },
  { id: 'rutinas', texto: 'Rutinas', Icono: IconoLista },
  { id: 'progreso', texto: 'Progreso', Icono: IconoProgreso },
  { id: 'ajustes', texto: 'Ajustes', Icono: IconoAjustes },
];

/** El descanso en marcha: cuándo acaba y cuánto duraba, para pintar la barra. */
interface DescansoActivo {
  finEn: number;
  total: number;
}

export function App() {
  const [seccion, setSeccion] = useState<Seccion>('resumen');
  const [descanso, setDescanso] = useState<DescansoActivo | null>(null);

  const { ajustes, cambiar: cambiarAjustes, recargar: recargarAjustes } = useAjustes();
  const { nota, avisar } = useNota();

  const entrenos = useEntrenos();
  const rutinas = useRutinas();
  const ejercicios = useEjercicios();
  const medidas = useMedidas();

  useEffect(() => {
    aplicarTema(ajustes.tema);
  }, [ajustes.tema]);

  const recargarTodo = async () => {
    await Promise.all([
      entrenos.recargar(),
      rutinas.recargar(),
      ejercicios.recargar(),
      medidas.recargar(),
      recargarAjustes(),
    ]);
  };

  const empezarDescanso = (segundos: number) => {
    if (segundos <= 0) return;
    setDescanso({ finEn: Date.now() + segundos * 1000, total: segundos });
  };

  const saludo = ajustes.nombre ? `Hola, ${ajustes.nombre}` : 'FitLog';

  return (
    <div className="app">
      <header className="cabecera">
        <button className="marca" onClick={() => setSeccion('resumen')} title="Ir al resumen">
          {saludo}
          <span>Entrenos y progreso</span>
        </button>
        <span className="hueco" />
        {entrenos.enCurso && seccion !== 'entrenar' && (
          <button
            type="button"
            className="accion pequena primaria"
            onClick={() => setSeccion('entrenar')}
          >
            Entreno en curso
          </button>
        )}
      </header>

      <div className="cuerpo">
        <nav className="lateral" aria-label="Secciones">
          {SECCIONES.map(({ id, texto, Icono }) => (
            <button
              key={id}
              type="button"
              aria-current={seccion === id ? 'page' : undefined}
              onClick={() => setSeccion(id)}
            >
              <Icono />
              {texto}
            </button>
          ))}
        </nav>

        <main className="contenido">
          {seccion === 'resumen' && (
            <VistaResumen
              entrenos={entrenos.entrenos}
              catalogo={ejercicios.catalogo}
              onIrAEntrenar={() => setSeccion('entrenar')}
            />
          )}

          {seccion === 'entrenar' && (
            <VistaEntreno
              entrenos={entrenos.entrenos}
              enCurso={entrenos.enCurso}
              rutinas={rutinas.rutinas}
              catalogo={ejercicios.catalogo}
              porId={ejercicios.porId}
              ajustes={ajustes}
              guardar={entrenos.guardar}
              guardarYa={entrenos.guardarYa}
              borrar={entrenos.borrar}
              guardarRutina={rutinas.guardar}
              avisar={avisar}
              onDescansar={empezarDescanso}
            />
          )}

          {seccion === 'ejercicios' && (
            <VistaEjercicios
              catalogo={ejercicios.catalogo}
              entrenos={entrenos.entrenos}
              deCasa={ejercicios.deCasa}
              guardarPropio={ejercicios.guardar}
              borrarPropio={ejercicios.borrar}
              avisar={avisar}
            />
          )}

          {seccion === 'rutinas' && (
            <VistaRutinas
              rutinas={rutinas.rutinas}
              catalogo={ejercicios.catalogo}
              porId={ejercicios.porId}
              descansoPorDefecto={ajustes.descansoPorDefecto}
              guardar={rutinas.guardar}
              borrar={rutinas.borrar}
              avisar={avisar}
            />
          )}

          {seccion === 'progreso' && (
            <VistaProgreso
              entrenos={entrenos.entrenos}
              catalogo={ejercicios.catalogo}
              porId={ejercicios.porId}
              medidas={medidas.medidas}
              guardarMedida={medidas.guardar}
              borrarMedida={medidas.borrar}
              avisar={avisar}
            />
          )}

          {seccion === 'ajustes' && (
            <VistaAjustes
              ajustes={ajustes}
              cambiar={cambiarAjustes}
              deCasa={ejercicios.deCasa}
              propios={ejercicios.propios.length}
              entrenos={entrenos.entrenos.length}
              onRecargar={recargarTodo}
              avisar={avisar}
            />
          )}
        </main>
      </div>

      {/* El botón de empezar sólo aparece donde tiene sentido: si ya hay entreno en curso,
          o si estás en la pantalla de entrenar, sería un botón que no hace nada nuevo. */}
      {!entrenos.enCurso && seccion !== 'entrenar' && seccion !== 'ajustes' && (
        <button type="button" className="flotante" onClick={() => setSeccion('entrenar')}>
          <IconoPesa />
          Entrenar
        </button>
      )}

      <nav className="tira" aria-label="Secciones">
        {SECCIONES.map(({ id, texto, Icono }) => (
          <button
            key={id}
            type="button"
            aria-current={seccion === id ? 'page' : undefined}
            onClick={() => setSeccion(id)}
          >
            <Icono />
            {texto}
          </button>
        ))}
      </nav>

      {descanso && (
        <Descanso
          finEn={descanso.finEn}
          total={descanso.total}
          avisar={ajustes.avisoDescanso}
          onCambiar={(finEn) => setDescanso({ ...descanso, finEn })}
          onCerrar={() => setDescanso(null)}
        />
      )}

      {nota && <div className="nota">{nota}</div>}
    </div>
  );
}
