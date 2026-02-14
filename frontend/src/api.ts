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
    async createSession() {
      return request('/api/v1/chat/sessions', {
        method: 'POST',
      })
    },

    async sendMessage(sessionId: string, message: string) {
      return request(`/api/v1/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
    },

    async getHistory(sessionId: string) {
      return request(`/api/v1/chat/sessions/${sessionId}/history`)
    },
  },

  health: {
    async check() {
      return request('/api/health')
    },
  },

  assessment: {
    async getScale(scaleType: string) {
      return request(`/api/v1/assessments/scales/${scaleType}`)
    },
  },
}
