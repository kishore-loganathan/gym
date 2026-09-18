'use client';

import React from 'react';
import { 
  Scale, 
  Calendar, 
  Database, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Settings, 
  MessageSquare,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  LineChart,
  FileText,
  Target
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  stats = {}, 
  dbConnected, 
  onOpenQuickLog, 
  onOpenMongoModal, 
  onOpenAiModal, 
  onOpenChatModal, 
  onOpenGoalModal, 
  onRefreshData 
}) {
  const startW = stats.startWeight !== undefined ? stats.startWeight : 90;
  const targetW = stats.targetWeight !== undefined ? stats.targetWeight : 80;
  const startD = stats.startDate || '17 Sep 2026';
  const endD = stats.endDate || '1 Jan 2027';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily Tracker', icon: CalendarDays },
    { id: 'weekly', label: 'Weekly Scores', icon: CheckSquare },
    { id: 'analytics', label: 'Deep Analytics', icon: LineChart },
    { id: 'reports', label: 'Auto Reports', icon: FileText },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
          <Scale className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-base font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-1.5">
            FIT-TRACK
          </h1>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200 inline-block mt-0.5">
            {startW} → {targetW} KG
          </span>
        </div>
      </div>

      {/* Goal Target Info Card */}
      <div className="p-4 mx-3 my-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-700 font-semibold">
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-600" /> Timeline Goal
          </span>
          <button
            onClick={onOpenGoalModal}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            title="Edit Goal & Dates"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
          <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
          {startD} – {endD}
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="px-3 mb-4">
        <button
          onClick={onOpenQuickLog}
          className="w-full py-2.5 px-4 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Quick Log Entry</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Utilities & AI Controls Section */}
      <div className="p-3 border-t border-slate-100 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
          AI & Database Utilities
        </div>

        <button
          onClick={onOpenChatModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Ask Analytics AI</span>
        </button>

        <button
          onClick={onOpenAiModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>View AI Insights</span>
        </button>

        <button
          onClick={onOpenMongoModal}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            dbConnected
              ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800'
              : 'bg-amber-50/60 border-amber-200/80 text-amber-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>MongoDB Atlas</span>
          </span>
          <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </button>

        <button
          onClick={onRefreshData}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync / Refresh Data</span>
        </button>
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-mono">
        v1.0 • 107 Days Tracker
      </div>
    </aside>
  );
}
