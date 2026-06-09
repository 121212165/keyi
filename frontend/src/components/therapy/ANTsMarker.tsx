'use client';

import { useState, useEffect } from 'react';

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

    const ants = loadANTs();
    ants.push({
      id: Date.now().toString(),
      content: messageContent.substring(0, 100),
      type,
      timestamp: new Date().toISOString(),
    });
    saveANTs(ants);
  };

  if (marked) {
    return (
      <span className="text-xs ml-1" style={{ color: "#9b5b32" }} title="已标记为自动负性思维">
        🚩
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="text-xs ml-1 transition"
        style={{ color: "#7a6d63" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#2f5b4f"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}
        title="标记为自动负性思维"
      >
        🚩
      </button>

      {showSelector && (
        <div className="absolute bottom-full left-0 mb-1 p-2 z-50 min-w-[160px]"
          style={{ background: "#fffdf8", border: "1px solid #ded2c3", borderRadius: "10px", boxShadow: "0 20px 52px rgba(32,25,20,0.12)" }}>
          <p className="text-xs mb-1.5" style={{ color: "#7a6d63" }}>选择认知扭曲类型：</p>
          <div className="space-y-1">
            {Object.entries(ANT_TYPES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleMark(key)}
                className="w-full text-left px-2 py-1 text-xs transition"
                style={{ color: "#4c4037", borderRadius: "6px" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(47,91,79,0.06)"; e.currentTarget.style.color = "#2f5b4f"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4c4037"; }}
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

export function ANTsList() {
  const [ants, setANTs] = useState<ANTRecord[]>([]);

  useEffect(() => {
    setANTs(loadANTs());
  }, []);

  const clearANTs = () => {
    saveANTs([]);
    setANTs([]);
  };

  if (ants.length === 0) return null;

  return (
    <div className="p-3" style={{ borderTop: "1px solid #ded2c3" }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs" style={{ color: "#7a6d63" }}>ANTs 记录 ({ants.length})</span>
        <button onClick={clearANTs} className="text-xs transition" style={{ color: "#7a6d63" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#b33a3a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}>
          清除
        </button>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {ants.slice(-5).reverse().map((ant) => (
          <div key={ant.id} className="text-xs p-1.5" style={{ background: "#fdf5ef", borderRadius: "8px" }}>
            <span style={{ color: "#9b5b32" }} className="font-medium">{ANT_TYPES[ant.type] || ant.type}</span>
            <p className="truncate mt-0.5" style={{ color: "#7a6d63" }}>{ant.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
