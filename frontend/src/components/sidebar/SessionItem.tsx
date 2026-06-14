'use client';

interface Session {
  id: string;
  title: string;
  started_at: string;
  updated_at?: string;
  message_count: number;
}

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (e: React.MouseEvent, sessionId: string) => void;
}

function getSessionTitle(session: Session): string {
  if (session.title && session.title !== '新对话') {
    return session.title.length > 15 ? session.title.substring(0, 15) + '...' : session.title;
  }
  return '新的对话';
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}

export default function SessionItem({ session, isActive, onSelect, onDelete }: SessionItemProps) {
  return (
    <div
      onClick={() => onSelect(session.id)}
      className="p-3 rounded-lg cursor-pointer transition group"
      style={{
        background: isActive ? "rgba(47,91,79,0.08)" : "transparent",
        border: isActive ? "1px solid rgba(47,91,79,0.15)" : "1px solid transparent",
        borderRadius: "10px",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f1e3cf"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium truncate flex-1" style={{ color: "#201914" }}>
          {getSessionTitle(session)}
        </span>
        <button
          onClick={(e) => onDelete(e, session.id)}
          className="opacity-0 group-hover:opacity-100 transition"
          style={{ color: "#7a6d63" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#b33a3a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="text-xs mt-1" style={{ color: "#9b5b32", opacity: 0.6 }}>
        {relativeTime(session.updated_at || session.started_at)}
      </div>
    </div>
  );
}
