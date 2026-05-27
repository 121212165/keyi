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
  content: '你好，我是可意，一个温暖、专业、有同理心的AI心理医生。\n\n在这里，你可以畅所欲言，我会用心倾听、陪伴和支持你。\n\n今天有什么想聊的吗？',
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
      if (res.data && Array.isArray(res.data)) setSessions(res.data);
    } catch (err) {
      console.error('加载会话列表失败:', err);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const res = await chatAPI.getHistory(sessionId);
      if (res.data && Array.isArray(res.data)) setMessages(res.data);
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
    if (!currentSessionId) await handleCreateSession();

    addMessage({
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    });
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: content, session_id: currentSessionId }),
      });
      const data = await response.json();

      if (response.ok) {
        addMessage({
          id: data.message_id || `msg-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: data.timestamp || new Date().toISOString(),
        });
        loadSessions();
      } else {
        throw new Error(data.detail || '请求失败');
      }
    } catch {
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

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="flex h-screen">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <main className="flex-1 flex flex-col">
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
              className="text-xs text-primary-600 hover:text-primary-700 px-3 py-1 rounded-full border border-primary-200 hover:bg-primary-50 transition"
            >
              🧠 记录认知三角
            </button>
          </div>
        )}
        {therapyMode === 'desensitize' && (
          <div className="px-4 py-1 flex justify-center">
            <button
              onClick={() => setShowDesensitizePanel(!showDesensitizePanel)}
              className="text-xs text-primary-600 hover:text-primary-700 px-3 py-1 rounded-full border border-primary-200 hover:bg-primary-50 transition"
            >
              🌊 脱敏训练面板
            </button>
          </div>
        )}
        <ChatInput onSend={handleSend} loading={loading} />
      </main>
    </div>
  );
}
