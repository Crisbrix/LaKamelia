import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import MessageCard from '../components/MessageCard';

const POLL_MS = 5000;

export default function AdminPanel() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
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
          <h1 className="font-display text-4xl text-bark">Panel de administracion</h1>
          <p className="text-bark-soft">
            Cola de mensajes del programa <strong>La Kamelia</strong>: asigna prioridades y
            controla el orden al aire.
          </p>
        </div>
        <span className="text-xs font-display uppercase tracking-widest bg-spot border-2 border-ink rounded-full px-3 py-1">
          Rol: Administrador
        </span>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats?.total ?? '—'} tone="bg-hay" />
        <StatCard label="Pendientes" value={stats?.pendiente ?? '—'} tone="bg-spot" />
        <StatCard label="Leidos" value={stats?.leido ?? '—'} tone="bg-sky" />
        <StatCard
          label="Prioridad alta"
          value={stats?.byPriority?.[3] ?? '—'}
          tone="bg-tomato text-white"
        />
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
        <p className="mb-4 text-sm font-bold text-tomato border-2 border-tomato bg-tomato/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="font-display text-bark text-xl">Cargando cola de mensajes...</p>
      ) : messages.length === 0 ? (
        <div className="card-rustic p-8 text-center text-bark-soft">
          No hay mensajes con estos filtros.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onPriorityChange={changePriority}
              onToggleStatus={toggleStatus}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`card-rustic p-4 ${tone}`}>
      <p className="font-display text-3xl leading-none">{value}</p>
      <p className="text-xs font-extrabold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
