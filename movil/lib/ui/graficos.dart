/// Los gráficos, pintados a mano con `CustomPainter`.
///
/// Sin librería: son dos formas —columnas y una línea— y cualquier librería de gráficos
/// pesa más que todo esto, además de traer su propio criterio visual que habría que pelear.
///
/// Las reglas que siguen, y que no son estéticas:
///
///  · **Los colores salen del tema** (`ColoresFitLog.series`), que están validados contra el
///    fondo de cada tema: banda de luminosidad, contraste y separación entre series
///    contiguas también con daltonismo. No se escribe un color a pelo aquí.
///  · **Un solo eje.** Nunca dos escalas en el mismo gráfico: dos medidas de magnitudes
///    distintas son dos gráficos.
///  · **El texto no lleva el color del dato.** Las columnas y la línea llevan el color; las
///    etiquetas y los números van en color de texto. Un verde claro es ilegible como texto
///    sobre fondo claro, y la identidad ya la da la marca de color de al lado.
///  · **Se etiqueta poco.** Un número sobre cada punto es ruido que nadie lee: se etiqueta
///    el máximo o el que se está señalando, y el resto lo cuenta el eje.
///  · **Se puede señalar.** Un gráfico en un móvil es para tocarlo, así que los dos llevan
///    globo al arrastrar el dedo por encima.
library;

import 'dart:math';
import 'package:flutter/material.dart';

import 'tema.dart';

class PuntoGrafico {
  const PuntoGrafico({
    required this.clave,
    required this.etiqueta,
    required this.valor,
    this.detalle,
  });

  /// Identificador estable de la columna o del punto.
  final String clave;

  /// Lo que se lee bajo el eje. Corto: «12/08».
  final String etiqueta;

  /// Lo que se lee en el globo, más largo: «Semana del 10 de agosto».
  final String? detalle;
  final double valor;
}

const _alto = 168.0;
const _margen = EdgeInsets.fromLTRB(42, 18, 6, 24);

/// Escala redondeada hacia arriba: los ejes se leen mejor en 0 / 500 / 1000.
({double techo, List<double> pasos}) _escalaBonita(double maximo) {
  if (maximo <= 0) return (techo: 1, pasos: [0, 1]);
  final magnitud = pow(10, (log(maximo) / ln10).floor()).toDouble();
  final normalizado = maximo / magnitud;
  final redondeo = normalizado <= 1
      ? 1.0
      : normalizado <= 2
          ? 2.0
          : normalizado <= 5
              ? 5.0
              : 10.0;
  final techo = redondeo * magnitud;
  return (techo: techo, pasos: [0, techo / 2, techo]);
}

TextPainter _texto(String texto, Color color, {double tamano = 10.5, FontWeight? peso}) {
  final pintor = TextPainter(
    text: TextSpan(
      text: texto,
      style: TextStyle(
        color: color,
        fontSize: tamano,
        fontWeight: peso ?? FontWeight.normal,
        fontFeatures: const [FontFeature.tabularFigures()],
      ),
    ),
    textDirection: TextDirection.ltr,
  )..layout();
  return pintor;
}

/// Columnas. Una sola serie, así que no lleva leyenda: el título ya dice qué se pinta.
class Columnas extends StatefulWidget {
  const Columnas({
    super.key,
    required this.datos,
    required this.formato,
    this.titulo,
    this.subtitulo,
  });

  final List<PuntoGrafico> datos;
  final String Function(double) formato;
  final String? titulo;
  final String? subtitulo;

  @override
  State<Columnas> createState() => _ColumnasState();
}

class _ColumnasState extends State<Columnas> {
  int? _senalada;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final punto = _senalada == null ? null : widget.datos[_senalada!];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.titulo != null)
          Text(widget.titulo!,
              style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700)),
        if (widget.subtitulo != null)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(widget.subtitulo!,
                style: TextStyle(fontSize: 12.5, color: c.textoDebil, height: 1.4)),
          ),
        const SizedBox(height: 10),
        SizedBox(
          height: _alto,
          child: LayoutBuilder(
            builder: (contexto, medidas) {
              final banda = widget.datos.isEmpty
                  ? 0.0
                  : (medidas.maxWidth - _margen.horizontal) / widget.datos.length;
              void senalar(Offset local) {
                if (banda <= 0) return;
                final i = ((local.dx - _margen.left) / banda).floor();
                setState(() => _senalada = i.clamp(0, widget.datos.length - 1));
              }

              return GestureDetector(
                // Se responde al arrastre además del toque: en el móvil se recorre la
                // gráfica con el dedo sin levantarlo.
                onTapDown: (d) => senalar(d.localPosition),
                onHorizontalDragUpdate: (d) => senalar(d.localPosition),
                onHorizontalDragEnd: (_) => setState(() => _senalada = null),
                onTapUp: (_) => setState(() => _senalada = null),
                onTapCancel: () => setState(() => _senalada = null),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _PintorDeColumnas(
                          datos: widget.datos,
                          formato: widget.formato,
                          senalada: _senalada,
                          colores: c,
                        ),
                      ),
                    ),
                    if (punto != null)
                      _Globo(
                        izquierda: _margen.left + banda * _senalada! + banda / 2,
                        arriba: _yDe(punto.valor, widget.datos),
                        titulo: punto.detalle ?? punto.etiqueta,
                        valor: widget.formato(punto.valor),
                        color: c.serie1,
                        anchoTotal: medidas.maxWidth,
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  static double _yDe(double valor, List<PuntoGrafico> datos) {
    final maximo = datos.map((d) => d.valor).fold(0.0, max);
    final escala = _escalaBonita(maximo);
    final altoUtil = _alto - _margen.vertical;
    return _margen.top + altoUtil * (1 - valor / escala.techo);
  }
}

class _PintorDeColumnas extends CustomPainter {
  _PintorDeColumnas({
    required this.datos,
    required this.formato,
    required this.senalada,
    required this.colores,
  });

  final List<PuntoGrafico> datos;
  final String Function(double) formato;
  final int? senalada;
  final ColoresFitLog colores;

  @override
  void paint(Canvas lienzo, Size medida) {
    if (datos.isEmpty) return;
    final maximo = datos.map((d) => d.valor).fold(0.0, max);
    final escala = _escalaBonita(maximo);
    final anchoUtil = medida.width - _margen.horizontal;
    final altoUtil = medida.height - _margen.vertical;
    final banda = anchoUtil / datos.length;
    // Tope de 24: una columna más gruesa llena el hueco y se come el aire que separa unas
    // de otras. El resto de la banda es ese aire, no un error de cálculo.
    final anchoBarra = min(24.0, max(4.0, banda - 8));
    double y(double valor) => _margen.top + altoUtil * (1 - valor / escala.techo);

    final rejilla = Paint()
      ..color = colores.rejilla
      ..strokeWidth = 1;
    for (final paso in escala.pasos) {
      lienzo.drawLine(Offset(_margen.left, y(paso)), Offset(medida.width - _margen.right, y(paso)), rejilla);
      final etiqueta = _texto(formato(paso), colores.textoDebil);
      etiqueta.paint(lienzo, Offset(_margen.left - 8 - etiqueta.width, y(paso) - etiqueta.height / 2));
    }

    // Se etiqueta la columna más alta, que es la que cuenta la historia; el resto, al señalar.
    var indiceMaximo = 0;
    for (var i = 1; i < datos.length; i++) {
      if (datos[i].valor > datos[indiceMaximo].valor) indiceMaximo = i;
    }
    final activa = senalada ?? (datos[indiceMaximo].valor > 0 ? indiceMaximo : null);

    for (var i = 0; i < datos.length; i++) {
      final d = datos[i];
      final centro = _margen.left + banda * i + banda / 2;
      final alto = d.valor > 0 ? max(2.0, altoUtil * (d.valor / escala.techo)) : 0.0;
      final arriba = _margen.top + altoUtil - alto;

      if (alto > 0) {
        final pincel = Paint()
          ..color = senalada == null || senalada == i
              ? colores.serie1
              : colores.serie1.withValues(alpha: 0.45);
        // Esquinas de arriba redondeadas y base cuadrada: la columna nace de la línea de
        // cero y no debe parecer que flota.
        final radioArriba = Radius.circular(min(4, anchoBarra / 2));
        lienzo.drawRRect(
          RRect.fromRectAndCorners(
            Rect.fromLTWH(centro - anchoBarra / 2, arriba, anchoBarra, alto),
            topLeft: radioArriba,
            topRight: radioArriba,
          ),
          pincel,
        );
      }

      if (activa == i && d.valor > 0) {
        final valor = _texto(formato(d.valor), colores.texto, tamano: 11, peso: FontWeight.w700);
        valor.paint(lienzo, Offset(centro - valor.width / 2, arriba - valor.height - 4));
      }

      final abajo = _texto(d.etiqueta, colores.textoDebil);
      abajo.paint(lienzo, Offset(centro - abajo.width / 2, medida.height - abajo.height - 6));
    }

    lienzo.drawLine(
      Offset(_margen.left, _margen.top + altoUtil),
      Offset(medida.width - _margen.right, _margen.top + altoUtil),
      Paint()
        ..color = colores.eje
        ..strokeWidth = 1,
    );
  }

  @override
  bool shouldRepaint(_PintorDeColumnas anterior) =>
      anterior.senalada != senalada || anterior.datos != datos || anterior.colores != colores;
}

/// Una línea. Para lo que cambia poco a poco: el peso corporal o un ejercicio a lo largo de
/// los meses.
class LineaGrafico extends StatefulWidget {
  const LineaGrafico({
    super.key,
    required this.datos,
    required this.formato,
    this.titulo,
    this.subtitulo,
    this.unidad,
  });

  final List<PuntoGrafico> datos;
  final String Function(double) formato;
  final String? titulo;
  final String? subtitulo;
  final String? unidad;

  @override
  State<LineaGrafico> createState() => _LineaGraficoState();
}

class _LineaGraficoState extends State<LineaGrafico> {
  int? _senalado;

  /// El eje no arranca en cero a propósito: el peso corporal se mueve dos kilos en dos
  /// meses, y con el cero dentro la línea sería plana y no se vería nada.
  ({double suelo, double techo}) get _encuadre {
    final valores = widget.datos.map((d) => d.valor);
    final maximo = valores.reduce(max);
    final minimo = valores.reduce(min);
    final holgura = [(maximo - minimo) * 0.25, maximo * 0.02, 0.5].reduce(max);
    return (suelo: max(0, minimo - holgura), techo: maximo + holgura);
  }

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    if (widget.datos.isEmpty) return const SizedBox.shrink();
    final punto = _senalado == null ? null : widget.datos[_senalado!];
    final encuadre = _encuadre;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.titulo != null)
          Text(widget.titulo!,
              style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700)),
        if (widget.subtitulo != null)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(widget.subtitulo!,
                style: TextStyle(fontSize: 12.5, color: c.textoDebil, height: 1.4)),
          ),
        const SizedBox(height: 10),
        SizedBox(
          height: _alto,
          child: LayoutBuilder(
            builder: (contexto, medidas) {
              final anchoUtil = medidas.maxWidth - _margen.horizontal;
              final paso = widget.datos.length > 1 ? anchoUtil / (widget.datos.length - 1) : anchoUtil;
              double x(int i) => widget.datos.length > 1
                  ? _margen.left + paso * i
                  : _margen.left + anchoUtil / 2;
              double y(double valor) =>
                  _margen.top +
                  (_alto - _margen.vertical) *
                      (1 - (valor - encuadre.suelo) / max(0.0001, encuadre.techo - encuadre.suelo));

              void senalar(Offset local) {
                final i = ((local.dx - _margen.left) / paso).round();
                setState(() => _senalado = i.clamp(0, widget.datos.length - 1));
              }

              return GestureDetector(
                onTapDown: (d) => senalar(d.localPosition),
                onHorizontalDragUpdate: (d) => senalar(d.localPosition),
                onHorizontalDragEnd: (_) => setState(() => _senalado = null),
                onTapUp: (_) => setState(() => _senalado = null),
                onTapCancel: () => setState(() => _senalado = null),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _PintorDeLinea(
                          datos: widget.datos,
                          formato: widget.formato,
                          senalado: _senalado,
                          suelo: encuadre.suelo,
                          techo: encuadre.techo,
                          colores: c,
                        ),
                      ),
                    ),
                    if (punto != null)
                      _Globo(
                        izquierda: x(_senalado ?? 0),
                        arriba: y(punto.valor),
                        titulo: punto.detalle ?? punto.etiqueta,
                        valor:
                            '${widget.formato(punto.valor)}${widget.unidad != null ? ' ${widget.unidad}' : ''}',
                        color: c.serie1,
                        anchoTotal: medidas.maxWidth,
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _PintorDeLinea extends CustomPainter {
  _PintorDeLinea({
    required this.datos,
    required this.formato,
    required this.senalado,
    required this.suelo,
    required this.techo,
    required this.colores,
  });

  final List<PuntoGrafico> datos;
  final String Function(double) formato;
  final int? senalado;
  final double suelo;
  final double techo;
  final ColoresFitLog colores;

  @override
  void paint(Canvas lienzo, Size medida) {
    if (datos.isEmpty) return;
    final anchoUtil = medida.width - _margen.horizontal;
    final altoUtil = medida.height - _margen.vertical;
    double x(int i) => datos.length > 1
        ? _margen.left + anchoUtil * i / (datos.length - 1)
        : _margen.left + anchoUtil / 2;
    double y(double valor) =>
        _margen.top + altoUtil * (1 - (valor - suelo) / max(0.0001, techo - suelo));

    final rejilla = Paint()
      ..color = colores.rejilla
      ..strokeWidth = 1;
    for (final paso in [suelo, (suelo + techo) / 2, techo]) {
      lienzo.drawLine(Offset(_margen.left, y(paso)), Offset(medida.width - _margen.right, y(paso)), rejilla);
      final etiqueta = _texto(formato(paso), colores.textoDebil);
      etiqueta.paint(lienzo, Offset(_margen.left - 8 - etiqueta.width, y(paso) - etiqueta.height / 2));
    }

    final trazo = Path()..moveTo(x(0), y(datos.first.valor));
    for (var i = 1; i < datos.length; i++) {
      trazo.lineTo(x(i), y(datos[i].valor));
    }

    // El relleno es un velo del 10 %, no un bloque de color: da cuerpo a la línea sin
    // competir con ella.
    final area = Path.from(trazo)
      ..lineTo(x(datos.length - 1), _margen.top + altoUtil)
      ..lineTo(x(0), _margen.top + altoUtil)
      ..close();
    lienzo.drawPath(area, Paint()..color = colores.serie1.withValues(alpha: 0.1));

    lienzo.drawPath(
      trazo,
      Paint()
        ..color = colores.serie1
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );

    if (senalado != null) {
      lienzo.drawLine(
        Offset(x(senalado!), _margen.top),
        Offset(x(senalado!), _margen.top + altoUtil),
        Paint()
          ..color = colores.eje
          ..strokeWidth = 1,
      );
    }

    // El punto final lleva un anillo del color del fondo para que se lea aunque caiga
    // encima de la línea o de la rejilla.
    for (final i in {datos.length - 1, ?senalado}) {
      lienzo.drawCircle(Offset(x(i), y(datos[i].valor)), 6.5, Paint()..color = colores.panel);
      lienzo.drawCircle(Offset(x(i), y(datos[i].valor)), 4.5, Paint()..color = colores.serie1);
    }

    if (datos.length > 1) {
      final primera = _texto(datos.first.etiqueta, colores.textoDebil);
      primera.paint(lienzo, Offset(_margen.left, medida.height - primera.height - 6));
      final ultima = _texto(datos.last.etiqueta, colores.textoDebil);
      ultima.paint(
        lienzo,
        Offset(medida.width - _margen.right - ultima.width, medida.height - ultima.height - 6),
      );
    }
  }

  @override
  bool shouldRepaint(_PintorDeLinea anterior) =>
      anterior.senalado != senalado || anterior.datos != datos || anterior.colores != colores;
}

/// El globo con el valor de lo que se está señalando.
class _Globo extends StatelessWidget {
  const _Globo({
    required this.izquierda,
    required this.arriba,
    required this.titulo,
    required this.valor,
    required this.color,
    required this.anchoTotal,
  });

  final double izquierda;
  final double arriba;
  final String titulo;
  final String valor;
  final Color color;
  final double anchoTotal;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    const ancho = 150.0;
    // Se mantiene dentro del gráfico: pegado a un borde, un globo centrado se saldría.
    final x = (izquierda - ancho / 2).clamp(0.0, max(0.0, anchoTotal - ancho)).toDouble();
    return Positioned(
      left: x,
      top: max(0.0, arriba - 58),
      width: ancho,
      child: IgnorePointer(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: c.panel,
            borderRadius: BorderRadius.circular(radioS),
            border: Border.all(color: c.bordeFuerte),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.25), blurRadius: 12),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                titulo,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                maxLines: 2,
              ),
              const SizedBox(height: 3),
              Row(
                children: [
                  Container(
                    width: 9,
                    height: 9,
                    decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    valor,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Barras horizontales para comparar categorías: series por grupo muscular.
///
/// Con nombres largos («Isquiotibiales») las columnas verticales obligan a girar el texto o
/// a abreviarlo; en horizontal el nombre se lee de corrido.
class Barras extends StatelessWidget {
  const Barras({super.key, required this.datos, required this.formato, this.referencia});

  final List<PuntoGrafico> datos;
  final String Function(double) formato;

  /// Línea de referencia por categoría, si la hay: «diez series por semana».
  final double? referencia;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final maximo = <double>[
      ...datos.map((d) => d.valor),
      referencia ?? 0,
      1.0,
    ].reduce(max);

    return Column(
      children: [
        for (final d in datos)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Row(
              children: [
                SizedBox(
                  width: 108,
                  child: Text(
                    d.etiqueta,
                    style: const TextStyle(fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: SizedBox(
                    height: 14,
                    child: Stack(
                      children: [
                        Positioned.fill(
                          top: 3,
                          bottom: 3,
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: c.panelHueco,
                              borderRadius: BorderRadius.circular(999),
                            ),
                          ),
                        ),
                        FractionallySizedBox(
                          widthFactor: (d.valor / maximo).clamp(0.0, 1.0),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 3),
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                color: c.serie1,
                                borderRadius: BorderRadius.circular(999),
                              ),
                            ),
                          ),
                        ),
                        if (referencia != null && referencia! <= maximo)
                          FractionallySizedBox(
                            widthFactor: (referencia! / maximo).clamp(0.0, 1.0),
                            child: Align(
                              alignment: Alignment.centerRight,
                              child: Container(width: 1.5, color: c.eje),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                SizedBox(
                  width: 38,
                  child: Text(
                    formato(d.valor),
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
