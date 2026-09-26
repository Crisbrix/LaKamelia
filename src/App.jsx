import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import PresenterPanel from './pages/PresenterPanel';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const MIN_MS = 1400;
    const MAX_MS = 4500;
    const start = performance.now();
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      setLoading(false);
    };
    const schedule = () => {
      const restante = MIN_MS - (performance.now() - start);
      setTimeout(hide, Math.max(0, restante));
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    const force = setTimeout(hide, MAX_MS);
    return () => {
      clearTimeout(force);
      window.removeEventListener('load', schedule);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col paper">
      {loading && <LoadingScreen />}
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabina"
            element={
              <ProtectedRoute roles={['admin', 'presentador']}>
                <PresenterPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="wood-panel border-t-4 border-ink mt-10">
        <div className="max-w-6xl mx-auto px-4 py-5 text-center text-parchment text-sm">
          <p className="font-display text-lg">Rancho Criadero La Kamelia</p>
          <p className="text-spot text-xs uppercase tracking-[0.25em] font-bold">
            Programa radial La Kamelia · Orgullosamente colombiano
          </p>
        </div>
      </footer>
    </div>
  );
}
