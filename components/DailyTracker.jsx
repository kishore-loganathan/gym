'use client';

import React, { useState } from 'react';
import { Search, Check, Edit3, Flame } from 'lucide-react';

export default function DailyTracker({ dailyLogs = [], onUpdateLog, onOpenQuickLogForDate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const handleCheckboxToggle = (log, field) => {
    const updated = {
      ...log,
      [field]: !log[field]
    };
    onUpdateLog(updated);
  };

  const handleWeightBlur = (log, value) => {
    const num = value === '' ? null : parseFloat(value);
    if (log.weight !== num) {
      onUpdateLog({ ...log, weight: num });
    }
  };

  const handleProteinBlur = (log, value) => {
    const num = value === '' ? null : parseFloat(value);
    if (log.proteinGrams !== num) {
      onUpdateLog({ ...log, proteinGrams: num });
    }
  };

  const handleTextBlur = (log, field, value) => {
    if (log[field] !== value) {
      onUpdateLog({ ...log, [field]: value });
    }
  };

  const filteredLogs = dailyLogs.filter(log => {
    const matchesSearch = log.displayDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.dailyNotes && log.dailyNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.sleepHours && log.sleepHours.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.cardioTiming && log.cardioTiming.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'missing_weight') return log.weight === null;
    if (filterMode === 'missing_protein') return log.proteinGrams === null || log.proteinGrams === 0;
    if (filterMode === 'workout_done') return log.workout === true;
    if (filterMode === 'all_habits') return log.workout && log.homeFood && log.noSweets && log.noMaida && log.noHotelFood;

    return true;
  });

  return (
    <div className="space-y-6">

      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            📅 Daily Habit, Protein & Sleep Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Record weight, protein intake (g), sleep timing/duration, cardio, and non-negotiable habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search date, notes, sleep..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer font-medium"
            >
              <option value="all">Show All Days</option>
              <option value="missing_weight">Needs Weight Entry</option>
              <option value="missing_protein">Needs Protein Entry</option>
              <option value="workout_done">Gym Workout ✓</option>
              <option value="all_habits">100% Perfect Habits ✓</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="custom-table text-left">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="w-32">Date</th>
                <th className="w-20">Days Left</th>
                <th className="w-28">Weight (kg)</th>
                <th className="w-28">Protein (g)</th>
                <th className="text-center w-24">Gym / Workout</th>
                <th className="text-center w-24">Home Food</th>
                <th className="text-center w-24">No Sweets</th>
                <th className="text-center w-24">No Maida</th>
                <th className="text-center w-24">No Hotel Food</th>
                <th className="w-36">Sleep Duration</th>
                <th className="w-36">Cardio Duration</th>
                <th>Daily Notes</th>
                <th className="w-12 text-center">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const isToday = log.date === new Date().toISOString().split('T')[0];
                return (
                  <tr
                    key={log._id || log.date}
                    className={`transition-colors ${isToday ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600' : ''}`}
                  >
                    {/* Date */}
                    <td className="font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{log.displayDate}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded">
                            TODAY
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Days Left */}
                    <td>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
                        {log.daysLeft}d
                      </span>
                    </td>

                    {/* Weight (kg) */}
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="--"
                        defaultValue={log.weight !== null ? log.weight : ''}
                        onBlur={(e) => handleWeightBlur(log, e.target.value)}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-emerald-700 font-bold font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </td>

                    {/* Protein Intake (g) */}
                    <td>
                      <input
                        type="number"
                        step="1"
                        placeholder="e.g. 120"
                        defaultValue={log.proteinGrams !== null && log.proteinGrams !== undefined ? log.proteinGrams : ''}
                        onBlur={(e) => handleProteinBlur(log, e.target.value)}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-cyan-700 font-bold font-mono focus:outline-none focus:border-cyan-600 focus:bg-white"
                      />
                    </td>

                    {/* Gym Checkbox */}
                    <td className="text-center">
                      <button
                        onClick={() => handleCheckboxToggle(log, 'workout')}
                        className={`habit-toggle ${log.workout ? 'checked' : ''}`}
                        title="Gym / Workout"
                      >
                        {log.workout && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Home Food Checkbox */}
                    <td className="text-center">
                      <button
                        onClick={() => handleCheckboxToggle(log, 'homeFood')}
                        className={`habit-toggle ${log.homeFood ? 'checked' : ''}`}
                        title="Home Food Only"
                      >
                        {log.homeFood && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </td>

                    {/* No Sweets Checkbox */}
                    <td className="text-center">
                      <button
                        onClick={() => handleCheckboxToggle(log, 'noSweets')}
                        className={`habit-toggle ${log.noSweets ? 'checked' : ''}`}
                        title="No Sweets/Chocolate"
                      >
                        {log.noSweets && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </td>

                    {/* No Maida Checkbox */}
                    <td className="text-center">
                      <button
                        onClick={() => handleCheckboxToggle(log, 'noMaida')}
                        className={`habit-toggle ${log.noMaida ? 'checked' : ''}`}
                        title="No Maida Foods"
                      >
                        {log.noMaida && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </td>

                    {/* No Hotel Food Checkbox */}
                    <td className="text-center">
                      <button
                        onClick={() => handleCheckboxToggle(log, 'noHotelFood')}
                        className={`habit-toggle ${log.noHotelFood ? 'checked' : ''}`}
                        title="No Hotel/Restaurant Food"
                      >
                        {log.noHotelFood && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Sleep Entry */}
                    <td>
                      <input
                        type="text"
                        placeholder="e.g. 7h 30m"
                        defaultValue={log.sleepHours || ''}
                        onBlur={(e) => handleTextBlur(log, 'sleepHours', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-purple-700 font-mono focus:outline-none focus:border-purple-600 focus:bg-white font-semibold"
                      />
                    </td>

                    {/* Cardio Timing */}
                    <td>
                      <input
                        type="text"
                        placeholder="e.g. 45m"
                        defaultValue={log.cardioTiming || ''}
                        onBlur={(e) => handleTextBlur(log, 'cardioTiming', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-cyan-600 focus:bg-white font-medium"
                      />
                    </td>

                    {/* Daily Notes */}
                    <td>
                      <input
                        type="text"
                        placeholder="Log notes..."
                        defaultValue={log.dailyNotes || ''}
                        onBlur={(e) => handleTextBlur(log, 'dailyNotes', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </td>

                    {/* Quick Modal Button */}
                    <td className="text-center">
                      <button
                        onClick={() => onOpenQuickLogForDate(log)}
                        className="p-1.5 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition"
                        title="Open Quick Edit Modal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
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
