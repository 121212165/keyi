const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = {
  baseUrl: API_BASE_URL,

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
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
  },

  chat: {
    async createSession() {
      return this.request('/api/chat/sessions', {
        method: 'POST',
      })
    },

    async sendMessage(sessionId: string, message: string) {
      return this.request(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message, session_id: sessionId }),
      })
    },

    async getHistory(sessionId: string) {
      return this.request(`/api/chat/sessions/${sessionId}/history`)
    },
  },

  health: {
    async check() {
      return this.request('/api/health')
    },
  },
}
