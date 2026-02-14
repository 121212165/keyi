// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || '/api'

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

export const api = {
  baseUrl: API_BASE_URL,

  chat: {
    // 创建会话: POST /chat?action=create
    async createSession() {
      return request('/chat?action=create', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    },

    // 发送消息: POST /chat?session_id=xxx
    async sendMessage(sessionId: string, message: string) {
      return request(`/chat?session_id=${sessionId}`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
    },

    // 获取历史: GET /chat?session_id=xxx&action=history
    async getHistory(sessionId: string) {
      return request(`/chat?session_id=${sessionId}&action=history`)
    },
  },

  health: {
    async check() {
      return request('/chat?action=health')
    },
  },
}
