import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (getToken()) {
      api('/me').then((d) => setUser(d.user)).catch(() => setToken(null)).finally(() => setLoading(false));
    }
    const onLogout = () => setUser(null);
    window.addEventListener('nextstep:logout', onLogout);
    return () => window.removeEventListener('nextstep:logout', onLogout);
  }, []);

  const finish = (d) => { setToken(d.token); setUser(d.user); };
  const login = async (email, password) => finish(await api('/login', { method: 'POST', body: { email, password } }));
  const register = async (form) => finish(await api('/register', { method: 'POST', body: form }));
  const logout = async () => { try { await api('/logout', { method: 'POST' }); } catch { /* ignore */ } setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
