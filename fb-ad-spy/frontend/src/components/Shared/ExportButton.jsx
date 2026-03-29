import React, { useState } from 'react';
import client from '../../api/client';

export default function ExportButton({ type = 'pdf', endpoint = '/api/swipefile/export/pdf', label }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const isPdf = type === 'pdf';
      const res = await client.get(endpoint, {
        responseType: isPdf ? 'blob' : 'text'
      });

      const blob = isPdf ? new Blob([res.data], { type: 'application/pdf' }) : new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isPdf ? 'export.pdf' : 'export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--border)] transition disabled:opacity-50"
    >
      {loading ? (
        <span className="animate-spin">&#9696;</span>
      ) : type === 'pdf' ? (
        '\uD83D\uDCC4'
      ) : (
        '\uD83D\uDCCA'
      )}
      {label || (type === 'pdf' ? 'Export PDF' : 'Export CSV')}
    </button>
  );
}
