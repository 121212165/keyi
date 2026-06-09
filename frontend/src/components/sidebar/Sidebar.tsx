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
    <aside className="w-64 flex flex-col transition-all duration-300" style={{ background: "#f8f3ea", borderRight: "1px solid #ded2c3" }}>
      <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid #ded2c3" }}>
        <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.25rem", fontWeight: 400, color: "#2f5b4f" }}>林序</h1>
        <p className="text-sm" style={{ color: "#7a6d63" }}>森林里的倾听者</p>
      </div>

      <button
        onClick={onCreateSession}
        disabled={isCreatingSession}
        className="mx-4 mt-4 py-2 px-4 text-white text-sm transition disabled:opacity-50"
        style={{ background: "#2f5b4f", borderRadius: "10px" }}
        onMouseEnter={(e) => { if (!isCreatingSession) e.currentTarget.style.background = "#274d43"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#2f5b4f"; }}
      >
        {isCreatingSession ? '创建中...' : '+ 新对话'}
      </button>

      <div className="flex-1 overflow-y-auto p-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-center" style={{ color: "#9b5b32", opacity: 0.6 }}>暂无历史记录</p>
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

      <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid #ded2c3" }}>
        {user ? (
          <div className="flex items-center justify-between">
            <span className="text-sm truncate max-w-[120px]" style={{ color: "#4c4037" }}>{user.email}</span>
            <button onClick={onLogout} className="text-sm transition" style={{ color: "#7a6d63" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#4c4037"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}>
              退出
            </button>
          </div>
        ) : (
          <button onClick={onLogout} className="w-full py-2 text-sm transition" style={{ color: "#7a6d63" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#4c4037"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}>
            退出登录
          </button>
        )}
      </div>
    </aside>
  );
}
