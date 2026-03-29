import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import useStore from '../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useStore(s => s.setUser);
  const setToken = useStore(s => s.setToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await client.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--primary)]">FB Ad Spy</h1>
          <p className="text-[var(--muted)] mt-2">Intelligence Tool</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text)]">Sign In</h2>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-xs text-center text-[var(--muted)]">
            First time? Register via POST /api/auth/register
          </p>
        </form>
      </div>
    </div>
  );
}
