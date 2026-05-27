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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mx-4 mb-2 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">🧠 记录认知三角</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            当时脑子里闪过了什么念头？
          </label>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="例如：我觉得自己又搞砸了..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 outline-none"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            你感觉到了什么情绪？（可多选）
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EMOTION_OPTIONS.map((feeling) => (
              <button
                key={feeling}
                onClick={() => toggleFeeling(feeling)}
                className={`px-2.5 py-1 rounded-full text-xs transition ${
                  selectedFeelings.includes(feeling)
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {feeling}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            你当时做了什么？
          </label>
          <input
            type="text"
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            placeholder="例如：我选择了回避..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!thought.trim()}
          className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-50"
        >
          提交给可意分析
        </button>
      </div>
    </div>
  );
}
