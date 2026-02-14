'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { chatAPI } from '@/lib/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Session {
  id: string;
  title: string;
  started_at: string;
  updated_at?: string;
  message_count: number;
}

export default function ChatInterface() {
  const {
    user,
    token,
    logout,
    sessions,
    currentSessionId,
    messages,
    setSessions,
    setCurrentSession,
    addSession,
    removeSession,
    setMessages,
    addMessage,
    clearMessages,
  } = useStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 加载会话列表
  useEffect(() => {
    if (token) {
      loadSessions();
    }
  }, [token]);

  // 初始欢迎语
  useEffect(() => {
    if (messages.length === 0 && !currentSessionId) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: '你好，我是可意，一个温暖、专业、有同理心的AI心理医生。\n\n在这里，你可以畅所欲言，我会用心倾听、陪伴和支持你。\n\n今天有什么想聊的吗？',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [setMessages, messages.length, currentSessionId]);

  const loadSessions = async () => {
    try {
      const res = await chatAPI.listSessions(token);
      if (res.data && Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error('加载会话列表失败:', err);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const res = await chatAPI.getHistory(sessionId);
      if (res.data && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('加载历史消息失败:', err);
    }
  };

  const handleCreateSession = async () => {
    if (isCreatingSession) return;
    setIsCreatingSession(true);

    try {
      const res = await chatAPI.createSession(token);
      if (res.data && res.data.id) {
        const newSession: Session = {
          id: res.data.id,
          title: '新对话',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 0,
        };
        addSession(newSession);
        setCurrentSession(newSession.id);
        clearMessages();
        // 添加欢迎语
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: '你好，我是可意，一个温暖、专业、有同理心的AI心理医生。\n\n在这里，你可以畅所欲言，我会用心倾听、陪伴和支持你。\n\n今天有什么想聊的吗？',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('创建会话失败:', err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    loadSessionHistory(sessionId);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个对话吗？')) return;

    try {
      await chatAPI.deleteSession(sessionId, token);
      removeSession(sessionId);
      if (currentSessionId === sessionId) {
        clearMessages();
        setCurrentSession(null);
      }
    } catch (err) {
      console.error('删除会话失败:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // 如果没有当前会话，先创建
    if (!currentSessionId) {
      await handleCreateSession();
    }

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${API_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: currentSessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: data.message_id || `msg-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        addMessage(assistantMessage);

        // 刷新会话列表
        loadSessions();
      } else {
        throw new Error(data.detail || '请求失败');
      }
    } catch (err: any) {
      addMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const getSessionTitle = (session: Session) => {
    // 使用会话标题，如果为空则显示默认文本
    if (session.title && session.title !== '新对话') {
      return session.title.length > 15 ? session.title.substring(0, 15) + '...' : session.title;
    }
    return '新的对话';
  };

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-primary-600">可意</h1>
          <p className="text-sm text-gray-500">AI心理助手</p>
        </div>

        <button
          onClick={handleCreateSession}
          disabled={isCreatingSession}
          className="mx-4 mt-4 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm disabled:opacity-50"
        >
          {isCreatingSession ? '创建中...' : '+ 新对话'}
        </button>

        <div className="flex-1 overflow-y-auto p-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">暂无历史记录</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`p-3 rounded-lg cursor-pointer transition group ${
                    currentSessionId === session.id
                      ? 'bg-primary-100 border border-primary-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-700 font-medium truncate flex-1">
                      {getSessionTitle(session)}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {dayjs(session.updated_at || session.started_at).fromNow()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate max-w-[120px]">{user.email}</span>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
                退出
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
              退出登录
            </button>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 侧边栏切换按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-16">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'
                }`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.content}
                <div className="text-xs opacity-70 mt-1 text-right">
                  {dayjs(msg.timestamp).format('HH:mm')}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="在这里输入你想说的话..."
                className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                rows={2}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50 self-end"
              >
                发送
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
