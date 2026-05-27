'use client';

import SessionItem from './SessionItem';
import EmotionRecorder from '../therapy/EmotionRecorder';
import { ANTsList } from '../therapy/ANTsMarker';

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

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  isCreatingSession: boolean;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (e: React.MouseEvent, sessionId: string) => void;
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  isCreatingSession,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
  user,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-primary-600">可意</h1>
        <p className="text-sm text-gray-500">AI心理助手</p>
      </div>

      <button
        onClick={onCreateSession}
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
              <SessionItem
                key={session.id}
                session={session}
                isActive={currentSessionId === session.id}
                onSelect={onSelectSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        )}
      </div>

      <EmotionRecorder />
      <ANTsList />

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        {user ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 truncate max-w-[120px]">{user.email}</span>
            <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-600">
              退出
            </button>
          </div>
        ) : (
          <button onClick={onLogout} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            退出登录
          </button>
        )}
      </div>
    </aside>
  );
}
