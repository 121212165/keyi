'use client';

import { useState, useRef, useEffect } from 'react';

interface TherapyMode {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

const THERAPY_MODES: TherapyMode[] = [
  { id: 'general', name: '自由对话', shortName: '自由', description: '普通的支持性对话，我会倾听并陪伴你', icon: '💬' },
  { id: 'cbt', name: 'CBT 认知疗法', shortName: 'CBT', description: '帮助识别和改变负性思维模式', icon: '🧠' },
  { id: 'desensitize', name: '系统脱敏', shortName: '脱敏', description: '通过渐进式暴露克服恐惧和焦虑', icon: '🌊' },
];

interface TherapyModeSelectorProps {
  selectedMode: string;
  onSelect: (mode: string) => void;
}

export default function TherapyModeSelector({ selectedMode, onSelect }: TherapyModeSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const current = THERAPY_MODES.find(m => m.id === selectedMode) || THERAPY_MODES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* PC: tab bar */}
      <div className="hidden md:flex items-center gap-0 px-4 pt-3 pb-0" style={{ maxWidth: 'var(--chat-max-width)', margin: '0 auto', width: '100%' }}>
        {THERAPY_MODES.map((mode) => {
          const isActive = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              className="relative px-4 py-2 text-sm transition"
              style={{
                color: isActive ? '#2f5b4f' : '#7a6d63',
                fontWeight: isActive ? 500 : 400,
                background: 'transparent',
                border: 'none',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#4c4037'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#7a6d63'; }}
              title={mode.description}
            >
              <span className="mr-1.5">{mode.icon}</span>
              {mode.name}
              {isActive && (
                <div style={{ position: 'absolute', bottom: 0, left: '16px', right: '16px', height: '3px', background: '#2f5b4f', borderRadius: '2px 2px 0 0' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: dropdown in top bar (rendered by ChatInterface) */}
      <div className="md:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm transition"
          style={{ background: '#f1e3cf', color: '#4c4037', borderRadius: '8px', border: 'none' }}
        >
          <span>{current.icon}</span>
          <span>{current.shortName}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '150ms' }}>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="mode-dropdown">
            {THERAPY_MODES.map((mode) => {
              const isActive = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => { onSelect(mode.id); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition"
                  style={{
                    background: isActive ? 'rgba(47,91,79,0.08)' : 'transparent',
                    color: isActive ? '#2f5b4f' : '#4c4037',
                    fontWeight: isActive ? 500 : 400,
                    border: 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f1e3cf'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{mode.icon}</span>
                  <div>
                    <div>{mode.name}</div>
                    <div className="text-xs" style={{ color: '#7a6d63' }}>{mode.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
