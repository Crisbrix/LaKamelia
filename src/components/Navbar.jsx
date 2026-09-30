import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoDark from '../imagenes/kamelia-dark.png';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `relative px-3.5 py-1.5 rounded-lg text-[13px] font-extrabold uppercase tracking-wide transition-colors ${
    isActive ? 'text-[#131316]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
  }`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isPresenter, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="wood-panel sticky top-0 z-40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoDark}
            alt="Rancho Criadero La Kamelia"
            className="w-10 h-10 object-contain rounded-xl border border-white/10 bg-white/95 p-1 animate-swing"
          />
          <div className="leading-tight">
            <p className="font-display text-lg md:text-xl text-zinc-100 group-hover:text-spot transition-colors">
              Rancho Criadero La Kamelia
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              La Kamelia · Orgullosamente colombiano
            </p>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-1 flex-wrap">
          <NavLink to="/" className={linkClass} end>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-spot"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">Enviar saludo</span>
              </>
            )}
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-spot"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">Admin</span>
                </>
              )}
            </NavLink>
          )}

          {isPresenter && (
            <NavLink to="/cabina" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-spot"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">Cabina</span>
                </>
              )}
            </NavLink>
          )}

          {isAuthenticated ? (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="btn btn-red !py-1.5 !px-3.5 !text-xs ml-1"
            >
              Salir ({user.username})
            </motion.button>
          ) : (
            <NavLink to="/login" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-spot"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">Ingresar</span>
                </>
              )}
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
