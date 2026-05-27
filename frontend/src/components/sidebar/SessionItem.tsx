'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

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

export default function SessionItem({ session, isActive, onSelect, onDelete }: SessionItemProps) {
  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`p-3 rounded-lg cursor-pointer transition group ${
        isActive
          ? 'bg-primary-100 border border-primary-200'
          : 'hover:bg-gray-100'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm text-gray-700 font-medium truncate flex-1">
          {getSessionTitle(session)}
        </span>
        <button
          onClick={(e) => onDelete(e, session.id)}
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
  );
}
