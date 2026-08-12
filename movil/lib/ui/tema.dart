/// Temas visuales.
///
/// Los mismos dos que la versión web y con los mismos valores, para que las dos se
/// reconozcan como la misma aplicación.
///
/// **Añadir uno cuesta más que elegir colores.** Los cuatro tonos de las series de los
/// gráficos están validados contra la superficie concreta de cada tema: que caben en la
/// banda de luminosidad, que dos series contiguas se distinguen también con daltonismo y
/// que contrastan con el fondo. Un tema nuevo cambia el fondo, así que hay que repetir esa
/// validación y quedarse con un orden que la apruebe. Dos temas bien resueltos valen más
/// que seis a medias.
library;

import 'package:flutter/material.dart';

class Tema {
  const Tema({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.icono,
    required this.oscuro,
  });

  final String id;
  final String nombre;
  final String descripcion;
  final String icono;
  final bool oscuro;
}

const temas = <Tema>[
  Tema(
    id: 'oscuro',
    nombre: 'Oscuro',
    descripcion: 'El de casa. Para el gimnasio de noche y para no deslumbrar entre series.',
    icono: '☾',
    oscuro: true,
  ),
  Tema(
    id: 'claro',
    nombre: 'Claro',
    descripcion: 'Para entrenar a plena luz, que es donde peor se ve una pantalla.',
    icono: '☀',
    oscuro: false,
  ),
];

Tema temaDe(String id) => temas.firstWhere((t) => t.id == id, orElse: () => temas.first);

/// Los colores que Material no tiene pero esta aplicación sí usa: los tonos de las series
/// de los gráficos, los tres niveles de texto y las superficies intermedias.
///
/// Va como extensión del tema y no como constantes globales para que un widget no tenga que
/// saber qué tema está puesto: pide `ColoresFitLog.de(context)` y le llega el juego correcto.
@immutable
class ColoresFitLog extends ThemeExtension<ColoresFitLog> {
  const ColoresFitLog({
    required this.panel,
    required this.panelAlto,
    required this.panelHueco,
    required this.borde,
    required this.bordeSuave,
    required this.bordeFuerte,
    required this.texto,
    required this.textoTenue,
    required this.textoDebil,
    required this.acento,
    required this.acentoSuave,
    required this.bueno,
    required this.aviso,
    required this.serio,
    required this.malo,
    required this.serie1,
    required this.serie2,
    required this.serie3,
    required this.serie4,
    required this.rejilla,
    required this.eje,
  });

  final Color panel;
  final Color panelAlto;
  final Color panelHueco;
  final Color borde;
  final Color bordeSuave;
  final Color bordeFuerte;
  final Color texto;
  final Color textoTenue;
  final Color textoDebil;
  final Color acento;
  final Color acentoSuave;
  final Color bueno;
  final Color aviso;
  final Color serio;
  final Color malo;

  /// Las cuatro series de los gráficos, en el orden validado. El orden **es** el mecanismo
  /// de seguridad para daltonismo: no se reordenan ni se sustituyen a ojo.
  final Color serie1;
  final Color serie2;
  final Color serie3;
  final Color serie4;
  final Color rejilla;
  final Color eje;

  static ColoresFitLog de(BuildContext context) =>
      Theme.of(context).extension<ColoresFitLog>()!;

  List<Color> get series => [serie1, serie2, serie3, serie4];

  @override
  ColoresFitLog copyWith({
    Color? panel,
    Color? panelAlto,
    Color? panelHueco,
    Color? borde,
    Color? bordeSuave,
    Color? bordeFuerte,
    Color? texto,
    Color? textoTenue,
    Color? textoDebil,
    Color? acento,
    Color? acentoSuave,
    Color? bueno,
    Color? aviso,
    Color? serio,
    Color? malo,
    Color? serie1,
    Color? serie2,
    Color? serie3,
    Color? serie4,
    Color? rejilla,
    Color? eje,
  }) =>
      ColoresFitLog(
        panel: panel ?? this.panel,
        panelAlto: panelAlto ?? this.panelAlto,
        panelHueco: panelHueco ?? this.panelHueco,
        borde: borde ?? this.borde,
        bordeSuave: bordeSuave ?? this.bordeSuave,
        bordeFuerte: bordeFuerte ?? this.bordeFuerte,
        texto: texto ?? this.texto,
        textoTenue: textoTenue ?? this.textoTenue,
        textoDebil: textoDebil ?? this.textoDebil,
        acento: acento ?? this.acento,
        acentoSuave: acentoSuave ?? this.acentoSuave,
        bueno: bueno ?? this.bueno,
        aviso: aviso ?? this.aviso,
        serio: serio ?? this.serio,
        malo: malo ?? this.malo,
        serie1: serie1 ?? this.serie1,
        serie2: serie2 ?? this.serie2,
        serie3: serie3 ?? this.serie3,
        serie4: serie4 ?? this.serie4,
        rejilla: rejilla ?? this.rejilla,
        eje: eje ?? this.eje,
      );

  @override
  ColoresFitLog lerp(ThemeExtension<ColoresFitLog>? otro, double t) {
    if (otro is! ColoresFitLog) return this;
    Color mezcla(Color a, Color b) => Color.lerp(a, b, t)!;
    return ColoresFitLog(
      panel: mezcla(panel, otro.panel),
      panelAlto: mezcla(panelAlto, otro.panelAlto),
      panelHueco: mezcla(panelHueco, otro.panelHueco),
      borde: mezcla(borde, otro.borde),
      bordeSuave: mezcla(bordeSuave, otro.bordeSuave),
      bordeFuerte: mezcla(bordeFuerte, otro.bordeFuerte),
      texto: mezcla(texto, otro.texto),
      textoTenue: mezcla(textoTenue, otro.textoTenue),
      textoDebil: mezcla(textoDebil, otro.textoDebil),
      acento: mezcla(acento, otro.acento),
      acentoSuave: mezcla(acentoSuave, otro.acentoSuave),
      bueno: mezcla(bueno, otro.bueno),
      aviso: mezcla(aviso, otro.aviso),
      serio: mezcla(serio, otro.serio),
      malo: mezcla(malo, otro.malo),
      serie1: mezcla(serie1, otro.serie1),
      serie2: mezcla(serie2, otro.serie2),
      serie3: mezcla(serie3, otro.serie3),
      serie4: mezcla(serie4, otro.serie4),
      rejilla: mezcla(rejilla, otro.rejilla),
      eje: mezcla(eje, otro.eje),
    );
  }
}

const _coloresOscuro = ColoresFitLog(
  panel: Color(0xFF1A1A19),
  panelAlto: Color(0xFF232322),
  panelHueco: Color(0xFF2C2C2A),
  borde: Color(0xFF2C2C2A),
  bordeSuave: Color(0xFF232322),
  bordeFuerte: Color(0xFF383835),
  texto: Color(0xFFFFFFFF),
  textoTenue: Color(0xFFC3C2B7),
  textoDebil: Color(0xFF898781),
  acento: Color(0xFF3987E5),
  acentoSuave: Color(0xFF14243A),
  bueno: Color(0xFF0CA30C),
  aviso: Color(0xFFFAB219),
  serio: Color(0xFFEC835A),
  malo: Color(0xFFD03B3B),
  serie1: Color(0xFF3987E5),
  serie2: Color(0xFFD95926),
  serie3: Color(0xFF199E70),
  serie4: Color(0xFFC98500),
  rejilla: Color(0xFF2C2C2A),
  eje: Color(0xFF383835),
);

const _coloresClaro = ColoresFitLog(
  panel: Color(0xFFFCFCFB),
  panelAlto: Color(0xFFF2F1ED),
  panelHueco: Color(0xFFE9E8E3),
  borde: Color(0xFFE1E0D9),
  bordeSuave: Color(0xFFEBEAE4),
  bordeFuerte: Color(0xFFC3C2B7),
  texto: Color(0xFF0B0B0B),
  textoTenue: Color(0xFF52514E),
  textoDebil: Color(0xFF898781),
  acento: Color(0xFF2A78D6),
  acentoSuave: Color(0xFFE8F1FD),
  bueno: Color(0xFF006300),
  aviso: Color(0xFFFAB219),
  serio: Color(0xFFEC835A),
  malo: Color(0xFFD03B3B),
  // Los mismos cuatro tonos, escalonados para la superficie clara.
  serie1: Color(0xFF2A78D6),
  serie2: Color(0xFFEB6834),
  serie3: Color(0xFF1BAF7A),
  serie4: Color(0xFFEDA100),
  rejilla: Color(0xFFE1E0D9),
  eje: Color(0xFFC3C2B7),
);

const radio = 16.0;
const radioS = 10.0;
const radioXs = 8.0;

ThemeData temaDatosDe(String id) {
  final tema = temaDe(id);
  final c = tema.oscuro ? _coloresOscuro : _coloresClaro;
  final fondo = tema.oscuro ? const Color(0xFF0D0D0D) : const Color(0xFFF9F9F7);

  final base = ThemeData(
    useMaterial3: true,
    brightness: tema.oscuro ? Brightness.dark : Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: c.acento,
      brightness: tema.oscuro ? Brightness.dark : Brightness.light,
    ).copyWith(
      primary: c.acento,
      surface: fondo,
      surfaceContainer: c.panel,
      onSurface: c.texto,
      error: c.malo,
    ),
    scaffoldBackgroundColor: fondo,
  );

  return base.copyWith(
    extensions: [c],
    // Sólo se cambian los colores. Aquí había un `fontSizeFactor: 1.02` para agrandar un
    // pelín la letra, y reventaba la aplicación al arrancar: `apply` con un factor de tamaño
    // exige que **todos** los estilos del tema tengan tamaño, y varios de Material lo llevan
    // nulo a propósito. Los tamaños se ponen donde hacen falta, en cada widget.
    textTheme: base.textTheme.apply(bodyColor: c.texto, displayColor: c.texto),
    dividerColor: c.borde,
    cardTheme: CardThemeData(
      color: c.panel,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radio),
        side: BorderSide(color: c.borde),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: c.panel,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radioS),
        borderSide: BorderSide(color: c.bordeFuerte),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radioS),
        borderSide: BorderSide(color: c.bordeFuerte),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radioS),
        borderSide: BorderSide(color: c.acento, width: 2),
      ),
      labelStyle: TextStyle(color: c.textoTenue, fontSize: 13, fontWeight: FontWeight.w600),
      hintStyle: TextStyle(color: c.textoDebil),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        // 48 de alto: se pulsa de pie, con prisa y a veces con las manos sudadas.
        minimumSize: const Size(0, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radioS)),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(0, 48),
        foregroundColor: c.texto,
        side: BorderSide(color: c.bordeFuerte),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radioS)),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: c.acento),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: c.panel,
      indicatorColor: c.acentoSuave,
      height: 68,
      labelTextStyle: WidgetStatePropertyAll(
        TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: c.textoDebil),
      ),
      iconTheme: WidgetStateProperty.resolveWith(
        (estados) => IconThemeData(
          size: 23,
          color: estados.contains(WidgetState.selected) ? c.acento : c.textoDebil,
        ),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: fondo,
      surfaceTintColor: Colors.transparent,
      foregroundColor: c.texto,
      elevation: 0,
      titleTextStyle: TextStyle(
        color: c.texto,
        fontSize: 17,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.2,
      ),
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: c.panel,
      surfaceTintColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
    ),
    dialogTheme: DialogThemeData(backgroundColor: c.panel, surfaceTintColor: Colors.transparent),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: c.texto,
      contentTextStyle: TextStyle(color: fondo, fontWeight: FontWeight.w700),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
    ),
  );
}
