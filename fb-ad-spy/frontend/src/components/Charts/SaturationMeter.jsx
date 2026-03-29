import React from 'react';

export default function SaturationMeter({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-medium text-[var(--text)] mb-3">Niche Saturation</h3>
        <p className="text-xs text-[var(--muted)] text-center py-4">No data available</p>
      </div>
    );
  }

  const getColor = (score) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getTextColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-blue-400';
    return 'text-emerald-400';
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-medium text-[var(--text)] mb-4">Niche Saturation</h3>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.niche}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[var(--text)]">{item.niche}</span>
              <span className={`text-xs font-medium ${getTextColor(item.score)}`}>
                {item.score}% - {item.label}
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getColor(item.score)}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
