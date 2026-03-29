import React from 'react';
import useStore from '../../store/useStore';

const options = [
  { value: '', label: 'All Formats' },
  { value: 'Image', label: 'Image' },
  { value: 'Video', label: 'Video' },
  { value: 'Carousel', label: 'Carousel' },
  { value: 'Stories', label: 'Stories' },
  { value: 'Reels', label: 'Reels' }
];

export default function FormatFilter() {
  const filters = useStore(s => s.filters);
  const setFilters = useStore(s => s.setFilters);

  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">Ad Format</label>
      <select
        value={filters.format}
        onChange={(e) => setFilters({ format: e.target.value })}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
