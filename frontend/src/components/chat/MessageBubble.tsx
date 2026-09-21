'use client';

import type { Message } from '@/store';
import { recordChips } from '@/lib/domain/record-display';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp);
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  const chips = isUser ? [] : recordChips(message.metadata);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`px-4 py-3 ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
        style={{
          whiteSpace: 'pre-wrap',
          maxWidth: isUser ? 'min(70%, 480px)' : '100%',
          wordBreak: 'break-word',
        }}
      >
        {message.content}

        {chips.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 10,
              paddingTop: 8,
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {chips.map((chip) => (
              <span
                key={chip}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  border: '1px solid var(--border, #ded2c3)',
                  background: 'rgba(255,255,255,0.6)',
                  color: 'var(--muted, #6b6157)',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs mt-1 text-right" style={{ opacity: 0.6 }}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
