import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CountryChart({ data, onClickCountry }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-medium text-[var(--text)] mb-3">Ads by Country</h3>
        <p className="text-xs text-[var(--muted)] text-center py-8">No data available</p>
      </div>
    );
  }

  const chartData = Object.entries(data)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-medium text-[var(--text)] mb-3">Ads by Country (Top 10)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ bottom: 20 }}>
          <XAxis dataKey="code" tick={{ fill: '#f1f5f9', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '8px', color: '#f1f5f9' }}
          />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            onClick={(data) => onClickCountry && onClickCountry(data.code)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
