'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Flame, Target, Trophy, Clock, CheckCircle2, TrendingDown, Dumbbell, Utensils, Moon, Coffee, ShieldAlert, Sparkles, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ stats, dailyLogs = [], weeklyCheckins = [], onOpenQuickLog, onOpenAiModal }) {
  if (!stats) return <div className="p-8 text-center text-slate-500">Loading Dashboard Analytics...</div>;

  const startW = stats.startWeight !== undefined ? stats.startWeight : 90.0;
  const targetW = stats.targetWeight !== undefined ? stats.targetWeight : 80.0;
  const totalDays = stats.totalDays || 107;

  const dateLabels = dailyLogs.map(d => d.displayDate);
  const actualWeightData = dailyLogs.map(d => d.weight);
  
  const targetTrajectory = dailyLogs.map((_, idx) => {
    return +(startW - (idx / Math.max(1, dailyLogs.length - 1)) * (startW - targetW)).toFixed(2);
  });

  const weightChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Actual Logged Weight (kg)',
        data: actualWeightData,
        borderColor: '#059669',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#059669',
        pointRadius: 3,
        tension: 0.2,
        fill: true,
        spanGaps: true
      },
      {
        label: `Target Trajectory (${startW} → ${targetW} kg)`,
        data: targetTrajectory,
        borderColor: '#d97706',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#334155', font: { size: 12, weight: '600' } }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#334155',
        shadowColor: 'rgba(0,0,0,0.1)'
      }
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', maxTicksLimit: 12, font: { size: 11 } }
      },
      y: {
        grid: { color: '#e2e8f0' },
        ticks: { color: '#475569', font: { size: 11 } }
      }
    }
  };

  const habitLabels = [
    'Gym / Workout',
    'Home Food',
    'No Sweets',
    'No Maida',
    'No Hotel Food',
    'Sleep Tracked'
  ];

  const habitDataValues = [
    stats.habitCounts?.workout || 0,
    stats.habitCounts?.homeFood || 0,
    stats.habitCounts?.noSweets || 0,
    stats.habitCounts?.noMaida || 0,
    stats.habitCounts?.noHotelFood || 0,
    stats.habitCounts?.sleepTarget || 0
  ];

  const habitBarData = {
    labels: habitLabels,
    datasets: [
      {
        label: `Days Completed (Out of ${totalDays})`,
        data: habitDataValues,
        backgroundColor: [
          '#10b981',
          '#06b6d4',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#3b82f6'
        ],
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#334155'
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11, weight: '600' } } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b' },
        min: 0,
        max: totalDays
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider border border-emerald-200">
              Active Goal
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">{totalDays} Days Fitness Plan</span>
          </div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900">
            Weight Loss Journey: <span className="text-emerald-600">{startW} KG → {targetW} KG</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Focus on daily habit consistency, protein intake (g), sleep, and cardio duration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAiModal}
            className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>View Insights</span>
          </button>
          <button
            onClick={onOpenQuickLog}
            className="px-4.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-1"
          >
            + Update Today's Stats
          </button>
        </div>
      </div>

      {/* 5 Stat Cards (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Weight Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Current Weight</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-slate-900">
              {stats.currentWeight} <span className="text-xs font-normal text-slate-500">kg</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -{stats.weightLost} kg
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Start: <strong className="text-slate-800">{startW} kg</strong></span>
            <span>Target: <strong className="text-emerald-700">{targetW} kg</strong></span>
          </div>
        </div>

        {/* Card 2: Protein Intake */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-cyan-600">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Protein</span>
            <Zap className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-slate-900">
              {stats.averages?.avgProteinGrams || 0} <span className="text-xs font-normal text-slate-500">g/day</span>
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Total Logged: <strong className="text-slate-800">{stats.averages?.totalProteinGrams || 0}g</strong></span>
            <span>Days: <strong className="text-cyan-700">{stats.averages?.proteinDaysLogged || 0}d</strong></span>
          </div>
        </div>

        {/* Card 3: Overall Consistency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Consistency</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-slate-900">
              {stats.overallConsistencyPct}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.totalCheckmarksAchieved}/{stats.totalCheckableUnits})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.overallConsistencyPct)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Days Countdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Days Left</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-slate-900">
              {stats.daysRemaining} <span className="text-xs font-normal text-slate-500">days</span>
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Progress: <strong className="text-slate-800">{stats.daysElapsed}/{totalDays}d</strong></span>
          </div>
        </div>

        {/* Card 5: Streaks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-slate-900">
              {stats.streaks?.current || 0} <span className="text-xs font-normal text-slate-500">days</span>
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Best: <strong className="text-purple-700">{stats.streaks?.longest || 0}d</strong></span>
          </div>
        </div>

      </div>

      {/* Main Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weight Trajectory Graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Weight Loss Progress Trajectory
              </h3>
              <p className="text-xs text-slate-500">Actual logged weight vs expected linear goal path</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <Line data={weightChartData} options={chartOptions} />
          </div>
        </div>

        {/* Habit Breakdown Graph */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Habits Compliance
              </h3>
              <p className="text-xs text-slate-500">Total days completed per habit</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <Bar data={habitBarData} options={barOptions} />
          </div>
        </div>

      </div>

      {/* Daily Non-Negotiables Breakdown Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-emerald-600" />
          Daily Metrics & Non-Negotiables Breakdown ({totalDays} Days Total)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900">Gym / Workout ✓</span>
                <span className="text-emerald-700">{stats.habitPercentages?.workout}%</span>
              </div>
              <p className="text-xs text-slate-500">{stats.habitCounts?.workout || 0} / {totalDays} days</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900">Protein Target Intake (g)</span>
                <span className="text-cyan-700">{stats.averages?.avgProteinGrams || 0}g avg</span>
              </div>
              <p className="text-xs text-slate-500">{stats.averages?.proteinDaysLogged || 0} / {totalDays} days logged</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900">Sleep Duration</span>
                <span className="text-purple-700">{stats.averages?.avgSleepHours || 0}h avg</span>
              </div>
              <p className="text-xs text-slate-500">{stats.averages?.sleepDaysLogged || 0} / {totalDays} days logged</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900">No Sweets/Chocolate ✓</span>
                <span className="text-amber-700">{stats.habitPercentages?.noSweets}%</span>
              </div>
              <p className="text-xs text-slate-500">{stats.habitCounts?.noSweets || 0} / {totalDays} days</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900">No Maida ✓</span>
                <span className="text-indigo-700">{stats.habitPercentages?.noMaida}%</span>
              </div>
              <p className="text-xs text-slate-500">{stats.habitCounts?.noMaida || 0} / {totalDays} days</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900">No Hotel Food ✓</span>
                <span className="text-pink-700">{stats.habitPercentages?.noHotelFood}%</span>
              </div>
              <p className="text-xs text-slate-500">{stats.habitCounts?.noHotelFood || 0} / {totalDays} days</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
