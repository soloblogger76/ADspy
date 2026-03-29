import React, { useState } from 'react';
import AdPreview from './AdPreview';
import AdScore from './AdScore';
import RevenueBox from './RevenueBox';
import FunnelBadge from './FunnelBadge';
import { NicheBadge, AgeBadge } from '../Shared/Badge';
import useStore from '../../store/useStore';

export default function AdCard({ ad, onAnalyze }) {
  const [showFullText, setShowFullText] = useState(false);
  const saveToSwipeFile = useStore(s => s.saveToSwipeFile);
  const toggleSelectAd = useStore(s => s.toggleSelectAd);
  const selectedAds = useStore(s => s.selectedAds);

  const isSelected = selectedAds.includes(ad.fb_ad_id);
  const bodyText = ad.ad_creative_body || '';
  const truncated = bodyText.length > 200 && !showFullText;
  const displayText = truncated ? bodyText.substring(0, 200) + '...' : bodyText;

  const countries = Array.isArray(ad.ad_reached_countries) ? ad.ad_reached_countries : [];
  const fbUrl = `https://www.facebook.com/ads/library/?id=${ad.fb_ad_id}`;

  return (
    <div className={`rounded-xl border bg-[var(--card)] overflow-hidden transition-all ${
      isSelected ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : 'border-[var(--border)]'
    }`}>
      <div className="p-4 space-y-3">
        {/* ROW 1: Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <AdScore score={ad.winning_score || 0} label={ad.winning_label} />
          <NicheBadge niche={ad.niche} />
          <AgeBadge age={ad.age_category} />
          <FunnelBadge funnel={ad.funnel_type} />
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
            {ad.ad_format || 'Image'}
          </span>
        </div>

        {/* ROW 2: Page name + Domain */}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[var(--text)] truncate">{ad.page_name || 'Unknown Page'}</h3>
          {ad.domain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--muted)]">
              {ad.domain}
            </span>
          )}
        </div>

        {/* ROW 3: Preview */}
        <AdPreview ad={ad} />

        {/* ROW 4: Body text */}
        {bodyText && (
          <div className="text-sm text-[var(--muted)]">
            <p>{displayText}</p>
            {bodyText.length > 200 && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="text-[var(--primary)] text-xs mt-1 hover:underline"
              >
                {showFullText ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* ROW 5: Countries */}
        {countries.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {countries.map(c => (
              <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted)]">
                {c}
              </span>
            ))}
          </div>
        )}

        {/* ROW 6: Revenue */}
        <RevenueBox ad={ad} />

        {/* ROW 7: Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
          <button
            onClick={() => saveToSwipeFile(ad)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-white/5 transition"
          >
            \uD83D\uDD16 Save
          </button>
          <button
            onClick={() => onAnalyze && onAnalyze(ad)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-white/5 transition"
          >
            \uD83E\uDD16 Analyze
          </button>
          <button
            onClick={() => toggleSelectAd(ad.fb_ad_id)}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg border transition ${
              isSelected
                ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]'
                : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:bg-white/5'
            }`}
          >
            \uD83D\uDCCB {isSelected ? 'Selected' : 'Compare'}
          </button>
          <a
            href={fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-white/5 transition"
          >
            \u2197\uFE0F View
          </a>
        </div>
      </div>
    </div>
  );
}
