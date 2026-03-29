import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import NicheChart from '../components/Charts/NicheChart';
import CountryChart from '../components/Charts/CountryChart';
import SpendTrendChart from '../components/Charts/SpendTrendChart';
import SaturationMeter from '../components/Charts/SaturationMeter';

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-[var(--muted)]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const stats = useStore(s => s.stats);
  const fetchStats = useStore(s => s.fetchStats);
  const setFilters = useStore(s => s.setFilters);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleNicheClick = (niche) => {
    setFilters({ niche });
    navigate('/explorer');
  };

  const handleCountryClick = (country) => {
    setFilters({ country });
    navigate('/explorer');
  };

  const formatCurrency = (n) => {
    if (!n) return '$0';
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return `$${Math.round(n)}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Ads" value={stats.total_ads || 0} icon="\uD83D\uDCCA" />
        <StatCard label="Active Ads" value={stats.active_ads || 0} icon="\u2705" />
        <StatCard label="Niches" value={stats.niches_count || 0} icon="\uD83C\uDFAF" />
        <StatCard label="Countries" value={stats.countries_count || 0} icon="\uD83C\uDF0D" />
        <StatCard
          label="Est. Market Spend"
          value={`${formatCurrency(stats.total_est_revenue_min)} - ${formatCurrency(stats.total_est_revenue_max)}`}
          icon="\uD83D\uDCB0"
        />
        <StatCard
          label="Revenue Opportunity"
          value={`${formatCurrency(stats.total_est_revenue_min)} - ${formatCurrency(stats.total_est_revenue_max)}`}
          icon="\uD83D\uDCC8"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NicheChart data={stats.by_niche} onClickNiche={handleNicheClick} />
        <CountryChart data={stats.by_country} onClickCountry={handleCountryClick} />
      </div>

      <SpendTrendChart data={stats.trend} />

      <SaturationMeter data={stats.saturation} />
    </div>
  );
}
