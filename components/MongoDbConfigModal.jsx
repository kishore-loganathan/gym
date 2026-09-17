'use client';

import React from 'react';
import { X, Database, CheckCircle, AlertTriangle, RefreshCw, Globe } from 'lucide-react';

export default function MongoDbConfigModal({ isOpen, onClose, dbConnected, onSeedDatabase }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Vercel & MongoDB Deployment Config
            </h3>
            <p className="text-xs text-slate-500">Database connection parameters for Vercel deployment</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4">

          {/* Connection Status Badge */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            dbConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {dbConnected ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-bold font-heading">
                {dbConnected ? 'MongoDB Server Connected' : 'Ready for Vercel Deployment'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {dbConnected
                  ? 'Real-time database sync is active. All updates are automatically saved to MongoDB.'
                  : 'Add MONGODB_URI in Vercel project environment variables for live cloud database sync.'}
              </p>
            </div>
          </div>

          {/* Vercel Deployment Instructions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Globe className="w-4 h-4 text-emerald-600" />
              1-Click Vercel Deployment Instructions:
            </div>
            <p>1. Push this project to GitHub / GitLab.</p>
            <p>2. Import repository in <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">Vercel.com</a>.</p>
            <p>3. Under <strong>Environment Variables</strong> in Vercel, add:</p>
            <pre className="bg-slate-100 p-2 rounded text-slate-800 font-mono overflow-x-auto text-[11px] border border-slate-200">
              MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/weightloss_tracker
            </pre>
            <p>4. Click <strong>Deploy</strong>. Next.js App Router + API Routes + MongoDB will run seamlessly on Vercel!</p>
          </div>

          {/* Re-seed Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-800">Re-seed 107 Days Template</h5>
              <p className="text-[11px] text-slate-500">Populates 107 days (Sep 17, 2026 – Jan 1, 2027) & 16 Weeks</p>
            </div>
            <button
              onClick={() => {
                onSeedDatabase();
                onClose();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reset/Re-seed</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
