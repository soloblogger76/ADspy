import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import FilterPanel from '../components/Filters/FilterPanel';
import AdCard from '../components/Ads/AdCard';
import CompareModal from '../components/Ads/CompareModal';
import SkeletonCard from '../components/Shared/SkeletonCard';
import { useNavigate } from 'react-router-dom';

export default function AdExplorer() {
  const ads = useStore(s => s.ads);
  const total = useStore(s => s.total);
  const page = useStore(s => s.page);
  const totalPages = useStore(s => s.totalPages);
  const loading = useStore(s => s.loading);
  const fetchAds = useStore(s => s.fetchAds);
  const selectedAds = useStore(s => s.selectedAds);
  const setPage = useStore(s => s.setPage);
  const navigate = useNavigate();

  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    fetchAds();
  }, [page]);

  const handleAnalyze = (ad) => {
    useStore.getState().saveToSwipeFile(ad);
    navigate('/ai-studio');
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar filters */}
      <div className="w-64 flex-shrink-0 overflow-auto">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Filters</h3>
          <FilterPanel />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text)]">Ad Explorer</h1>
          <span className="text-sm text-[var(--muted)]">{total} ads found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-[var(--muted)]">No ads found</p>
            <p className="text-sm text-[var(--muted)] mt-2">Try searching for keywords or adjusting filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ads.map(ad => (
                <AdCard key={ad.fb_ad_id || ad.id} ad={ad} onAnalyze={handleAnalyze} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-white/5 disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-[var(--muted)]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-white/5 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Compare bar */}
        {selectedAds.length > 0 && (
          <div className="fixed bottom-0 left-60 right-0 bg-[var(--card)] border-t border-[var(--border)] p-4 flex items-center justify-between z-40">
            <span className="text-sm text-[var(--text)]">
              {selectedAds.length} ad(s) selected for comparison
            </span>
            <button
              onClick={() => setShowCompare(true)}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:opacity-90 transition"
            >
              Compare Selected ({selectedAds.length})
            </button>
          </div>
        )}

        {showCompare && <CompareModal onClose={() => setShowCompare(false)} />}
      </div>
    </div>
  );
}
