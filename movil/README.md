# FitLog para Android

La aplicación de móvil. Lo que hay que saber para tocarla —cómo instalarla sin compilar nada,
las decisiones de dentro y de dónde sale el catálogo de ejercicios— está en el
[README de la raíz](../README.md), para no tener dos versiones de lo mismo.

En corto:

```sh
flutter pub get
flutter analyze          # tiene que decir «No issues found!»
flutter test             # motor de cálculo + pantallas
flutter run              # con un móvil conectado o un emulador
flutter build apk --release
```

```
lib/
  motor/      Cálculo puro y con pruebas: volumen, récords, 1RM, fechas.
  datos/      El catálogo de ejercicios. GENERADO: no editar a mano.
  almacen/    Los archivos JSON y los tipos que se guardan.
  ui/         Pantallas, piezas comunes, gráficos con CustomPainter y temas.
```
