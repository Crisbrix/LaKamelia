import { useEffect, useState } from 'react';
import { api } from '../api/client';
import CowLogo from '../components/CowLogo';
import SongRequestModal from '../components/SongRequestModal';

const EMPTY_FORM = {
  client_name: '',
  honoree_name: '',
  message_text: '',
  song_request_url: '',
};

export default function Home() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [songOpen, setSongOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .recentPublic()
        .then((data) => active && setRecent(data.rows || []))
        .catch(() => {});

    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function attachSong({ url }) {
    update('song_request_url', url);
    setSongOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSending(true);

    try {
      const data = await api.createMessage(form);
      setSent(data.message);
      setForm(EMPTY_FORM);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* HERO */}
      <section className="card-rustic p-6 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-spot/30" />
        <div className="flex flex-col md:flex-row items-center gap-6 relative">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-[0.2em] bg-tomato text-white border-2 border-ink rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Al aire ahora
            </span>
            <p className="mt-3 text-xs md:text-sm font-extrabold uppercase tracking-[0.25em] text-bark-soft">
              Rancho Criadero La Kamelia · Orgullosamente colombiano
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-bark leading-tight mt-2">
              Manda tu saludo
              <span className="block text-pasture">con La Kamelia</span>
            </h1>
            <p className="mt-3 text-bark-soft text-lg max-w-xl">
              El programa de complacencias del{' '}
              <strong className="text-bark">Rancho Criadero La Kamelia</strong>: escribe tu
              felicitacion, dedicatoria o cumpliano. Nuestro locutor la lee en vivo y, si quieres,
              pedimos la cancion que elijas.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a href="#enviar" className="btn btn-primary">
                Enviar saludo gratis
              </a>
              <button className="btn btn-green" onClick={() => setSongOpen(true)} type="button">
                Pedir una cancion
              </button>
            </div>
          </div>
          <div className="animate-floaty">
            <CowLogo className="w-40 h-40 md:w-52 md:h-52" />
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <section id="enviar" className="lg:col-span-2 card-rustic p-6 md:p-8 scroll-mt-24">
          <h2 className="font-display text-2xl text-bark mb-1">
            Formulario de complacencias · La Kamelia
          </h2>
          <p className="text-sm text-bark-soft mb-5">
            No necesitas registro ni contrasena. Solo tus datos y el saludo.
          </p>

          {sent ? (
            <div className="animate-pop border-[3px] border-pasture bg-pasture/10 rounded-2xl p-6 text-center">
              <p className="font-display text-2xl text-pasture-dark">Saludo enviado a la cabina</p>
              <p className="mt-2 text-bark">
                <strong>{sent.honoree_name}</strong> ya esta en la cola de mensajes.
              </p>
              <p className="text-sm text-bark-soft mt-1">
                Pronto podras escucharlo al aire. Gracias por escribirnos.
              </p>
              <button className="btn btn-primary mt-4" onClick={() => setSent(null)}>
                Enviar otro saludo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label" htmlFor="client_name">
                    Tu nombre
                  </label>
                  <input
                    id="client_name"
                    className="field"
                    placeholder="Ej: Maria Fernandez"
                    value={form.client_name}
                    onChange={(event) => update('client_name', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="honoree_name">
                    Nombre del homenajeado
                  </label>
                  <input
                    id="honoree_name"
                    className="field"
                    placeholder="Ej: Don Pedro el campesino"
                    value={form.honoree_name}
                    onChange={(event) => update('honoree_name', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="message_text">
                  Tu saludo
                </label>
                <textarea
                  id="message_text"
                  className="field min-h-32 resize-y"
                  maxLength={600}
                  placeholder="Ej: Feliz cumpleaños tio, que Dios te bendiga en tu labranza..."
                  value={form.message_text}
                  onChange={(event) => update('message_text', event.target.value)}
                  required
                />
                <p className="text-xs text-bark-soft mt-1 text-right">
                  {form.message_text.length}/600
                </p>
              </div>

              <div className="bg-hay/60 border-2 border-dashed border-bark/50 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="field-label !mb-0">Cancion pedida (opcional)</p>
                    <p className="text-sm text-bark-soft break-all">
                      {form.song_request_url || 'Aun no has adjuntado ninguna cancion.'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-green !py-1.5 !px-4 !text-sm"
                      onClick={() => setSongOpen(true)}
                    >
                      Pedir una cancion
                    </button>
                    {form.song_request_url && (
                      <button
                        type="button"
                        className="btn btn-ghost !py-1.5 !px-4 !text-sm"
                        onClick={() => update('song_request_url', '')}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm font-bold text-tomato border-2 border-tomato bg-tomato/10 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button className="btn btn-primary w-full !text-lg" disabled={sending}>
                {sending ? 'Enviando a la cabina...' : 'Enviar saludo al aire'}
              </button>
            </form>
          )}
        </section>

        {/* LATERAL */}
        <aside className="grid gap-6 content-start">
          <div className="card-rustic p-5">
            <h3 className="font-display text-xl text-bark mb-3">Como funciona</h3>
            <ol className="grid gap-3 text-sm text-bark">
              <li className="flex gap-3">
                <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full bg-spot border-2 border-ink font-display">
                  1
                </span>
                Escribes tu saludo y el homenajeado, sin registrarte.
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full bg-spot border-2 border-ink font-display">
                  2
                </span>
                El administrador le asigna prioridad en la cola.
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full bg-spot border-2 border-ink font-display">
                  3
                </span>
                El presentador lo lee al aire, con voz IA si lo desea.
              </li>
            </ol>
          </div>

          <div className="card-rustic p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl text-bark">Ya al aire</h3>
              <span className="text-xs font-bold uppercase text-bark-soft">Actualiza solo</span>
            </div>

            {recent.length === 0 ? (
              <p className="text-sm text-bark-soft">
                Todavia no hay saludos leidos. ¡Sé el primero en mandar el tuyo!
              </p>
            ) : (
              <ul className="grid gap-3">
                {recent.map((item) => (
                  <li key={item.id} className="border-2 border-bark/40 rounded-xl p-3 bg-parchment">
                    <p className="font-display text-bark">{item.honoree_name}</p>
                    <p className="text-xs text-bark-soft">De {item.client_name}</p>
                    <p className="text-sm mt-1 line-clamp-3">{item.message_text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <SongRequestModal open={songOpen} onClose={() => setSongOpen(false)} onAttach={attachSong} />
    </div>
  );
}
