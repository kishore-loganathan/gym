'use client';

import React from 'react';
import { Flame, Zap, Moon, Activity, TrendingDown, CheckCircle2, Award, Calendar, BarChart3, Dumbbell } from 'lucide-react';

export default function DeepAnalyticsPage({ stats, dailyLogs = [] }) {
  if (!stats) return <div className="p-8 text-center text-slate-500">Loading Deep Analytics...</div>;

  const averages = stats.averages || {};
  const totalDays = stats.totalDays || 107;

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
          📈 Deep Analytics & Comprehensive Averages
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Detailed metrics breakdown: your average protein intake (g), average cardio duration (mins), average sleep duration (hrs), and weekly weight loss rate.
        </p>
      </div>

      {/* 4 Core Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Average Protein */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-cyan-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Protein Intake</span>
            <Zap className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-heading text-slate-900">
              {averages.avgProteinGrams || 0}
            </span>
            <span className="text-sm font-semibold text-slate-600">g / day</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total logged: <strong className="text-slate-900">{averages.totalProteinGrams || 0}g</strong> across {averages.proteinDaysLogged || 0} days
          </p>
        </div>

        {/* Card 2: Average Cardio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Cardio Duration</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-heading text-slate-900">
              {averages.avgCardioMinutes || 0}
            </span>
            <span className="text-sm font-semibold text-slate-600">mins / workout</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total logged: <strong className="text-slate-900">{averages.totalCardioMinutes || 0} mins</strong> across {averages.cardioDaysLogged || 0} workouts
          </p>
        </div>

        {/* Card 3: Average Sleep */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Sleep Duration</span>
            <Moon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-heading text-slate-900">
              {averages.avgSleepHours || 0}
            </span>
            <span className="text-sm font-semibold text-slate-600">hours / night</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total sleep tracked: <strong className="text-slate-900">{averages.totalSleepHours || 0} hrs</strong> across {averages.sleepDaysLogged || 0} nights
          </p>
        </div>

        {/* Card 4: Weight Loss Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Weight Loss Speed</span>
            <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-heading text-slate-900">
              {stats.avgWeightLossPerWeek || 0}
            </span>
            <span className="text-sm font-semibold text-slate-600">kg / week</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total Lost: <strong className="text-emerald-700">-{stats.weightLost || 0} kg</strong> over {stats.weeksElapsed || 1} weeks
          </p>
        </div>

      </div>

      {/* Habit Completion Averages Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Full Habit & Metric Compliance Averages (Out of {totalDays} Days)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900">Gym / Workout Rate</span>
              <span className="text-xs font-mono font-bold text-emerald-700">{stats.habitPercentages?.workout}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${stats.habitPercentages?.workout}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{averages.workoutDaysCount || 0} out of {totalDays} days completed</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900">Home Food Only Rate</span>
              <span className="text-xs font-mono font-bold text-cyan-700">{stats.habitPercentages?.homeFood}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${stats.habitPercentages?.homeFood}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{averages.homeFoodDaysCount || 0} out of {totalDays} days completed</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900">No Sweets/Chocolate Rate</span>
              <span className="text-xs font-mono font-bold text-amber-700">{stats.habitPercentages?.noSweets}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.habitPercentages?.noSweets}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{averages.noSweetsDaysCount || 0} out of {totalDays} days completed</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900">No Maida Foods Rate</span>
              <span className="text-xs font-mono font-bold text-indigo-700">{stats.habitPercentages?.noMaida}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stats.habitPercentages?.noMaida}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{averages.noMaidaDaysCount || 0} out of {totalDays} days completed</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900">No Hotel Food Rate</span>
              <span className="text-xs font-mono font-bold text-pink-700">{stats.habitPercentages?.noHotelFood}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-pink-600 h-full rounded-full" style={{ width: `${stats.habitPercentages?.noHotelFood}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{averages.noHotelFoodDaysCount || 0} out of {totalDays} days completed</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900">Sleep Tracking Rate</span>
               <span className="text-xs font-mono font-bold text-purple-700">{stats.habitPercentages?.sleepTarget}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${stats.habitPercentages?.sleepTarget}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{averages.sleepDaysLogged || 0} out of {totalDays} nights logged</p>
          </div>

        </div>
      </div>

    </div>
  );
}
