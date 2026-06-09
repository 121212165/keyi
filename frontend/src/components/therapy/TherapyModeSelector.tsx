'use client';

interface TherapyMode {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const THERAPY_MODES: TherapyMode[] = [
  {
    id: 'general',
    name: '自由对话',
    description: '普通的支持性对话，我会倾听并陪伴你',
    icon: '💬',
  },
  {
    id: 'cbt',
    name: 'CBT 认知疗法',
    description: '帮助识别和改变负性思维模式',
    icon: '🧠',
  },
  {
    id: 'desensitize',
    name: '系统脱敏',
    description: '通过渐进式暴露克服恐惧和焦虑',
    icon: '🌊',
  },
];

interface TherapyModeSelectorProps {
  selectedMode: string;
  onSelect: (mode: string) => void;
}

export default function TherapyModeSelector({ selectedMode, onSelect }: TherapyModeSelectorProps) {
  return (
    <div className="flex gap-2 px-4 py-2">
      {THERAPY_MODES.map((mode) => {
        const isActive = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="px-3 py-1.5 text-sm transition"
            style={{
              borderRadius: "9999px",
              background: isActive ? "#2f5b4f" : "#f1e3cf",
              color: isActive ? "#ffffff" : "#4c4037",
              border: "none",
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#e8d5bc"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "#f1e3cf"; }}
            title={mode.description}
          >
            <span className="mr-1">{mode.icon}</span>
            {mode.name}
          </button>
        );
      })}
    </div>
  );
}
