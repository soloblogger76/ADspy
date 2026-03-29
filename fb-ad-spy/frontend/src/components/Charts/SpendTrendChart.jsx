import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LINE_COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#eab308', '#8b5cf6'];

export default function SpendTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-medium text-[var(--text)] mb-3">Spend Trend (Last 6 Months)</h3>
        <p className="text-xs text-[var(--muted)] text-center py-8">No trend data available</p>
      </div>
    );
  }

  const allNiches = new Set();
  data.forEach(d => {
    if (d.niches) {
      Object.keys(d.niches).forEach(n => allNiches.add(n));
    }
  });

  const topNiches = [...allNiches].slice(0, 5);

  const chartData = data.map(d => {
    const point = { month: d.month };
    topNiches.forEach(n => {
      point[n] = (d.niches && d.niches[n]) || 0;
    });
    return point;
  });

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-medium text-[var(--text)] mb-3">Spend Trend (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '8px', color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          {topNiches.map((niche, i) => (
            <Line
              key={niche}
              type="monotone"
              dataKey={niche}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
