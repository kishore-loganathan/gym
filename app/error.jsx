'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Next.js App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="glass-panel p-8 text-center max-w-md w-full border-amber-500/30">
        <div className="text-amber-400 text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold font-heading text-white mb-2">Something went wrong</h2>
        <p className="text-xs text-slate-400 mb-6">
          {error?.message || 'An unexpected error occurred while loading the application.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
