'use client';

import React, { useState, useEffect } from 'react';
import { X, Scale, Target, Calendar, Save, Check } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function GoalSettingsModal({ isOpen, onClose, stats = {}, onSaveSettings }) {
  if (!isOpen) return null;

  const { showToast } = useToast();
  const [startWeight, setStartWeight] = useState(stats.startWeight || 90.0);
  const [targetWeight, setTargetWeight] = useState(stats.targetWeight || 80.0);
  const [startDate, setStartDate] = useState(stats.startDate || '2026-09-17');
  const [endDate, setEndDate] = useState(stats.endDate || '2027-01-01');
  const [excludeSundays, setExcludeSundays] = useState(!!stats.excludeSundays);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (stats) {
      if (stats.startWeight !== undefined) setStartWeight(stats.startWeight);
      if (stats.targetWeight !== undefined) setTargetWeight(stats.targetWeight);
      if (stats.startDate) setStartDate(stats.startDate);
      if (stats.endDate) setEndDate(stats.endDate);
      if (stats.excludeSundays !== undefined) setExcludeSundays(!!stats.excludeSundays);
    }
  }, [stats, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload = {
      startWeight: parseFloat(startWeight),
      targetWeight: parseFloat(targetWeight),
      startDate,
      endDate,
      excludeSundays
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
        if (onSaveSettings) onSaveSettings(payload);
        showToast('Goal settings saved.', 'success');
        onClose();
      } else {
        showToast('Failed to save goal settings. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      showToast('Network error while saving goal settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm modal-backdrop">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-200 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Target className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                🎯 Goal & Date Settings
              </h3>
              <p className="text-xs text-slate-500">Customize starting weight, target weight & timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">

          {/* Start Weight & Target Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-600" /> Start Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-emerald-700 font-bold font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-600" /> Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-indigo-700 font-bold font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" /> Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-purple-700 font-mono focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Target End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-teal-700 font-mono focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Skip Sunday for Averages */}
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
            <span className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">Exclude Sundays from averages</span>
              <span className="text-[11px] text-slate-500">Protein, cardio & sleep averages will skip Sunday logs</span>
            </span>
            <input
              type="checkbox"
              checked={excludeSundays}
              onChange={(e) => setExcludeSundays(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 shrink-0"
            />
          </label>

          {/* Summary Preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Total Weight to Lose:</span>
              <strong className="text-emerald-700 font-mono font-bold">
                {(Math.max(0, parseFloat(startWeight || 0) - parseFloat(targetWeight || 0))).toFixed(1)} kg
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Timeline Duration:</span>
              <strong className="text-indigo-700 font-mono font-bold">
                {(() => {
                  if (!startDate || !endDate) return '0 days';
                  const s = new Date(startDate + 'T00:00:00Z');
                  const e = new Date(endDate + 'T00:00:00Z');
                  const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                  return `${diff} Days`;
                })()}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Goal settings saved!
              </span>
            ) : <span />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Apply Goal Changes'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
