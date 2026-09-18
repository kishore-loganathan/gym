'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Dumbbell, Utensils, Moon, Coffee, ShieldAlert, Calendar, Flame } from 'lucide-react';

export default function QuickLogModal({ isOpen, onClose, selectedLog, dailyLogs = [], onSaveLog }) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const initialLog = selectedLog || dailyLogs.find(d => d.date === todayStr) || dailyLogs[0] || {};

  const [date, setDate] = useState(initialLog.date || todayStr);
  const [weight, setWeight] = useState(initialLog.weight !== null && initialLog.weight !== undefined ? initialLog.weight : '');
  const [proteinGrams, setProteinGrams] = useState(initialLog.proteinGrams !== null && initialLog.proteinGrams !== undefined ? initialLog.proteinGrams : '');
  const [sleepH, setSleepH] = useState(initialLog.sleepHoursNum ? Math.floor(initialLog.sleepHoursNum) : '');
  const [sleepM, setSleepM] = useState(initialLog.sleepHoursNum ? Math.round((initialLog.sleepHoursNum % 1) * 60) : '');
  const [cardioH, setCardioH] = useState(initialLog.cardioMinutes ? Math.floor(initialLog.cardioMinutes / 60) : '');
  const [cardioM, setCardioM] = useState(initialLog.cardioMinutes ? initialLog.cardioMinutes % 60 : '');
  
  const [workout, setWorkout] = useState(!!initialLog.workout);
  const [homeFood, setHomeFood] = useState(!!initialLog.homeFood);
  const [noSweets, setNoSweets] = useState(!!initialLog.noSweets);
  const [noMaida, setNoMaida] = useState(!!initialLog.noMaida);
  const [noHotelFood, setNoHotelFood] = useState(!!initialLog.noHotelFood);
  const [cardioNotes, setCardioNotes] = useState(initialLog.cardioTiming || '');
  const [dailyNotes, setDailyNotes] = useState(initialLog.dailyNotes || '');

  useEffect(() => {
    const current = dailyLogs.find(d => d.date === date);
    if (current) {
      setWeight(current.weight !== null && current.weight !== undefined ? current.weight : '');
      setProteinGrams(current.proteinGrams !== null && current.proteinGrams !== undefined ? current.proteinGrams : '');
      
      const sNum = current.sleepHoursNum !== null && current.sleepHoursNum !== undefined ? current.sleepHoursNum : null;
      setSleepH(sNum !== null ? Math.floor(sNum) : '');
      setSleepM(sNum !== null ? Math.round((sNum % 1) * 60) : '');

      const cMins = current.cardioMinutes !== null && current.cardioMinutes !== undefined ? current.cardioMinutes : null;
      setCardioH(cMins !== null ? Math.floor(cMins / 60) : '');
      setCardioM(cMins !== null ? cMins % 60 : '');

      setWorkout(!!current.workout);
      setHomeFood(!!current.homeFood);
      setNoSweets(!!current.noSweets);
      setNoMaida(!!current.noMaida);
      setNoHotelFood(!!current.noHotelFood);
      setCardioNotes(current.cardioTiming || '');
      setDailyNotes(current.dailyNotes || '');
    }
  }, [date, dailyLogs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const current = dailyLogs.find(d => d.date === date) || initialLog;

    // Sleep calculation
    const sH = sleepH === '' ? 0 : parseInt(sleepH, 10);
    const sM = sleepM === '' ? 0 : parseInt(sleepM, 10);
    const totalSleepMins = (sH * 60) + sM;
    const computedSleepHoursNum = totalSleepMins > 0 ? +(totalSleepMins / 60).toFixed(2) : null;
    const computedSleepHoursStr = totalSleepMins > 0 ? `${sH > 0 ? `${sH}h ` : ''}${sM}m` : '';

    // Cardio calculation
    const cH = cardioH === '' ? 0 : parseInt(cardioH, 10);
    const cM = cardioM === '' ? 0 : parseInt(cardioM, 10);
    const totalCardioMins = (cH * 60) + cM;
    const computedCardioMins = totalCardioMins > 0 ? totalCardioMins : null;
    const computedCardioStr = totalCardioMins > 0 ? `${cH > 0 ? `${cH}h ` : ''}${cM}m ${cardioNotes}`.trim() : cardioNotes;

    const updated = {
      ...current,
      date,
      weight: weight === '' ? null : parseFloat(weight),
      proteinGrams: proteinGrams === '' ? null : parseFloat(proteinGrams),
      sleepHoursNum: computedSleepHoursNum,
      sleepHours: computedSleepHoursStr,
      cardioMinutes: computedCardioMins,
      cardioTiming: computedCardioStr,
      workout,
      homeFood,
      noSweets,
      noMaida,
      noHotelFood,
      dailyNotes
    };

    onSaveLog(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm modal-backdrop">
      <div className="bg-white w-full max-w-lg p-6 relative border border-slate-200 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              📝 Quick Daily Update
            </h3>
            <p className="text-xs text-slate-500">Record weight, protein intake (g), sleep, and habits</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Select Date
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-mono cursor-pointer"
            >
              {dailyLogs.map((d) => (
                <option key={d.date} value={d.date}>
                  {d.displayDate} (Days left: {d.daysLeft})
                </option>
              ))}
            </select>
          </div>

          {/* Weight & Protein Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Weight Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Body Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 88.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-emerald-700 font-bold font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Protein Intake Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Protein Intake (Grams)
              </label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 130g"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-cyan-700 font-bold font-mono focus:outline-none focus:border-cyan-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Sleep Hours & Minutes */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-purple-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-purple-600" /> Sleep Duration</span>
              <span className="text-[10px] text-slate-500 font-mono">Hours & Minutes</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1 font-medium">Hours</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="e.g. 7"
                  value={sleepH}
                  onChange={(e) => setSleepH(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-purple-700 font-bold font-mono focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1 font-medium">Minutes</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="e.g. 30"
                  value={sleepM}
                  onChange={(e) => setSleepM(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-purple-700 font-bold font-mono focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Cardio Hours & Minutes */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-600" /> Cardio Workout Duration</span>
              <span className="text-[10px] text-slate-500 font-mono">Hours & Minutes</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1 font-medium">Hours</span>
                <input
                  type="number"
                  min="0"
                  max="12"
                  placeholder="e.g. 0 or 1"
                  value={cardioH}
                  onChange={(e) => setCardioH(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1 font-medium">Minutes</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="e.g. 45"
                  value={cardioM}
                  onChange={(e) => setCardioM(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Habit Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Daily Habit Checkmarks
            </label>
            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() => setWorkout(!workout)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  workout
                    ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Dumbbell className={`w-4 h-4 ${workout ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">Gym / Workout</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${workout ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                  {workout && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHomeFood(!homeFood)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  homeFood
                    ? 'bg-cyan-50 border-cyan-500 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Utensils className={`w-4 h-4 ${homeFood ? 'text-cyan-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">Home Food</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${homeFood ? 'bg-cyan-600 text-white' : 'border border-slate-300'}`}>
                  {homeFood && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNoSweets(!noSweets)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  noSweets
                    ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Coffee className={`w-4 h-4 ${noSweets ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">No Sweets</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${noSweets ? 'bg-amber-600 text-white' : 'border border-slate-300'}`}>
                  {noSweets && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNoMaida(!noMaida)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  noMaida
                    ? 'bg-purple-50 border-purple-500 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShieldAlert className={`w-4 h-4 ${noMaida ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">No Maida</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${noMaida ? 'bg-purple-600 text-white' : 'border border-slate-300'}`}>
                  {noMaida && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

            </div>
          </div>

          {/* Cardio Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cardio Workout Notes / Type
            </label>
            <input
              type="text"
              placeholder="e.g. Morning Treadmill / Outdoor Run"
              value={cardioNotes}
              onChange={(e) => setCardioNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Daily Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Notes / Meal Log
            </label>
            <textarea
              rows="2"
              placeholder="e.g., Felt energetic, drank 3.5L water..."
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-700 transition"
            >
              Save Entry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
