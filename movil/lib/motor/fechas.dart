/// Fechas y duraciones.
///
/// Todo se guarda en horario **local** con el formato `AAAA-MM-DD`, no en UTC. Parece un
/// detalle y no lo es: un entreno de las once de la noche en España es «hoy» para quien
/// entrena, pero ya es mañana en UTC. Guardarlo en UTC movería medio entreno al día
/// siguiente y el resumen de la semana saldría mal.
library;

typedef ClaveDia = String;

String _dosCifras(int n) => n.toString().padLeft(2, '0');

/// `AAAA-MM-DD` de una fecha, en local.
ClaveDia claveDia([DateTime? fecha]) {
  final f = fecha ?? DateTime.now();
  return '${f.year}-${_dosCifras(f.month)}-${_dosCifras(f.day)}';
}

ClaveDia hoy() => claveDia();

/// De `AAAA-MM-DD` a `DateTime` a mediodía local: así ningún cambio de hora la mueve de día.
DateTime fechaDeClave(ClaveDia clave) {
  final p = clave.split('-').map(int.parse).toList();
  return DateTime(p[0], p[1], p[2], 12);
}

ClaveDia sumarDias(ClaveDia clave, int dias) {
  final f = fechaDeClave(clave);
  return claveDia(DateTime(f.year, f.month, f.day + dias, 12));
}

/// Las claves de los últimos `n` días, de más antigua a la dada.
List<ClaveDia> ultimosDias(int n, [ClaveDia? desde]) {
  final fin = desde ?? hoy();
  return List.generate(n, (i) => sumarDias(fin, i - (n - 1)));
}

/// El lunes de la semana a la que pertenece la fecha. La semana empieza en lunes.
ClaveDia lunesDe(ClaveDia clave) {
  // En Dart, `weekday` ya da 1 para lunes y 7 para domingo, así que no hay que corregir
  // el domingo como en JavaScript.
  final dia = fechaDeClave(clave).weekday - 1;
  return sumarDias(clave, -dia);
}

const _dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const _diasCortos = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const _meses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

String nombreDelDia(ClaveDia clave) => _dias[fechaDeClave(clave).weekday - 1];

String inicialDelDia(ClaveDia clave) => _diasCortos[fechaDeClave(clave).weekday - 1];

/// «12 de agosto». Con año sólo si no es el corriente, que es lo que estorba de más.
String formatoFecha(ClaveDia clave) {
  final f = fechaDeClave(clave);
  final mismoAno = f.year == DateTime.now().year;
  return '${f.day} de ${_meses[f.month - 1]}${mismoAno ? '' : ' de ${f.year}'}';
}

int diasEntre(ClaveDia a, ClaveDia b) =>
    fechaDeClave(b).difference(fechaDeClave(a)).inDays;

/// «Hoy», «Ayer» o la fecha. En una lista de entrenos es lo primero que se busca.
String fechaRelativa(ClaveDia clave) {
  final h = hoy();
  if (clave == h) return 'Hoy';
  if (clave == sumarDias(h, -1)) return 'Ayer';
  if (clave == sumarDias(h, 1)) return 'Mañana';
  final dias = diasEntre(clave, h);
  if (dias > 1 && dias < 7) return nombreDelDia(clave);
  return formatoFecha(clave);
}

/// `1:05:09` o `5:09`. La hora sólo aparece cuando existe.
String formatoDuracion(int segundos) {
  final s = segundos < 0 ? 0 : segundos;
  final h = s ~/ 3600;
  final m = (s % 3600) ~/ 60;
  final seg = s % 60;
  return h > 0 ? '$h:${_dosCifras(m)}:${_dosCifras(seg)}' : '$m:${_dosCifras(seg)}';
}

/// «1 h 12 min», para leer de un vistazo la duración de un entreno.
String duracionLarga(int segundos) {
  final min = (segundos / 60).round();
  // Un entreno de veinte segundos no duró «0 min», que además parece un error.
  if (min < 1) return 'menos de 1 min';
  if (min < 60) return '$min min';
  final h = min ~/ 60;
  final resto = min % 60;
  return resto == 0 ? '$h h' : '$h h $resto min';
}

String horaDe(DateTime instante) => '${instante.hour}:${_dosCifras(instante.minute)}';

/// Segundos entre dos instantes. Si no hay fin, hasta ahora.
int segundosEntre(DateTime comienzo, DateTime? fin) {
  final s = (fin ?? DateTime.now()).difference(comienzo).inSeconds;
  return s < 0 ? 0 : s;
}
