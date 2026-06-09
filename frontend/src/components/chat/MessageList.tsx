'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-16">
      {messages.map((msg, index) => (
        <MessageBubble key={msg.id || index} message={msg} />
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="px-4 py-3" style={{ background: "#fffdf8", borderRadius: "16px 16px 16px 4px", border: "1px solid #ded2c3" }}>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#9b5b32", opacity: 0.5 }} />
              <div className="w-2 h-2 rounded-full animate-bounce delay-75" style={{ background: "#9b5b32", opacity: 0.5 }} />
              <div className="w-2 h-2 rounded-full animate-bounce delay-150" style={{ background: "#9b5b32", opacity: 0.5 }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
