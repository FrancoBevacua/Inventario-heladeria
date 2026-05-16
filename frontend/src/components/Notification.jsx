import React from 'react';

export default function Notification({ message, type }) {
  const scheme = {
    success: 'bg-emerald-600 text-white shadow-emerald-100',
    error: 'bg-red-600 text-white shadow-red-100',
    warning: 'bg-amber-500 text-white shadow-amber-100',
    info: 'bg-blue-600 text-white shadow-blue-100'
  };

  return (
    <div className={`fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg z-50 font-bold text-xs uppercase tracking-wide border border-white/10 animate-slide-up ${scheme[type] || scheme.info}`}>
      {message}
    </div>
  );
}