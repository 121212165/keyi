'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) {
        onSend(input.trim());
        setInput('');
      }
    }
  };

  const handleClick = () => {
    if (input.trim() && !loading) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入你想说的话..."
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleClick}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50 self-end"
          >
            发送
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
