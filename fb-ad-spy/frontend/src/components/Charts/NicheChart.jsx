import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const NICHE_COLORS = {
  'Education': '#3b82f6',
  'Finance': '#10b981',
  'E-commerce': '#8b5cf6',
  'Health': '#f43f5e',
  'Real Estate': '#f97316',
  'SaaS/Tech': '#06b6d4',
  'Fashion': '#ec4899',
  'Food': '#eab308',
  'Travel': '#14b8a6',
  'Beauty': '#d946ef',
  'Automotive': '#64748b',
  'Other': '#6b7280'
};

export default function NicheChart({ data, onClickNiche }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-medium text-[var(--text)] mb-3">Ads by Niche</h3>
        <p className="text-xs text-[var(--muted)] text-center py-8">No data available</p>
      </div>
    );
  }

  const chartData = Object.entries(data)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-medium text-[var(--text)] mb-3">Ads by Niche</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#f1f5f9', fontSize: 12 }}
            width={75}
          />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '8px', color: '#f1f5f9' }}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(data) => onClickNiche && onClickNiche(data.name)}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={NICHE_COLORS[entry.name] || '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
