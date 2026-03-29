import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { NicheBadge } from '../components/Shared/Badge';

export default function Competitors() {
  const competitors = useStore(s => s.competitors);
  const fetchCompetitors = useStore(s => s.fetchCompetitors);
  const addCompetitor = useStore(s => s.addCompetitor);
  const removeCompetitor = useStore(s => s.removeCompetitor);
  const showToast = useStore(s => s.showToast);

  const [form, setForm] = useState({ page_id: '', page_name: '', niche: '', notes: '' });
  const [viewAds, setViewAds] = useState(null);
  const [adsData, setAdsData] = useState([]);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.page_id || !form.page_name) return;
    await addCompetitor(form);
    setForm({ page_id: '', page_name: '', niche: '', notes: '' });
  };

  const handleViewAds = async (competitor) => {
    try {
      const res = await client.get(`/api/competitors/${competitor.id}/ads`);
      setAdsData(res.data);
      setViewAds(competitor.id);
    } catch (err) {
      showToast('Failed to load ads', 'error');
    }
  };

  const handleCheck = async (competitor) => {
    setChecking(competitor.id);
    try {
      const res = await client.post(`/api/competitors/${competitor.id}/check`);
      showToast(`Found ${res.data.new_ads} new ads`, 'success');
      fetchCompetitors();
    } catch (err) {
      showToast('Check failed', 'error');
    } finally {
      setChecking(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Competitors</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-bold text-[var(--text)] mb-3">Add Competitor</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={form.page_id}
            onChange={(e) => setForm({ ...form, page_id: e.target.value })}
            placeholder="Facebook Page ID"
            required
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            type="text"
            value={form.page_name}
            onChange={(e) => setForm({ ...form, page_name: e.target.value })}
            placeholder="Page Name"
            required
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            type="text"
            value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
            placeholder="Niche (optional)"
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:opacity-90 transition"
          >
            Add Competitor
          </button>
        </div>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notes (optional)"
          className="mt-3 w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
        />
      </form>

      {/* Competitors list */}
      <div className="space-y-3">
        {competitors.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-8">No competitors added yet</p>
        ) : (
          competitors.map(c => (
            <div key={c.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-[var(--text)]">{c.page_name}</h3>
                  {c.niche && <NicheBadge niche={c.niche} />}
                  <span className="text-xs text-[var(--muted)]">{c.total_ads || 0} ads</span>
                  {c.new_ads > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {'\uD83C\uDD95'} {c.new_ads} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">
                    {c.last_checked ? `Checked: ${new Date(c.last_checked).toLocaleDateString()}` : 'Never checked'}
                  </span>
                  <button
                    onClick={() => handleViewAds(c)}
                    className="px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-white/5"
                  >
                    View Ads
                  </button>
                  <button
                    onClick={() => handleCheck(c)}
                    disabled={checking === c.id}
                    className="px-3 py-1.5 text-xs bg-[var(--primary)]/20 border border-[var(--primary)]/30 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/30 disabled:opacity-50"
                  >
                    {checking === c.id ? 'Checking...' : 'Check Now'}
                  </button>
                  <button
                    onClick={() => removeCompetitor(c.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {c.notes && <p className="text-xs text-[var(--muted)] mt-2">{c.notes}</p>}

              {viewAds === c.id && (
                <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-2">
                  {adsData.length === 0 ? (
                    <p className="text-xs text-[var(--muted)]">No ads found</p>
                  ) : (
                    adsData.map(a => (
                      <div key={a.id} className="flex items-center justify-between bg-[var(--bg)] rounded-lg p-3">
                        <div className="flex-1">
                          <p className="text-sm text-[var(--text)]">{a.ad_data?.page_name || 'Unknown'}</p>
                          <p className="text-xs text-[var(--muted)] line-clamp-1">{a.ad_data?.ad_creative_body || ''}</p>
                        </div>
                        {a.is_new === 1 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{'\uD83C\uDD95'}</span>
                        )}
                        <a
                          href={`https://www.facebook.com/ads/library/?id=${a.fb_ad_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-xs text-[var(--primary)] hover:underline"
                        >
                          View
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
