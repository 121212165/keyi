'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import type { Message, Session } from '@/store';
import { chatAPI } from '@/lib/api';
import { getTherapyMode } from '@/lib/therapy-modes';
import { HOTLINES } from '@/lib/domain/crisis-reply';
import Sidebar from './sidebar/Sidebar';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import TherapyModeSelector from './therapy/TherapyModeSelector';
import CognitiveTriadForm from './therapy/CognitiveTriadForm';
import DesensitizePanel from './therapy/DesensitizePanel';
import SleepLogPanel from './therapy/SleepLogPanel';

function makeWelcome(mode: string): Message {
  return {
    // 固定 id 会在同一列表里撞 key；固定时间戳让欢迎气泡永远显示 08:00。
    id: `welcome-${mode}-${Date.now()}`,
    role: 'assistant',
    content: getTherapyMode(mode).welcome,
    timestamp: new Date().toISOString(),
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
  const [crisisAlert, setCrisisAlert] = useState<{ level: string; keyword: string } | null>(null);

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
    setCrisisAlert(null);
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

    setCrisisAlert(null);
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
      let streamError: string | null = null;
      let storeError: string | null = null;

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
          if (!line.startsWith('data: ')) continue;
          let data: {
            type?: string;
            text?: string;
            error?: string;
            alert_level?: string;
            detected_keyword?: string;
          };
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (data.type === 'delta' && data.text) {
            fullReply += data.text;
            if (!rafId) rafId = requestAnimationFrame(flushUI);
          } else if (data.type === 'crisis') {
            // 分级信息此前到达即被丢弃：危机文案和普通气泡长得一样，也没有可拨的号码。
            setCrisisAlert({
              level: (data.alert_level as string) ?? 'high',
              keyword: (data.detected_keyword as string) ?? '',
            });
          } else if (data.type === 'error') {
            streamError = data.error || '流读取中断';
          } else if (data.type === 'store_error') {
            storeError = data.error || '消息未能保存';
          }
        }
        if (streamError) {
          void reader.cancel();
          break;
        }
      }

      if (rafId) cancelAnimationFrame(rafId);

      // 出错与落库失败都必须可见：静默留白的气泡会让用户以为是自己没发出去。
      let finalContent = fullReply;
      if (streamError) finalContent = fullReply || `（没能收到回复：${streamError}）请再试一次。`;
      if (storeError) finalContent += '\n\n（这条回复没能存入历史，刷新后会丢失）';
      setMessages(useStore.getState().messages.map(m =>
        m.id === assistantMsgId ? { ...m, content: finalContent } : m
      ));
      loadSessions();
    } catch (err) {
      console.error('发送消息失败:', err);
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

        {/* 危机提示：分级可见，热线可一键拨打 */}
        {crisisAlert && (
          <div
            role="alert"
            style={{
              maxWidth: 'var(--chat-max-width)',
              margin: '0 auto',
              width: '100%',
              padding: '12px 16px',
            }}
          >
            <div
              style={{
                border: `1px solid ${crisisAlert.level === 'critical' ? '#c2451f' : '#b9701f'}`,
                borderLeftWidth: 4,
                borderRadius: 12,
                background: crisisAlert.level === 'critical' ? '#fdf1ec' : '#fdf6ec',
                padding: '12px 14px',
                color: '#4c4037',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {crisisAlert.level === 'critical' ? '现在最重要的是你的安全' : '我想先确认你现在是否安全'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HOTLINES.map((hotline) => (
                  <a
                    key={hotline.number}
                    href={`tel:${hotline.number.replace(/[^0-9+]/g, '')}`}
                    style={{
                      border: '1px solid #ded2c3',
                      borderRadius: 9999,
                      padding: '4px 10px',
                      fontSize: '0.82rem',
                      color: '#2f5b4f',
                      background: '#fffdf8',
                    }}
                  >
                    {hotline.label}：{hotline.number}
                  </a>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCrisisAlert(null)}
                style={{ marginTop: 8, fontSize: '0.78rem', color: '#7a6f63', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                我已安全，继续聊天
              </button>
            </div>
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
