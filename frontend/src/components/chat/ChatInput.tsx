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
    <div className="px-4 md:px-6 py-4" style={{ borderTop: '1px solid #ded2c3', background: '#fffdf8' }}>
      <div style={{ maxWidth: 'var(--chat-max-width)', margin: '0 auto' }}>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入你想说的话..."
            className="flex-1 resize-none px-4 py-3 outline-none"
            style={{
              border: '1px solid #ded2c3',
              borderRadius: '12px',
              background: '#fffdf8',
              color: '#201914',
              minHeight: '48px',
              maxHeight: '34vh',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#2f5b4f'; e.target.style.boxShadow = '0 0 0 3px rgba(47,91,79,0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#ded2c3'; e.target.style.boxShadow = 'none'; }}
            rows={1}
            disabled={loading}
          />
          <button
            onClick={handleClick}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 text-white transition disabled:opacity-50"
            style={{ background: '#2f5b4f', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = '#274d43'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2f5b4f'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
