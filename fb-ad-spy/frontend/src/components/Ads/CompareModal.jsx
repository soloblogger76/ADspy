import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import useStore from '../../store/useStore';
import { NicheBadge, AgeBadge, ScoreBadge } from '../Shared/Badge';
import FunnelBadge from './FunnelBadge';
import ExportButton from '../Shared/ExportButton';

export default function CompareModal({ onClose }) {
  const selectedAds = useStore(s => s.selectedAds);
  const clearSelected = useStore(s => s.clearSelected);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAds.length === 0) return;

    const fetchComparison = async () => {
      try {
        const res = await client.post('/api/ads/compare', { ad_ids: selectedAds });
        setAds(res.data);
      } catch (err) {
        console.error('Compare error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [selectedAds]);

  const handleClose = () => {
    clearSelected();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Compare Ads ({ads.length})</h2>
          <div className="flex items-center gap-3">
            <ExportButton type="pdf" endpoint="/api/swipefile/export/pdf" label="Export PDF" />
            <button onClick={handleClose} className="text-[var(--muted)] hover:text-[var(--text)] text-xl">&times;</button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading comparison...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {ads.map(ad => {
              const countries = Array.isArray(ad.ad_reached_countries) ? ad.ad_reached_countries : [];
              return (
                <div key={ad.fb_ad_id} className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={ad.winning_score || 0} />
                    <h3 className="text-sm font-bold text-[var(--text)] truncate">{ad.page_name}</h3>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <NicheBadge niche={ad.niche} />
                    <FunnelBadge funnel={ad.funnel_type} />
                    <AgeBadge age={ad.age_category} />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Format</span>
                      <span className="text-[var(--text)]">{ad.ad_format}</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Platform</span>
                      <span className="text-[var(--text)]">{ad.platform_type}</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Days Running</span>
                      <span className="text-[var(--text)]">{ad.days_running}</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Countries</span>
                      <span className="text-[var(--text)]">{countries.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted)]">
                      <span>Revenue Range</span>
                      <span className="text-emerald-400">
                        {ad.est_revenue_min ? `$${Math.round(ad.est_revenue_min).toLocaleString()}` : 'N/A'}
                        {' - '}
                        {ad.est_revenue_max ? `$${Math.round(ad.est_revenue_max).toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--muted)] line-clamp-3">{ad.ad_creative_body}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
