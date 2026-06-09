'use client';

import { useState } from 'react';

interface CognitiveTriadFormProps {
  onSubmit: (data: { thought: string; feeling: string; behavior: string }) => void;
  onClose: () => void;
}

const EMOTION_OPTIONS = [
  '焦虑', '愤怒', '悲伤', '羞愧', '恐惧',
  '内疚', '沮丧', '孤独', '无助', '烦躁',
];

export default function CognitiveTriadForm({ onSubmit, onClose }: CognitiveTriadFormProps) {
  const [thought, setThought] = useState('');
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [behavior, setBehavior] = useState('');

  const toggleFeeling = (feeling: string) => {
    setSelectedFeelings((prev) =>
      prev.includes(feeling) ? prev.filter((f) => f !== feeling) : [...prev, feeling]
    );
  };

  const handleSubmit = () => {
    if (!thought.trim()) return;
    onSubmit({
      thought: thought.trim(),
      feeling: selectedFeelings.join('、'),
      behavior: behavior.trim(),
    });
    setThought('');
    setSelectedFeelings([]);
    setBehavior('');
  };

  return (
    <div className="p-4 mx-4 mb-2" style={{ background: "#fffdf8", border: "1px solid #ded2c3", borderRadius: "16px" }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "#201914" }}>记录认知三角</h3>
        <button onClick={onClose} className="text-sm transition" style={{ color: "#7a6d63" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#4c4037"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}>
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs mb-1 block" style={{ color: "#7a6d63" }}>
            当时脑子里闪过了什么念头？
          </label>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="例如：我觉得自己又搞砸了..."
            className="w-full px-3 py-2 text-sm resize-none outline-none"
            style={{ border: "1px solid #ded2c3", borderRadius: "10px", background: "#fffdf8", color: "#201914" }}
            onFocus={(e) => { e.target.style.borderColor = "#2f5b4f"; e.target.style.boxShadow = "0 0 0 3px rgba(47,91,79,0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#ded2c3"; e.target.style.boxShadow = "none"; }}
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: "#7a6d63" }}>
            你感觉到了什么情绪？（可多选）
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EMOTION_OPTIONS.map((feeling) => {
              const isSelected = selectedFeelings.includes(feeling);
              return (
                <button
                  key={feeling}
                  onClick={() => toggleFeeling(feeling)}
                  className="px-2.5 py-1 text-xs transition"
                  style={{
                    borderRadius: "9999px",
                    background: isSelected ? "rgba(47,91,79,0.1)" : "#f8f3ea",
                    color: isSelected ? "#2f5b4f" : "#7a6d63",
                    border: isSelected ? "1px solid rgba(47,91,79,0.3)" : "1px solid #ded2c3",
                  }}
                >
                  {feeling}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: "#7a6d63" }}>
            你当时做了什么？
          </label>
          <input
            type="text"
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            placeholder="例如：我选择了回避..."
            className="w-full px-3 py-2 text-sm outline-none"
            style={{ border: "1px solid #ded2c3", borderRadius: "10px", background: "#fffdf8", color: "#201914" }}
            onFocus={(e) => { e.target.style.borderColor = "#2f5b4f"; e.target.style.boxShadow = "0 0 0 3px rgba(47,91,79,0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#ded2c3"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!thought.trim()}
          className="w-full py-2 text-white text-sm transition disabled:opacity-50"
          style={{ background: "#2f5b4f", borderRadius: "10px" }}
          onMouseEnter={(e) => { if (thought.trim()) e.currentTarget.style.background = "#274d43"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#2f5b4f"; }}
        >
          提交给林序分析
        </button>
      </div>
    </div>
  );
}
