const CONFIG = {
  1: { label: 'Baja', className: 'bg-pasture/15 text-pasture-dark border-pasture/40', hint: 'Cuando haya espacio' },
  2: { label: 'Media', className: 'bg-spot/15 text-spot border-spot/40', hint: 'Orden normal' },
  3: { label: 'Alta', className: 'bg-tomato/15 text-tomato border-tomato/45', hint: 'Sale primero al aire' },
};

export default function PriorityBadge({ priority, size = 'md' }) {
  const config = CONFIG[priority] || CONFIG[2];
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-extrabold uppercase tracking-wide ${config.className} ${sizeClass}`}
      title={config.hint}
    >
      Prio {priority} · {config.label}
    </span>
  );
}

export const PRIORITY_OPTIONS = [1, 2, 3].map((value) => ({
  value,
  label: CONFIG[value].label,
}));
