export default function StatusDot({ online = false, className = '' }) {
  return (
    <span className={`relative inline-flex h-2.5 w-2.5 shrink-0 ${className}`} aria-hidden="true">
      <span
        className={`absolute inset-0 rounded-full ${online ? 'bg-pasture' : 'bg-zinc-600'}`}
      />
      {online && (
        <span className="absolute inset-0 animate-ping rounded-full bg-pasture/60 motion-reduce:animate-none" />
      )}
    </span>
  );
}
