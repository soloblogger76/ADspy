import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function TopBar() {
  const user = useStore(s => s.user);
  const logout = useStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[var(--card)] border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-[var(--text)]">
          {user?.team_name && <span className="text-[var(--muted)]">{user.team_name} / </span>}
          Welcome, {user?.name || 'User'}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--muted)] bg-[var(--bg)] px-2 py-1 rounded">
          {user?.role || 'member'}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--muted)] hover:text-[var(--danger)] transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
