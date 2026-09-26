import logoLight from '../imagenes/kamelia-light.png';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 wood-panel flex flex-col items-center justify-center gap-5 px-6 text-center">
      <img
        src={logoLight}
        alt=""
        className="w-32 h-32 md:w-44 md:h-44 object-contain animate-floaty drop-shadow-lg"
      />

      <div>
        <p className="font-display text-4xl md:text-5xl text-parchment">La Kamelia</p>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-spot mt-2">
          Rancho Criadero La Kamelia
        </p>
      </div>

      <div className="flex items-end gap-2 h-4" aria-hidden="true">
        <span
          className="w-3 h-3 rounded-full bg-spot animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-3 h-3 rounded-full bg-spot animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-3 h-3 rounded-full bg-spot animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-parchment/80">
        Encendiendo el estudio...
      </p>

      <p role="status" className="sr-only">
        Cargando Rancho Criadero La Kamelia
      </p>
    </div>
  );
}
