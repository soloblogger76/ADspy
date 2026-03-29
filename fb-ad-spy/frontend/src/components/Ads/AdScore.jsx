import React from 'react';

export default function AdScore({ score, label }) {
  let bg;
  if (score >= 80) bg = 'bg-emerald-500';
  else if (score >= 60) bg = 'bg-blue-500';
  else if (score >= 40) bg = 'bg-yellow-500';
  else if (score >= 20) bg = 'bg-orange-500';
  else bg = 'bg-gray-500';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold text-white ${bg}`}>
        {score}
      </div>
      <span className="text-xs text-[var(--muted)]">{label}</span>
    </div>
  );
}
