import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../api/client';
import MessageCard from '../components/MessageCard';
import UserManager from '../components/UserManager';
import Segmented from '../ui/Segmented';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';

const POLL_MS = 5000;

const STAT_TONES = {
  total: 'bg-white/[0.04] border-white/10',
  pendiente: 'bg-spot/15 border-spot/40',
  leido: 'bg-sky/15 border-sky/40',
  high: 'bg-tomato/15 border-tomato/40',
};

export default function AdminPanel() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('mensajes');
  const [statusFilter, setStatusFilter] = useState('pendiente');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [listData, statsData] = await Promise.all([
        api.listMessages({ status: statusFilter, priority: priorityFilter, search }),
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
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  async function changePriority(message, priority) {
    if (message.priority === priority) return;
    setMessages((current) =>
      current.map((item) => (item.id === message.id ? { ...item, priority } : item))
    );
    try {
      await api.setPriority(message.id, priority);
      load();
    } catch (requestError) {
      setError(requestError.message);
      load();
    }
  }

  async function toggleStatus(message) {
    const nextStatus = message.status === 'leido' ? 'pendiente' : 'leido';
    setMessages((current) =>
      current.map((item) => (item.id === message.id ? { ...item, status: nextStatus } : item))
    );
    try {
      await api.setStatus(message.id, nextStatus);
      load();
    } catch (requestError) {
      setError(requestError.message);
      load();
    }
  }

  async function remove(message) {
    const confirmed = window.confirm(`Eliminar el saludo de ${message.honoree_name}?`);
    if (!confirmed) return;
    try {
      await api.deleteMessage(message.id);
      load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-bark-soft">
            Rancho Criadero La Kamelia · Orgullosamente colombiano
          </p>
          <h1 className="font-extrabold text-4xl text-bark">Panel de administracion</h1>
          <p className="text-bark-soft">
            Cola de mensajes del programa <strong>La Kamelia</strong>: asigna prioridades y
            controla el orden al aire.
          </p>
        </div>
        <span className="text-xs font-extrabold uppercase tracking-widest bg-spot/15 text-spot border border-spot/40 rounded-full px-3 py-1">
          Rol: Administrador
        </span>
      </div>

      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Secciones del panel">
        <Segmented
          id="admin-tabs"
          options={[
            { value: 'mensajes', label: 'Cola de mensajes' },
            { value: 'usuarios', label: 'Usuarios' },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Secciones del panel"
        />
      </nav>

      {tab === 'usuarios' ? (
        <UserManager />
      ) : (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total" value={stats?.total ?? '—'} tone="total" />
            <StatCard label="Pendientes" value={stats?.pendiente ?? '—'} tone="pendiente" />
            <StatCard label="Leidos" value={stats?.leido ?? '—'} tone="leido" />
            <StatCard label="Prioridad alta" value={stats?.byPriority?.[3] ?? '—'} tone="high" />
          </section>

          <section className="card-rustic p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="field-label" htmlFor="status-filter">
                  Estado
                </label>
                <select
                  id="status-filter"
                  className="field"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="leido">Leidos</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="priority-filter">
                  Prioridad
                </label>
                <select
                  id="priority-filter"
                  className="field"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="3">3 · Alta</option>
                  <option value="2">2 · Media</option>
                  <option value="1">1 · Baja</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="search">
                  Buscar
                </label>
                <input
                  id="search"
                  className="field"
                  placeholder="Nombre o texto del saludo"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </section>

          {error && (
            <p className="mb-4 text-sm font-bold text-tomato border border-tomato/50 bg-tomato/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <p className="font-extrabold text-bark text-xl">Cargando cola de mensajes...</p>
          ) : messages.length === 0 ? (
            <EmptyState icon="📬" title="Sin mensajes" hint="No hay mensajes con estos filtros." />
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <div
                key={messages.length}
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-4"
                style={{ minHeight: 200 }}
              >
                {messages.map((message) => (
                  <motion.div key={message.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
                    <MessageCard
                      message={message}
                      onPriorityChange={changePriority}
                      onToggleStatus={toggleStatus}
                      onDelete={remove}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const toneClass = STAT_TONES[tone] || STAT_TONES.total;
  const textClass = tone === 'high' ? 'text-tomato' : 'text-bark';
  return (
    <div className={`card-rustic p-4 ${toneClass}`}>
      <p className={`font-extrabold text-3xl leading-none ${textClass}`}>{value}</p>
      <p className="text-xs font-extrabold uppercase tracking-wider mt-1 text-bark-soft">{label}</p>
    </div>
  );
}