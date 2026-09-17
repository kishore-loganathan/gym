'use client';

import React, { useState } from 'react';
import { Sparkles, Brain, Trophy, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, X, Zap, ShieldCheck } from 'lucide-react';

export default function AiFeedbackModal({ isOpen, onClose, stats, dailyLogs = [] }) {
  const generateDynamicFeedback = (currentStats) => {
    const consistencyPct = currentStats?.overallConsistencyPct || 0;
    const streak = currentStats?.streaks?.current || 0;
    const weightLost = currentStats?.weightLost || 0;
    const daysRemaining = currentStats?.daysRemaining || 106;
    const targetW = currentStats?.targetWeight || 80.0;
    const workoutCount = currentStats?.habitCounts?.workout || 0;
    const homeFoodCount = currentStats?.habitCounts?.homeFood || 0;

    const grade = consistencyPct >= 80 ? 'A+' : (consistencyPct >= 60 ? 'A' : (consistencyPct >= 40 ? 'B+' : 'B'));

    return {
      performanceGrade: grade,
      summary: `You have achieved ${weightLost} kg weight loss so far with an overall habit consistency of ${consistencyPct}%. You have ${daysRemaining} days remaining to reach your target of ${targetW} kg.`,
      strengths: [
        `Strong commitment with a ${streak}-day active consistency streak!`,
        `Solid compliance on Home Food (${homeFoodCount} days) and Gym workouts (${workoutCount} days).`
      ],
      focusAreas: [
        `Sleep timing (11 PM - 9 AM) is key to accelerating metabolic recovery.`,
        `Strictly avoiding hotel food & maida will prevent water retention spikes.`
      ],
      actionableTips: [
        `Prioritize 7–8 hours of sleep tonight to boost fat oxidation tomorrow.`,
        `Maintain your daily workout routine and track cardio timing consistently.`,
        `Drink 3.5L of water daily to flush out sodium and keep appetite controlled.`
      ],
      motivationalQuote: `"Consistency > Perfection. Small daily habits repeated without fail yield compounding physical transformations."`
    };
  };

  const [aiData, setAiData] = useState(() => generateDynamicFeedback(stats));
  const [loading, setLoading] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const fetchAiFeedback = async (providedKey = '') => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: providedKey || customKey })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.aiFeedback) {
          setAiData(json.aiFeedback);
        } else {
          setAiData(generateDynamicFeedback(stats));
        }
      } else {
        setAiData(generateDynamicFeedback(stats));
      }
    } catch (err) {
      console.error('AI Error:', err);
      setAiData(generateDynamicFeedback(stats));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setAiData(generateDynamicFeedback(stats));
      fetchAiFeedback();
    }
  }, [isOpen, stats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Brain className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                🤖 AI Empowered Coach & Analytics
              </h3>
              <p className="text-xs text-slate-500">Powered by Gemini AI • Real-time habit & weight loss feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-4">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-600">Generating AI Personalized Coach Analysis...</p>
            </div>
          ) : aiData ? (
            <>
              {/* Performance Grade Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Overall Performance Grade
                  </span>
                  <h4 className="text-3xl font-extrabold font-heading text-slate-900 mt-0.5">
                    {aiData.performanceGrade || 'A+'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md leading-relaxed">
                    {aiData.summary}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md font-heading shrink-0">
                  {aiData.performanceGrade || 'A+'}
                </div>
              </div>

              {/* Strengths & Focus Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-slate-50 border border-emerald-200 shadow-xs">
                  <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strongest Points
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {aiData.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Focus Areas */}
                <div className="p-4 rounded-xl bg-slate-50 border border-amber-200 shadow-xs">
                  <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Focus & Risk Areas
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {aiData.focusAreas?.map((foc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{foc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 3 Actionable AI Recommendations */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-600" /> Actionable Tips for Next 7 Days
                </h5>
                <div className="space-y-2.5">
                  {aiData.actionableTips?.map((tip, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed pt-0.5">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivational Quote */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-xs font-semibold italic text-emerald-800">
                  {aiData.motivationalQuote}
                </p>
              </div>

            </>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Click refresh to generate AI Feedback
            </div>
          )}

          {/* Key Management Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[11px] text-emerald-700 hover:underline font-medium"
            >
              {showKeyInput ? 'Hide API Key Settings' : '🔑 Custom Gemini Key'}
            </button>

            <button
              onClick={() => fetchAiFeedback(customKey)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh AI Analysis</span>
            </button>
          </div>

          {showKeyInput && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <input
                type="password"
                placeholder="Paste Gemini API Key..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
              <button
                onClick={() => fetchAiFeedback(customKey)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
              >
                Apply Key
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
