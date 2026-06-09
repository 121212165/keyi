'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { chatAPI } from '@/lib/api';
import Sidebar from './sidebar/Sidebar';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import TherapyModeSelector from './therapy/TherapyModeSelector';
import CognitiveTriadForm from './therapy/CognitiveTriadForm';
import DesensitizePanel from './therapy/DesensitizePanel';

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
  timestamp: new Date().toISOString(),
};

export default function ChatInterface() {
  const {
    user, token, logout,
    sessions, currentSessionId, messages,
    setSessions, setCurrentSession, addSession, removeSession,
    setMessages, addMessage, clearMessages,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [therapyMode, setTherapyMode] = useState('general');
  const [showTriadForm, setShowTriadForm] = useState(false);
  const [showDesensitizePanel, setShowDesensitizePanel] = useState(false);

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
      const res = await chatAPI.listSessions(token ?? undefined);
      const sessionsData = res.data?.sessions || res.data;
      if (Array.isArray(sessionsData)) setSessions(sessionsData);
    } catch (err) {
      console.error('加载会话列表失败:', err);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const res = await chatAPI.getHistory(sessionId);
      const messagesData = res.data?.messages || res.data;
      if (Array.isArray(messagesData)) setMessages(messagesData);
    } catch (err) {
      console.error('加载历史消息失败:', err);
    }
  };

  const handleCreateSession = async () => {
    if (isCreatingSession) return;
    setIsCreatingSession(true);
    try {
      const res = await chatAPI.createSession(token ?? undefined, therapyMode);
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
      await chatAPI.deleteSession(sessionId, token ?? undefined);
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
      // Wait a tick for state to update
      await new Promise(r => setTimeout(r, 100));
    }

    const userMsgId = `temp-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    addMessage({
      id: userMsgId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    });

    // Add placeholder assistant message
    addMessage({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    });

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const sid = currentSessionId || useStore.getState().currentSessionId;
      if (!sid) throw new Error('No session');

      const response = await fetch(`${API_URL}/api/v1/chat/sessions/${sid}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullReply = '';

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
                const currentMessages = useStore.getState().messages;
                setMessages(
                  currentMessages.map(m =>
                    m.id === assistantMsgId ? { ...m, content: fullReply } : m
                  )
                );
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      // Final update
      loadSessions();
    } catch {
      // Replace placeholder with error
      const msgs = useStore.getState().messages.map(m =>
        m.id === assistantMsgId
          ? { ...m, content: '抱歉，我遇到了一些问题。请稍后再试。' }
          : m
      );
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="flex h-screen">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-10 p-2 transition"
        style={{ background: "#fffdf8", borderRadius: "10px", boxShadow: "0 4px 24px rgba(32,25,20,0.08)", border: "1px solid #ded2c3" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1e3cf"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#fffdf8"; }}
      >
        <svg className="w-5 h-5" fill="none" stroke="#4c4037" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {sidebarOpen && (
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          isCreatingSession={isCreatingSession}
          onCreateSession={handleCreateSession}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 flex flex-col" style={{ background: "#fbf6ee" }}>
        <TherapyModeSelector selectedMode={therapyMode} onSelect={setTherapyMode} />
        {showTriadForm && therapyMode === 'cbt' && (
          <CognitiveTriadForm
            onSubmit={(data) => {
              handleSend(`[认知三角记录]\n想法：${data.thought}\n感受：${data.feeling}\n行为：${data.behavior}`);
              setShowTriadForm(false);
            }}
            onClose={() => setShowTriadForm(false)}
          />
        )}
        {showDesensitizePanel && therapyMode === 'desensitize' && (
          <DesensitizePanel
            onSubmit={(message) => {
              handleSend(message);
              setShowDesensitizePanel(false);
            }}
            onClose={() => setShowDesensitizePanel(false)}
          />
        )}
        <MessageList messages={messages} loading={loading} />
        {therapyMode === 'cbt' && (
          <div className="px-4 py-1 flex justify-center">
            <button
              onClick={() => setShowTriadForm(!showTriadForm)}
              className="text-xs px-3 py-1 transition"
              style={{ color: "#2f5b4f", borderRadius: "9999px", border: "1px solid rgba(47,91,79,0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(47,91,79,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              记录认知三角
            </button>
          </div>
        )}
        {therapyMode === 'desensitize' && (
          <div className="px-4 py-1 flex justify-center">
            <button
              onClick={() => setShowDesensitizePanel(!showDesensitizePanel)}
              className="text-xs px-3 py-1 transition"
              style={{ color: "#2f5b4f", borderRadius: "9999px", border: "1px solid rgba(47,91,79,0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(47,91,79,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              脱敏训练面板
            </button>
          </div>
        )}
        <ChatInput onSend={handleSend} loading={loading} />
      </main>
    </div>
  );
}
