import React from 'react';
import useStore from '../../store/useStore';
import AgeFilter from './AgeFilter';
import PlatformFilter from './PlatformFilter';
import FormatFilter from './FormatFilter';

const NICHES = ['', 'Education', 'E-commerce', 'Finance', 'Health', 'Real Estate', 'SaaS/Tech', 'Fashion', 'Food', 'Travel', 'Beauty', 'Automotive', 'Other'];
const FUNNELS = ['', 'VSL', 'Webinar', 'Lead Gen', 'Product', 'Booking', 'App', 'Community', 'Other'];
const COUNTRIES = ['', 'US', 'IN', 'GB', 'AU', 'CA', 'AE', 'SG', 'DE', 'FR', 'BR', 'JP', 'KR', 'NG', 'ZA', 'KE'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'score', label: 'Highest Score' },
  { value: 'revenue', label: 'Highest Revenue' }
];

export default function FilterPanel() {
  const filters = useStore(s => s.filters);
  const setFilters = useStore(s => s.setFilters);
  const resetFilters = useStore(s => s.resetFilters);
  const fetchAds = useStore(s => s.fetchAds);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAds();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch}>
        <label className="block text-xs text-[var(--muted)] mb-1">Search Ads</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search keywords..."
            className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:opacity-90 transition"
          >
            Search
          </button>
        </div>
      </form>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Country</label>
        <select
          value={filters.country}
          onChange={(e) => setFilters({ country: e.target.value })}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
        >
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{c || 'All Countries'}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Niche</label>
        <select
          value={filters.niche}
          onChange={(e) => setFilters({ niche: e.target.value })}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
        >
          {NICHES.map(n => (
            <option key={n} value={n}>{n || 'All Niches'}</option>
          ))}
        </select>
      </div>

      <AgeFilter />
      <PlatformFilter />
      <FormatFilter />

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Funnel Type</label>
        <select
          value={filters.funnel}
          onChange={(e) => setFilters({ funnel: e.target.value })}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
        >
          {FUNNELS.map(f => (
            <option key={f} value={f}>{f || 'All Funnels'}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value })}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
        >
          {SORTS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { fetchAds(); }}
          className="flex-1 px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:opacity-90 transition"
        >
          Apply Filters
        </button>
        <button
          onClick={() => { resetFilters(); fetchAds(); }}
          className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] text-sm rounded-lg hover:bg-white/5 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
