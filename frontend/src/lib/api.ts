/**
 * API 客户端 —— 原生 fetch 实现（无 axios 依赖）
 * 导出签名与历史 axios 版兼容：返回 { data }，错误带 .response.status
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<{ data: T }> {
  const { method = 'GET', body, token } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const message =
      (data.error as string) || (data.detail as string) || `请求失败 (HTTP ${res.status})`;
    const err = new Error(message) as Error & { response?: { status: number } };
    err.response = { status: res.status };
    throw err;
  }

  return { data: data as T };
}

export const authAPI = {
  register: (email: string, password: string) =>
    request('/api/v1/auth/register', { method: 'POST', body: { email, password } }),

  login: (email: string, password: string) =>
    request('/api/v1/auth/login', { method: 'POST', body: { email, password } }),

  logout: () => request('/api/v1/auth/logout', { method: 'POST' }),

  me: (token: string) =>
    request('/api/v1/auth/me', { token }),
};

export const chatAPI = {
  createSession: (token?: string, therapyMode?: string) =>
    request('/api/v1/chat/sessions', {
      method: 'POST',
      body: { therapy_mode: therapyMode },
      token,
    }),

  listSessions: (token?: string) =>
    request('/api/v1/chat/sessions', { token }),

  sendMessage: (sessionId: string, message: string, token?: string) =>
    request(`/api/v1/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: { message },
      token,
    }),

  getHistory: (sessionId: string, limit = 50, token?: string) =>
    request(`/api/v1/chat/sessions/${sessionId}/history?limit=${limit}`, { token }),

  deleteSession: (sessionId: string, token?: string) =>
    request(`/api/v1/chat/sessions/${sessionId}`, { method: 'DELETE', token }),

  chat: (message: string, token?: string) =>
    request('/api/v1/ai/chat', { method: 'POST', body: { message }, token }),

  sendMessageStream: async function* (
    sessionId: string,
    message: string,
    token?: string
  ) {
    const response = await fetch(
      `${API_BASE}/api/v1/chat/sessions/${sessionId}/messages/stream`,
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

export default { request };
