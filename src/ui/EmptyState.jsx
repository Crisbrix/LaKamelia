export default function EmptyState({ icon = '♪', title, hint }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center">
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-lg text-spot">
        {icon}
      </span>
      <p className="font-semibold text-zinc-200">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}
