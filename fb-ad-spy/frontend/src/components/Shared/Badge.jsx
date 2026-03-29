import React from 'react';

const NICHE_COLORS = {
  'Education': 'bg-blue-500/20 text-blue-400',
  'Finance': 'bg-emerald-500/20 text-emerald-400',
  'E-commerce': 'bg-violet-500/20 text-violet-400',
  'Health': 'bg-rose-500/20 text-rose-400',
  'Real Estate': 'bg-orange-500/20 text-orange-400',
  'SaaS/Tech': 'bg-cyan-500/20 text-cyan-400',
  'Fashion': 'bg-pink-500/20 text-pink-400',
  'Food': 'bg-yellow-500/20 text-yellow-400',
  'Travel': 'bg-teal-500/20 text-teal-400',
  'Beauty': 'bg-fuchsia-500/20 text-fuchsia-400',
  'Automotive': 'bg-slate-500/20 text-slate-400',
  'Other': 'bg-gray-500/20 text-gray-400'
};

const AGE_CONFIG = {
  'new': { icon: '\uD83D\uDFE2', color: 'text-green-400' },
  'recent': { icon: '\uD83D\uDFE1', color: 'text-yellow-400' },
  'old': { icon: '\uD83D\uDD34', color: 'text-red-400' }
};

export function NicheBadge({ niche }) {
  const colorClass = NICHE_COLORS[niche] || NICHE_COLORS['Other'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {niche || 'Other'}
    </span>
  );
}

export function AgeBadge({ age }) {
  const config = AGE_CONFIG[age] || AGE_CONFIG['new'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.color}`}>
      {config.icon} {age}
    </span>
  );
}

export function ScoreBadge({ score }) {
  let bg;
  if (score >= 80) bg = 'bg-emerald-500';
  else if (score >= 60) bg = 'bg-blue-500';
  else if (score >= 40) bg = 'bg-yellow-500';
  else if (score >= 20) bg = 'bg-orange-500';
  else bg = 'bg-gray-500';

  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold text-white ${bg}`}>
      {score}
    </span>
  );
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-500/20 text-gray-400',
    primary: 'bg-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
