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
      {THERAPY_MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className={`px-3 py-1.5 rounded-full text-sm transition ${
            selectedMode === mode.id
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={mode.description}
        >
          <span className="mr-1">{mode.icon}</span>
          {mode.name}
        </button>
      ))}
    </div>
  );
}
