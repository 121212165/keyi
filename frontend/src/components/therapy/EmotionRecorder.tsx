'use client';

import { useState } from 'react';

interface EmotionRecord {
  date: string;
  score: number;
}

const EMOTION_LEVELS = [
  { score: 1, emoji: '😢', label: '很差' },
  { score: 2, emoji: '😟', label: '不太好' },
  { score: 3, emoji: '😐', label: '一般' },
  { score: 4, emoji: '🙂', label: '不错' },
  { score: 5, emoji: '😊', label: '很好' },
];

const STORAGE_KEY = 'keyi-emotion-records';

function loadRecords(): EmotionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: EmotionRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getRecentDays(records: EmotionRecord[], days: number = 7): (EmotionRecord | null)[] {
  const result: (EmotionRecord | null)[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const record = records.find((r) => r.date === dateStr);
    result.push(record || null);
  }
  return result;
}

export default function EmotionRecorder() {
  const [records, setRecords] = useState<EmotionRecord[]>(() => loadRecords());
  const [todayRecorded, setTodayRecorded] = useState(() =>
    loadRecords().some((r) => r.date === getToday())
  );

  const handleRecord = (score: number) => {
    const today = getToday();
    const updated = records.filter((r) => r.date !== today);
    updated.push({ date: today, score });
    saveRecords(updated);
    setRecords(updated);
    setTodayRecorded(true);
  };

  const recentDays = getRecentDays(records);
  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="p-3 border-t border-gray-200">
      <p className="text-xs text-gray-500 mb-2 text-center">
        {todayRecorded ? '今日已记录 ✓' : '今天心情如何？'}
      </p>

      {!todayRecorded && (
        <div className="flex justify-center gap-1 mb-3">
          {EMOTION_LEVELS.map((level) => (
            <button
              key={level.score}
              onClick={() => handleRecord(level.score)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-lg"
              title={level.label}
            >
              {level.emoji}
            </button>
          ))}
        </div>
      )}

      {records.length > 0 && (
        <div className="flex justify-center gap-1">
          {recentDays.map((record, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayOfWeek = dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1];
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 flex items-center justify-center text-xs">
                  {record
                    ? EMOTION_LEVELS.find((l) => l.score === record.score)?.emoji || '·'
                    : '·'}
                </div>
                <span className="text-[10px] text-gray-400">{dayOfWeek}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
