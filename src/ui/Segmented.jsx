import { motion } from 'framer-motion';

export default function Segmented({ id, options, value, onChange, ariaLabel, className = '' }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value || 'all'}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className="relative rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide transition-colors"
          >
            {active && (
              <motion.span
                layoutId={`${id}-indicator`}
                className="absolute inset-0 rounded-lg bg-spot"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className={`relative ${active ? 'text-[#131316]' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
