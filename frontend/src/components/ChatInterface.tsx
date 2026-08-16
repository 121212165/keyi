'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { chatAPI } from '@/lib/api';
import { getTherapyMode } from '@/lib/therapy-modes';
import Sidebar from './sidebar/Sidebar';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import TherapyModeSelector from './therapy/TherapyModeSelector';
import CognitiveTriadForm from './therapy/CognitiveTriadForm';
import DesensitizePanel from './therapy/DesensitizePanel';
import SleepLogPanel from './therapy/SleepLogPanel';

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
  therapy_mode?: string;
}

function makeWelcome(mode: string): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    content: getTherapyMode(mode).welcome,
    timestamp: '2026-01-01T00:00:00.000Z',
  };
}

export default function ChatInterface({ initialMode = 'general' }: { initialMode?: string }) {
  const {
    user, token, logout,
    sessions, currentSessionId, messages,
    setSessions, setCurrentSession, addSession, removeSession,
    setMessages, addMessage, clearMessages,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [therapyMode, setTherapyMode] = useState(initialMode);
  const [showTriadForm, setShowTriadForm] = useState(false);
  const [showDesensitizePanel, setShowDesensitizePanel] = useState(false);
  const [showSleepPanel, setShowSleepPanel] = useState(false);

  const currentMode = getTherapyMode(therapyMode);

  useEffect(() => {
    if (token) loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (messages.length === 0 && !currentSessionId) {
      setMessages([makeWelcome(therapyMode)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const res = await chatAPI.getHistory(sessionId, 50, token ?? undefined);
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
          therapy_mode: res.data.therapy_mode ?? therapyMode,
        };
        addSession(newSession);
        setCurrentSession(newSession.id);
        clearMessages();
        setMessages([makeWelcome(therapyMode)]);
      }
    } catch (err) {
      console.error('创建会话失败:', err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const selectedSession = sessions.find((session) => session.id === sessionId);
    if (selectedSession?.therapy_mode) {
      setTherapyMode(selectedSession.therapy_mode);
    }
    setCurrentSession(sessionId);
    loadSessionHistory(sessionId);
  };

  const handleSelectMode = (mode: string) => {
    if (mode === therapyMode) return;
    setTherapyMode(mode);
    // 模式切换 = 进入对应模式的会话；若当前会话不是该模式，则视为新会话
    const cur = sessions.find((s) => s.id === currentSessionId);
    if (cur && cur.therapy_mode !== mode) {
      setCurrentSession(null);
      setMessages([makeWelcome(mode)]);
    } else if (!cur) {
      setMessages([makeWelcome(mode)]);
    }
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
    // 串模式防护：无当前会话，或当前会话模式与所选模式不同 → 新建该模式会话
    const state = useStore.getState();
    const cur = state.sessions.find((s) => s.id === state.currentSessionId);
    if (!cur || cur.therapy_mode !== therapyMode) {
      await handleCreateSession();
      await new Promise(r => setTimeout(r, 100));
    }

    const userMsgId = `temp-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    addMessage({ id: userMsgId, role: 'user', content, timestamp: new Date().toISOString() });
    addMessage({ id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date().toISOString() });
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const sid = useStore.getState().currentSessionId;
      if (!sid) throw new Error('No session');

      const response = await fetch(`${API_URL}/api/v1/chat/sessions/${sid}/messages/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
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
              if (data.type === 'error') {
                throw new Error(data.error || 'Stream failed');
              }
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

  const handleLogout = () => { logout(); window.location.href = '/'; };

  const sidebarProps = {
    sessions, currentSessionId, isCreatingSession,
    onCreateSession: handleCreateSession,
    onSelectSession: handleSelectSession,
    onDeleteSession: handleDeleteSession,
    user, onLogout: handleLogout,
  };

  return (
    <div className="flex h-screen" style={{ background: '#fbf6ee' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="drawer-overlay active md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile drawer sidebar */}
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

      {/* PC sidebar */}
      <Sidebar {...sidebarProps} />

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0" style={{ background: '#fbf6ee' }}>
        {/* Mobile top bar */}
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
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '1.1rem', color: '#2f5b4f' }}>
            {currentMode.icon} {currentMode.name}
          </span>
          <TherapyModeSelector selectedMode={therapyMode} onSelect={handleSelectMode} />
        </div>

        {/* PC mode tabs */}
        <div className="hidden md:block">
          <TherapyModeSelector selectedMode={therapyMode} onSelect={handleSelectMode} />
        </div>

        {/* Therapy panels (collapsible) */}
        {showTriadForm && therapyMode === 'cbt' && (
          <div style={{ maxWidth: 'var(--chat-max-width)', margin: '0 auto', width: '100%', padding: '0 16px' }}>
            <CognitiveTriadForm
              onSubmit={(data) => {
                handleSend(`[认知三角记录]\n想法：${data.thought}\n感受：${data.feeling}\n行为：${data.behavior}`);
                setShowTriadForm(false);
              }}
              onClose={() => setShowTriadForm(false)}
            />
          </div>
        )}
        {showDesensitizePanel && therapyMode === 'desensitize' && (
          <div style={{ maxWidth: 'var(--chat-max-width)', margin: '0 auto', width: '100%', padding: '0 16px' }}>
            <DesensitizePanel
              onSubmit={(message) => { handleSend(message); setShowDesensitizePanel(false); }}
              onClose={() => setShowDesensitizePanel(false)}
            />
          </div>
        )}
        {showSleepPanel && therapyMode === 'sleep' && (
          <div style={{ maxWidth: 'var(--chat-max-width)', margin: '0 auto', width: '100%', padding: '0 16px' }}>
            <SleepLogPanel
              onSubmit={(message) => { handleSend(message); setShowSleepPanel(false); }}
              onClose={() => setShowSleepPanel(false)}
            />
          </div>
        )}

        {/* Messages */}
        <MessageList messages={messages} loading={loading} />

        {/* Therapy action buttons */}
        {(therapyMode === 'cbt' || therapyMode === 'desensitize' || therapyMode === 'sleep') && (
          <div style={{ maxWidth: 'var(--chat-max-width)', margin: '0 auto', width: '100%', padding: '4px 16px' }} className="flex justify-center">
            <button
              onClick={() => {
                if (therapyMode === 'cbt') setShowTriadForm(!showTriadForm);
                else if (therapyMode === 'desensitize') setShowDesensitizePanel(!showDesensitizePanel);
                else setShowSleepPanel(!showSleepPanel);
              }}
              className="text-xs px-3 py-1 transition"
              style={{ color: currentMode.color, borderRadius: '9999px', border: `1px solid ${currentMode.color}33`, background: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${currentMode.color}0f`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {therapyMode === 'cbt' ? '记录认知三角' : therapyMode === 'desensitize' ? '脱敏训练面板' : '填写睡眠日志'}
            </button>
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} loading={loading} />
      </main>
    </div>
  );
}
