import { useMemo, useState } from 'react';

function extractYouTubeId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') return parsed.pathname.slice(1).split('/')[0] || null;
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
      const match = parsed.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
      if (match) return match[2];
    }
    return null;
  } catch {
    return null;
  }
}

export default function SongRequestModal({ open, onClose, onAttach }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const videoId = useMemo(() => (url ? extractYouTubeId(url.trim()) : null), [url]);

  if (!open) return null;

  function openYouTubeSearch() {
    const query = title.trim() || url.trim();
    if (!query) {
      setError('Escribe el nombre de la cancion antes de buscar en YouTube.');
      return;
    }
    setError('');
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function handleAttach() {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Pega el enlace del video de YouTube que copiaste.');
      return;
    }
    if (!extractYouTubeId(cleanUrl)) {
      setError('Ese enlace no parece un video de YouTube valido.');
      return;
    }
    setError('');
    onAttach({ url: cleanUrl, title: title.trim() });
    setTitle('');
    setUrl('');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card-rustic w-full max-w-lg p-6 animate-pop max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-2xl text-bark">Pedir una cancion</h2>
            <p className="text-sm text-bark-soft">
              Busca el tema en YouTube, copia el enlace y adjuntalo a tu saludo.
            </p>
          </div>
          <button className="btn btn-ghost !py-1 !px-3" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </div>

        <label className="field-label" htmlFor="song-title">
          1. Nombre del tema / artista
        </label>
        <div className="flex gap-2 mb-4">
          <input
            id="song-title"
            className="field"
            placeholder="Ej: La Gota Fria - Carlos Vives"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button className="btn btn-red whitespace-nowrap" onClick={openYouTubeSearch} type="button">
            Buscar en YouTube
          </button>
        </div>

        <label className="field-label" htmlFor="song-url">
          2. Pega aqui el enlace copiado
        </label>
        <input
          id="song-url"
          className="field mb-3"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />

        {videoId && (
          <div className="mb-4 border-[3px] border-bark rounded-2xl overflow-hidden">
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Vista previa de la cancion"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {error && (
          <p className="mb-3 text-sm font-bold text-tomato border-2 border-tomato bg-tomato/10 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-end">
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-green" onClick={handleAttach} type="button">
            Adjuntar al saludo
          </button>
        </div>
      </div>
    </div>
  );
}
