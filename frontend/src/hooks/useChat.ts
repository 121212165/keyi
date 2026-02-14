import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import {
  setSessionId,
  setMessages,
  addMessage,
  setLoading,
  setSending,
  setError,
  clearChat,
  Message,
} from '../store/slices/chatSlice'
import { api } from '../api'

export function useChat() {
  const dispatch = useDispatch<AppDispatch>()
  const { sessionId, messages, loading, sending, error } = useSelector(
    (state: RootState) => state.chat
  )

  const initializeSession = useCallback(async () => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const response = await api.chat.createSession()
      dispatch(setSessionId(response.session_id))

      // 添加欢迎消息
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: '你好，我是可意，你的AI心理陪伴助手。很高兴你来到这里。无论你现在想倾诉什么，或者只是想找人说说话，我都在。今天想聊些什么呢？',
        timestamp: new Date(),
      }
      dispatch(setMessages([welcomeMessage]))
    } catch (err) {
      dispatch(setError('初始化会话失败'))
      throw err
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) {
        throw new Error('会话未初始化')
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      }

      dispatch(setSending(true))
      dispatch(setError(null))

      try {
        const data = await api.chat.sendMessage(sessionId, content)

        // 危机预警
        if (data.alert_level) {
          return { type: 'alert', content: data.response }
        }

        // 正常回复
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }

        dispatch(addMessage(userMessage))
        dispatch(addMessage(assistantMessage))

        return { type: 'message', content: data.response }
      } catch (err) {
        dispatch(setError('发送消息失败'))
        throw err
      } finally {
        dispatch(setSending(false))
      }
    },
    [dispatch, sessionId]
  )

  const loadHistory = useCallback(
    async (sid?: string) => {
      const id = sid || sessionId
      if (!id) return

      try {
        const data = await api.chat.getHistory(id)
        const formattedMessages: Message[] = data.messages.map(
          (msg: { role: string; content: string; timestamp: string }, idx: number) => ({
            id: idx.toString(),
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          })
        )
        dispatch(setMessages(formattedMessages))
      } catch (err) {
        console.error('加载历史失败:', err)
      }
    },
    [dispatch, sessionId]
  )

  const resetChat = useCallback(() => {
    dispatch(clearChat())
  }, [dispatch])

  return {
    sessionId,
    messages,
    loading,
    sending,
    error,
    initializeSession,
    sendMessage,
    loadHistory,
    resetChat,
  }
}
