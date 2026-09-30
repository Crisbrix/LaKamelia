import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoDark from '../imagenes/kamelia-dark.png';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      const from = location.state?.from || (user.role === 'admin' ? '/admin' : '/cabina');
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="card-rustic p-7"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logoDark} alt="La Kamelia" className="w-24 h-24 object-contain animate-floaty" />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-bark-soft">
            Rancho Criadero La Kamelia · Orgullosamente colombiano
          </p>
          <h1 className="font-extrabold text-3xl text-bark mt-1">Acceso al estudio</h1>
          <p className="text-sm text-bark-soft">
            Panel de administracion y cabina de locucion del programa radial La Kamelia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="field-label" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              className="field"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              className="field"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-tomato border border-tomato/50 bg-tomato/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-5 border-t border-dashed border-white/10 pt-4 text-xs text-bark-soft">
          <p className="font-extrabold text-sm text-bark mb-1">Cuentas de prueba</p>
          <p>
            <strong>admin</strong> / (contraseña configurada) → panel de prioridades
          </p>
          <p>
            <strong>presentador (Gabriel)</strong> / (contraseña configurada) → cabina al aire
          </p>
        </div>
      </motion.div>
    </div>
  );
}