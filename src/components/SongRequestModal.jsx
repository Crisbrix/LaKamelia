import { useState } from 'react';
import { api } from '../api/client';

const EMPTY = { song_name: '', artist: '', table_number: '' };

export default function SongRequestModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  if (!open) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function close() {
    setSent(null);
    setError('');
    setForm(EMPTY);
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      const data = await api.createSongRequest(form);
      setSent(data.song_request);
      setForm(EMPTY);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card-rustic w-full max-w-lg p-6 animate-pop max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {sent ? (
          <div className="text-center">
            <p className="font-display text-2xl text-pasture-dark">Cancion enviada a la cabina</p>
            <p className="mt-3 font-display text-xl text-bark">{sent.song_name}</p>
            <p className="text-bark-soft">{sent.artist}</p>
            <p className="mt-2 inline-block text-xs font-display uppercase tracking-widest bg-spot text-ink border-2 border-ink rounded-full px-3 py-1">
              Mesa {sent.table_number}
            </p>
            <p className="mt-4 text-sm text-bark-soft">
              Ya esta en la cola del presentador. Gracias por tu peticion.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-5">
              <button className="btn btn-ghost" onClick={close} type="button">
                Cerrar
              </button>
              <button className="btn btn-green" onClick={() => setSent(null)} type="button">
                Pedir otra cancion
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-2xl text-bark">Pedir una cancion</h2>
                <p className="text-sm text-bark-soft">
                  Dinos que suena y desde que mesa la pides. Nuestro locutor la pone al aire.
                </p>
              </div>
              <button className="btn btn-ghost !py-1 !px-3" onClick={close} aria-label="Cerrar" type="button">
                X
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="field-label" htmlFor="song_name">
                  1. Nombre de la cancion
                </label>
                <input
                  id="song_name"
                  className="field"
                  placeholder="Ej: La Gota Fria"
                  maxLength={150}
                  value={form.song_name}
                  onChange={(event) => update('song_name', event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor="song_artist">
                  2. Artista
                </label>
                <input
                  id="song_artist"
                  className="field"
                  placeholder="Ej: Carlos Vives"
                  maxLength={150}
                  value={form.artist}
                  onChange={(event) => update('artist', event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor="song_table_number">
                  3. Numero de mesa
                </label>
                <input
                  id="song_table_number"
                  className="field"
                  placeholder="Ej: 12"
                  maxLength={20}
                  value={form.table_number}
                  onChange={(event) => update('table_number', event.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm font-bold text-tomato border-2 border-tomato bg-tomato/10 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3 justify-end">
                <button className="btn btn-ghost" onClick={close} type="button">
                  Cancelar
                </button>
                <button className="btn btn-green" type="submit" disabled={sending}>
                  {sending ? 'Enviando...' : 'Pedir esta cancion'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
