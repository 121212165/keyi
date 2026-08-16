'use client';

import { useState } from 'react';

interface SleepLogPanelProps {
  onSubmit: (message: string) => void;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #ded2c3',
  borderRadius: '10px',
  background: '#fffdf8',
  color: '#201914',
  padding: '8px 10px',
  width: '100%',
  fontSize: '14px',
};

const labelStyle: React.CSSProperties = {
  color: '#7a6d63',
  fontSize: '12px',
  marginBottom: '4px',
  display: 'block',
};

export default function SleepLogPanel({ onSubmit, onClose }: SleepLogPanelProps) {
  const [bedtime, setBedtime] = useState('');
  const [sleepTime, setSleepTime] = useState('');
  const [wakeCount, setWakeCount] = useState(0);
  const [awakeMinutes, setAwakeMinutes] = useState(0);
  const [wakeupTime, setWakeupTime] = useState('');
  const [fatigue, setFatigue] = useState(5);

  const handleSubmit = () => {
    if (!bedtime && !wakeupTime) {
      return;
    }

    const lines = ['[睡眠日志]'];
    if (bedtime) lines.push(`就寝时间：${bedtime}`);
    if (sleepTime) lines.push(`入睡时间：${sleepTime}${bedtime ? `（距就寝 ${diffMinutes(bedtime, sleepTime)} 分钟）` : ''}`);
    lines.push(`夜间醒来：${wakeCount} 次${awakeMinutes > 0 ? `，共约 ${awakeMinutes} 分钟` : ''}`);
    if (wakeupTime) lines.push(`起床时间：${wakeupTime}`);
    lines.push(`白天疲劳度：${fatigue}/10`);

    onSubmit(lines.join('\n'));
  };

  function diffMinutes(from: string, to: string): number {
    const [fh, fm] = from.split(':').map(Number);
    const [th, tm] = to.split(':').map(Number);
    let diff = (th * 60 + tm) - (fh * 60 + fm);
    if (diff < 0) diff += 24 * 60; // 跨午夜
    return diff;
  }

  return (
    <div className="p-4 mx-4 mb-2" style={{ background: '#fffdf8', border: '1px solid #ded2c3', borderRadius: '16px' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#201914' }}>
          🌙 睡眠日志
          <span className="ml-2 text-xs" style={{ color: '#7a6d63' }}>
            记录昨晚的睡眠，帮可意为你制定 CBT-I 方案
          </span>
        </h3>
        <button
          onClick={onClose}
          className="text-xs px-2 py-1 transition"
          style={{ color: '#7a6d63', background: 'transparent', border: 'none' }}
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>就寝时间</label>
          <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>入睡时间</label>
          <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>夜间醒来次数</label>
          <input type="number" min={0} max={10} value={wakeCount} onChange={(e) => setWakeCount(Math.max(0, Number(e.target.value)))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>醒着总时长（分钟）</label>
          <input type="number" min={0} max={480} step={5} value={awakeMinutes} onChange={(e) => setAwakeMinutes(Math.max(0, Number(e.target.value)))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>起床时间</label>
          <input type="time" value={wakeupTime} onChange={(e) => setWakeupTime(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>白天疲劳度：{fatigue}/10</label>
          <input
            type="range" min={0} max={10} value={fatigue}
            onChange={(e) => setFatigue(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#5b4f8e' }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm transition"
          style={{ color: '#4c4037', borderRadius: '10px', border: '1px solid #ded2c3', background: 'transparent' }}
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 text-sm transition"
          style={{ background: '#5b4f8e', color: '#ffffff', borderRadius: '10px', border: 'none' }}
        >
          发送日志
        </button>
      </div>
    </div>
  );
}
