# FitLog

Registro de entrenos: qué hiciste, con cuánto y cómo va la cosa. Pensado para usarse **de
pie, con una mano y entre series**, que es cuando de verdad se apunta un peso.

Sin cuenta y sin servidor: todo se guarda en el propio dispositivo (IndexedDB) y se puede
exportar a un archivo cuando quieras.

## Arrancar

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # las pruebas del motor de cálculo
npm run build    # tsc -b && vite build
```

## Qué hay

- **Resumen** — cómo va la semana y si vas más o menos que la anterior.
- **Entrenar** — el entreno en curso y el historial. Debajo de cada ejercicio se ve lo que
  hiciste **la última vez**, que es lo que se mira para decidir si hoy toca subir. Marcar
  una serie arranca el descanso solo.
- **Ejercicios** — 280 del catálogo (máquinas, poleas, barra, mancuernas, kettlebell, peso
  corporal, bandas, multipower, anillas, cardio…) más los que crees tú. Cada uno guarda tus
  récords y su evolución.
- **Rutinas** — planes con días («Torso / Pierna»). Al empezar a entrenar eliges un día y
  los ejercicios ya están puestos.
- **Progreso** — volumen por semana, reparto de series por grupo muscular, tabla de récords
  y peso corporal con sus perímetros.
- **Ajustes** — tema claro u oscuro, descanso por defecto, copia de seguridad.

## Cómo está montado

Mismo lenguaje que **Anima-Manager**: TypeScript estricto, React 18 sobre Vite, todo en
español —archivos, identificadores, clases CSS y variables de tema— y los comentarios
explican **por qué** está así, no qué hace la línea de abajo.

```
src/
  motor/      Cálculo puro y con pruebas: volumen, récords, 1RM, fechas, nutrición.
  datos/      Los catálogos escritos a mano: ejercicios y alimentos.
  almacen/    Persistencia local sobre IndexedDB (interfaz asíncrona desde el primer día).
  ui/         Vistas, piezas comunes, gráficos en SVG y temas.
  nube/       Estimación de comida por foto (ver más abajo).
api/          Función sin servidor para esa estimación.
```

Decisiones que conviene conocer antes de tocar nada:

- **El entreno en curso es el que no tiene `fin`.** No hay una variable aparte con «cuál
  estoy haciendo ahora», que es lo que se queda descolgado en cuanto algo falla a medias.
- **No hay botón de guardar.** Se escribe con 400 ms de retardo para no tocar la base en
  cada tecla, y lo pendiente se vuelca al ocultarse la página (`visibilitychange`, que en el
  móvil es el evento fiable; `beforeunload` no lo es).
- **El calentamiento no cuenta** para el volumen ni para los récords. Si contara, subir el
  peso poco a poco antes de la serie fuerte inflaría el total.
- **Las fechas se guardan en horario local** (`AAAA-MM-DD`), no en UTC: una cena a las once
  de la noche es «hoy» para quien la cena.
- **Los colores de los gráficos** salen de las variables del tema y están validados contra
  el fondo de cada tema (banda de luminosidad, contraste y separación entre series contiguas
  también con daltonismo). Añadir un tema obliga a repetir esa validación.

## Comidas por foto (escrito pero no conectado)

Hay una parte de nutrición **hecha y sin enchufar** a la interfaz, esperando luz verde: el
catálogo de alimentos, el cálculo de macros y objetivos (con sus pruebas) y `src/nube/vision.ts`,
que estima los alimentos de una foto y sus macros con un modelo con visión. No entra en el
paquete final: el SDK no aparece en el build mientras nada de la interfaz lo importe.

Cuando se conecte, la clave de la API tiene dos caminos y el orden importa:

1. **Un servidor propio** (`api/vision.ts`, con `ANTHROPIC_API_KEY` en su entorno). La clave
   se queda en el servidor. Es lo recomendado.
2. **Una clave guardada en el dispositivo**, para usarlo sin desplegar nada. Funciona, y
   tiene una pega que conviene decir sin adornos: viaja en el JavaScript de la página y
   cualquier script que llegue a ejecutarse ahí podría leerla.

La estimación de una foto es una estimación: no hay báscula, no se ve el aceite del sofrito
y el volumen de un plato en una foto es una conjetura razonable. Todo lo que salga de ahí se
marca como estimado y se puede corregir antes de guardar.
