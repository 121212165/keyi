/**
 * API 客户端 —— 原生 fetch 实现（无 axios 依赖）
 * 只保留前端真正会调的四个方法；流式对话由 ChatInterface 直接 fetch `/messages/stream`，
 * 因为那里需要逐 delta 更新气泡。
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

/** 服务端信封形状不一（有的返回对象、有的返回裸数组），调用侧靠 Array.isArray 收敛。 */
export interface ResponseData {
  [key: string]: unknown;
  id?: string;
  therapy_mode?: string;
  sessions?: unknown;
  messages?: unknown;
  error?: string;
  detail?: string;
}

async function request(path: string, options: RequestOptions = {}): Promise<{ data: ResponseData }> {
  const { method = 'GET', body, token } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as ResponseData;

  if (!res.ok) {
    const message = data.error || data.detail || `请求失败 (HTTP ${res.status})`;
    const err = new Error(message) as Error & { response?: { status: number } };
    err.response = { status: res.status };
    throw err;
  }

  return { data };
}

export const chatAPI = {
  createSession: (token?: string, therapyMode?: string) =>
    request('/api/v1/chat/sessions', {
      method: 'POST',
      body: { therapy_mode: therapyMode },
      token,
    }),

  listSessions: (token?: string) =>
    request('/api/v1/chat/sessions', { token }),

  getHistory: (sessionId: string, limit = 50, token?: string) =>
    request(`/api/v1/chat/sessions/${sessionId}/history?limit=${limit}`, { token }),

  deleteSession: (sessionId: string, token?: string) =>
    request(`/api/v1/chat/sessions/${sessionId}`, { method: 'DELETE', token }),
};
