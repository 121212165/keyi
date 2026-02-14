import { describe, it, expect } from 'vitest'
import chatReducer, {
  setSessionId,
  setMessages,
  addMessage,
  setLoading,
  setSending,
  setError,
  clearChat,
  Message,
} from './chatSlice'

describe('chatSlice', () => {
  const initialState = {
    sessionId: '',
    messages: [],
    loading: false,
    sending: false,
    error: null,
  }

  it('should return initial state', () => {
    expect(chatReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should set sessionId', () => {
    const state = chatReducer(initialState, setSessionId('test-session-123'))
    expect(state.sessionId).toBe('test-session-123')
  })

  it('should set messages', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
    ]
    const state = chatReducer(initialState, setMessages(messages))
    expect(state.messages).toEqual(messages)
    expect(state.messages.length).toBe(1)
  })

  it('should add message', () => {
    const message: Message = {
      id: '2',
      role: 'assistant',
      content: 'Hi there!',
      timestamp: new Date(),
    }
    const state = chatReducer(initialState, addMessage(message))
    expect(state.messages.length).toBe(1)
    expect(state.messages[0]).toEqual(message)
  })

  it('should set loading', () => {
    expect(chatReducer(initialState, setLoading(true)).loading).toBe(true)
    expect(chatReducer(initialState, setLoading(false)).loading).toBe(false)
  })

  it('should set sending', () => {
    expect(chatReducer(initialState, setSending(true)).sending).toBe(true)
    expect(chatReducer(initialState, setSending(false)).sending).toBe(false)
  })

  it('should set error', () => {
    expect(chatReducer(initialState, setError('Network error')).error).toBe('Network error')
    expect(chatReducer(initialState, setError(null)).error).toBeNull()
  })

  it('should clear chat', () => {
    const stateWithData = {
      ...initialState,
      sessionId: 'test-session',
      messages: [{ id: '1', role: 'user' as const, content: 'Hi', timestamp: new Date() }],
    }
    const cleared = chatReducer(stateWithData, clearChat())
    expect(cleared.sessionId).toBe('')
    expect(cleared.messages).toEqual([])
    expect(cleared.error).toBeNull()
  })
})
