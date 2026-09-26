import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { username: '', full_name: '', password: '', role: 'presentador' };

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value.replace(' ', 'T')}Z`);
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UserManager() {
  const { user: sessionUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ full_name: '', role: 'presentador', password: '' });

  const load = useCallback(async () => {
    try {
      const data = await api.listUsers();
      setUsers(data.rows || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(setter, key, value) {
    setter((current) => ({ ...current, [key]: value }));
  }

  async function createUser(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const data = await api.createUser(form);
      setNotice(`Usuario "${data.user.username}" creado correctamente`);
      setForm(EMPTY_FORM);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(user) {
    setError('');
    setNotice('');
    setEditingId(user.id);
    setEdit({ full_name: user.full_name || '', role: user.role, password: '' });
  }

  async function saveEdit(user) {
    setSaving(true);
    setError('');
    try {
      const payload = { full_name: edit.full_name, role: edit.role };
      if (edit.password) payload.password = edit.password;
      await api.updateUser(user.id, payload);
      setNotice(`Usuario "${user.username}" actualizado`);
      setEditingId(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(user) {
    const confirmed = window.confirm(`Eliminar el usuario "${user.username}"? Esta accion no se puede deshacer.`);
    if (!confirmed) return;
    setError('');
    try {
      await api.deleteUser(user.id);
      setNotice(`Usuario "${user.username}" eliminado`);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card-rustic p-4">
        <h2 className="font-display text-2xl text-bark mb-1">Nuevo usuario</h2>
        <p className="text-sm text-bark-soft mb-4">
          Crea cuentas para el equipo del programa: administradores o presentadores.
        </p>

        <form onSubmit={createUser} className="grid md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="field-label" htmlFor="new-username">
              Usuario
            </label>
            <input
              id="new-username"
              className="field"
              placeholder="ej: locutor2"
              value={form.username}
              onChange={(event) => setField(setForm, 'username', event.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="new-full-name">
              Nombre completo
            </label>
            <input
              id="new-full-name"
              className="field"
              placeholder="ej: Maria Lopez"
              value={form.full_name}
              onChange={(event) => setField(setForm, 'full_name', event.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="new-password">
              Contrasena
            </label>
            <input
              id="new-password"
              type="password"
              className="field"
              placeholder="minimo 6 caracteres"
              value={form.password}
              onChange={(event) => setField(setForm, 'password', event.target.value)}
              required
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="field-label" htmlFor="new-role">
                Rol
              </label>
              <select
                id="new-role"
                className="field"
                value={form.role}
                onChange={(event) => setField(setForm, 'role', event.target.value)}
              >
                <option value="presentador">Presentador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </section>

      {notice && (
        <p className="text-sm font-bold text-pasture-dark border-2 border-pasture bg-pasture/10 rounded-xl px-3 py-2">
          {notice}
        </p>
      )}

      {error && (
        <p className="text-sm font-bold text-tomato border-2 border-tomato bg-tomato/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <section>
        <h2 className="font-display text-2xl text-bark mb-3">Usuarios del estudio ({users.length})</h2>

        {loading ? (
          <p className="font-display text-bark text-xl">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <div className="card-rustic p-8 text-center text-bark-soft">Todavia no hay usuarios.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {users.map((user) => {
              const isMe = sessionUser && user.id === sessionUser.id;
              const isEditing = editingId === user.id;

              return (
                <article key={user.id} className="card-rustic p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-display text-lg text-bark leading-tight flex items-center gap-2">
                        {user.username}
                        {isMe && (
                          <span className="text-[10px] uppercase tracking-wider bg-spot border-2 border-ink rounded-full px-2 py-0.5">
                            Tu cuenta
                          </span>
                        )}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-bark-soft font-bold">
                        {user.full_name || 'Sin nombre completo'} · alta {formatDate(user.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-display uppercase px-2 py-0.5 rounded-full border-2 border-ink ${
                        user.role === 'admin' ? 'bg-tomato text-white' : 'bg-sky text-ink'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Presentador'}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="grid sm:grid-cols-2 gap-3 bg-parchment/70 border-2 border-dashed border-bark/40 rounded-xl p-3">
                      <div>
                        <label className="field-label" htmlFor={`name-${user.id}`}>
                          Nombre completo
                        </label>
                        <input
                          id={`name-${user.id}`}
                          className="field"
                          value={edit.full_name}
                          onChange={(event) => setField(setEdit, 'full_name', event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor={`role-${user.id}`}>
                          Rol
                        </label>
                        <select
                          id={`role-${user.id}`}
                          className="field"
                          value={edit.role}
                          onChange={(event) => setField(setEdit, 'role', event.target.value)}
                        >
                          <option value="presentador">Presentador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="field-label" htmlFor={`password-${user.id}`}>
                          Nueva contrasena (opcional)
                        </label>
                        <input
                          id={`password-${user.id}`}
                          type="password"
                          className="field"
                          placeholder="Dejar vacio para no cambiar"
                          value={edit.password}
                          onChange={(event) => setField(setEdit, 'password', event.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2 flex flex-wrap gap-2">
                        <button
                          className="btn btn-green !py-1.5 !px-4 !text-sm"
                          type="button"
                          disabled={saving}
                          onClick={() => saveEdit(user)}
                        >
                          {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button
                          className="btn btn-ghost !py-1.5 !px-4 !text-sm"
                          type="button"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-auto pt-1">
                      <button
                        className="btn btn-primary !py-1.5 !px-4 !text-sm"
                        type="button"
                        onClick={() => startEdit(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-red !py-1.5 !px-4 !text-sm ml-auto"
                        type="button"
                        disabled={isMe}
                        title={isMe ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                        onClick={() => removeUser(user)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
