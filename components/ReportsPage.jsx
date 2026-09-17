'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Award, TrendingDown, Zap, Activity, Moon, Printer } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Reports fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !reports) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-semibold">Auto-Generating Weekly & Monthly Reports...</p>
      </div>
    );
  }

  const { monthlyReports = [], weeklyReports = [] } = reports;

  return (
    <div className="space-y-6 print:p-0">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            📄 Auto-Generated Weekly & Monthly Reports
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Aggregated progress summaries computed automatically from your daily and weekly logged metrics.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-2 print:hidden"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* SECTION 1: Monthly Executive Reports */}
      <div>
        <h3 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Monthly Progress Reports
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthlyReports.map((m) => {
            const isLoss = m.monthWeightChange !== null && m.monthWeightChange < 0;
            const isGain = m.monthWeightChange !== null && m.monthWeightChange > 0;

            return (
              <div key={m.monthKey} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h4 className="text-lg font-bold font-heading text-slate-900">{m.monthName}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
                    {m.totalDaysInMonth} Days
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Weight Change</span>
                    {m.monthWeightChange === null ? (
                      <strong className="text-slate-400">--</strong>
                    ) : (
                      <strong className={`font-mono text-sm font-bold ${isLoss ? 'text-emerald-700' : isGain ? 'text-amber-700' : 'text-slate-700'}`}>
                        {m.monthWeightChange > 0 ? `+${m.monthWeightChange}` : m.monthWeightChange} kg
                      </strong>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Workout Consistency</span>
                    <strong className="text-cyan-700 font-mono text-sm font-bold">
                      {m.workoutConsistencyPct}% ({m.workoutDays}/{m.totalDaysInMonth}d)
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Avg Daily Protein</span>
                    <strong className="text-emerald-700 font-mono text-sm font-bold">
                      {m.avgProteinGrams} g/day
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Total Cardio Time</span>
                    <strong className="text-purple-700 font-mono text-sm font-bold">
                      {m.cardioFormatted || `${m.totalCardioMinutes}m`}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Avg Nightly Sleep</span>
                    <strong className="text-purple-600 font-mono text-sm font-bold">
                      {m.avgSleepFormatted || `${m.avgSleepHours}h`}
                    </strong>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 16-Week Granular Reports */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Detailed Weekly Progress Report Table
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="custom-table text-left text-xs">
            <thead>
              <tr>
                <th>Week</th>
                <th>Start Date</th>
                <th>Weight (kg)</th>
                <th>Weight Change</th>
                <th>Waist (cm)</th>
                <th>Avg Protein (g)</th>
                <th>Total Cardio (h & m)</th>
                <th>Avg Sleep (h & m)</th>
                <th>Workout Days</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {weeklyReports.map((w) => {
                const isLoss = w.weightChange !== null && w.weightChange < 0;
                return (
                  <tr key={w.weekNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="font-bold text-emerald-700">{w.weekLabel}</td>
                    <td className="text-slate-700 font-mono">{w.startDate}</td>
                    <td className="font-mono text-emerald-700 font-bold">{w.weight !== null ? `${w.weight} kg` : '--'}</td>
                    <td>
                      {w.weightChange === null ? '--' : (
                        <span className={`font-mono font-bold ${isLoss ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {w.weightChange > 0 ? `+${w.weightChange}` : w.weightChange} kg
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-cyan-700">{w.waistCm ? `${w.waistCm} cm` : '--'}</td>
                    <td className="font-mono text-cyan-700">{w.avgProteinGrams}g</td>
                    <td className="font-mono text-purple-700 font-bold">{w.cardioFormatted || `${w.totalCardioMinutes}m`}</td>
                    <td className="font-mono text-purple-700">{w.avgSleepFormatted || `${w.avgSleepHours}h`}</td>
                    <td className="font-mono text-slate-700">{w.workoutDays}/7d</td>
                    <td className="text-slate-600 truncate max-w-xs">{w.notes || '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
