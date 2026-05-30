'use client';

import { useState } from 'react';

interface ANTRecord {
  id: string;
  content: string;
  type: string;
  timestamp: string;
}

const ANT_TYPES: Record<string, string> = {
  all_or_nothing: '全或无思维',
  catastrophizing: '灾难化',
  mind_reading: '读心术',
  labeling: '标签化',
  emotional_reasoning: '情绪推理',
  should_statements: '应该陈述',
  personalization: '个人化',
};

const STORAGE_KEY = 'keyi-ant-records';

function loadANTs(): ANTRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveANTs(ants: ANTRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ants));
}

interface ANTsMarkerProps {
  messageContent: string;
  onMark: (content: string, type: string) => void;
}

export default function ANTsMarker({ messageContent, onMark }: ANTsMarkerProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [marked, setMarked] = useState(false);

  const handleMark = (type: string) => {
    onMark(messageContent, type);
    setMarked(true);
    setShowSelector(false);

    // 保存到 localStorage
    const ants = loadANTs();
    ants.push({
      id: crypto.randomUUID(),
      content: messageContent.substring(0, 100),
      type,
      timestamp: new Date().toISOString(),
    });
    saveANTs(ants);
  };

  if (marked) {
    return (
      <span className="text-xs text-primary-500 ml-1" title="已标记为自动负性思维">
        🚩
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="text-xs text-gray-400 hover:text-primary-500 ml-1 transition"
        title="标记为自动负性思维"
      >
        🚩
      </button>

      {showSelector && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
          <p className="text-xs text-gray-500 mb-1.5">选择认知扭曲类型：</p>
          <div className="space-y-1">
            {Object.entries(ANT_TYPES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleMark(key)}
                className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded transition"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 独立的 ANTs 列表组件（用于侧边栏）
export function ANTsList() {
  const [ants, setANTs] = useState<ANTRecord[]>(() => loadANTs());

  const clearANTs = () => {
    saveANTs([]);
    setANTs([]);
  };

  if (ants.length === 0) return null;

  return (
    <div className="p-3 border-t border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">🚩 ANTs 记录 ({ants.length})</span>
        <button onClick={clearANTs} className="text-xs text-gray-400 hover:text-red-500">清除</button>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {ants.slice(-5).reverse().map((ant) => (
          <div key={ant.id} className="text-xs bg-orange-50 p-1.5 rounded">
            <span className="text-orange-600 font-medium">{ANT_TYPES[ant.type] || ant.type}</span>
            <p className="text-gray-500 truncate mt-0.5">{ant.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
