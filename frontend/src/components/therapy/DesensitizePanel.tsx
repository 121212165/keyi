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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mx-4 mb-2 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          🌊 系统脱敏训练
          <span className="ml-2 text-xs text-gray-400">
            {stage === 'goal' && '第1步：确定目标'}
            {stage === 'hierarchy' && '第2步：建立焦虑等级'}
            {stage === 'exposure' && '第3步：渐进暴露'}
          </span>
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      {/* 进度条 */}
      <div className="flex gap-1 mb-4">
        <div className={`h-1 flex-1 rounded ${stage === 'goal' ? 'bg-primary-500' : 'bg-primary-200'}`} />
        <div className={`h-1 flex-1 rounded ${stage === 'hierarchy' ? 'bg-primary-500' : stage === 'exposure' ? 'bg-primary-200' : 'bg-gray-200'}`} />
        <div className={`h-1 flex-1 rounded ${stage === 'exposure' ? 'bg-primary-500' : 'bg-gray-200'}`} />
      </div>

      {/* 第1步：确定目标 */}
      {stage === 'goal' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">你想通过脱敏训练克服什么恐惧或焦虑？</p>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="例如：公开演讲、坐电梯、社交场合..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button
            onClick={handleGoalSubmit}
            disabled={!goal.trim()}
            className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-50"
          >
            下一步：建立焦虑等级
          </button>
        </div>
      )}

      {/* 第2步：建立焦虑等级 */}
      {stage === 'hierarchy' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            列出让你感到焦虑的情境，从最轻微到最强烈（SUD 0-100）
          </p>

          {items.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                  <span className="text-gray-400 w-4">{i + 1}</span>
                  <span className="flex-1">{item.description}</span>
                  <span className="text-primary-600 font-medium">SUD {item.sud}</span>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">✕</button>
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
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">SUD:</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={newSud}
              onChange={(e) => setNewSud(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-600 w-8">{newSud}</span>
            <button
              onClick={addItem}
              disabled={!newDesc.trim()}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition disabled:opacity-50"
            >
              添加
            </button>
          </div>

          <button
            onClick={handleHierarchySubmit}
            disabled={items.length < 3}
            className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-50"
          >
            {items.length < 3 ? `至少需要3个情境（当前${items.length}个）` : '开始渐进暴露'}
          </button>
        </div>
      )}

      {/* 第3步：渐进暴露 */}
      {stage === 'exposure' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            请按照焦虑等级从低到高逐步练习。每次练习后报告你当前的焦虑程度。
          </p>

          {items.length > 0 && (
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${
                    i === 0 ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                  <span className="flex-1">{item.description}</span>
                  <span className="text-gray-400">SUD {item.sud}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">报告你当前的焦虑程度：</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">放松</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={currentSud}
                onChange={(e) => setCurrentSud(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-400">极度焦虑</span>
              <span className="text-sm text-primary-600 font-medium w-8">{currentSud}</span>
            </div>
          </div>

          <button
            onClick={handleSudReport}
            className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition"
          >
            报告焦虑程度
          </button>
        </div>
      )}
    </div>
  );
}
