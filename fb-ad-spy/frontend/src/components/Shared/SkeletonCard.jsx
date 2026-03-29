import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="w-10 h-10 bg-gray-700 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="h-48 bg-gray-700 rounded-lg mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-700 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-700 rounded flex-1" />
        <div className="h-8 bg-gray-700 rounded flex-1" />
        <div className="h-8 bg-gray-700 rounded flex-1" />
      </div>
    </div>
  );
}
