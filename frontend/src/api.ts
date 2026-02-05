const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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
      return this.request('/api/v1/chat/sessions', {
        method: 'POST',
      })
    },

    async sendMessage(sessionId: string, message: string) {
      return this.request(`/api/v1/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
    },

    async getHistory(sessionId: string) {
      return this.request(`/api/v1/chat/sessions/${sessionId}/history`)
    },
  },

  emotion: {
    async analyze(text: string) {
      return this.request('/api/v1/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
    },
  },

  assessment: {
    async getScale(scaleType: string) {
      return this.request(`/api/v1/assessments/scales/${scaleType}`)
    },

    async submitAssessment(scaleType: string, answers: number[]) {
      return this.request('/api/v1/assessments/submissions', {
        method: 'POST',
        body: JSON.stringify({
          scale_type: scaleType,
          answers,
        }),
      })
    },
  },

  suggestion: {
    async generate(emotion: string, intensity: string) {
      return this.request('/api/v1/suggestions/generate', {
        method: 'POST',
        body: JSON.stringify({
          emotion,
          intensity,
        }),
      })
    },
  },

  alert: {
    async getResources(alertType: string) {
      return this.request(`/api/v1/alerts/resources?alert_type=${alertType}`)
    },

    async trigger(message: string) {
      return this.request('/api/v1/alerts/trigger', {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
    },
  },
}