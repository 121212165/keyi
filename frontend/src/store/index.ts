'use client';

import { create } from 'zustand';

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

interface User {
  id: string;
  email: string;
}

interface AppState {
  // 用户
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;

  // 会话
  sessions: Session[];
  currentSessionId: string | null;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (sessionId: string | null) => void;
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;

  // 消息
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // UI 状态
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 持久化
  _persist: any;
}

// 创建 store（不使用持久化，在组件中手动处理）
export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    set({ user, token });
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      if (user && token) {
        localStorage.setItem('keyi-user', JSON.stringify({ user, token }));
      } else {
        localStorage.removeItem('keyi-user');
      }
    }
  },
  logout: () => {
    set({ user: null, token: null, sessions: [], currentSessionId: null, messages: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('keyi-user');
    }
  },

  sessions: [],
  currentSessionId: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions],
    currentSessionId: session.id,
  })),
  removeSession: (sessionId) => set((state) => ({
    sessions: state.sessions.filter((s) => s.id !== sessionId),
    currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
  })),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  _persist: null,
}));

// 从 localStorage 恢复数据
export function restoreUser(): { user: User | null; token: string | null } | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem('keyi-user');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('恢复用户数据失败:', e);
  }
  return null;
}
