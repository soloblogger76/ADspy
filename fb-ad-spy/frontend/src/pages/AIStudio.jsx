import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import AIAnalyzer from '../components/AI/AIAnalyzer';
import AIGenerator from '../components/AI/AIGenerator';

export default function AIStudio() {
  const swipeFile = useStore(s => s.swipeFile);
  const fetchSwipeFile = useStore(s => s.fetchSwipeFile);

  useEffect(() => {
    fetchSwipeFile();
  }, [fetchSwipeFile]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">AI Studio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <AIAnalyzer swipeFileAds={swipeFile} />
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <AIGenerator swipeFileAds={swipeFile} />
        </div>
      </div>
    </div>
  );
}
