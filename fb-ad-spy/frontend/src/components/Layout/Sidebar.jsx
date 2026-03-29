import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '\uD83D\uDCCA' },
  { path: '/explorer', label: 'Ad Explorer', icon: '\uD83D\uDD0D' },
  { path: '/competitors', label: 'Competitors', icon: '\uD83C\uDFAF' },
  { path: '/swipefile', label: 'Swipe File', icon: '\uD83D\uDCCC' },
  { path: '/alerts', label: 'Alerts', icon: '\uD83D\uDD14' },
  { path: '/ai-studio', label: 'AI Studio', icon: '\uD83E\uDD16' }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-[var(--primary)]">FB Ad Spy</h1>
            <p className="text-xs text-[var(--muted)]">Intelligence Tool</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-[var(--muted)] hover:text-[var(--text)] text-sm"
        >
          {collapsed ? '\u27A1' : '\u2B05'}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-r-2 border-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        {!collapsed && (
          <p className="text-xs text-[var(--muted)]">v1.0.0</p>
        )}
      </div>
    </aside>
  );
}
