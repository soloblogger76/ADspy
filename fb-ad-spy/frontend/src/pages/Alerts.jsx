import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';

export default function Alerts() {
  const alerts = useStore(s => s.alerts);
  const fetchAlerts = useStore(s => s.fetchAlerts);
  const createAlert = useStore(s => s.createAlert);
  const toggleAlert = useStore(s => s.toggleAlert);
  const deleteAlert = useStore(s => s.deleteAlert);

  const [form, setForm] = useState({
    alert_type: 'keyword',
    keyword: '',
    country: '',
    niche: '',
    email_to: ''
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAlerts();
    loadLogs();
  }, [fetchAlerts]);

  const loadLogs = async () => {
    try {
      const res = await client.get('/api/alerts/log');
      setLogs(res.data);
    } catch (err) {
      console.error('Logs error:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email_to) return;
    await createAlert(form);
    setForm({ alert_type: 'keyword', keyword: '', country: '', niche: '', email_to: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Alerts</h1>

      {/* Create alert form */}
      <form onSubmit={handleCreate} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-[var(--text)]">Create New Alert</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={form.alert_type}
            onChange={(e) => setForm({ ...form, alert_type: e.target.value })}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="keyword">Keyword Alert</option>
            <option value="niche">Niche Alert</option>
            <option value="country">Country Alert</option>
            <option value="competitor">Competitor Alert</option>
          </select>
          <input
            type="text"
            value={form.keyword}
            onChange={(e) => setForm({ ...form, keyword: e.target.value })}
            placeholder="Keyword"
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="Country code (e.g. US)"
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            type="email"
            value={form.email_to}
            onChange={(e) => setForm({ ...form, email_to: e.target.value })}
            placeholder="Email to notify"
            required
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:opacity-90 transition"
          >
            Create Alert
          </button>
        </div>
        <input
          type="text"
          value={form.niche}
          onChange={(e) => setForm({ ...form, niche: e.target.value })}
          placeholder="Niche filter (optional)"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
        />
      </form>

      {/* Active alerts */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[var(--text)]">Active Alerts ({alerts.length})</h3>
        {alerts.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-4">No alerts configured</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleAlert(alert.id, !alert.is_active)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    alert.is_active ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    alert.is_active ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
                <div>
                  <p className="text-sm text-[var(--text)]">
                    <span className="font-medium">{alert.alert_type}</span>
                    {alert.keyword && <span> &mdash; "{alert.keyword}"</span>}
                    {alert.country && <span> in {alert.country}</span>}
                    {alert.niche && <span> ({alert.niche})</span>}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Notify: {alert.email_to}
                    {alert.last_triggered && (
                      <span> | Last triggered: {new Date(alert.last_triggered).toLocaleString()}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Trigger history */}
      <div>
        <h3 className="text-sm font-bold text-[var(--text)] mb-3">Trigger History</h3>
        {logs.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-4">No triggers yet</p>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs text-[var(--muted)] font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-xs text-[var(--muted)] font-medium">Keyword</th>
                  <th className="px-4 py-3 text-left text-xs text-[var(--muted)] font-medium">Country</th>
                  <th className="px-4 py-3 text-left text-xs text-[var(--muted)] font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-xs text-[var(--muted)] font-medium">Triggered</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-[var(--border)]">
                    <td className="px-4 py-3 text-[var(--text)]">{log.alert_type}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{log.keyword || '-'}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{log.country || '-'}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{log.email_to}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{new Date(log.last_triggered).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
