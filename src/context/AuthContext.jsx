import { createContext, useContext, useMemo, useState } from 'react';
import { api, clearSession, getStoredUser, setSession } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isPresenter: user?.role === 'presentador',
      async login(username, password) {
        const data = await api.login(username, password);
        setSession(data.token, data.user);
        setUser(data.user);
        return data.user;
      },
      logout() {
        clearSession();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
