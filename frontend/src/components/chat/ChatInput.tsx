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
    <div className="p-4" style={{ borderTop: "1px solid #ded2c3", background: "#fffdf8" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入你想说的话..."
            className="flex-1 resize-none px-4 py-3 outline-none"
            style={{ border: "1px solid #ded2c3", borderRadius: "12px", background: "#fffdf8", color: "#201914" }}
            onFocus={(e) => { e.target.style.borderColor = "#2f5b4f"; e.target.style.boxShadow = "0 0 0 3px rgba(47,91,79,0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#ded2c3"; e.target.style.boxShadow = "none"; }}
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleClick}
            disabled={loading || !input.trim()}
            className="px-6 py-2 text-white transition disabled:opacity-50 self-end"
            style={{ background: "#2f5b4f", borderRadius: "12px" }}
            onMouseEnter={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = "#274d43"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2f5b4f"; }}
          >
            发送
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "#9b5b32", opacity: 0.5 }}>
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
