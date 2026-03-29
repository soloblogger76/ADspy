import React, { useState } from 'react';

export default function RevenueBox({ ad }) {
  const [open, setOpen] = useState(false);

  const fmt = ad.revenue_formatted || {};
  const confidence = ad.confidence || 'Low';

  let confIcon, confColor;
  if (confidence === 'High') {
    confIcon = '\uD83D\uDFE2';
    confColor = 'text-green-400';
  } else if (confidence === 'Medium') {
    confIcon = '\uD83D\uDFE1';
    confColor = 'text-yellow-400';
  } else {
    confIcon = '\uD83D\uDD34';
    confColor = 'text-red-400';
  }

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5 transition"
      >
        <span>\uD83D\uDCB0 Revenue Estimate</span>
        <span className="text-xs">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div className="px-3 py-3 space-y-2 border-t border-[var(--border)] text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">\uD83D\uDCB0 Est. Daily Spend:</span>
            <span className="text-[var(--text)]">{fmt.daily_spend || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">\uD83D\uDCB0 Est. Total Spend:</span>
            <span className="text-[var(--text)]">{fmt.total_spend || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">\uD83D\uDCC8 Est. Revenue:</span>
            <span className="text-emerald-400 font-medium">{fmt.revenue || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Confidence:</span>
            <span className={confColor}>{confIcon} {confidence}</span>
          </div>
          <p className="text-xs text-[var(--muted)] pt-1 border-t border-[var(--border)]">
            \u26A0\uFE0F {ad.disclaimer || 'Estimated using industry benchmarks. Not actual Facebook data.'}
          </p>
        </div>
      )}
    </div>
  );
}
