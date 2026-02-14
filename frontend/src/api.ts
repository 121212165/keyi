// API 配置
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '/api/v1') as string

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface SendMessageResponse {
  response: string
  alert_level?: string
}

interface EmotionResult {
  primary_emotion: string
  secondary_emotions: string[]
  intensity: string
  confidence: number
}

interface AssessmentScale {
  scale_type: string
  name: string
  description: string
  questions: Array<{
    id: number
    text: string
  }>
}

interface AssessmentResult {
  score: number
  level: string
  description: string
  recommendations: string[]
}

interface Suggestion {
  type: string
  content: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

export const api = {
  baseUrl: API_BASE_URL,

  // 聊天 API
  chat: {
    async createSession(): Promise<{ session_id: string }> {
      return request('/chat/sessions', {
        method: 'POST',
      })
    },

    async sendMessage(
      sessionId: string,
      message: string
    ): Promise<SendMessageResponse> {
      return request(`/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
    },

    async getHistory(sessionId: string): Promise<{ messages: ChatMessage[] }> {
      return request(`/chat/sessions/${sessionId}/history`)
    },
  },

  // 情绪分析 API
  emotion: {
    async analyze(text: string): Promise<EmotionResult> {
      return request('/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
    },
  },

  // 心理评估 API
  assessment: {
    async getScale(
      scaleType: 'phq9' | 'gad7' | 'pss10'
    ): Promise<AssessmentScale> {
      return request(`/assessments/scales/${scaleType}`)
    },

    async submit(
      scaleType: 'phq9' | 'gad7' | 'pss10',
      answers: number[]
    ): Promise<AssessmentResult> {
      return request('/assessments/submissions', {
        method: 'POST',
        body: JSON.stringify({ scale_type: scaleType, answers }),
      })
    },
  },

  // 建议生成 API
  suggestion: {
    async generate(
      emotion: string,
      intensity: string
    ): Promise<{ suggestions: Suggestion[] }> {
      return request('/suggestions/generate', {
        method: 'POST',
        body: JSON.stringify({ emotion, intensity }),
      })
    },
  },

  // 健康检查
  health: {
    async check(): Promise<{ status: string }> {
      return request('/health')
    },
  },
}
