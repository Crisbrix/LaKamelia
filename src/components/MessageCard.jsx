import PriorityBadge from './PriorityBadge';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value.replace(' ', 'T')}${value.includes('Z') ? '' : 'Z'}`);
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageCard({
  message,
  variant = 'admin',
  onPriorityChange,
  onToggleStatus,
  onDelete,
  onSpeak,
  isSpeaking = false,
}) {
  const isRead = message.status === 'leido';

  return (
    <article
      className={`card-rustic p-4 flex flex-col gap-3 ${
        isRead ? 'opacity-70 bg-white/[0.02]' : ''
      } ${isSpeaking ? 'ring-2 ring-spot/60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-extrabold text-lg text-bark leading-tight">
            Para: {message.honoree_name}
          </p>
          <p className="text-xs uppercase tracking-wide text-bark-soft font-bold">
            De: {message.client_name} · {formatDate(message.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {message.table_number && (
            <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-white/15 bg-white/[0.04] text-zinc-300">
              Mesa {message.table_number}
            </span>
          )}
          <PriorityBadge priority={message.priority} size="sm" />
          <span
            className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              isRead
                ? 'border-sky/40 bg-sky/15 text-sky'
                : 'border-white/15 bg-white/[0.04] text-zinc-200'
            }`}
          >
            {isRead ? 'Leido' : 'Pendiente'}
          </span>
        </div>
      </div>

      <p className="text-zinc-100 leading-relaxed whitespace-pre-wrap bg-white/[0.03] border border-dashed border-white/10 rounded-xl p-3">
        {message.message_text}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {onSpeak && (
          <button className="btn btn-primary !py-1.5 !px-4 !text-sm" onClick={() => onSpeak(message)}>
            {isSpeaking ? 'Leyendo...' : 'Leer con voz IA'}
          </button>
        )}

        {onToggleStatus && (
          <button
            className={`btn !py-1.5 !px-4 !text-sm ${isRead ? 'btn-ghost' : 'btn-green'}`}
            onClick={() => onToggleStatus(message)}
          >
            {isRead ? 'Marcar pendiente' : 'Marcar como leido'}
          </button>
        )}

        {onPriorityChange && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => onPriorityChange(message, level)}
                title={`Prioridad ${level}`}
                className={`w-8 h-8 rounded-full border border-white/15 font-extrabold text-sm transition ${
                  message.priority === level
                    ? level === 3
                      ? 'bg-tomato text-white'
                      : level === 2
                        ? 'bg-spot text-[#131316]'
                        : 'bg-pasture text-[#06120a]'
                    : 'bg-white/[0.04] text-zinc-400 hover:bg-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}

        {onDelete && (
          <button className="btn btn-red !py-1.5 !px-4 !text-sm ml-auto" onClick={() => onDelete(message)}>
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
}