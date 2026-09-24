import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import MessageCard from '../components/MessageCard';
import PriorityBadge from '../components/PriorityBadge';
import useSpeech from '../hooks/useSpeech';

const POLL_MS = 3000;

export default function PresenterPanel() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pendiente');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const speech = useSpeech();

  const load = useCallback(async () => {
    try {
      const [listData, statsData] = await Promise.all([
        api.listMessages({ status: statusFilter }),
        api.stats(),
      ]);
      setMessages(listData.rows || []);
      setStats(statsData);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const nextUp = useMemo(
    () => messages.find((message) => message.status === 'pendiente') || null,
    [messages]
  );

  async function markAsRead(message) {
    speech.stop();
    setMessages((current) =>
      current.map((item) => (item.id === message.id ? { ...item, status: 'leido' } : item))
    );
    try {
      await api.markAsRead(message.id);
      load();
    } catch (requestError) {
      setError(requestError.message);
      load();
    }
  }

  async function reopen(message) {
    try {
      await api.setStatus(message.id, 'pendiente');
      load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleSpeak(message) {
    if (speech.speaking && speech.currentId === message.id) {
      speech.stop();
      return;
    }
    speech.speak(message);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-bark-soft">
            Rancho Criadero La Kamelia · Orgullosamente colombiano
          </p>
          <h1 className="font-display text-4xl text-bark">Cabina del presentador</h1>
          <p className="text-bark-soft">
            Cola en vivo del programa <strong>La Kamelia</strong> ordenada por prioridad. Lee el
            mensaje y marcalo como leido.
          </p>
        </div>
        <span className="text-xs font-display uppercase tracking-widest bg-tomato text-white border-2 border-ink rounded-full px-3 py-1">
          Al aire · {stats?.pendiente ?? 0} pendientes
        </span>
      </div>

      {/* PANEL DE VOZ */}
      <section className="card-rustic p-5 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-display text-2xl text-bark">
              Lectura por IA / voz robotizada
            </h2>
            <p className="text-sm text-bark-soft">
              Motor <code className="bg-hay px-1 rounded">window.speechSynthesis</code> con{' '}
              <strong>lang es-ES</strong> (castellano de España) forzando la voz{' '}
              <strong>es-CO Bogotá, Colombia</strong> cuando el navegador la tenga disponible.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn !py-1.5 !px-4 !text-sm ${speech.robotMode ? 'btn-red' : 'btn-ghost'}`}
              onClick={() => speech.setRobotMode((value) => !value)}
              title="Activa tono de locutor robotico"
            >
              Tono {speech.robotMode ? 'robotico' : 'natural'}
            </button>
            <button
              className="btn btn-red !py-1.5 !px-4 !text-sm"
              onClick={speech.stop}
              disabled={!speech.speaking}
            >
              Detener lectura
            </button>
          </div>
        </div>

        {!speech.supported ? (
          <p className="text-sm font-bold text-tomato">
            Tu navegador no soporta la sintesis de voz. Prueba con Chrome o Edge.
          </p>
        ) : (
          <>
            {speech.ready && !speech.hasSpanishVoice && (
              <p className="mb-3 text-sm font-bold text-bark border-2 border-spot bg-spot/20 rounded-xl px-3 py-2">
                Este equipo no tiene voces en espanol (es-ES / es-CO Bogotá) instaladas: se
                leera con la voz del sistema en lang es-ES. Activa el tono robótico para el
                efecto de locutor.
              </p>
            )}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="field-label" htmlFor="voice-select">
                  Voz del locutor
                </label>
                <select
                  id="voice-select"
                  className="field"
                  value={speech.voiceName}
                  onChange={(event) => speech.setVoiceName(event.target.value)}
                >
                  {speech.voices.length === 0 && <option value="">Cargando voces...</option>}
                  {speech.voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="rate-range">
                  Velocidad: {speech.rate.toFixed(2)}x
                </label>
                <input
                  id="rate-range"
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  className="w-full accent-spot"
                  value={speech.rate}
                  onChange={(event) => speech.setRate(Number(event.target.value))}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="pitch-range">
                  Tono: {speech.pitch.toFixed(2)}
                </label>
                <input
                  id="pitch-range"
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  className="w-full accent-spot"
                  value={speech.pitch}
                  onChange={(event) => speech.setPitch(Number(event.target.value))}
                />
              </div>
            </div>
          </>
        )}

        {speech.lastError && (
          <p className="mt-3 text-sm font-bold text-tomato">{speech.lastError}</p>
        )}
      </section>

      {/* SIGUIENTE AL AIRE */}
      {nextUp && (
        <section className="card-rustic p-5 mb-6 border-tomato">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h2 className="font-display text-2xl text-tomato">Siguiente al aire</h2>
            <PriorityBadge priority={nextUp.priority} />
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <p className="font-display text-3xl text-bark leading-tight">
                {nextUp.honoree_name}
              </p>
              <p className="text-sm uppercase tracking-wide text-bark-soft font-bold">
                Enviado por {nextUp.client_name}
              </p>
              <p className="mt-2 text-lg whitespace-pre-wrap">{nextUp.message_text}</p>
              {nextUp.song_request_url && (
                <a
                  className="inline-block mt-2 font-extrabold text-pasture-dark underline decoration-spot decoration-4 underline-offset-4 break-all"
                  href={nextUp.song_request_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir cancion pedida
                </a>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                className="btn btn-primary"
                onClick={() => handleSpeak(nextUp)}
                disabled={!speech.supported}
              >
                {speech.speaking && speech.currentId === nextUp.id
                  ? 'Leyendo ahora...'
                  : 'Leer con voz IA'}
              </button>
              <button className="btn btn-green" onClick={() => markAsRead(nextUp)}>
                Marcar como leido
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FILTROS */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <h2 className="font-display text-2xl text-bark mr-auto">Cola de mensajes</h2>
        {['pendiente', 'leido', ''].map((value) => (
          <button
            key={value || 'todas'}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-1.5 rounded-full border-2 border-ink font-display text-sm uppercase ${
              statusFilter === value ? 'bg-spot text-ink' : 'bg-white text-bark'
            }`}
          >
            {value === 'pendiente' ? 'Pendientes' : value === 'leido' ? 'Leidos' : 'Todos'}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-sm font-bold text-tomato border-2 border-tomato bg-tomato/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="font-display text-bark text-xl">Sincronizando con la cabina...</p>
      ) : messages.length === 0 ? (
        <div className="card-rustic p-8 text-center text-bark-soft">
          No hay mensajes {statusFilter ? `con estado "${statusFilter}"` : ''}.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              variant="presenter"
              onSpeak={handleSpeak}
              onToggleStatus={message.status === 'leido' ? reopen : markAsRead}
              isSpeaking={speech.speaking && speech.currentId === message.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
