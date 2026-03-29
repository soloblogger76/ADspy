import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { NicheBadge, ScoreBadge } from '../components/Shared/Badge';
import ExportButton from '../components/Shared/ExportButton';

export default function SwipeFile() {
  const swipeFile = useStore(s => s.swipeFile);
  const fetchSwipeFile = useStore(s => s.fetchSwipeFile);
  const showToast = useStore(s => s.showToast);

  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState('');
  const [search, setSearch] = useState('');
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    fetchSwipeFile();
    loadCollections();
  }, []);

  useEffect(() => {
    fetchSwipeFile(activeCollection, search);
  }, [activeCollection, search]);

  const loadCollections = async () => {
    try {
      const res = await client.get('/api/swipefile/collections');
      setCollections(res.data);
    } catch (err) {
      console.error('Collections error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/api/swipefile/${id}`);
      fetchSwipeFile(activeCollection, search);
      loadCollections();
      showToast('Removed from swipe file', 'success');
    } catch (err) {
      showToast('Failed to remove', 'error');
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      await client.patch(`/api/swipefile/${id}/notes`, { notes: notesText });
      setEditingNotes(null);
      fetchSwipeFile(activeCollection, search);
      showToast('Notes updated', 'success');
    } catch (err) {
      showToast('Failed to update notes', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">Swipe File</h1>
        <div className="flex gap-2">
          <ExportButton type="pdf" endpoint="/api/swipefile/export/pdf" label="Export PDF" />
          <ExportButton type="csv" endpoint="/api/swipefile/export/csv" label="Export CSV" />
        </div>
      </div>

      {/* Collection tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCollection('')}
          className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-lg transition ${
            activeCollection === ''
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          All ({swipeFile.length})
        </button>
        {collections.map(c => (
          <button
            key={c.collection_name}
            onClick={() => setActiveCollection(c.collection_name)}
            className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-lg transition ${
              activeCollection === c.collection_name
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {c.collection_name} ({c.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search swipe file..."
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
      />

      {/* Ads grid */}
      {swipeFile.length === 0 ? (
        <p className="text-center text-[var(--muted)] py-8">No ads in swipe file</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {swipeFile.map(item => {
            const ad = item.ad_data || {};
            return (
              <div key={item.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ScoreBadge score={ad.winning_score || 0} />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[var(--text)] truncate">{ad.page_name || 'Unknown'}</h3>
                    <span className="text-xs text-[var(--muted)]">{item.collection_name}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <NicheBadge niche={ad.niche} />
                  {ad.funnel_type && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{ad.funnel_type}</span>
                  )}
                </div>

                <p className="text-xs text-[var(--muted)] line-clamp-3">{ad.ad_creative_body || 'No text'}</p>

                {/* Notes */}
                {editingNotes === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      rows={2}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveNotes(item.id)}
                        className="px-2 py-1 text-xs bg-emerald-600 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--text)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => { setEditingNotes(item.id); setNotesText(item.notes || ''); }}
                    className="text-xs text-[var(--muted)] cursor-pointer hover:text-[var(--text)] italic"
                  >
                    {item.notes || 'Click to add notes...'}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                  <a
                    href={`https://www.facebook.com/ads/library/?id=${item.fb_ad_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--primary)] hover:bg-white/5"
                  >
                    View on FB
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
