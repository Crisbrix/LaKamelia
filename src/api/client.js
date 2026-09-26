const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('kamelia_token');
}

export function setSession(token, user) {
  if (token) localStorage.setItem('kamelia_token', token);
  if (user) localStorage.setItem('kamelia_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('kamelia_token');
  localStorage.removeItem('kamelia_user');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('kamelia_user') || 'null');
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  health: () => request('/health'),

  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me', { auth: true }),

  createMessage: (payload) => request('/messages', { method: 'POST', body: payload }),
  recentPublic: () => request('/messages/public/recent'),

  listMessages: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ).toString();
    return request(`/messages${query ? `?${query}` : ''}`, { auth: true });
  },

  stats: () => request('/messages/stats', { auth: true }),
  setPriority: (id, priority) =>
    request(`/messages/${id}/priority`, { method: 'PATCH', auth: true, body: { priority } }),
  setStatus: (id, status) =>
    request(`/messages/${id}/status`, { method: 'PATCH', auth: true, body: { status } }),
  markAsRead: (id) => request(`/messages/${id}/read`, { method: 'PATCH', auth: true }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE', auth: true }),

  listUsers: () => request('/users', { auth: true }),
  createUser: (payload) => request('/users', { method: 'POST', auth: true, body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PATCH', auth: true, body: payload }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE', auth: true }),
};
