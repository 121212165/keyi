'use client';

import dayjs from 'dayjs';
import ANTsMarker from '../therapy/ANTsMarker';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-3 ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {message.content}
        {isUser && (
          <ANTsMarker
            messageContent={message.content}
            onMark={(content, type) => {
              console.log('ANT marked:', type, content.substring(0, 50));
            }}
          />
        )}
        <div className="text-xs mt-1 text-right" style={{ opacity: 0.6 }}>
          {dayjs(message.timestamp).format('HH:mm')}
        </div>
      </div>
    </div>
  );
}
