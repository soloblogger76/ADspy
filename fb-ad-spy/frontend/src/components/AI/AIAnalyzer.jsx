import React, { useState } from 'react';
import client from '../../api/client';
import useStore from '../../store/useStore';

export default function AIAnalyzer({ swipeFileAds }) {
  const showToast = useStore(s => s.showToast);
  const [selectedAdId, setSelectedAdId] = useState('');
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!selectedAdId && !manualText) {
      showToast('Select an ad or paste ad text', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (selectedAdId) {
        const res = await client.post('/api/ai/analyze', { ad_id: selectedAdId });
        setResult(res.data);
      } else {
        showToast('Please select an ad from your swipe file', 'warning');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[var(--text)]">Ad Analyzer</h3>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Select Ad from Swipe File</label>
        <select
          value={selectedAdId}
          onChange={(e) => setSelectedAdId(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="">Choose an ad...</option>
          {(swipeFileAds || []).map(item => (
            <option key={item.id} value={item.fb_ad_id}>
              {item.ad_data?.page_name || item.fb_ad_id} - {(item.ad_data?.ad_creative_body || '').substring(0, 50)}...
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Or paste ad text manually</label>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Paste ad text here..."
          rows={3}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Ad'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4 bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--muted)]">Hook Type</span>
              <p className="text-sm font-medium text-[var(--text)]">{result.hook_type}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted)]">Tone</span>
              <p className="text-sm font-medium text-[var(--text)]">{result.tone}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-[var(--muted)]">Score</span>
              <p className="text-3xl font-bold text-[var(--primary)]">{result.overall_score}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-[var(--muted)]">Target Audience</span>
              <p className="text-sm text-[var(--text)]">{result.target_audience}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted)]">Core Offer</span>
              <p className="text-sm text-[var(--text)]">{result.core_offer}</p>
            </div>
          </div>

          <div>
            <span className="text-xs text-[var(--muted)]">Why It Works</span>
            <p className="text-sm text-[var(--text)] mt-1">{result.why_it_works}</p>
          </div>

          <div>
            <span className="text-xs text-[var(--muted)]">Psychological Triggers</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(result.psychological_triggers || []).map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-[var(--muted)]">Weaknesses</span>
            <ul className="mt-1 space-y-1">
              {(result.weaknesses || []).map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-xs text-[var(--muted)]">Improvement Suggestions</span>
            <ul className="mt-1 space-y-1">
              {(result.improvement_suggestions || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
            <div>
              <span className="text-xs text-[var(--muted)]">Hook Strength</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--border)] rounded-full">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full"
                    style={{ width: `${(result.hook_strength || 0) * 10}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text)]">{result.hook_strength}/10</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-[var(--muted)]">CTA Effectiveness</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--border)] rounded-full">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(result.cta_effectiveness || 0) * 10}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text)]">{result.cta_effectiveness}/10</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
