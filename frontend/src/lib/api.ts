import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/api/v1/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),

  logout: () => api.post('/api/v1/auth/logout'),

  me: (token: string) =>
    api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const chatAPI = {
  createSession: (token?: string) =>
    api.post(
      '/api/v1/chat/sessions',
      {},
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    ),

  listSessions: (token?: string) =>
    api.get('/api/v1/chat/sessions', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  sendMessage: (sessionId: string, message: string, token?: string) =>
    api.post(
      `/api/v1/chat/sessions/${sessionId}/messages`,
      { message },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    ),

  getHistory: (sessionId: string, limit = 50) =>
    api.get(`/api/v1/chat/sessions/${sessionId}/history?limit=${limit}`),

  deleteSession: (sessionId: string, token?: string) =>
    api.delete(`/api/v1/chat/sessions/${sessionId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  chat: (message: string, token?: string) =>
    api.post(
      '/api/v1/ai/chat',
      { message },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    ),
};

export default api;
