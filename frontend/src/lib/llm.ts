import { ApiError } from '@/lib/api'

interface ChatMessage { role: string; content: string }

function endpoint(base: string): string {
  return `${base.replace(/\/$/, '').replace(/\/v1$/, '')}/v1/messages`
}

export async function requestLlm(system: string, messages: ChatMessage[], stream: boolean): Promise<Response> {
  const base = process.env.LLM_BASE_URL
  const key = process.env.LLM_API_KEY
  if (!base || !key) throw new ApiError(500, 'llm_not_configured', 'AI 服务未配置')
  const send = () => fetch(endpoint(base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514', max_tokens: 2048, system, messages, stream }),
  })
  let response = await send()
  if (!response.ok && [429, 500, 502, 503].includes(response.status)) response = await send()
  if (!response.ok) {
    console.error('LLM request failed', response.status, await response.text().catch(() => ''))
    throw new ApiError(502, 'llm_unavailable', 'AI 服务暂时不可用，请稍后重试')
  }
  return response
}

export async function completionText(response: Response): Promise<string> {
  const data = await response.json()
  return data.content?.map((item: { text?: string }) => item.text ?? '').join('') ?? ''
}

export async function* textDeltas(response: Response): AsyncGenerator<string> {
  if (!response.body) throw new ApiError(502, 'llm_empty_stream', 'AI 服务没有返回内容')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (!raw || raw === '[DONE]') continue
      try {
        const event = JSON.parse(raw)
        if (event.type === 'content_block_delta' && event.delta?.text) yield event.delta.text
      } catch { }
    }
  }
}

export function sseJson(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}
