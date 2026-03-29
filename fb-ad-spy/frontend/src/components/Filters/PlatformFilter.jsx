import React from 'react';
import useStore from '../../store/useStore';

const options = [
  { value: '', label: 'All Platforms' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook + Instagram', label: 'Facebook + Instagram' }
];

export default function PlatformFilter() {
  const filters = useStore(s => s.filters);
  const setFilters = useStore(s => s.setFilters);

  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">Platform</label>
      <select
        value={filters.platform}
        onChange={(e) => setFilters({ platform: e.target.value })}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
