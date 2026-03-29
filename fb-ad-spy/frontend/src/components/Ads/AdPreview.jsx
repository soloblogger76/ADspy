import React, { useState } from 'react';

export default function AdPreview({ ad }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const snapshotUrl = ad.ad_snapshot_url;
  const isVideo = ad.ad_format === 'Video';

  if (!snapshotUrl || errored) {
    return (
      <div className="relative w-full h-64 bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-[var(--muted)] text-center px-4 line-clamp-4">
          {ad.ad_creative_body ? ad.ad_creative_body.substring(0, 150) + '...' : 'No preview available'}
        </p>
        {snapshotUrl && (
          <a
            href={snapshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            \uD83D\uDC41 View Ad Preview \u2192
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-800">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
          <span className="text-[var(--muted)] text-sm">Loading preview...</span>
        </div>
      )}
      <iframe
        src={snapshotUrl}
        className={`w-full h-full border-0 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        sandbox="allow-same-origin allow-scripts"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        title="Ad Preview"
      />
      {isVideo && loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center">
            <span className="text-3xl">\u25B6\uFE0F</span>
          </div>
        </div>
      )}
    </div>
  );
}
