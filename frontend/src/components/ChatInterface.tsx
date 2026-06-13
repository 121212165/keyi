'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import Sidebar from './sidebar/Sidebar';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';

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

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '你好，我是林序，一个温暖、专业、有同理心的AI心理医生。\n\n在这里，你可以畅所欲言，我会用心倾听、陪伴和支持你。\n\n今天有什么想聊的吗？',
  timestamp: '2026-01-01T00:00:00.000Z',
};

const THERAPY_MODES = [
  { id: 'general', name: '自由对话' },
  { id: 'cbt', name: 'CBT认知疗法' },
  { id: 'desensitize', name: '系统脱敏' },
];

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ChatInterface() {
  const {
    user, token, logout,
    sessions, currentSessionId, messages,
    setSessions, setCurrentSession, addSession, removeSession,
    setMessages, addMessage, clearMessages,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [therapyMode, setTherapyMode] = useState('general');

  useEffect(() => {
    if (token) loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (messages.length === 0 && !currentSessionId) {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [setMessages, messages.length, currentSessionId]);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/v1/chat/sessions', { headers: authHeaders(token) });
      const data = await res.json();
      const sessionsData = data?.sessions || data;
      if (Array.isArray(sessionsData)) setSessions(sessionsData);
    } catch (err) {
      console.error('加载会话列表失败:', err);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/chat/sessions/${sessionId}/history`);
      const data = await res.json();
      const messagesData = data?.messages || data;
      if (Array.isArray(messagesData)) setMessages(messagesData);
    } catch (err) {
      console.error('加载历史消息失败:', err);
    }
  };

  const handleCreateSession = async () => {
    if (isCreatingSession) return;
    setIsCreatingSession(true);
    try {
      const res = await fetch('/api/v1/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ therapy_mode: therapyMode }),
      });
      const data = await res.json();
      if (data && data.id) {
        const newSession: Session = {
          id: data.id,
          title: '新对话',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 0,
        };
        addSession(newSession);
        setCurrentSession(newSession.id);
        clearMessages();
        setMessages([WELCOME_MESSAGE]);
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
      await fetch(`/api/v1/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      removeSession(sessionId);
      if (currentSessionId === sessionId) {
        clearMessages();
        setCurrentSession(null);
      }
    } catch (err) {
      console.error('删除会话失败:', err);
    }
  };

  const handleSend = async (content: string) => {
    if (!currentSessionId) {
      await handleCreateSession();
      await new Promise(r => setTimeout(r, 100));
    }

    const userMsgId = `temp-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    addMessage({ id: userMsgId, role: 'user', content, timestamp: new Date().toISOString() });
    addMessage({ id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date().toISOString() });
    setLoading(true);

    try {
      const sid = currentSessionId || useStore.getState().currentSessionId;
      if (!sid) throw new Error('No session');

      const response = await fetch(`/api/v1/chat/sessions/${sid}/messages/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullReply = '';
      let rafId = 0;

      const flushUI = () => {
        const currentMessages = useStore.getState().messages;
        setMessages(currentMessages.map(m => m.id === assistantMsgId ? { ...m, content: fullReply } : m));
        rafId = 0;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'delta' && data.text) {
                fullReply += data.text;
                if (!rafId) rafId = requestAnimationFrame(flushUI);
              }
            } catch { /* skip */ }
          }
        }
      }

      if (rafId) cancelAnimationFrame(rafId);
      flushUI();
      loadSessions();
    } catch {
      const msgs = useStore.getState().messages.map(m =>
        m.id === assistantMsgId ? { ...m, content: '抱歉，我遇到了一些问题。请稍后再试。' } : m
      );
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); window.location.reload(); };

  const sidebarProps = {
    sessions, currentSessionId, isCreatingSession,
    onCreateSession: handleCreateSession,
    onSelectSession: handleSelectSession,
    onDeleteSession: handleDeleteSession,
    user, onLogout: handleLogout,
  };

  return (
    <div className="flex h-screen" style={{ background: '#fbf6ee' }}>
      {sidebarOpen && (
        <div className="drawer-overlay active md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="md:hidden" style={{ position: 'fixed', inset: '0', pointerEvents: sidebarOpen ? 'auto' : 'none', zIndex: 50 }}>
        <div
          style={{
            position: 'absolute', inset: '0', left: 'auto', width: '280px',
            background: '#f8f3ea', borderRight: '1px solid #ded2c3',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 300ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <Sidebar {...sidebarProps} isMobileDrawer onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      <Sidebar {...sidebarProps} />

      <main className="flex-1 flex flex-col min-w-0" style={{ background: '#fbf6ee' }}>
        <div className="md:hidden flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #ded2c3' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 transition"
            style={{ background: 'transparent', border: 'none', color: '#4c4037' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '1.1rem', color: '#2f5b4f' }}>林序</span>
          <span className="text-xs" style={{ color: '#7a6d63' }}>
            {THERAPY_MODES.find(m => m.id === therapyMode)?.name}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-0 px-4 pt-3 pb-0" style={{ maxWidth: 'var(--chat-max-width)', margin: '0 auto', width: '100%' }}>
          {THERAPY_MODES.map((mode) => {
            const isActive = therapyMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setTherapyMode(mode.id)}
                className="relative px-4 py-2 text-sm transition"
                style={{
                  color: isActive ? '#2f5b4f' : '#7a6d63',
                  fontWeight: isActive ? 500 : 400,
                  background: 'transparent',
                  border: 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#4c4037'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#7a6d63'; }}
              >
                {mode.name}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '16px', right: '16px', height: '3px', background: '#2f5b4f', borderRadius: '2px 2px 0 0' }} />
                )}
              </button>
            );
          })}
        </div>

        <MessageList messages={messages} loading={loading} />

        <ChatInput onSend={handleSend} loading={loading} />
      </main>
    </div>
  );
}
