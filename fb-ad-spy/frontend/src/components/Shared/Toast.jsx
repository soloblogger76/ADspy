import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500/90 border-emerald-400',
    error: 'bg-red-500/90 border-red-400',
    warning: 'bg-yellow-500/90 border-yellow-400',
    info: 'bg-blue-500/90 border-blue-400'
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-white text-sm shadow-lg ${colors[type] || colors.info}`}>
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white/70 hover:text-white text-lg leading-none">
          &times;
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
