import React from 'react';

const FUNNEL_ICONS = {
  'VSL': '\uD83C\uDFA5',
  'Webinar': '\uD83C\uDF99\uFE0F',
  'Lead Gen': '\uD83D\uDCE7',
  'Product': '\uD83D\uDED2',
  'Booking': '\uD83D\uDCC5',
  'App': '\uD83D\uDCF1',
  'Community': '\uD83D\uDC65',
  'Other': '\uD83D\uDD17'
};

export default function FunnelBadge({ funnel }) {
  const icon = FUNNEL_ICONS[funnel] || FUNNEL_ICONS['Other'];

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
      {icon} {funnel || 'Other'}
    </span>
  );
}
