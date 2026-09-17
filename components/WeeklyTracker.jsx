'use client';

import React from 'react';

export default function WeeklyTracker({ weeklyCheckins = [], onUpdateWeeklyCheckin }) {
  const handleBlur = (w, field, value) => {
    const numFields = ['weight', 'waistCm'];
    let parsed = value === '' ? null : (numFields.includes(field) ? parseFloat(value) : value);
    if (w[field] !== parsed) {
      onUpdateWeeklyCheckin({ ...w, [field]: parsed });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            🗓️ Weekly Check-ins & Automatic Habit Scores
          </h2>
          <p className="text-xs text-slate-500">
            Track weekly weight, waist measurement (cm), and aggregated habit scores for each week.
          </p>
        </div>
      </div>

      {/* Main Weekly Check-in Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="custom-table text-left">
            <thead>
              <tr>
                <th className="w-28">Week</th>
                <th className="w-32">Date</th>
                <th className="w-32">Weight (kg)</th>
                <th className="w-36">Change vs Prev</th>
                <th className="w-32">Waist (cm)</th>
                <th className="w-64">Weekly Habit Compliance</th>
                <th className="w-28 text-center">Score</th>
                <th>Weekly Notes</th>
              </tr>
            </thead>
            <tbody>
              {weeklyCheckins.map((w) => {
                const scores = w.scores || {};
                const change = w.changeVsPrevious;
                const isLoss = change !== null && change < 0;
                const isGain = change !== null && change > 0;

                return (
                  <tr key={w.weekNumber} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Week */}
                    <td className="font-bold text-emerald-700 font-heading">
                      {w.weekLabel}
                    </td>

                    {/* Date */}
                    <td className="text-slate-700 font-mono text-xs whitespace-nowrap">
                      {w.displayDate}
                    </td>

                    {/* Weight (kg) */}
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="--"
                        defaultValue={w.weight !== null ? w.weight : ''}
                        onBlur={(e) => handleBlur(w, 'weight', e.target.value)}
                        className="w-24 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-emerald-700 font-bold font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </td>

                    {/* Change vs Previous */}
                    <td>
                      {change === null ? (
                        <span className="text-slate-400 text-xs">--</span>
                      ) : (
                        <span className={`inline-flex items-center text-xs font-bold font-mono ${isLoss ? 'text-emerald-600' : isGain ? 'text-amber-600' : 'text-slate-500'}`}>
                          {isLoss ? '📉 ' : isGain ? '📈 +' : '➖ '}
                          {change > 0 ? `+${change}` : change} kg
                        </span>
                      )}
                    </td>

                    {/* Waist (cm) */}
                    <td>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="cm"
                        defaultValue={w.waistCm !== null ? w.waistCm : ''}
                        onBlur={(e) => handleBlur(w, 'waistCm', e.target.value)}
                        className="w-24 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-cyan-700 font-bold font-mono focus:outline-none focus:border-cyan-600 focus:bg-white"
                      />
                    </td>

                    {/* Weekly Habit Breakdown */}
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium" title="Workout days">
                          💪 {scores.workoutDays || 0}/7
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium" title="Home food days">
                          🥗 {scores.homeFoodDays || 0}/7
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium" title="No sweets days">
                          🍬 {scores.noSweetsDays || 0}/7
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium" title="No maida days">
                          🌾 {scores.noMaidaDays || 0}/7
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium" title="No hotel food days">
                          🚫 {scores.noHotelFoodDays || 0}/7
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium" title="Sleep target days">
                          🌙 {scores.sleepTargetDays || 0}/7
                        </span>
                      </div>
                    </td>

                    {/* Overall Weekly Score Badge */}
                    <td className="text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        (scores.overallConsistencyPct || 0) >= 80
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : (scores.overallConsistencyPct || 0) >= 50
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {scores.overallConsistencyPct || 0}%
                      </span>
                    </td>

                    {/* Weekly Notes */}
                    <td>
                      <input
                        type="text"
                        placeholder="Week notes & observations..."
                        defaultValue={w.notes || ''}
                        onBlur={(e) => handleBlur(w, 'notes', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-cyan-600 focus:bg-white"
                      />
                    </td>

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
