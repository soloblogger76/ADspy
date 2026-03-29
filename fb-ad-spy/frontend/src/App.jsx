import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdExplorer from './pages/AdExplorer';
import Competitors from './pages/Competitors';
import SwipeFile from './pages/SwipeFile';
import Alerts from './pages/Alerts';
import AIStudio from './pages/AIStudio';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import Toast from './components/Shared/Toast';

function ProtectedLayout({ children }) {
  const token = useStore(s => s.token);
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6 bg-[var(--bg)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const toast = useStore(s => s.toast);
  const clearToast = useStore(s => s.clearToast);

  return (
    <BrowserRouter>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/explorer" element={<ProtectedLayout><AdExplorer /></ProtectedLayout>} />
        <Route path="/competitors" element={<ProtectedLayout><Competitors /></ProtectedLayout>} />
        <Route path="/swipefile" element={<ProtectedLayout><SwipeFile /></ProtectedLayout>} />
        <Route path="/alerts" element={<ProtectedLayout><Alerts /></ProtectedLayout>} />
        <Route path="/ai-studio" element={<ProtectedLayout><AIStudio /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
