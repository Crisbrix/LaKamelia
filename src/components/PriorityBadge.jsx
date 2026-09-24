const CONFIG = {
  1: { label: 'Baja', className: 'bg-pasture text-white', hint: 'Cuando haya espacio' },
  2: { label: 'Media', className: 'bg-spot text-ink', hint: 'Orden normal' },
  3: { label: 'Alta', className: 'bg-tomato text-white', hint: 'Sale primero al aire' },
};

export default function PriorityBadge({ priority, size = 'md' }) {
  const config = CONFIG[priority] || CONFIG[2];
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-ink font-display uppercase ${config.className} ${sizeClass}`}
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
