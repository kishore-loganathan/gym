'use client';

import React from 'react';
import { Scale, Calendar, Database, Plus, RefreshCw, Sparkles, Settings, MessageSquare } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats = {}, dbConnected, onOpenQuickLog, onOpenMongoModal, onOpenAiModal, onOpenChatModal, onOpenGoalModal, onRefreshData }) {
  const startW = stats.startWeight !== undefined ? stats.startWeight : 90;
  const targetW = stats.targetWeight !== undefined ? stats.targetWeight : 80;
  const startD = stats.startDate || '17 Sep 2026';
  const endD = stats.endDate || '1 Jan 2027';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Scale className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading text-slate-900 tracking-tight flex items-center gap-2">
                FIT-TRACK <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">{startW} → {targetW} KG</span>
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {startD} – {endD} • Consistency &gt; Perfection
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'daily'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              📅 Daily Log
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              🗓️ Weekly Scores
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              📈 Deep Analytics & Averages
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              📄 Auto Reports
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* Goal Settings Button */}
            <button
              onClick={onOpenGoalModal}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition"
              title="Customize Goal Weights & Start/End Dates"
            >
              <Settings className="w-4 h-4 text-slate-700" />
            </button>

            {/* Analytics Q&A Chatbot */}
            <button
              onClick={onOpenChatModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ask Analytics</span>
            </button>

            {/* Insights Coach Button */}
            <button
              onClick={onOpenAiModal}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition"
              title="Open Insights & Coaching"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </button>

            {/* DB Status indicator */}
            <button
              onClick={onOpenMongoModal}
              className={`p-2 rounded-xl border text-xs transition-all ${
                dbConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
              title={dbConnected ? 'MongoDB Atlas Connected' : 'DB Warning'}
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Refresh */}
            <button
              onClick={onRefreshData}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Quick Log Button */}
            <button
              onClick={onOpenQuickLog}
              className="hidden sm:flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Entry</span>
            </button>
          </div>

        </div>

        {/* Mobile & Tablet Nav Tabs */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-200 mt-1 overflow-x-auto text-xs whitespace-nowrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'dashboard' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'daily' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Daily Log
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'weekly' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'analytics' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Averages
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'reports' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Reports
          </button>
        </div>

      </div>
    </header>
  );
}
