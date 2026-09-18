import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';
import { getFallbackDaily, getFallbackWeekly } from '@/lib/seed';
import UserSettings from '@/lib/models/UserSettings';

export async function POST(req) {
  try {
    await dbConnect();
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

    const body = await req.json().catch(() => ({}));
    const userMessage = body.message || 'Give me personalized weight loss advice';
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY || '';

    let START_WEIGHT = 90.0;
    let TARGET_WEIGHT = 80.0;
    let START_DATE_STR = '2026-09-17';
    let END_DATE_STR = '2027-01-01';
    if (dbReady) {
      try {
        const settings = await UserSettings.findOne({ key: 'default_goal' });
        if (settings) {
          if (settings.startWeight !== undefined) START_WEIGHT = settings.startWeight;
          if (settings.targetWeight !== undefined) TARGET_WEIGHT = settings.targetWeight;
          if (settings.startDate) START_DATE_STR = settings.startDate;
          if (settings.endDate) END_DATE_STR = settings.endDate;
        }
      } catch (e) {}
    }
    const sDate = new Date(START_DATE_STR + 'T00:00:00Z');
    const eDate = new Date(END_DATE_STR + 'T00:00:00Z');
    const TOTAL_DAYS = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const todayStr = new Date().toISOString().split('T')[0];
    const daysElapsed = Math.max(1, dailyLogs.filter(d => d.date <= todayStr).length);

    const logsWithWeight = dailyLogs.filter(d => d.weight !== null && d.weight > 0);
    const currentWeight = logsWithWeight.length > 0 ? logsWithWeight[logsWithWeight.length - 1].weight : START_WEIGHT;
    const weightLost = Math.max(0, +(START_WEIGHT - currentWeight).toFixed(2));

    const proteinLogs = dailyLogs.filter(d => d.proteinGrams !== null && d.proteinGrams > 0);
    const totalProtein = proteinLogs.reduce((s, d) => s + d.proteinGrams, 0);
    const avgProtein = proteinLogs.length > 0 ? +(totalProtein / proteinLogs.length).toFixed(1) : 0;

    const cardioLogs = dailyLogs.filter(d => d.cardioMinutes !== null && d.cardioMinutes > 0);
    const totalCardio = cardioLogs.reduce((s, d) => s + d.cardioMinutes, 0);
    const avgCardio = cardioLogs.length > 0 ? +(totalCardio / cardioLogs.length).toFixed(1) : 0;

    // Calculate Full Platform Context for Gemini Analysis
    const habitCounts = { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 };
    let totalCheckmarks = 0;
    
    // Only count days that have actually happened — the seed/demo data
    // pre-fills the whole goal range with sample habit values, which would
    // otherwise pollute "consistency so far" with future days.
    dailyLogs.filter(d => d.date <= todayStr).forEach(d => {
      if (d.workout) habitCounts.workout++;
      if (d.homeFood) habitCounts.homeFood++;
      if (d.noSweets) habitCounts.noSweets++;
      if (d.noMaida) habitCounts.noMaida++;
      if (d.noHotelFood) habitCounts.noHotelFood++;
      if (d.sleepTarget) habitCounts.sleepTarget++;
      totalCheckmarks += (d.workout?1:0) + (d.homeFood?1:0) + (d.noSweets?1:0) + (d.noMaida?1:0) + (d.noHotelFood?1:0) + (d.sleepTarget?1:0);
    });

    // Consistency measured against days actually elapsed, not the full plan
    // duration, otherwise a user on day 1 shows a misleadingly tiny percentage.
    const consistencyPct = +((totalCheckmarks / (daysElapsed * 6)) * 100).toFixed(1);

    // Recent days up to today (the full log array runs through the goal's
    // end date, so a plain slice(-7) would grab future, not-yet-lived days).
    const pastLogs = dailyLogs.filter(d => d.date <= todayStr);
    const recentLogs = pastLogs.slice(-7).map(d =>
      `Date: ${d.displayDate || d.date} | Wt: ${d.weight ?? 'N/A'}kg | Prot: ${d.proteinGrams ?? 0}g | Sleep: ${d.sleepHours || 'N/A'} | Cardio: ${d.cardioTiming || 'None'} (${d.cardioMinutes || 0}m) | Habits: Workout:${d.workout?'✓':'✗'}, HomeFood:${d.homeFood?'✓':'✗'}, NoSweets:${d.noSweets?'✓':'✗'}`
    ).join('\n') || 'No logs yet.';

    // Weekly Summary — most recent weeks up to today, not the earliest ones
    const pastWeeks = weeklyCheckins.filter(w => !w.startDate || w.startDate <= todayStr);
    const weeklySummary = pastWeeks.slice(-8).map(w =>
      `Week ${w.weekNumber} (${w.startDate} - ${w.endDate}): Weight ${w.weeklyAvgWeight || 'N/A'}kg | Score: ${w.overallWeeklyScore}/100`
    ).join('\n') || 'No weekly check-ins yet.';

    const systemPrompt = `You are FIT-TRACK AI, an elite personal fitness coach, sports nutritionist, and data analyst.
You have FULL ACCESS to the user's entire live weight loss tracker database, reports, daily logs, and weekly scores.

PLATFORM METRICS & DATASET:
- Goal: Start Weight ${START_WEIGHT} kg -> Target Weight ${TARGET_WEIGHT} kg (${TOTAL_DAYS} Days Total)
- Today is Day ${daysElapsed} of ${TOTAL_DAYS} — do not describe the plan as finished or already over.
- Current Weight: ${currentWeight} kg | Total Weight Lost: ${weightLost} kg
- Habit Consistency So Far: ${consistencyPct}% (${totalCheckmarks} / ${daysElapsed * 6} checkmarks achieved through Day ${daysElapsed})
- Average Daily Protein: ${avgProtein} g/day
- Average Daily Cardio: ${avgCardio} mins/day
- Habit Totals (out of ${daysElapsed} days elapsed so far):
  * Workout/Gym: ${habitCounts.workout} days
  * Home Cooked Meals: ${habitCounts.homeFood} days
  * Zero Sweets: ${habitCounts.noSweets} days
  * Zero Maida: ${habitCounts.noMaida} days
  * Zero Hotel Food: ${habitCounts.noHotelFood} days
  * Sleep 11 PM - 9 AM: ${habitCounts.sleepTarget} days

RECENT LOGS (most recent days up to today):
${recentLogs}

WEEKLY SCORES SUMMARY (most recent weeks up to today):
${weeklySummary}

USER QUESTION: "${userMessage}"

INSTRUCTIONS:
1. Analyze the live dataset above carefully to answer the user's question directly.
2. Refer to specific logged metrics (protein grams, workout days, weight trend, sleep hours) to provide personalized, data-backed guidance.
3. Keep response encouraging, structured with bold key points and markdown formatting. Be highly helpful and direct.`;

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const apiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ success: true, answer: text, source: 'gemini' });
        }
      } else {
        const errBody = await apiRes.text().catch(() => '');
        console.error('Gemini AI Chat call failed:', apiRes.status, errBody);
      }
    } catch (e) {
      console.error('Gemini AI Chat call error:', e.message);
    }

    // Smart Domain-Aware AI Fitness Engine (Contextual Q&A)
    const lowerQ = userMessage.toLowerCase();
    let answer = "";

    if (lowerQ.includes('hello') || lowerQ === 'hi' || lowerQ === 'hii' || lowerQ.includes('hey')) {
      answer = `Hello there! 👋 I am your **FIT-TRACK AI Fitness Coach**. 

I am tracking your **90 kg → 80 kg** weight loss journey. How can I help you today? You can ask me about:
- 🥩 **Protein Foods & Meal Ideas**
- 🏋️ **Workout & Gym Guidelines**
- 🏃 **Cardio & Fat Burning Tips**
- ⚖️ **Scale Weight & Water Retention**`;
    } else if (lowerQ.includes('workout') || lowerQ.includes('exercise') || lowerQ.includes('gym') || lowerQ.includes('hour') || lowerQ.includes('time')) {
      answer = `### 🏋️ Workout & Training Guidance:
- **Duration**: **45 to 60 minutes per day** of strength training (4–5 days/week) is optimal for fat loss while preserving muscle.
- **Cardio**: 20–30 minutes of moderate cardio (walking, incline tread, cycling) after weight training or in the morning.
- **Key Principle**: Avoid working out for more than 75 minutes at a time as cortisol levels rise and recovery slows down. Focus on progressive overload and high consistency!`;
    } else if (lowerQ.includes('diet') || lowerQ.includes('food') || lowerQ.includes('eat') || lowerQ.includes('enough')) {
      answer = `### 🥗 Diet & Nutrition Check:
- **Calorie Deficit**: Aim for a **300–500 kcal daily deficit** (approx. 1,800–2,000 kcal/day for a 90kg → 80kg goal).
- **Protein Intake**: Ensure **120g – 140g of protein daily** (1.5g per kg of target body weight).
- **Non-Negotiable Food Rules**:
  - Stick to **Home Cooked Meals**
  - **Zero Maida & Zero Refined Sweets**
  - **No Hotel / Junk / Fried Foods**
- If you follow these 3 non-negotiables, your diet is 100% on point!`;
    } else if (lowerQ.includes('protein') || lowerQ.includes('increase')) {
      answer = `### 🥩 How to Increase Protein Intake (120g–140g Target):
1. **Eggs / Egg Whites**: 4 eggs + 2 egg whites = ~28g protein.
2. **Lean Chicken Breast or Fish**: 150g = ~35g protein.
3. **Paneer / Tofu / Soy Chunks**: 100g Paneer/Tofu = ~18g protein. 50g Soy chunks = ~26g protein.
4. **Greek Yogurt / Sattu / Whey Protein**: 1 scoop whey or 200g Greek yogurt = ~24g protein.
- *Pro Tip*: Divide protein across 3–4 meals (approx. 30g–35g per meal).`;
    } else if (lowerQ.includes('fluctuat') || lowerQ.includes('weight') || lowerQ.includes('scale')) {
      answer = `### ⚖️ Why Weight Fluctuates Daily on the Scale:
1. **Water Retention**: Eating salt, carbs, or hotel food causes muscles to hold 1–2 kg of water.
2. **Digestion / Food Volume**: Un-digested food in the stomach overnight adds temporary weight.
3. **Muscle Repair**: Hard gym workouts cause micro-tears in muscles, retaining fluid for recovery.
- *Solution*: Focus on your **Weekly Average Weight Trend** rather than daily spikes.`;
    } else if (lowerQ.includes('tip') || lowerQ.includes('fat loss') || lowerQ.includes('accelerat') || lowerQ.includes('speed')) {
      answer = `### 🔥 3 Proven Tips to Accelerate Fat Loss (90 kg → 80 kg):
1. **Prioritize 7.5+ Hours Sleep (11 PM - 7 AM)**: Sleep deprivation increases hunger hormone ghrelin by 20% and lowers fat oxidation.
2. **Hit 10,000 Steps Daily (NEAT)**: Walking 10k steps burns an extra 300–400 kcal per day effortless fat loss.
3. **Drink 3.5 Liters Water Daily**: Hydration flushes out sodium, prevents false hunger cravings, and improves metabolic rate.`;
    } else {
      answer = `### 🎯 FIT-TRACK Coach Advice for Your Goal (90 kg → 80 kg):
To reach **80 kg** efficiently:
- **Protein**: Target **120g–140g/day**
- **Cardio**: 25–30 mins/day
- **Non-Negotiable**: No sweets, no maida, no hotel food, and 7.5h sleep!
Feel free to ask me about workouts, meal plans, or weight loss tips!`;
    }

    return NextResponse.json({ success: true, answer, source: 'fallback' });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
