/**
 * Los iconos, como SVG en línea.
 *
 * Sin librería de iconos: son quince trazos y una dependencia entera para eso pesa más
 * que esto. Todos heredan el color del texto (`currentColor`) y miden lo que diga el CSS,
 * así que no hay que pasarles tamaño ni color por cada uso.
 */

interface Props {
  /** Se lee en voz alta. Sin él, el icono es decorativo y los lectores lo saltan. */
  titulo?: string;
}

function svg(hijos: React.ReactNode, { titulo }: Props = {}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
    >
      {titulo && <title>{titulo}</title>}
      {hijos}
    </svg>
  );
}

export const IconoResumen = (p: Props) =>
  svg(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
    </>,
    p,
  );

export const IconoPesa = (p: Props) =>
  svg(
    <>
      <path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11" />
    </>,
    p,
  );

export const IconoLista = (p: Props) =>
  svg(
    <>
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </>,
    p,
  );

export const IconoPlato = (p: Props) =>
  svg(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
    </>,
    p,
  );

export const IconoProgreso = (p: Props) =>
  svg(
    <>
      <path d="M3 17l5-6 4 3 4-6 5 4" />
      <path d="M3 21h18" />
    </>,
    p,
  );

export const IconoAjustes = (p: Props) =>
  svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>,
    p,
  );

export const IconoMas = (p: Props) => svg(<path d="M12 5v14M5 12h14" />, p);
export const IconoMenos = (p: Props) => svg(<path d="M5 12h14" />, p);
export const IconoVisto = (p: Props) => svg(<path d="M4 12.5l5 5L20 6.5" />, p);
export const IconoCruz = (p: Props) => svg(<path d="M6 6l12 12M18 6L6 18" />, p);
export const IconoAtras = (p: Props) => svg(<path d="M15 5l-7 7 7 7" />, p);
export const IconoBuscar = (p: Props) =>
  svg(
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </>,
    p,
  );

export const IconoCamara = (p: Props) =>
  svg(
    <>
      <path d="M3 8.5A2.5 2.5 0 015.5 6h1.2a2 2 0 001.7-1l.5-.8a1.5 1.5 0 011.3-.7h3.6a1.5 1.5 0 011.3.7l.5.8a2 2 0 001.7 1h1.2A2.5 2.5 0 0121 8.5v8A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </>,
    p,
  );

export const IconoChispa = (p: Props) =>
  svg(
    <>
      <path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z" />
      <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>,
    p,
  );

export const IconoReloj = (p: Props) =>
  svg(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>,
    p,
  );

export const IconoFuego = (p: Props) =>
  svg(
    <path d="M12 3s4.5 3.8 4.5 8a4.5 4.5 0 01-9 0c0-1.3.5-2.4 1.2-3.3C9 9.2 10 10 11 10c0-2.6 1-5.2 1-7z" />,
    p,
  );

export const IconoBalanza = (p: Props) =>
  svg(
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8.5 9.5a3.5 3.5 0 017 0" />
      <path d="M12 15v-3" />
    </>,
    p,
  );

export const IconoPapelera = (p: Props) =>
  svg(
    <>
      <path d="M4 7h16M9.5 7V5a1 1 0 011-1h3a1 1 0 011 1v2" />
      <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
      <path d="M10.5 11v6M13.5 11v6" />
    </>,
    p,
  );

export const IconoLapiz = (p: Props) =>
  svg(
    <>
      <path d="M16.5 3.5l4 4L8 20H4v-4z" />
      <path d="M14 6l4 4" />
    </>,
    p,
  );

export const IconoCopia = (p: Props) =>
  svg(
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5.5A1.5 1.5 0 0013.5 4h-8A1.5 1.5 0 004 5.5v8A1.5 1.5 0 005.5 15" />
    </>,
    p,
  );

export const IconoEstrella = (p: Props) =>
  svg(<path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8z" />, p);

export const IconoJugar = (p: Props) => svg(<path d="M7 4.5l12 7.5-12 7.5z" />, p);
export const IconoPausa = (p: Props) => svg(<path d="M9 5v14M15 5v14" />, p);
export const IconoBandera = (p: Props) =>
  svg(
    <>
      <path d="M5 3v18" />
      <path d="M5 4.5h12l-2 4 2 4H5" />
    </>,
    p,
  );
