import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Chat history keys look like "nextstep-chat-messages:<userId>".
export const CHAT_STORAGE_PREFIX = 'nextstep-chat-messages';

// Remove every saved chat (all accounts, plus the old shared key) so the
// next person on this browser starts with a clean assistant.
function clearChatHistory() {
  try {
    Object.keys(localStorage)
      .filter((k) => k === CHAT_STORAGE_PREFIX || k.startsWith(`${CHAT_STORAGE_PREFIX}:`))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* storage unavailable */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (getToken()) {
      api('/me').then((d) => setUser(d.user)).catch(() => setToken(null)).finally(() => setLoading(false));
    }
    // Drop the old shared chat key left over from before history was per account.
    try { localStorage.removeItem(CHAT_STORAGE_PREFIX); } catch { /* storage unavailable */ }
    const onLogout = () => { clearChatHistory(); setUser(null); };
    window.addEventListener('nextstep:logout', onLogout);
    return () => window.removeEventListener('nextstep:logout', onLogout);
  }, []);

  const finish = (d) => { setToken(d.token); setUser(d.user); };
  const login = async (email, password, role) => finish(await api('/login', { method: 'POST', body: { email, password, ...(role ? { role } : {}) } }));
  // Partner sign-ups come back { pending: true, message } with no token, so we
  // return the response and only log in when a token is present.
  const register = async (form) => {
    const d = await api('/register', { method: 'POST', body: form });
    if (d?.token) finish(d);
    return d;
  };
  const logout = async () => { try { await api('/logout', { method: 'POST' }); } catch { /* ignore */ } clearChatHistory(); setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
