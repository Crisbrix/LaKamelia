import { Link, NavLink, useNavigate } from 'react-router-dom';
import logoLight from '../imagenes/kamelia-light.png';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full font-extrabold text-sm uppercase tracking-wide border-2 transition ${
    isActive
      ? 'bg-spot text-ink border-ink'
      : 'bg-transparent text-parchment border-transparent hover:bg-white/15'
  }`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isPresenter, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="wood-panel border-b-4 border-ink sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoLight}
            alt="Rancho Criadero La Kamelia"
            className="w-11 h-11 object-contain animate-swing"
          />
          <div className="leading-tight">
            <p className="font-display text-lg md:text-xl text-parchment">
              Rancho Criadero La Kamelia
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-spot font-bold">
              La Kamelia · Orgullosamente colombiano
            </p>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-2 flex-wrap">
          <NavLink to="/" className={linkClass} end>
            Enviar saludo
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          {isPresenter && (
            <NavLink to="/cabina" className={linkClass}>
              Cabina
            </NavLink>
          )}

          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-red !py-1.5 !px-4 !text-sm">
              Salir ({user.username})
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Ingresar
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
