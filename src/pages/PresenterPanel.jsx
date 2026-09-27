import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import PriorityBadge from '../components/PriorityBadge';
import useSpeech from '../hooks/useSpeech';

const POLL_MS = 3000;

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

export default function PresenterPanel() {
  const [messages, setMessages] = useState([]);
  const [songs, setSongs] = useState([]);
  const [stats, setStats] = useState(null);
  const [songStats, setSongStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pendiente');
  const [songFilter, setSongFilter] = useState('pendiente');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMessage, setOpenMessage] = useState(null);

  const speech = useSpeech();

  const load = useCallback(async () => {
    try {
      const [listData, statsData, songData, songStatsData] = await Promise.all([
        api.listMessages({ status: statusFilter }),
        api.stats(),
        api.listSongRequests({ status: songFilter }),
        api.songStats(),
      ]);
      setMessages(listData.rows || []);
      setStats(statsData);
      setSongs(songData.rows || []);
      setSongStats(songStatsData);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, songFilter]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const openId = openMessage ? openMessage.id : null;

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpenMessage(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function markAsRead(message) {
    speech.stop();
    const updated = { ...message, status: 'leido' };
    setOpenMessage(updated);
    try {
      await api.markAsRead(message.id);
      await load();
    } catch (requestError) {
      setError(requestError.message);
      await load();
    }
  }

  async function reopen(message) {
    const updated = { ...message, status: 'pendiente' };
    setOpenMessage(updated);
    try {
      await api.setStatus(message.id, 'pendiente');
      await load();
    } catch (requestError) {
      setError(requestError.message);
      await load();
    }
  }

  function handleSpeak(message) {
    if (speech.speaking && speech.currentId === message.id) {
      speech.stop();
      return;
    }
    speech.speak(message);
  }

  async function toggleSong(song) {
    const next = song.status === 'pendiente' ? 'colocada' : 'pendiente';
    try {
      await api.setSongStatus(song.id, next);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const nextUp = messages.find((message) => message.status === 'pendiente') || null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-bark-soft">
            Rancho Criadero La Kamelia · Orgullosamente colombiano
          </p>
          <h1 className="font-display text-4xl text-bark">Cabina del presentador</h1>
          <p className="text-bark-soft">
            Cola en vivo del programa <strong>La Kamelia</strong>: saludos a la izquierda y
            canciones pedidas a la derecha.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-display uppercase tracking-widest bg-tomato text-white border-2 border-ink rounded-full px-3 py-1">
            Al aire · {stats?.pendiente ?? 0} saludos
          </span>
          <span className="text-xs font-display uppercase tracking-widest bg-spot text-ink border-2 border-ink rounded-full px-3 py-1">
            {songStats?.pendiente ?? 0} canciones
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm font-bold text-tomato border-2 border-tomato bg-tomato/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* DOS COLUMNAS: SALUDOS | CANCIONES */}
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
        {/* COLUMNA IZQUIERDA: MENSAJES DE SALUDOS */}
        <section className="card-rustic p-5">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <h2 className="font-display text-2xl text-bark mr-auto">Mensajes de saludos</h2>
            {['pendiente', 'leido', ''].map((value) => (
              <button
                key={value || 'todas'}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-full border-2 border-ink font-display text-xs uppercase ${
                  statusFilter === value ? 'bg-spot text-ink' : 'bg-white text-bark'
                }`}
              >
                {value === 'pendiente' ? 'Pendientes' : value === 'leido' ? 'Leidos' : 'Todos'}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="font-display text-bark text-xl">Sincronizando con la cabina...</p>
          ) : messages.length === 0 ? (
            <div className="border-2 border-dashed border-bark/40 rounded-2xl p-6 text-center text-bark-soft">
              No hay saludos {statusFilter ? `con estado "${statusFilter}"` : ''}.
            </div>
          ) : (
            <ul className="grid gap-3 max-h-[65vh] overflow-y-auto pr-1">
              {messages.map((message, index) => {
                const isSelected = message.id === openId;
                const isSpeaking = speech.speaking && speech.currentId === message.id;
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => setOpenMessage(message)}
                      className={`w-full text-left rounded-2xl border-2 p-3 transition ${
                        isSelected
                          ? 'border-ink bg-spot/30 shadow-[4px_4px_0_0_var(--color-ink)]'
                          : 'border-bark/40 bg-parchment hover:border-ink hover:bg-hay'
                      } ${message.status === 'leido' ? 'opacity-70' : ''} ${
                        isSpeaking ? 'ring-4 ring-spot' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-lg text-bark leading-tight">
                          {message.honoree_name}
                        </span>
                        {message.table_number && (
                          <span className="text-[10px] font-display uppercase px-2 py-0.5 rounded-full border-2 border-ink bg-hay text-ink">
                            Mesa {message.table_number}
                          </span>
                        )}
                        <span className="ml-auto flex items-center gap-2">
                          <PriorityBadge priority={message.priority} size="sm" />
                          <span
                            className={`text-[10px] font-display uppercase px-2 py-0.5 rounded-full border-2 border-ink ${
                              message.status === 'leido' ? 'bg-sky text-ink' : 'bg-white text-bark'
                            }`}
                          >
                            {message.status === 'leido' ? 'Leido' : 'Pendiente'}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-bark-soft mt-1">
                        De {message.client_name} · {formatDate(message.created_at)}
                      </p>
                      <p className="text-sm text-ink mt-1 line-clamp-2">{message.message_text}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {nextUp && nextUp.id === message.id && message.status === 'pendiente' && (
                          <span className="text-[10px] font-display uppercase px-2 py-0.5 rounded-full bg-tomato text-white border-2 border-ink">
                            Siguiente al aire
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-bark-soft">
                          Clic para abrir en grande
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* COLUMNA DERECHA: COLA DE CANCIONES PEDIDAS */}
        <section className="card-rustic p-5">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <h2 className="font-display text-2xl text-bark mr-auto">Canciones pedidas</h2>
            {['pendiente', 'colocada', ''].map((value) => (
              <button
                key={value || 'todas'}
                onClick={() => setSongFilter(value)}
                className={`px-3 py-1.5 rounded-full border-2 border-ink font-display text-xs uppercase ${
                  songFilter === value ? 'bg-spot text-ink' : 'bg-white text-bark'
                }`}
              >
                {value === 'pendiente' ? 'Pendientes' : value === 'colocada' ? 'Colocadas' : 'Todas'}
              </button>
            ))}
          </div>

          <p className="text-sm text-bark-soft mb-4">
            Solo nombre de la cancion, artista y mesa: sin enlaces ni videos.
          </p>

          {songs.length === 0 ? (
            <div className="border-2 border-dashed border-bark/40 rounded-2xl p-6 text-center text-bark-soft">
              Nadie ha pedido canciones {songFilter ? `con estado "${songFilter}"` : ''}.
            </div>
          ) : (
            <ul className="grid gap-3 max-h-[65vh] overflow-y-auto pr-1">
              {songs.map((song) => (
                <li
                  key={song.id}
                  className={`rounded-2xl border-2 border-bark/40 bg-parchment p-3 ${
                    song.status === 'colocada' ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-display text-lg text-bark leading-tight">
                        {song.song_name}
                      </p>
                      <p className="text-sm text-bark-soft">{song.artist}</p>
                    </div>
                    <span className="text-[11px] font-display uppercase px-2 py-0.5 rounded-full border-2 border-ink bg-spot text-ink">
                      Mesa {song.table_number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-3">
                    <span
                      className={`text-[10px] font-display uppercase px-2 py-0.5 rounded-full border-2 border-ink ${
                        song.status === 'colocada' ? 'bg-pasture text-white' : 'bg-white text-bark'
                      }`}
                    >
                      {song.status === 'colocada' ? 'Colocada' : 'Pendiente'}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-bark-soft font-bold">
                      {formatDate(song.created_at)}
                    </span>
                    <button
                      type="button"
                      className={`btn !py-1 !px-3 !text-xs ml-auto ${
                        song.status === 'pendiente' ? 'btn-green' : 'btn-ghost'
                      }`}
                      onClick={() => toggleSong(song)}
                    >
                      {song.status === 'pendiente' ? 'Marcar colocada' : 'Volver a pendiente'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* PANEL DE VOZ */}
      <section className="card-rustic p-5 mt-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-display text-2xl text-bark">Lectura por IA / voz robotizada</h2>
            <p className="text-sm text-bark-soft">
              Motor <code className="bg-hay px-1 rounded">window.speechSynthesis</code> con{' '}
              <strong>lang es-ES</strong> (castellano de España) y voz{' '}
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
                Este equipo no tiene voces en espanol (es-ES / es-CO Bogotá) instaladas: se leera
                con la voz del sistema en lang es-ES. Activa el tono robotico para el efecto de
                locutor.
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

      {/* RECUADRO GRANDE DEL MENSAJE SELECCIONADO */}
      {openMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4"
          onClick={() => setOpenMessage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="card-rustic w-full max-w-3xl p-6 md:p-8 animate-pop max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-bark-soft">
                  Saludo en cabina
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-bark leading-tight">
                  {openMessage.honoree_name}
                </h2>
                <p className="text-sm uppercase tracking-wide text-bark-soft font-bold mt-1">
                  De {openMessage.client_name}
                  {openMessage.table_number ? ` · Mesa ${openMessage.table_number}` : ''} ·{' '}
                  {formatDate(openMessage.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={openMessage.priority} />
                <span
                  className={`text-[11px] font-display uppercase px-2 py-0.5 rounded-full border-2 border-ink ${
                    openMessage.status === 'leido' ? 'bg-sky text-ink' : 'bg-white text-bark'
                  }`}
                >
                  {openMessage.status === 'leido' ? 'Leido' : 'Pendiente'}
                </span>
              </div>
            </div>

            <p className="mt-5 text-xl md:text-2xl leading-relaxed whitespace-pre-wrap bg-parchment/70 border-2 border-dashed border-bark/40 rounded-2xl p-5">
              {openMessage.message_text}
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                className="btn btn-primary !text-lg"
                onClick={() => handleSpeak(openMessage)}
                disabled={!speech.supported}
              >
                {speech.speaking && speech.currentId === openMessage.id
                  ? 'Leyendo ahora...'
                  : 'Leer con voz IA'}
              </button>
              {openMessage.status === 'pendiente' ? (
                <button className="btn btn-green !text-lg" onClick={() => markAsRead(openMessage)}>
                  Marcar como leido
                </button>
              ) : (
                <button className="btn btn-ghost !text-lg" onClick={() => reopen(openMessage)}>
                  Volver a pendiente
                </button>
              )}
              <button className="btn btn-ghost !text-lg ml-auto" onClick={() => setOpenMessage(null)}>
                Cerrar
              </button>
            </div>

            <p className="text-xs text-bark-soft mt-4">
              Voz: <strong>es-ES</strong> (castellano de España) adaptada a{' '}
              <strong>es-CO · Bogotá</strong>. Cierra con la tecla Esc.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
