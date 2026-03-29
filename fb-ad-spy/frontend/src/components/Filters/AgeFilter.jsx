import React from 'react';
import useStore from '../../store/useStore';

const options = [
  { value: '', label: 'All Ages' },
  { value: 'new', label: '\uD83D\uDFE2 New (0-7 days)' },
  { value: 'recent', label: '\uD83D\uDFE1 Recent (8-30 days)' },
  { value: 'old', label: '\uD83D\uDD34 Old (30+ days)' }
];

export default function AgeFilter() {
  const filters = useStore(s => s.filters);
  const setFilters = useStore(s => s.setFilters);

  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">Ad Age</label>
      <select
        value={filters.age}
        onChange={(e) => setFilters({ age: e.target.value })}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
