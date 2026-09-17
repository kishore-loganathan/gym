'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import DailyTracker from '@/components/DailyTracker';
import WeeklyTracker from '@/components/WeeklyTracker';
import DeepAnalyticsPage from '@/components/DeepAnalyticsPage';
import ReportsPage from '@/components/ReportsPage';
import QuickLogModal from '@/components/QuickLogModal';
import MongoDbConfigModal from '@/components/MongoDbConfigModal';
import AiFeedbackModal from '@/components/AiFeedbackModal';
import AiChatModal from '@/components/AiChatModal';
import GoalSettingsModal from '@/components/GoalSettingsModal';
import { getInitialState } from '@/lib/initialState';

export default function Page() {
  const initial = getInitialState();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(initial.stats);
  const [dailyLogs, setDailyLogs] = useState(initial.dailyLogs);
  const [weeklyCheckins, setWeeklyCheckins] = useState(initial.weeklyCheckins);
  const [dbConnected, setDbConnected] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [selectedQuickLogDate, setSelectedQuickLogDate] = useState(null);
  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Background fetch to sync with MongoDB Atlas
  const syncWithServer = async (forceFresh = false) => {
    try {
      setSyncing(true);
      const url = forceFresh ? '/api/init?fresh=true' : '/api/init';
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.dailyLogs && data.dailyLogs.length > 0) setDailyLogs(data.dailyLogs);
        if (data.weeklyCheckins && data.weeklyCheckins.length > 0) setWeeklyCheckins(data.weeklyCheckins);
        setDbConnected(!!data.dbConnected);

        try {
          localStorage.setItem('fit_track_cache', JSON.stringify(data));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Background sync warning:', err.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Restore from localStorage if available
    try {
      const saved = localStorage.getItem('fit_track_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
        if (parsed.weeklyCheckins) setWeeklyCheckins(parsed.weeklyCheckins);
        setDbConnected(!!parsed.dbConnected);
      }
    } catch (e) {}

    // Background sync with MongoDB Atlas
    syncWithServer();
  }, []);

  const handleUpdateDailyLog = async (updatedLog) => {
    // Immediate Optimistic Update
    setDailyLogs(prev => prev.map(d => (d.date === updatedLog.date ? updatedLog : d)));

    try {
      const res = await fetch(`/api/daily/${updatedLog.date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLog)
      });

      if (res.ok) {
        syncWithServer(true);
      }
    } catch (err) {
      console.error('Error updating daily log:', err);
    }
  };

  const handleUpdateWeeklyCheckin = async (updatedWeekly) => {
    setWeeklyCheckins(prev => prev.map(w => (w.weekNumber === updatedWeekly.weekNumber ? updatedWeekly : w)));

    try {
      const res = await fetch(`/api/weekly/${updatedWeekly.weekNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWeekly)
      });

      if (res.ok) {
        syncWithServer(true);
      }
    } catch (err) {
      console.error('Error updating weekly checkin:', err);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      const res = await fetch('/api/seed?force=true', { method: 'POST' });
      if (res.ok) {
        alert('Database successfully re-seeded with 107 Days and 16 Weeks!');
        syncWithServer(true);
      }
    } catch (err) {
      alert('Seeding error: ' + err.message);
    }
  };

  const handleOpenQuickLogForDate = (log) => {
    setSelectedQuickLogDate(log);
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        dbConnected={dbConnected}
        onOpenQuickLog={() => {
          setSelectedQuickLogDate(null);
          setIsQuickLogOpen(true);
        }}
        onOpenMongoModal={() => setIsMongoModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenChatModal={() => setIsChatModalOpen(true)}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onRefreshData={() => syncWithServer(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              dailyLogs={dailyLogs}
              weeklyCheckins={weeklyCheckins}
              onOpenQuickLog={() => {
                setSelectedQuickLogDate(null);
                setIsQuickLogOpen(true);
              }}
              onOpenAiModal={() => setIsAiModalOpen(true)}
            />
          )}

          {activeTab === 'daily' && (
            <DailyTracker
              dailyLogs={dailyLogs}
              onUpdateLog={handleUpdateDailyLog}
              onOpenQuickLogForDate={handleOpenQuickLogForDate}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklyTracker
              weeklyCheckins={weeklyCheckins}
              onUpdateWeeklyCheckin={handleUpdateWeeklyCheckin}
            />
          )}

          {activeTab === 'analytics' && (
            <DeepAnalyticsPage
              stats={stats}
              dailyLogs={dailyLogs}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage />
          )}

        </main>

        <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 bg-white">
          <p>FIT-TRACK Full Next.js App Router Project • Dynamic Goal & Timeline • AI Empowered • Vercel Ready</p>
        </footer>
      </div>

      {/* Modals */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        selectedLog={selectedQuickLogDate}
        dailyLogs={dailyLogs}
        onSaveLog={handleUpdateDailyLog}
      />

      <MongoDbConfigModal
        isOpen={isMongoModalOpen}
        onClose={() => setIsMongoModalOpen(false)}
        dbConnected={dbConnected}
        onSeedDatabase={handleSeedDatabase}
      />

      <AiFeedbackModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        stats={stats}
        dailyLogs={dailyLogs}
      />

      <AiChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        stats={stats}
      />

      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        stats={stats}
        onSaveSettings={() => syncWithServer(true)}
      />

    </div>
  );
}
