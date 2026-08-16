'use client';

import { useState } from 'react';

interface AnxietyItem {
  id: string;
  description: string;
  sud: number;
}

interface DesensitizePanelProps {
  onSubmit: (message: string) => void;
  onClose: () => void;
}

export default function DesensitizePanel({ onSubmit, onClose }: DesensitizePanelProps) {
  const [stage, setStage] = useState<'goal' | 'hierarchy' | 'exposure'>('goal');
  const [goal, setGoal] = useState('');
  const [items, setItems] = useState<AnxietyItem[]>([]);
  const [newDesc, setNewDesc] = useState('');
  const [newSud, setNewSud] = useState(50);
  const [currentSud, setCurrentSud] = useState(50);

  const addItem = () => {
    if (!newDesc.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: newDesc.trim(), sud: newSud },
    ].sort((a, b) => a.sud - b.sud));
    setNewDesc('');
    setNewSud(50);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGoalSubmit = () => {
    if (!goal.trim()) return;
    onSubmit(`我想通过系统脱敏克服的焦虑/恐惧是：${goal.trim()}`);
    setStage('hierarchy');
  };

  const handleHierarchySubmit = () => {
    if (items.length === 0) return;
    const hierarchyText = items
      .map((item, i) => `${i + 1}. ${item.description} (SUD: ${item.sud})`)
      .join('\n');
    onSubmit(`我的焦虑等级列表：\n${hierarchyText}`);
    setStage('exposure');
  };

  const handleSudReport = () => {
    onSubmit(`我当前的焦虑程度是 ${currentSud}/100`);
  };

  const inputStyle = {
    border: "1px solid #ded2c3",
    borderRadius: "10px",
    background: "#fffdf8",
    color: "#201914",
  };

  const btnPrimary = {
    background: "#2f5b4f",
    color: "#ffffff",
    borderRadius: "10px",
  };

  return (
    <div className="p-4 mx-4 mb-2" style={{ background: "#fffdf8", border: "1px solid #ded2c3", borderRadius: "16px" }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "#201914" }}>
          系统脱敏训练
          <span className="ml-2 text-xs" style={{ color: "#7a6d63" }}>
            {stage === 'goal' && '第1步：确定目标'}
            {stage === 'hierarchy' && '第2步：建立焦虑等级'}
            {stage === 'exposure' && '第3步：渐进暴露'}
          </span>
        </h3>
        <button onClick={onClose} className="text-sm transition" style={{ color: "#7a6d63" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#4c4037"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}>✕</button>
      </div>

      <div className="flex gap-1 mb-4">
        <div className="h-1 flex-1 rounded" style={{ background: stage === 'goal' ? "#2f5b4f" : "rgba(47,91,79,0.25)" }} />
        <div className="h-1 flex-1 rounded" style={{ background: stage === 'hierarchy' ? "#2f5b4f" : stage === 'exposure' ? "rgba(47,91,79,0.25)" : "#ded2c3" }} />
        <div className="h-1 flex-1 rounded" style={{ background: stage === 'exposure' ? "#2f5b4f" : "#ded2c3" }} />
      </div>

      {stage === 'goal' && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "#7a6d63" }}>你想通过脱敏训练克服什么恐惧或焦虑？</p>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="例如：公开演讲、坐电梯、社交场合..."
            className="w-full px-3 py-2 text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#2f5b4f"; e.target.style.boxShadow = "0 0 0 3px rgba(47,91,79,0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#ded2c3"; e.target.style.boxShadow = "none"; }}
          />
          <button
            onClick={handleGoalSubmit}
            disabled={!goal.trim()}
            className="w-full py-2 text-sm transition disabled:opacity-50"
            style={btnPrimary}
            onMouseEnter={(e) => { if (goal.trim()) e.currentTarget.style.background = "#274d43"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2f5b4f"; }}
          >
            下一步：建立焦虑等级
          </button>
        </div>
      )}

      {stage === 'hierarchy' && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "#7a6d63" }}>
            列出让你感到焦虑的情境，从最轻微到最强烈（SUD 0-100）
          </p>

          {items.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-2 text-xs p-2" style={{ background: "#f8f3ea", borderRadius: "8px" }}>
                  <span className="w-4" style={{ color: "#7a6d63" }}>{i + 1}</span>
                  <span className="flex-1" style={{ color: "#201914" }}>{item.description}</span>
                  <span className="font-medium" style={{ color: "#2f5b4f" }}>SUD {item.sud}</span>
                  <button onClick={() => removeItem(item.id)} className="transition" style={{ color: "#7a6d63" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#b33a3a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="描述一个焦虑情境..."
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#2f5b4f"; e.target.style.boxShadow = "0 0 0 3px rgba(47,91,79,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ded2c3"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#7a6d63" }}>SUD:</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={newSud}
              onChange={(e) => setNewSud(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs w-8" style={{ color: "#4c4037" }}>{newSud}</span>
            <button
              onClick={addItem}
              disabled={!newDesc.trim()}
              className="px-3 py-1.5 text-xs transition disabled:opacity-50"
              style={{ background: "#f1e3cf", color: "#4c4037", borderRadius: "10px" }}
              onMouseEnter={(e) => { if (newDesc.trim()) e.currentTarget.style.background = "#e8d5bc"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f1e3cf"; }}
            >
              添加
            </button>
          </div>

          <button
            onClick={handleHierarchySubmit}
            disabled={items.length < 3}
            className="w-full py-2 text-sm transition disabled:opacity-50"
            style={btnPrimary}
            onMouseEnter={(e) => { if (items.length >= 3) e.currentTarget.style.background = "#274d43"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2f5b4f"; }}
          >
            {items.length < 3 ? `至少需要3个情境（当前${items.length}个）` : '开始渐进暴露'}
          </button>
        </div>
      )}

      {stage === 'exposure' && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "#7a6d63" }}>
            请按照焦虑等级从低到高逐步练习。每次练习后报告你当前的焦虑程度。
          </p>

          {items.length > 0 && (
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: i === 0 ? "#2f5b4f" : "#ded2c3" }} />
                  <span className="flex-1" style={{ color: "#201914" }}>{item.description}</span>
                  <span style={{ color: "#7a6d63" }}>SUD {item.sud}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3" style={{ background: "#f8f3ea", borderRadius: "10px" }}>
            <p className="text-xs mb-2" style={{ color: "#7a6d63" }}>报告你当前的焦虑程度：</p>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#7a6d63" }}>放松</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={currentSud}
                onChange={(e) => setCurrentSud(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs" style={{ color: "#7a6d63" }}>极度焦虑</span>
              <span className="text-sm font-medium w-8" style={{ color: "#2f5b4f" }}>{currentSud}</span>
            </div>
          </div>

          <button
            onClick={handleSudReport}
            className="w-full py-2 text-sm transition"
            style={btnPrimary}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#274d43"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2f5b4f"; }}
          >
            报告焦虑程度
          </button>
        </div>
      )}
    </div>
  );
}
