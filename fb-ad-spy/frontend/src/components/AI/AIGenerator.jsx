import React, { useState } from 'react';
import client from '../../api/client';
import useStore from '../../store/useStore';

export default function AIGenerator({ swipeFileAds }) {
  const showToast = useStore(s => s.showToast);
  const saveToSwipeFile = useStore(s => s.saveToSwipeFile);

  const [selectedAdId, setSelectedAdId] = useState('');
  const [userProduct, setUserProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!selectedAdId) {
      showToast('Select a winning ad', 'warning');
      return;
    }
    if (!userProduct.trim()) {
      showToast('Describe your product', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/api/ai/generate', {
        ad_id: selectedAdId,
        user_product: userProduct
      });
      setResult(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (variation) => {
    const text = `${variation.headline}\n\n${variation.primary_text}\n\n${variation.description}\n\nCTA: ${variation.cta}`;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[var(--text)]">Ad Copy Generator</h3>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Select Winning Ad</label>
        <select
          value={selectedAdId}
          onChange={(e) => setSelectedAdId(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="">Choose a winning ad...</option>
          {(swipeFileAds || []).map(item => (
            <option key={item.id} value={item.fb_ad_id}>
              {item.ad_data?.page_name || item.fb_ad_id} - Score: {item.ad_data?.winning_score || 'N/A'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Describe Your Product</label>
        <textarea
          value={userProduct}
          onChange={(e) => setUserProduct(e.target.value)}
          placeholder="e.g. Online yoga course for beginners, $49/month, includes live sessions and meal plans..."
          rows={4}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate 3 Ad Copies'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      )}

      {result && result.variations && !loading && (
        <div className="space-y-4">
          {result.variations.map((variation, i) => (
            <div key={i} className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--text)]">Variation {i + 1}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">Effectiveness:</span>
                  <span className="text-sm font-bold text-emerald-400">{variation.estimated_effectiveness}/10</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-[var(--muted)]">Headline</span>
                <p className="text-sm font-bold text-[var(--text)]">{variation.headline}</p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted)]">Primary Text</span>
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{variation.primary_text}</p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted)]">Description</span>
                <p className="text-sm text-[var(--muted)]">{variation.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-[var(--muted)]">CTA:</span>
                  <span className="ml-1 text-sm text-[var(--primary)] font-medium">{variation.cta}</span>
                </div>
                <div>
                  <span className="text-xs text-[var(--muted)]">Hook:</span>
                  <span className="ml-1 text-xs text-purple-400">{variation.hook_used}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-[var(--muted)]">Target Audience:</span>
                <span className="ml-1 text-xs text-[var(--text)]">{variation.target_audience}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  onClick={() => copyToClipboard(variation)}
                  className="flex-1 px-3 py-2 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-white/5 transition"
                >
                  Copy All
                </button>
                <button
                  onClick={() => {
                    saveToSwipeFile({
                      fb_ad_id: `generated-${Date.now()}-${i}`,
                      page_name: 'AI Generated',
                      ad_creative_body: variation.primary_text,
                      ad_creative_link_title: variation.headline,
                      niche: 'Other',
                      winning_score: variation.estimated_effectiveness * 10
                    }, 'AI Generated');
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-emerald-600/20 border border-emerald-600/30 rounded-lg text-emerald-400 hover:bg-emerald-600/30 transition"
                >
                  Save to Swipe File
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
