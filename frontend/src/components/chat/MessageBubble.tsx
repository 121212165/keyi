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
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-3 ${
          message.role === 'user'
            ? 'bg-primary-500 text-white rounded-2xl rounded-br-sm'
            : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'
        }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {message.content}
        {message.role === 'user' && (
          <ANTsMarker
            messageContent={message.content}
            onMark={(content, type) => {
              console.log('ANT marked:', type, content.substring(0, 50));
            }}
          />
        )}
        <div className="text-xs opacity-70 mt-1 text-right">
          {dayjs(message.timestamp).format('HH:mm')}
        </div>
      </div>
    </div>
  );
}
