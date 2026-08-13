# FitLog

Registro de entrenos: qué hiciste, con cuánto y cómo va la cosa. Pensado para usarse **de
pie, con una mano y entre series**, que es cuando de verdad se apunta un peso.

Sin cuenta y sin servidor: todo se guarda en el propio dispositivo y se puede sacar a un
archivo cuando quieras.

Hay **dos aplicaciones** con las mismas ideas dentro:

| | `movil/` | raíz (`src/`) |
|---|---|---|
| Qué es | App de **Android**, en Flutter | App **web**, en React |
| Para qué | Usarla en el móvil, en el gimnasio | Abrirla en el ordenador; fue el primer prototipo |
| Extra que sólo tiene ella | Aviso del descanso con la pantalla apagada | — |

El catálogo de ejercicios **se escribe una sola vez** (en la web) y se traduce a Dart con un
generador, para que las dos no puedan acabar diciendo cosas distintas.

## La app de Android

### Cómo instalarla en el móvil

No hace falta instalar nada en el ordenador: la compila GitHub.

1. En GitHub, pestaña **Actions** → **APK de Android** → la última ejecución en verde.
2. Abajo, en **Artifacts**, descarga `fitlog-apk` (un zip con el APK dentro).
3. Descomprímelo en el móvil y ábrelo. Android pedirá permiso para instalar aplicaciones de
   fuera de Play Store; se lo das al explorador de archivos o al navegador con el que lo
   abras.

Para actualizarla, instala el APK nuevo encima: los datos no se van, porque viven en la
carpeta de la aplicación y no en el APK. Eso funciona porque **todos los APK se firman con la
misma clave**, que está en el repositorio a propósito (`movil/android/app/fitlog.jks`); Android
identifica una aplicación por su firma, y con una clave distinta en cada compilación el APK
nuevo no se instalaría encima y habría que desinstalar —perdiendo los entrenos— para meterlo.
El razonamiento completo, y qué habría que cambiar antes de publicar esto en Play Store, está
en `movil/android/app/build.gradle.kts`.

### Tus datos: dónde están y cómo llevártelos a otro móvil

Viven **sólo en ese móvil**, en la carpeta privada de la aplicación: un JSON por colección. No
hay cuenta ni servidor, así que nadie más los ve — y por lo mismo, nadie más los guarda.

| | Tus datos |
|---|---|
| Cerrar la app, reiniciar, instalar un APK nuevo encima | Siguen ahí |
| Desinstalar, «Borrar datos», reset de fábrica, perder el móvil | Se van |

Para llevártelos: **Ajustes → Copias de seguridad → Compartir copia** saca un JSON y lo manda
a donde quieras (Drive, correo, WhatsApp a ti mismo). En el otro móvil, **Restaurar desde un
archivo**. Restaurar no borra nada: se fusiona registro a registro y, si algo choca, gana lo
más recientemente tocado, así que importar dos veces la misma copia no duplica entrenos.

Como acordarse es la parte que falla, la aplicación lleva la cuenta de cuándo fue la última
copia y avisa en el resumen cuando hay cuatro entrenos sin copiar (o uno y tres semanas). El
aviso desaparece al compartir una copia; nunca sale si no hay nada nuevo que perder.

La copia automática de Android a Google Drive existe y está activada por defecto, pero **no
cuentes con ella**: sólo restaura al estrenar un móvil, con la misma cuenta, y con una
aplicación instalada a mano casi nunca llega a dispararse.

### Desarrollo

```sh
cd movil
flutter pub get
flutter analyze          # sin avisos
flutter test             # motor de cálculo + pruebas de interfaz
flutter run              # con un móvil conectado o un emulador
flutter build apk --release
```

### Decisiones que conviene conocer antes de tocar nada

- **El entreno en curso es el que no tiene `fin`.** No hay una variable aparte con «cuál
  estoy haciendo ahora», que es lo que se queda descolgado en cuanto algo falla a medias.
- **No hay botón de guardar.** Se escribe con 400 ms de retardo para no tocar el disco en cada
  tecla, y lo pendiente se vuelca cuando Android se lleva la aplicación al fondo
  (`AppLifecycleState.paused`).
- **Los datos son un JSON por colección**, escrito en un temporal y renombrado encima. Si el
  móvil se apaga a mitad queda la versión anterior íntegra, en vez de un archivo truncado que
  no se puede leer. No hay base de datos porque la aplicación siempre lee la colección entera
  de todas formas: el resumen y los récords necesitan mirarlo todo.
- **El calentamiento no cuenta** para el volumen ni para los récords. Si contara, subir el peso
  poco a poco antes de la serie fuerte inflaría el total.
- **Las fechas se guardan en horario local** (`AAAA-MM-DD`), no en UTC: un entreno de las once
  de la noche es «hoy» para quien entrena.
- **El aviso del descanso tiene un límite honesto**: lo dispara un temporizador dentro de la
  aplicación, así que si Android la mata del todo para liberar memoria, no llega. Con la app en
  segundo plano y la pantalla apagada —el caso normal— sí llega. Hacerlo a prueba de todo
  pediría una alarma del sistema o un servicio en primer plano con su notificación permanente;
  el sitio para cambiarlo es `lib/ui/cronometro.dart`.
- **Los colores de los gráficos** salen del tema y están validados contra el fondo de cada
  tema (banda de luminosidad, contraste y separación entre series contiguas también con
  daltonismo). Añadir un tema obliga a repetir esa validación, no sólo a elegir colores.

```
movil/lib/
  motor/      Cálculo puro y con pruebas: volumen, récords, 1RM, fechas.
  datos/      El catálogo de ejercicios (generado, no editar a mano).
  almacen/    Los archivos JSON y los tipos que se guardan.
  ui/         Pantallas, piezas comunes, gráficos con CustomPainter y temas.
```

## La app web

```sh
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

Mismas convenciones que **Anima-Manager**: TypeScript estricto, React sobre Vite, todo en
español —archivos, identificadores, clases CSS y variables de tema— y los comentarios explican
**por qué** está así, no qué hace la línea de abajo.

```
src/
  motor/      Cálculo puro y con pruebas.
  datos/      Los catálogos escritos a mano: ejercicios y alimentos.
  almacen/    Persistencia local sobre IndexedDB.
  ui/         Vistas, piezas comunes, gráficos en SVG y temas.
  nube/       Estimación de comida por foto (ver más abajo).
api/          Función sin servidor para esa estimación.
herramientas/ El generador del catálogo de ejercicios para Dart.
```

### Regenerar el catálogo de Dart

Los ejercicios se añaden en `src/datos/ejercicios.ts` y de ahí salen los dos catálogos:

```sh
npx tsc src/datos/ejercicios.ts --outDir .tmp-gen --module es2020 --target es2020
node herramientas/generar_catalogo_dart.mjs > movil/lib/datos/ejercicios.dart
```

## Qué hay dentro (las dos)

- **Resumen** — cómo va la semana y si vas más o menos que la anterior.
- **Entrenar** — el entreno en curso y el historial. Debajo de cada ejercicio se ve lo que
  hiciste **la última vez**, que es lo que se mira para decidir si hoy toca subir. Marcar una
  serie arranca el descanso solo.
- **Ejercicios** — 297 del catálogo (máquinas, poleas, barra, mancuernas, kettlebell, peso
  corporal, bandas, multipower, anillas, cardio…) más los que crees tú. Cada uno guarda tus
  récords y su evolución.
- **Rutinas** — planes con días («Torso / Pierna»). Al empezar a entrenar eliges un día y los
  ejercicios ya están puestos.
- **Progreso** — volumen por semana, reparto de series por grupo muscular, tabla de récords y
  peso corporal con sus perímetros.
- **Ajustes** — tema claro u oscuro, descanso por defecto, copia de seguridad.

## Comidas por foto (escrito y sin conectar)

Hay una parte de nutrición **hecha y sin enchufar** a ninguna de las dos interfaces, esperando
luz verde: el catálogo de alimentos, el cálculo de macros y objetivos (con sus pruebas) y
`src/nube/vision.ts`, que estima los alimentos de una foto y sus macros con un modelo con
visión. No entra en el paquete final: el SDK no aparece en el build mientras nada de la
interfaz lo importe.

Cuando se conecte, la clave de la API tiene dos caminos y el orden importa:

1. **Un servidor propio** (`api/vision.ts`, con `ANTHROPIC_API_KEY` en su entorno). La clave se
   queda en el servidor. Es lo recomendado.
2. **Una clave guardada en el dispositivo**, para usarlo sin desplegar nada. Funciona, y tiene
   una pega que conviene decir sin adornos: viaja en el JavaScript de la página y cualquier
   script que llegue a ejecutarse ahí podría leerla.

La estimación de una foto es una estimación: no hay báscula, no se ve el aceite del sofrito y
el volumen de un plato en una foto es una conjetura razonable. Todo lo que salga de ahí se
marca como estimado y se puede corregir antes de guardar.
