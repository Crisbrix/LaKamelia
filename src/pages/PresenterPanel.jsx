import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../api/client';
import PriorityBadge from '../components/PriorityBadge';
import Ticks from '../ui/Ticks';
import useSpeech from '../hooks/useSpeech';
import Segmented from '../ui/Segmented';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

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

const MSG_FILTERS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'leido', label: 'Leidos' },
  { value: '', label: 'Todos' },
];

const SONG_FILTERS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'colocada', label: 'Colocadas' },
  { value: '', label: 'Todas' },
];

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
          <h1 className="font-extrabold text-4xl text-bark">Cabina del presentador</h1>
          <p className="text-bark-soft">
            Cola en vivo del programa <strong>La Kamelia</strong>: saludos a la izquierda y
            canciones pedidas a la derecha.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-extrabold uppercase tracking-widest bg-tomato/15 text-tomato border border-tomato/40 rounded-full px-3 py-1">
            Al aire · {stats?.pendiente ?? 0} saludos
          </span>
          <span className="text-xs font-extrabold uppercase tracking-widest bg-spot/15 text-spot border border-spot/40 rounded-full px-3 py-1">
            {songStats?.pendiente ?? 0} canciones
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm font-bold text-tomato border border-tomato/50 bg-tomato/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* DOS COLUMNAS: SALUDOS | CANCIONES */}
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
        {/* COLUMNA IZQUIERDA: MENSAJES DE SALUDOS */}
        <section className="card-rustic p-5">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <h2 className="font-extrabold text-2xl text-bark mr-auto">Mensajes de saludos</h2>
            <Segmented
              id="msg-filters"
              options={MSG_FILTERS}
              value={statusFilter}
              onChange={setStatusFilter}
              ariaLabel="Filtrar saludos"
            />
          </div>

          {loading ? (
            <p className="font-extrabold text-bark text-xl">Sincronizando con la cabina...</p>
          ) : messages.length === 0 ? (
            <EmptyState icon="📭" title="Sin saludos" hint={`No hay saludos ${statusFilter ? `con estado "${statusFilter}"` : ''}.`} />
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <ul
                key={statusFilter}
                className="grid gap-3 max-h-[65vh] overflow-y-auto pr-1"
                style={{ minHeight: 200 }}
              >
                {messages.map((message, index) => {
                  const isSelected = message.id === openId;
                  const isSpeaking = speech.speaking && speech.currentId === message.id;
                  return (
                    <motion.li
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3), type: 'spring', stiffness: 280, damping: 26 }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMessage(message)}
                        className={`w-full text-left rounded-2xl border p-3 transition ${
                          isSelected
                            ? 'border-spot/60 bg-spot/15 ring-2 ring-spot/30'
                            : 'border-white/10 bg-white/[0.03] hover:border-spot/40 hover:bg-white/5'
                        } ${message.status === 'leido' ? 'opacity-70' : ''} ${
                          isSpeaking ? 'ring-2 ring-spot/60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-lg text-bark leading-tight">
                            {message.honoree_name}
                          </span>
                          {message.table_number && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-white/15 bg-white/[0.04] text-zinc-300">
                              Mesa {message.table_number}
                            </span>
                          )}
                          <span className="ml-auto flex items-center gap-2">
                            <PriorityBadge priority={message.priority} size="sm" />
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                message.status === 'leido'
                                  ? 'border-sky/40 bg-sky/15 text-sky'
                                  : 'border-white/15 bg-white/[0.04] text-zinc-200'
                              }`}
                            >
                              {message.status === 'leido' ? 'Leido' : 'Pendiente'}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-bark-soft mt-1">
                          De {message.client_name} · {formatDate(message.created_at)}
                        </p>
                        <p className="text-sm text-zinc-300 mt-1 line-clamp-2">{message.message_text}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {nextUp && nextUp.id === message.id && message.status === 'pendiente' && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-tomato/15 text-tomato border border-tomato/40">
                              Siguiente al aire
                            </span>
                          )}
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-bark-soft">
                            Clic para abrir
                          </span>
                        </div>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </AnimatePresence>
          )}
        </section>

        {/* COLUMNA DERECHA: COLA DE CANCIONES PEDIDAS */}
        <section className="card-rustic p-5">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <h2 className="font-extrabold text-2xl text-bark mr-auto">Canciones pedidas</h2>
            <Segmented
              id="song-filters"
              options={SONG_FILTERS}
              value={songFilter}
              onChange={setSongFilter}
              ariaLabel="Filtrar canciones"
            />
          </div>

          <p className="text-sm text-bark-soft mb-4">
            Solo nombre de la cancion, artista y mesa: sin enlaces ni videos.
          </p>

          {songs.length === 0 ? (
            <EmptyState icon="🎵" title="Sin peticiones" hint={`Nadie ha pedido canciones ${songFilter ? `con estado "${songFilter}"` : ''}.`} />
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <ul
                key={songFilter}
                className="grid gap-3 max-h-[65vh] overflow-y-auto pr-1"
                style={{ minHeight: 200 }}
              >
                {songs.map((song, index) => (
                  <motion.li
                    key={song.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3), type: 'spring', stiffness: 280, damping: 26 }}
                    className={`rounded-2xl border p-3 ${song.status === 'colocada' ? 'opacity-70 border-white/10 bg-white/[0.02]' : 'border-white/10 bg-white/[0.03]'}`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-extrabold text-lg text-bark leading-tight">{song.song_name}</p>
                        <p className="text-sm text-bark-soft">{song.artist}</p>
                      </div>
                      <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-spot/40 bg-spot/15 text-spot">
                        Mesa {song.table_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          song.status === 'colocada'
                            ? 'border-pasture/40 bg-pasture/15 text-pasture-dark'
                            : 'border-white/15 bg-white/[0.04] text-zinc-200'
                        }`}
                      >
                        {song.status === 'colocada' ? 'Colocada' : 'Pendiente'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-bark-soft font-bold">
                        {formatDate(song.created_at)}
                      </span>
                      <Button
                        variant={song.status === 'pendiente' ? 'green' : 'ghost'}
                        size="sm"
                        className="ml-auto"
                        onClick={() => toggleSong(song)}
                      >
                        {song.status === 'pendiente' ? 'Marcar colocada' : 'Volver a pendiente'}
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </AnimatePresence>
          )}
        </section>
      </div>

      {/* PANEL DE VOZ */}
      <section className="card-rustic p-5 mt-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-extrabold text-2xl text-bark">Lectura por IA / voz robotizada</h2>
            <p className="text-sm text-bark-soft">
              Motor <code className="bg-white/[0.04] px-1 rounded border border-white/10">window.speechSynthesis</code> con{' '}
              <strong>lang es-ES</strong> (castellano de España) y voz{' '}
              <strong>es-CO Bogotá, Colombia</strong> cuando el navegador la tenga disponible.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={speech.robotMode ? 'red' : 'ghost'}
              size="sm"
              onClick={() => speech.setRobotMode((value) => !value)}
              title="Activa tono de locutor robotico"
            >
              Tono {speech.robotMode ? 'robotico' : 'natural'}
            </Button>
            <Button variant="red" size="sm" onClick={speech.stop} disabled={!speech.speaking}>
              Detener lectura
            </Button>
          </div>
        </div>

        {!speech.supported ? (
          <p className="text-sm font-bold text-tomato">
            Tu navegador no soporta la sintesis de voz. Prueba con Chrome o Edge.
          </p>
        ) : (
          <>
            {speech.ready && !speech.hasSpanishVoice && (
              <p className="mb-3 text-sm font-bold text-bark border border-spot/40 bg-spot/10 rounded-xl px-3 py-2">
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

      {/* RECUADRO GRANDE DEL MENSAJE SELECCIONADO - usando Modal */}
      <Modal
        open={!!openMessage}
        onClose={() => setOpenMessage(null)}
        labelledBy="reading-title"
        size="lg"
      >
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-bark-soft">
                Saludo en cabina
              </p>
              <h2 id="reading-title" className="font-extrabold text-3xl md:text-4xl text-bark leading-tight">
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
                className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  openMessage.status === 'leido'
                    ? 'border-sky/40 bg-sky/15 text-sky'
                    : 'border-white/15 bg-white/[0.04] text-zinc-200'
                }`}
              >
                {openMessage.status === 'leido' ? 'Leido' : 'Pendiente'}
              </span>
            </div>
          </div>

          <p className="mt-5 text-xl md:text-2xl leading-relaxed whitespace-pre-wrap bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-5">
            {openMessage.message_text}
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Button variant="primary" size="lg" onClick={() => handleSpeak(openMessage)} disabled={!speech.supported}>
              {speech.speaking && speech.currentId === openMessage.id ? 'Leyendo ahora...' : 'Leer con voz IA'}
            </Button>
            {openMessage.status === 'pendiente' ? (
              <Button variant="green" size="lg" onClick={() => markAsRead(openMessage)}>
                Marcar como leido
              </Button>
            ) : (
              <Button variant="ghost" size="lg" onClick={() => reopen(openMessage)}>
                Volver a pendiente
              </Button>
            )}
            <Button variant="ghost" size="lg" className="ml-auto" onClick={() => setOpenMessage(null)}>
              Cerrar
            </Button>
          </div>

          <p className="text-xs text-bark-soft mt-4">
            Voz: <strong>es-ES</strong> (castellano de España) adaptada a{' '}
            <strong>es-CO · Bogotá</strong>. Cierra con la tecla Esc.
          </p>
        </div>
      </Modal>
    </div>
  );
}