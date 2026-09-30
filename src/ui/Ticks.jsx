/**
 * Acuses de lectura de la cola de saludos:
 *  pendiente -> "enviado" (reloj)   |   leido -> "leido" (doble check, acento oro)
 */
export default function Ticks({ status, className = '' }) {
  const read = status === 'leido';

  if (!read) {
    return (
      <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${className}`} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5V12l3 2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-spot ${className}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 13.5 6.5 18 14 8.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 15.5 12.5 18 22 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
