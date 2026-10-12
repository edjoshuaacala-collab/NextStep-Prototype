const BASE = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('nextstep_token');
export const setToken = (t) => (t ? localStorage.setItem('nextstep_token', t) : localStorage.removeItem('nextstep_token'));

export async function api(path, { method = 'GET', body, params } = {}) {
  const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString() : '';
  const res = await fetch(`${BASE}${path}${qs}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    if (res.status === 401 && getToken()) { setToken(null); window.dispatchEvent(new Event('nextstep:logout')); }
    const first = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
    const err = new Error(first || data?.message || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.errors = data?.errors || {};
    throw err;
  }
  return data;
}
