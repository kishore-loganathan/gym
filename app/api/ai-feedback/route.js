import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';
import { getFallbackDaily, getFallbackWeekly } from '@/lib/seed';

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

    const apiKey = body.apiKey || process.env.GEMINI_API_KEY || '';

    // Gather Stats for Prompt
    const START_WEIGHT = 90.0;
    const TARGET_WEIGHT = 80.0;
    const TOTAL_DAYS = 107;

    const logsWithWeight = dailyLogs.filter(d => d.weight !== null && d.weight > 0);
    const currentWeight = logsWithWeight.length > 0 ? logsWithWeight[logsWithWeight.length - 1].weight : START_WEIGHT;
    const weightLost = Math.max(0, +(START_WEIGHT - currentWeight).toFixed(2));
    const weightRemaining = Math.max(0, +(currentWeight - TARGET_WEIGHT).toFixed(2));

    let habitCounts = { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 };
    let totalCheckmarks = 0;
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let daysElapsed = 0;

    dailyLogs.forEach((log) => {
      if (log.date <= todayStr) daysElapsed++;
      if (log.workout) habitCounts.workout++;
      if (log.homeFood) habitCounts.homeFood++;
      if (log.noSweets) habitCounts.noSweets++;
      if (log.noMaida) habitCounts.noMaida++;
      if (log.noHotelFood) habitCounts.noHotelFood++;
      if (log.sleepTarget) habitCounts.sleepTarget++;

      const cnt = (log.workout?1:0) + (log.homeFood?1:0) + (log.noSweets?1:0) + (log.noMaida?1:0) + (log.noHotelFood?1:0) + (log.sleepTarget?1:0);
      totalCheckmarks += cnt;
      if (log.workout || cnt >= 4) streak++; else streak = 0;
    });

    const consistencyPct = +((totalCheckmarks / (TOTAL_DAYS * 6)) * 100).toFixed(1);
    const daysRemaining = Math.max(0, TOTAL_DAYS - daysElapsed);

    // Try calling Gemini REST API if key provided
    if (apiKey) {
      try {
        const prompt = `Act as an expert Fitness & Weight Loss Coach analyzing a user's 107-day weight loss tracker (Target: 90 kg -> 80 kg).
Start Weight: 90.0 kg | Current Weight: ${currentWeight} kg | Target Weight: 80.0 kg
Total Weight Lost: ${weightLost} kg (${weightRemaining} kg remaining)
Overall Habit Consistency: ${consistencyPct}%
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

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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
        }
      } catch (e) {
        console.warn('Gemini API call warning:', e.message);
      }
    }

    // Smart AI Analytics Engine Fallback
    const grade = consistencyPct >= 80 ? 'A+' : (consistencyPct >= 60 ? 'A' : (consistencyPct >= 40 ? 'B+' : 'B'));
    const smartFallback = {
      performanceGrade: grade,
      summary: `You have achieved ${weightLost} kg weight loss so far with an overall habit consistency of ${consistencyPct}%. You have ${daysRemaining} days remaining to reach your target of 80.0 kg.`,
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
