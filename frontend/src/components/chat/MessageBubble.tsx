'use client';

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
  const time = new Date(message.timestamp);
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

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
        <div className="text-xs mt-1 text-right" style={{ opacity: 0.6 }}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
