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

function songLabel(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
    return id ? `YouTube · ${id}` : 'Cancion pedida';
  } catch {
    return 'Cancion pedida';
  }
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
        isRead ? 'opacity-70 bg-hay/40' : ''
      } ${isSpeaking ? 'ring-4 ring-spot' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-display text-lg text-bark leading-tight">
            Para: {message.honoree_name}
          </p>
          <p className="text-xs uppercase tracking-wide text-bark-soft font-bold">
            De: {message.client_name} · {formatDate(message.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={message.priority} size="sm" />
          <span
            className={`text-[11px] font-display uppercase px-2 py-0.5 rounded-full border-2 border-ink ${
              isRead ? 'bg-sky text-ink' : 'bg-white text-bark'
            }`}
          >
            {isRead ? 'Leido' : 'Pendiente'}
          </span>
        </div>
      </div>

      <p className="text-ink leading-relaxed whitespace-pre-wrap bg-parchment/70 border-2 border-dashed border-bark/40 rounded-xl p-3">
        {message.message_text}
      </p>

      {message.song_request_url && (
        <a
          href={message.song_request_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-extrabold text-pasture-dark underline decoration-spot decoration-4 underline-offset-4 break-all"
        >
          {songLabel(message.song_request_url)}
        </a>
      )}

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
                className={`w-8 h-8 rounded-full border-2 border-ink font-display text-sm transition ${
                  message.priority === level
                    ? level === 3
                      ? 'bg-tomato text-white'
                      : level === 2
                        ? 'bg-spot text-ink'
                        : 'bg-pasture text-white'
                    : 'bg-white text-bark-soft hover:bg-hay'
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
