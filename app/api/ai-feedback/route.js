import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';
import { getFallbackDaily, getFallbackWeekly } from '@/lib/seed';
import UserSettings from '@/lib/models/UserSettings';
import { excludeSundaysIf } from '@/lib/dateUtils';

export async function GET(req) {
  return POST(req);
}

export async function POST(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    await dbConnect().catch(() => {});
    const dbReady = isDbConnected();

    let dailyLogs = [];
    let weeklyCheckins = [];

    if (dbReady) {
      try {
        dailyLogs = await DailyLog.find().sort({ date: 1 });
        weeklyCheckins = await WeeklyCheckin.find().sort({ weekNumber: 1 });
      } catch (e) {}
    }

    if (!dailyLogs || dailyLogs.length === 0) dailyLogs = getFallbackDaily();
    if (!weeklyCheckins || weeklyCheckins.length === 0) weeklyCheckins = getFallbackWeekly();

    let excludeSundays = false;
    let START_WEIGHT = 90.0;
    let TARGET_WEIGHT = 80.0;
    let START_DATE_STR = '2026-09-17';
    let END_DATE_STR = '2027-01-01';
    if (dbReady) {
      try {
        const settings = await UserSettings.findOne({ key: 'default_goal' });
        if (settings) {
          excludeSundays = !!settings.excludeSundays;
          if (settings.startWeight !== undefined) START_WEIGHT = settings.startWeight;
          if (settings.targetWeight !== undefined) TARGET_WEIGHT = settings.targetWeight;
          if (settings.startDate) START_DATE_STR = settings.startDate;
          if (settings.endDate) END_DATE_STR = settings.endDate;
        }
      } catch (e) {}
    }
    dailyLogs = excludeSundaysIf(dailyLogs, excludeSundays);

    const apiKey = body.apiKey || process.env.GEMINI_API_KEY || '';

    // Gather Stats for Prompt
    const sDate = new Date(START_DATE_STR + 'T00:00:00Z');
    const eDate = new Date(END_DATE_STR + 'T00:00:00Z');
    const TOTAL_DAYS = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const logsWithWeight = dailyLogs.filter(d => d.weight !== null && d.weight > 0);
    const currentWeight = logsWithWeight.length > 0 ? logsWithWeight[logsWithWeight.length - 1].weight : START_WEIGHT;
    const weightLost = Math.max(0, +(START_WEIGHT - currentWeight).toFixed(2));
    const weightRemaining = Math.max(0, +(currentWeight - TARGET_WEIGHT).toFixed(2));

    let habitCounts = { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 };
    let totalCheckmarks = 0;
    let tempStreak = 0;
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let daysElapsed = 0;

    dailyLogs.forEach((log) => {
      if (log.date <= todayStr) daysElapsed++;
      // Skip days that haven't happened yet — the seed/demo data pre-fills
      // the whole goal range with sample habit values, which would
      // otherwise pollute "your consistency so far" with future days.
      if (log.date > todayStr) return;

      // There's no dedicated UI checkbox for "slept in the 11PM-9AM window" —
      // sleepTarget stays false forever unless we also treat "logged any
      // sleep hours" as meeting the habit, matching the dashboard's logic.
      const sleptTarget = log.sleepTarget || (log.sleepHours && log.sleepHours.trim() !== '') || (log.sleepHoursNum && log.sleepHoursNum > 0);

      if (log.workout) habitCounts.workout++;
      if (log.homeFood) habitCounts.homeFood++;
      if (log.noSweets) habitCounts.noSweets++;
      if (log.noMaida) habitCounts.noMaida++;
      if (log.noHotelFood) habitCounts.noHotelFood++;
      if (sleptTarget) habitCounts.sleepTarget++;

      const cnt = (log.workout?1:0) + (log.homeFood?1:0) + (log.noSweets?1:0) + (log.noMaida?1:0) + (log.noHotelFood?1:0) + (sleptTarget?1:0);
      totalCheckmarks += cnt;
      if (log.workout || cnt >= 4) tempStreak++; else tempStreak = 0;
      // Only count the streak up through today — the array includes
      // future, not-yet-lived days that would otherwise reset it to 0.
      if (log.date <= todayStr) streak = tempStreak;
    });

    // Consistency is measured against days actually elapsed so far, not the
    // full goal duration — otherwise a user on day 1 of a 107-day plan would
    // show a misleadingly tiny percentage (e.g. 3/6 habits = 0.5% instead of 50%).
    const effectiveDays = Math.max(1, daysElapsed);
    const consistencyPct = +((totalCheckmarks / (effectiveDays * 6)) * 100).toFixed(1);
    const daysRemaining = Math.max(0, TOTAL_DAYS - daysElapsed);

    // Try calling Gemini REST API if key provided
    if (apiKey) {
      try {
        const prompt = `Act as an expert Fitness & Weight Loss Coach analyzing a user's weight loss tracker (Target: ${START_WEIGHT} kg -> ${TARGET_WEIGHT} kg over ${TOTAL_DAYS} days).
The user is currently on Day ${daysElapsed} of ${TOTAL_DAYS} (${daysRemaining} days remaining) — do not describe the plan as finished or as if all ${TOTAL_DAYS} days have already passed.
Start Weight: ${START_WEIGHT} kg | Current Weight: ${currentWeight} kg | Target Weight: ${TARGET_WEIGHT} kg
Total Weight Lost: ${weightLost} kg (${weightRemaining} kg remaining)
Habit Consistency So Far (Day ${daysElapsed}): ${consistencyPct}%
Current Streak: ${streak} days

Provide a structured, highly motivating AI Coaching Analysis in JSON format:
{
  "performanceGrade": "A+ | A | B+ | B | C",
  "summary": "2-3 sentences concise executive feedback on current trajectory",
  "strengths": ["Highlight 1", "Highlight 2"],
  "focusAreas": ["Risk/Focus area 1", "Risk/Focus area 2"],
  "actionableTips": ["Tip 1", "Tip 2", "Tip 3"],
  "motivationalQuote": "Quote"
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const apiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText);
            return NextResponse.json({ success: true, aiFeedback: parsed, source: 'gemini-api' });
          }
        } else {
          const errBody = await apiRes.text().catch(() => '');
          console.error('Gemini API call failed:', apiRes.status, errBody);
        }
      } catch (e) {
        console.error('Gemini API call error:', e.message);
      }
    }

    // Smart AI Analytics Engine Fallback
    const grade = consistencyPct >= 80 ? 'A+' : (consistencyPct >= 60 ? 'A' : (consistencyPct >= 40 ? 'B+' : 'B'));
    const smartFallback = {
      performanceGrade: grade,
      summary: `You have achieved ${weightLost} kg weight loss so far with an overall habit consistency of ${consistencyPct}% (Day ${daysElapsed} of ${TOTAL_DAYS}). You have ${daysRemaining} days remaining to reach your target of ${TARGET_WEIGHT} kg.`,
      strengths: [
        `Strong commitment with a ${streak}-day active consistency streak!`,
        `Solid compliance on Home Food (${habitCounts.homeFood} days) and Gym workouts (${habitCounts.workout} days).`
      ],
      focusAreas: [
        `Sleep timing (11 PM - 9 AM) is key to accelerating metabolic recovery.`,
        `Strictly avoiding hotel food & maida will prevent water retention spikes.`
      ],
      actionableTips: [
        `Prioritize 7-8 hours of sleep tonight to boost fat oxidation tomorrow.`,
        `Maintain your daily workout routine and track cardio timing consistently.`,
        `Drink 3.5L of water daily to flush out sodium and keep appetite controlled.`
      ],
      motivationalQuote: `"Consistency > Perfection. Small daily habits repeated without fail yield compounding physical transformations."`
    };

    return NextResponse.json({ success: true, aiFeedback: smartFallback, source: 'smart-ai-engine' });

  } catch (err) {
    console.error('AI Feedback Route Error:', err);
    return NextResponse.json({
      success: true,
      aiFeedback: {
        performanceGrade: 'B',
        summary: 'Keep focusing on daily non-negotiable habits to accelerate weight loss progress.',
        strengths: ['Active consistency streak', 'Solid home food tracking'],
        focusAreas: ['Optimizing sleep timing', 'Flushing water retention'],
        actionableTips: [
          'Target 7.5+ hours sleep tonight',
          'Maintain workout & cardio timing',
          'Drink 3.5L water daily'
        ],
        motivationalQuote: '"Consistency over perfection!"'
      },
      source: 'safety-fallback'
    });
  }
}
