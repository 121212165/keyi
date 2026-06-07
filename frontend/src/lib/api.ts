import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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
  createSession: (token?: string, therapyMode?: string) =>
    api.post(
      '/api/v1/chat/sessions',
      { therapy_mode: therapyMode },
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

  sendMessageStream: async function* (
    sessionId: string,
    message: string,
    token?: string
  ) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(
      `${API_URL}/api/v1/chat/sessions/${sessionId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error('Stream request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch {
            // skip malformed data
          }
        }
      }
    }
  },
};

export default api;
