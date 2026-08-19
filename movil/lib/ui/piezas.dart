/// Las piezas que se repiten por toda la aplicación.
///
/// Están aquí y no en cada vista para que un cambio de criterio —cómo se ve un panel
/// plegado, cómo se escribe un número— se haga una vez. Todas son tontas: reciben lo que
/// tienen que pintar y no saben nada de entrenos.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../motor/fechas.dart';
import 'tema.dart';

/// «1 serie», «3 series», «ninguna». El plural se hace bien porque estos resúmenes se leen
/// constantemente y un «1 series» canta.
String contar(int n, String singular, String plural, [String vacio = 'ninguna']) {
  if (n == 0) return vacio;
  return '$n ${n == 1 ? singular : plural}';
}

/// Número con separadores españoles: 1.284, y con decimales 82,5.
String cifra(num n, [int decimales = 0]) {
  final texto = n.toStringAsFixed(decimales);
  final partes = texto.split('.');
  final enteros = partes[0];
  final negativo = enteros.startsWith('-');
  final digitos = negativo ? enteros.substring(1) : enteros;
  final conPuntos = StringBuffer();
  for (var i = 0; i < digitos.length; i++) {
    if (i > 0 && (digitos.length - i) % 3 == 0) conPuntos.write('.');
    conPuntos.write(digitos[i]);
  }
  final resultado = '${negativo ? '-' : ''}$conPuntos';
  return partes.length > 1 ? '$resultado,${partes[1]}' : resultado;
}

/// Kilos con un decimal sólo cuando lo tiene: «80» y «82,5».
String kilos(num n) => n == n.roundToDouble() ? cifra(n) : cifra(n, 1);

/// Los kilos de volumen se leen mejor en toneladas cuando pasan del millar.
String volumenCorto(num kg) => kg >= 1000 ? '${cifra(kg / 1000, 1)} t' : '${cifra(kg)} kg';

/// Cuándo se hizo la última copia de seguridad: «Nunca», «Hoy», «Hace 12 días».
String textoDeUltimaCopia(DateTime? cuando) {
  if (cuando == null) return 'Nunca';
  final dias = diasEntre(claveDia(cuando), hoy());
  if (dias <= 0) return 'Hoy';
  if (dias == 1) return 'Ayer';
  return 'Hace $dias días';
}

/// El texto del aviso de la copia.
///
/// Dice **cuánto trabajo se perdería**, no «acuérdate de hacer una copia». Un aviso que sólo
/// manda hacer algo se aprende a cerrar sin leerlo; uno que pone el número delante se decide
/// cada vez que sale.
String avisoDeCopia(int sinCopia, DateTime? ultimaCopia) {
  final trabajo = contar(sinCopia, 'entreno', 'entrenos');
  if (ultimaCopia == null) {
    return 'Todavía no has guardado ninguna copia: lo que llevas apuntado ($trabajo) sólo '
        'existe en este móvil y se iría con él.';
  }
  return 'Desde la última copia (${textoDeUltimaCopia(ultimaCopia).toLowerCase()}) hay '
      '$trabajo sin guardar fuera del móvil.';
}

/// Un panel: la caja con borde en la que va casi todo.
///
/// El color lo pinta un `Material` y no la decoración de un `Container`, y no es un detalle
/// de estilo: lo que se pulsa dentro del panel —una fila, un interruptor— dibuja su onda de
/// tinta sobre el `Material` más cercano. Con un `Container` de color por medio, el más
/// cercano queda **por debajo** del panel y la onda no se ve; al pulsar no pasa nada visible,
/// que es justo la señal de «me ha oído» que se busca con el dedo.
class Panel extends StatelessWidget {
  const Panel({super.key, required this.hijo, this.relleno = 16, this.apagado = false});

  final Widget hijo;
  final double relleno;
  final bool apagado;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Material(
      color: apagado ? c.panelAlto : c.panel,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radio),
        side: apagado ? BorderSide.none : BorderSide(color: c.borde),
      ),
      // Para que la tinta de lo que se pulse dentro no se salga por las esquinas.
      clipBehavior: Clip.antiAlias,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(relleno),
        child: hijo,
      ),
    );
  }
}

/// Un panel que se puede plegar, con un resumen que se lee sin abrirlo.
///
/// Está abierto lo que se usa: un panel con datos se abre, uno vacío se queda en una línea
/// que dice qué hay y deja de estorbar.
class PanelPlegable extends StatelessWidget {
  const PanelPlegable({
    super.key,
    required this.titulo,
    required this.hijo,
    this.resumen,
    this.abierto = true,
    this.ayuda,
  });

  final Widget titulo;

  /// Lo que se lee sin abrir: «3 series», «sin entrenos».
  final String? resumen;
  final bool abierto;

  /// La explicación larga de cómo se calcula algo. Va plegada dentro.
  final String? ayuda;
  final Widget hijo;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Material(
      // Igual que en `Panel`: el color va en el `Material` para que la cabecera plegable
      // pinte su onda al pulsarla.
      color: c.panel,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radio),
        side: BorderSide(color: c.borde),
      ),
      clipBehavior: Clip.antiAlias,
      child: Theme(
        // Sin esto, `ExpansionTile` pinta sus propias líneas y se suman al borde del panel.
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: abierto,
          shape: const Border(),
          collapsedShape: const Border(),
          tilePadding: const EdgeInsets.symmetric(horizontal: 16),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          title: DefaultTextStyle.merge(
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
            child: titulo,
          ),
          trailing: resumen == null
              ? null
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      resumen!,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: c.textoDebil,
                      ),
                    ),
                    Icon(Icons.expand_more, color: c.textoDebil, size: 22),
                  ],
                ),
          children: [
            if (ayuda != null) Ayuda(texto: ayuda!),
            hijo,
          ],
        ),
      ),
    );
  }
}

/// La explicación de cómo se calcula algo, plegada.
///
/// Estos textos hacen falta —nadie adivina qué es un máximo estimado— pero se leen **una
/// vez**. Delante de los datos, a partir de la segunda visita son cinco líneas que hay que
/// saltarse; aquí ocupan una línea hasta que alguien pregunta.
class Ayuda extends StatelessWidget {
  const Ayuda({super.key, required this.texto});

  final String texto;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        childrenPadding: const EdgeInsets.only(bottom: 8),
        dense: true,
        title: Text(
          'Cómo se calcula',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: c.textoDebil),
        ),
        children: [
          Text(texto, style: TextStyle(fontSize: 13.5, height: 1.5, color: c.textoTenue)),
        ],
      ),
    );
  }
}

/// El título de una sección, con su acción opcional a la derecha.
class TituloDeSeccion extends StatelessWidget {
  const TituloDeSeccion(this.texto, {super.key, this.accion, this.onAccion});

  final String texto;
  final String? accion;
  final VoidCallback? onAccion;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, top: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(
              texto.toUpperCase(),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
                color: c.textoDebil,
              ),
            ),
          ),
          if (accion != null && onAccion != null)
            TextButton(
              onPressed: onAccion,
              child: Text(accion!, style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
        ],
      ),
    );
  }
}

/// Una cifra con su etiqueta. El número va grande porque es lo que se viene a mirar.
class Cifra extends StatelessWidget {
  const Cifra({
    super.key,
    required this.etiqueta,
    required this.valor,
    this.unidad,
    this.delta,
    this.signo = SignoDelta.neutra,
  });

  final String etiqueta;
  final String valor;
  final String? unidad;
  final String? delta;

  /// Si subir es bueno o malo. Sin esto, el verde y el rojo son una apuesta.
  final SignoDelta signo;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final colorDelta = switch (signo) {
      SignoDelta.buena => c.bueno,
      SignoDelta.mala => c.malo,
      SignoDelta.neutra => c.textoDebil,
    };
    return Panel(
      relleno: 14,
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            etiqueta,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: c.textoDebil),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Flexible(
                child: Text(
                  valor,
                  style: const TextStyle(
                    fontSize: 25,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (unidad != null) ...[
                const SizedBox(width: 3),
                Text(
                  unidad!,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: c.textoDebil,
                  ),
                ),
              ],
            ],
          ),
          if (delta != null) ...[
            const SizedBox(height: 2),
            Text(
              delta!,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: colorDelta),
              maxLines: 2,
            ),
          ],
        ],
      ),
    );
  }
}

enum SignoDelta { buena, mala, neutra }

/// Barra de progreso hacia un objetivo. Pasado el objetivo cambia de color, no desborda.
class Medidor extends StatelessWidget {
  const Medidor({super.key, required this.hecho, required this.objetivo});

  final double hecho;
  final double objetivo;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final porcentaje = objetivo > 0 ? hecho / objetivo : 0.0;
    final color = porcentaje > 1.05
        ? c.serio
        : porcentaje >= 0.95
            ? c.bueno
            : c.acento;
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: LinearProgressIndicator(
        value: porcentaje.clamp(0.0, 1.0),
        minHeight: 8,
        backgroundColor: c.panelHueco,
        valueColor: AlwaysStoppedAnimation(color),
      ),
    );
  }
}

/// Estado vacío: dice qué falta y, si se puede, ofrece el siguiente paso.
class Vacio extends StatelessWidget {
  const Vacio({super.key, required this.titulo, this.icono, this.texto, this.accion});

  final String titulo;
  final IconData? icono;
  final String? texto;
  final Widget? accion;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
      child: Column(
        children: [
          if (icono != null) ...[
            Icon(icono, size: 32, color: c.textoDebil.withValues(alpha: 0.6)),
            const SizedBox(height: 8),
          ],
          Text(
            titulo,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: c.textoTenue),
          ),
          if (texto != null) ...[
            const SizedBox(height: 6),
            Text(
              texto!,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13.5, height: 1.5, color: c.textoDebil),
            ),
          ],
          if (accion != null) ...[const SizedBox(height: 14), accion!],
        ],
      ),
    );
  }
}

/// Etiqueta pequeña para datos sueltos: el grupo muscular, el material, «tuyo».
class EtiquetaPill extends StatelessWidget {
  const EtiquetaPill(this.texto, {super.key, this.color, this.fondo});

  final String texto;
  final Color? color;
  final Color? fondo;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: fondo ?? c.panelAlto,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        texto,
        style: TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w700,
          color: color ?? c.textoTenue,
        ),
      ),
    );
  }
}

/// Una tira de filtros que se arrastra en horizontal. `null` es «todo».
class Chips<T> extends StatelessWidget {
  const Chips({
    super.key,
    required this.opciones,
    required this.elegida,
    required this.onElegir,
    required this.textoDe,
    this.todas = 'Todo',
  });

  final List<T> opciones;
  final T? elegida;
  final ValueChanged<T?> onElegir;
  final String Function(T) textoDe;
  final String todas;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    Widget chip(String texto, bool marcado, VoidCallback onPulsar) => Padding(
          padding: const EdgeInsets.only(right: 7),
          child: GestureDetector(
            onTap: onPulsar,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
              decoration: BoxDecoration(
                color: marcado ? c.acento : c.panel,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: marcado ? Colors.transparent : c.bordeFuerte),
              ),
              child: Text(
                texto,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: marcado ? Colors.white : c.textoTenue,
                ),
              ),
            ),
          ),
        );

    return SizedBox(
      height: 38,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          chip(todas, elegida == null, () => onElegir(null)),
          for (final o in opciones)
            chip(textoDe(o), elegida == o, () => onElegir(elegida == o ? null : o)),
        ],
      ),
    );
  }
}

/// Selector de dos a cinco opciones, todas a la vista.
class Segmentado<T> extends StatelessWidget {
  const Segmentado({
    super.key,
    required this.opciones,
    required this.elegida,
    required this.onElegir,
  });

  final List<(T, String)> opciones;
  final T elegida;
  final ValueChanged<T> onElegir;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: c.panelAlto,
        borderRadius: BorderRadius.circular(radioS),
      ),
      child: Row(
        children: [
          for (final (valor, texto) in opciones)
            Expanded(
              child: GestureDetector(
                onTap: () => onElegir(valor),
                child: Container(
                  height: 38,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: elegida == valor ? c.panel : Colors.transparent,
                    borderRadius: BorderRadius.circular(radioXs),
                  ),
                  child: Text(
                    texto,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: elegida == valor ? c.texto : c.textoTenue,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Un número que se escribe a mano.
///
/// Saca el teclado numérico, que es lo que hace falta apuntando un peso entre series. El
/// campo vacío es `null` y no `0`: no es lo mismo «no lo he apuntado» que «he levantado
/// cero kilos», y contarlo como cero estropea las medias.
class CampoNumero extends StatefulWidget {
  const CampoNumero({
    super.key,
    required this.valor,
    required this.onCambiar,
    this.pista,
    this.etiqueta,
    this.decimal = true,
    this.centrado = true,
  });

  final num? valor;
  final ValueChanged<num?> onCambiar;
  final String? pista;
  final String? etiqueta;
  final bool decimal;
  final bool centrado;

  @override
  State<CampoNumero> createState() => _CampoNumeroState();
}

class _CampoNumeroState extends State<CampoNumero> {
  late final TextEditingController _control;

  @override
  void initState() {
    super.initState();
    _control = TextEditingController(text: _texto(widget.valor));
  }

  static String _texto(num? valor) {
    if (valor == null) return '';
    if (valor is int) return valor.toString();
    return valor == valor.roundToDouble() ? valor.round().toString() : valor.toString();
  }

  @override
  void didUpdateWidget(CampoNumero anterior) {
    super.didUpdateWidget(anterior);
    // Sólo se pisa lo escrito si el valor ha cambiado de verdad desde fuera: si no, cada
    // repintado movería el cursor al final mientras se está escribiendo.
    final esperado = _texto(widget.valor);
    if (widget.valor != anterior.valor && _control.text != esperado) {
      _control.text = esperado;
    }
  }

  @override
  void dispose() {
    _control.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _control,
      keyboardType: widget.decimal
          ? const TextInputType.numberWithOptions(decimal: true)
          : TextInputType.number,
      textAlign: widget.centrado ? TextAlign.center : TextAlign.start,
      inputFormatters: [
        FilteringTextInputFormatter.allow(widget.decimal ? RegExp(r'[0-9.,]') : RegExp(r'[0-9]')),
      ],
      decoration: InputDecoration(hintText: widget.pista, labelText: widget.etiqueta),
      style: const TextStyle(fontWeight: FontWeight.w600, fontFeatures: [FontFeature.tabularFigures()]),
      onChanged: (texto) {
        if (texto.trim().isEmpty) {
          widget.onCambiar(null);
          return;
        }
        // La coma es lo que sale del teclado español, y `num.parse` sólo entiende el punto.
        final numero = num.tryParse(texto.replaceAll(',', '.'));
        if (numero != null) widget.onCambiar(numero);
      },
    );
  }
}

/// Un interruptor con su explicación debajo.
class Interruptor extends StatelessWidget {
  const Interruptor({
    super.key,
    required this.texto,
    required this.activo,
    required this.onCambiar,
    this.pista,
  });

  final String texto;
  final String? pista;
  final bool activo;
  final ValueChanged<bool> onCambiar;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return SwitchListTile(
      value: activo,
      onChanged: onCambiar,
      contentPadding: EdgeInsets.zero,
      title: Text(texto, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600)),
      subtitle: pista == null
          ? null
          : Text(pista!, style: TextStyle(fontSize: 12.5, color: c.textoDebil, height: 1.4)),
    );
  }
}

/// Buscador redondo, con la lupa dentro.
class Buscador extends StatelessWidget {
  const Buscador({
    super.key,
    required this.onCambiar,
    this.etiqueta = 'Buscar',
    this.control,
    this.foco,
  });

  final ValueChanged<String> onCambiar;
  final String etiqueta;
  final TextEditingController? control;
  final FocusNode? foco;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return TextField(
      controller: control,
      focusNode: foco,
      onChanged: onCambiar,
      textInputAction: TextInputAction.search,
      decoration: InputDecoration(
        hintText: etiqueta,
        prefixIcon: Icon(Icons.search, size: 20, color: c.textoDebil),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(999),
          borderSide: BorderSide(color: c.bordeFuerte),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(999),
          borderSide: BorderSide(color: c.bordeFuerte),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(999),
          borderSide: BorderSide(color: c.acento, width: 2),
        ),
      ),
    );
  }
}

/// Una fila de lista: icono, nombre, metadatos debajo y valor a la derecha.
class FilaDeLista extends StatelessWidget {
  const FilaDeLista({
    super.key,
    required this.nombre,
    this.meta,
    this.valor,
    this.icono,
    this.iconoAcento = false,
    this.onPulsar,
    this.alFinal,
  });

  final String nombre;
  final String? meta;
  final String? valor;
  final IconData? icono;
  final bool iconoAcento;
  final VoidCallback? onPulsar;
  final Widget? alFinal;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return InkWell(
      onTap: onPulsar,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            if (icono != null) ...[
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: iconoAcento ? c.acentoSuave : c.panelAlto,
                  borderRadius: BorderRadius.circular(radioS),
                ),
                child: Icon(icono, size: 20, color: iconoAcento ? c.acento : c.textoTenue),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nombre,
                    style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                    maxLines: 2,
                  ),
                  if (meta != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      meta!,
                      style: TextStyle(fontSize: 12.5, color: c.textoDebil),
                      maxLines: 2,
                    ),
                  ],
                ],
              ),
            ),
            if (valor != null)
              Padding(
                padding: const EdgeInsets.only(left: 10),
                child: Text(
                  valor!,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontFeatures: [FontFeature.tabularFigures()],
                  ),
                ),
              ),
            ?alFinal,
          ],
        ),
      ),
    );
  }
}

/// Una lista dentro de un panel, con líneas finas entre filas.
class ListaEnPanel extends StatelessWidget {
  const ListaEnPanel({super.key, required this.filas});

  final List<Widget> filas;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Container(
      decoration: BoxDecoration(
        color: c.panel,
        borderRadius: BorderRadius.circular(radio),
        border: Border.all(color: c.borde),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (var i = 0; i < filas.length; i++) ...[
            if (i > 0) Divider(height: 1, thickness: 1, color: c.bordeSuave),
            filas[i],
          ],
        ],
      ),
    );
  }
}

/// Aviso en amarillo (o rojo si es un error): algo que conviene saber antes de seguir.
class Aviso extends StatelessWidget {
  const Aviso(this.texto, {super.key, this.error = false});

  final String texto;
  final bool error;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    final base = error ? c.malo : c.aviso;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: base.withValues(alpha: 0.13),
        borderRadius: BorderRadius.circular(radioS),
        border: Border.all(color: base.withValues(alpha: 0.35)),
      ),
      child: Text(texto, style: TextStyle(fontSize: 13, height: 1.45, color: c.textoTenue)),
    );
  }
}

/// Un aviso corto que se va solo. Para confirmar lo que ya ha pasado, nunca para preguntar:
/// una pregunta que desaparece sola no es una pregunta.
void avisar(BuildContext context, String texto, {String? accion, VoidCallback? onAccion}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(texto),
      // Con acción dura más: cuatro segundos no dan para leer y decidir.
      duration: Duration(seconds: accion == null ? 3 : 8),
      action: accion == null || onAccion == null
          ? null
          : SnackBarAction(label: accion, onPressed: onAccion),
    ));
}

/// Abre una hoja que sube desde abajo, con el teclado teniéndose en cuenta.
Future<T?> abrirHoja<T>(
  BuildContext context, {
  required String titulo,
  required Widget Function(BuildContext) contenido,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (contexto) => Padding(
      // Sin esto, el teclado tapa el campo que se está rellenando.
      padding: EdgeInsets.only(bottom: MediaQuery.of(contexto).viewInsets.bottom),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.9,
        maxChildSize: 0.95,
        builder: (_, controlador) => Column(
          children: [
            _CabeceraDeHoja(titulo: titulo),
            Expanded(
              child: SingleChildScrollView(
                controller: controlador,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                child: contenido(contexto),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _CabeceraDeHoja extends StatelessWidget {
  const _CabeceraDeHoja({required this.titulo});

  final String titulo;

  @override
  Widget build(BuildContext context) {
    final c = ColoresFitLog.de(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 8, 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: c.borde)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              titulo,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close),
            tooltip: 'Cerrar',
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
    );
  }
}

/// Pregunta de sí o no antes de algo que no se puede deshacer.
Future<bool> confirmar(
  BuildContext context, {
  required String titulo,
  required String texto,
  String si = 'Sí, borrar',
  String no = 'No, dejarlo',
}) async {
  final respuesta = await showDialog<bool>(
    context: context,
    builder: (contexto) => AlertDialog(
      title: Text(titulo),
      content: Text(texto),
      actions: [
        TextButton(onPressed: () => Navigator.pop(contexto, false), child: Text(no)),
        TextButton(
          onPressed: () => Navigator.pop(contexto, true),
          style: TextButton.styleFrom(foregroundColor: ColoresFitLog.de(contexto).malo),
          child: Text(si),
        ),
      ],
    ),
  );
  return respuesta ?? false;
}
