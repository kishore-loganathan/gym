import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';
import UserSettings from '@/lib/models/UserSettings';
import { getFallbackDaily, getFallbackWeekly, getFallbackSettings } from '@/lib/dataFallback';

export const dynamic = 'force-dynamic';

let dataCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000;

export function invalidateCache() {
  dataCache = null;
  lastFetchTime = 0;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const bypassCache = url.searchParams.get('fresh') === 'true';
    const now = Date.now();

    if (!bypassCache && dataCache && (now - lastFetchTime < CACHE_TTL_MS)) {
      return NextResponse.json(dataCache, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    // Connect with fast 2.5s race limit
    try {
      await dbConnect();
    } catch (e) {
      console.warn('DB connect exception caught:', e.message);
    }

    const dbReady = isDbConnected();
    let dailyLogs = [];
    let weeklyCheckins = [];
    let settings = getFallbackSettings();

    if (dbReady) {
      try {
        const results = await Promise.race([
          Promise.all([
            DailyLog.find().sort({ date: 1 }),
            WeeklyCheckin.find().sort({ weekNumber: 1 }),
            UserSettings.findOne({ key: 'default_goal' })
          ]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB Query Timeout')), 2000))
        ]);

        dailyLogs = results[0];
        weeklyCheckins = results[1];
        if (results[2]) settings = results[2];
      } catch (e) {
        console.warn('MongoDB query timed out or failed, falling back to pre-populated dataset:', e.message);
      }
    }

    const START_WEIGHT = settings.startWeight !== undefined ? settings.startWeight : 90.0;
    const TARGET_WEIGHT = settings.targetWeight !== undefined ? settings.targetWeight : 80.0;
    const START_DATE_STR = settings.startDate || '2026-09-17';
    const END_DATE_STR = settings.endDate || '2027-01-01';

    if (!dailyLogs || dailyLogs.length === 0) dailyLogs = getFallbackDaily(START_DATE_STR, END_DATE_STR);
    if (!weeklyCheckins || weeklyCheckins.length === 0) weeklyCheckins = getFallbackWeekly(START_DATE_STR, END_DATE_STR);

    const sDate = new Date(START_DATE_STR + 'T00:00:00Z');
    const eDate = new Date(END_DATE_STR + 'T00:00:00Z');
    const totalMs = Math.max(0, eDate.getTime() - sDate.getTime());
    const TOTAL_DAYS = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)) + 1);
    const TOTAL_WEIGHT_TO_LOSE = Math.max(0.1, +(START_WEIGHT - TARGET_WEIGHT).toFixed(2));

    const logsWithWeight = dailyLogs.filter(d => d.weight !== null && d.weight > 0);
    let currentWeight = START_WEIGHT;
    let latestLogDate = null;

    if (logsWithWeight.length > 0) {
      const latest = logsWithWeight[logsWithWeight.length - 1];
      currentWeight = latest.weight;
      latestLogDate = latest.date;
    } else {
      const weeklyWithWeight = weeklyCheckins.filter(w => w.weight !== null && w.weight > 0);
      if (weeklyWithWeight.length > 0) {
        currentWeight = weeklyWithWeight[weeklyWithWeight.length - 1].weight;
      }
    }

    const weightLost = Math.max(0, +(START_WEIGHT - currentWeight).toFixed(2));
    const weightRemaining = Math.max(0, +(currentWeight - TARGET_WEIGHT).toFixed(2));
    const weightLossProgressPct = Math.min(100, Math.max(0, +((weightLost / TOTAL_WEIGHT_TO_LOSE) * 100).toFixed(1)));

    // Protein calculations
    const proteinLogs = dailyLogs.filter(d => d.proteinGrams !== null && d.proteinGrams > 0);
    const totalProteinGrams = proteinLogs.reduce((sum, d) => sum + d.proteinGrams, 0);
    const avgProteinGrams = proteinLogs.length > 0 ? +(totalProteinGrams / proteinLogs.length).toFixed(1) : 0;

    // Cardio calculations
    const cardioLogs = dailyLogs.filter(d => d.cardioMinutes !== null && d.cardioMinutes > 0);
    const totalCardioMinutes = cardioLogs.reduce((sum, d) => sum + d.cardioMinutes, 0);
    const avgCardioMinutes = cardioLogs.length > 0 ? +(totalCardioMinutes / cardioLogs.length).toFixed(1) : 0;

    // Sleep calculations
    const sleepLogs = dailyLogs.filter(d => {
      if (d.sleepHoursNum !== null && d.sleepHoursNum > 0) return true;
      if (d.sleepHours) {
        const match = d.sleepHours.match(/(\d+(\.\d+)?)/);
        return !!match;
      }
      return false;
    });

    let totalSleepHours = 0;
    sleepLogs.forEach(d => {
      if (d.sleepHoursNum !== null && d.sleepHoursNum > 0) {
        totalSleepHours += d.sleepHoursNum;
      } else if (d.sleepHours) {
        const match = d.sleepHours.match(/(\d+(\.\d+)?)/);
        if (match) totalSleepHours += parseFloat(match[1]);
      }
    });

    const avgSleepHours = sleepLogs.length > 0 ? +(totalSleepHours / sleepLogs.length).toFixed(1) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    let daysElapsed = 0;
    let habitCounts = { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 };
    let totalCheckmarksAchieved = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    dailyLogs.forEach((log) => {
      const isLogged = log.workout || log.homeFood || log.noSweets || log.noMaida || log.noHotelFood || (log.weight !== null && log.weight > 0) || (log.proteinGrams !== null && log.proteinGrams > 0) || (log.cardioMinutes !== null && log.cardioMinutes > 0);
      if (log.date < todayStr || isLogged) daysElapsed++;

      if (log.workout) habitCounts.workout++;
      if (log.homeFood) habitCounts.homeFood++;
      if (log.noSweets) habitCounts.noSweets++;
      if (log.noMaida) habitCounts.noMaida++;
      if (log.noHotelFood) habitCounts.noHotelFood++;
      if (log.sleepTarget || (log.sleepHours && log.sleepHours.trim() !== '') || (log.sleepHoursNum && log.sleepHoursNum > 0)) habitCounts.sleepTarget++;

      const dayCheckCount = (log.workout ? 1 : 0) + (log.homeFood ? 1 : 0) + (log.noSweets ? 1 : 0) +
                            (log.noMaida ? 1 : 0) + (log.noHotelFood ? 1 : 0) +
                            ((log.sleepTarget || (log.sleepHours && log.sleepHours.trim() !== '') || (log.sleepHoursNum && log.sleepHoursNum > 0)) ? 1 : 0);
      totalCheckmarksAchieved += dayCheckCount;

      if (log.workout || dayCheckCount >= 4) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    currentStreak = tempStreak;
    const totalCheckableUnits = TOTAL_DAYS * 6;
    const overallConsistencyPct = +((totalCheckmarksAchieved / totalCheckableUnits) * 100).toFixed(1);
    const daysRemaining = Math.max(0, TOTAL_DAYS - daysElapsed);
    const weeksElapsed = Math.max(1, +(daysElapsed / 7).toFixed(1));
    const avgWeightLossPerWeek = +(weightLost / weeksElapsed).toFixed(2);

    let prevWeight = 90.0;
    const enrichedWeekly = weeklyCheckins.map((w) => {
      const wObj = w.toObject ? w.toObject() : { ...w };
      let changeVsPrevious = null;
      if (wObj.weight !== null) {
        changeVsPrevious = +(wObj.weight - prevWeight).toFixed(2);
        prevWeight = wObj.weight;
      }

      const weekStartDate = new Date(wObj.date + 'T00:00:00Z');
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      const weekStartDateStr = weekStartDate.toISOString().split('T')[0];
      const weekEndDateStr = weekEndDate.toISOString().split('T')[0];

      const weekLogs = dailyLogs.filter(d => d.date >= weekStartDateStr && d.date <= weekEndDateStr);

      let scores = {
        workoutDays: 0, homeFoodDays: 0, noSweetsDays: 0, noMaidaDays: 0, noHotelFoodDays: 0, sleepTargetDays: 0, totalChecked: 0, overallConsistencyPct: 0
      };

      weekLogs.forEach(d => {
        if (d.workout) scores.workoutDays++;
        if (d.homeFood) scores.homeFoodDays++;
        if (d.noSweets) scores.noSweetsDays++;
        if (d.noMaida) scores.noMaidaDays++;
        if (d.noHotelFood) scores.noHotelFoodDays++;
        if (d.sleepTarget || (d.sleepHours && d.sleepHours.trim() !== '')) scores.sleepTargetDays++;
      });

      scores.totalChecked = scores.workoutDays + scores.homeFoodDays + scores.noSweetsDays + scores.noMaidaDays + scores.noHotelFoodDays + scores.sleepTargetDays;
      const totalPossibleWeek = Math.max(1, weekLogs.length * 6);
      scores.overallConsistencyPct = +((scores.totalChecked / totalPossibleWeek) * 100).toFixed(1);

      return {
        ...wObj,
        changeVsPrevious,
        scores
      };
    });

    const responsePayload = {
      dbConnected: dbReady,
      stats: {
        startWeight: START_WEIGHT,
        targetWeight: TARGET_WEIGHT,
        startDate: START_DATE_STR,
        endDate: END_DATE_STR,
        totalToLose: TOTAL_WEIGHT_TO_LOSE,
        currentWeight,
        latestLogDate,
        weightLost,
        weightRemaining,
        weightLossProgressPct,
        avgWeightLossPerWeek,
        totalDays: TOTAL_DAYS,
        daysElapsed,
        daysRemaining,
        weeksElapsed,
        overallConsistencyPct,
        totalCheckmarksAchieved,
        totalCheckableUnits,
        averages: {
          avgProteinGrams,
          totalProteinGrams,
          proteinDaysLogged: proteinLogs.length,
          avgCardioMinutes,
          totalCardioMinutes,
          cardioDaysLogged: cardioLogs.length,
          avgSleepHours,
          totalSleepHours: +totalSleepHours.toFixed(1),
          sleepDaysLogged: sleepLogs.length,
          workoutDaysCount: habitCounts.workout,
          homeFoodDaysCount: habitCounts.homeFood,
          noSweetsDaysCount: habitCounts.noSweets,
          noMaidaDaysCount: habitCounts.noMaida,
          noHotelFoodDaysCount: habitCounts.noHotelFood
        },
        habitCounts,
        habitPercentages: {
          workout: +((habitCounts.workout / TOTAL_DAYS) * 100).toFixed(1),
          homeFood: +((habitCounts.homeFood / TOTAL_DAYS) * 100).toFixed(1),
          noSweets: +((habitCounts.noSweets / TOTAL_DAYS) * 100).toFixed(1),
          noMaida: +((habitCounts.noMaida / TOTAL_DAYS) * 100).toFixed(1),
          noHotelFood: +((habitCounts.noHotelFood / TOTAL_DAYS) * 100).toFixed(1),
          sleepTarget: +((habitCounts.sleepTarget / TOTAL_DAYS) * 100).toFixed(1)
        },
        streaks: { current: currentStreak, longest: longestStreak }
      },
      dailyLogs,
      weeklyCheckins: enrichedWeekly
    };

    dataCache = responsePayload;
    lastFetchTime = Date.now();

    return NextResponse.json(responsePayload);

  } catch (globalErr) {
    console.error('Fatal /api/init error fallback:', globalErr);
    // Ultimate failsafe: return fallback daily & weekly instantly
    const fallbackDaily = getFallbackDaily();
    const fallbackWeekly = getFallbackWeekly();
    return NextResponse.json({
      dbConnected: false,
      stats: {
        startWeight: 90, targetWeight: 80, totalToLose: 10, currentWeight: 90, latestLogDate: null, weightLost: 0, weightRemaining: 10, weightLossProgressPct: 0, avgWeightLossPerWeek: 0, totalDays: 107, daysElapsed: 1, daysRemaining: 106, weeksElapsed: 1, overallConsistencyPct: 0, totalCheckmarksAchieved: 0, totalCheckableUnits: 642,
        averages: { avgProteinGrams: 0, totalProteinGrams: 0, proteinDaysLogged: 0, avgCardioMinutes: 0, totalCardioMinutes: 0, cardioDaysLogged: 0, avgSleepHours: 0, totalSleepHours: 0, sleepDaysLogged: 0, workoutDaysCount: 0, homeFoodDaysCount: 0, noSweetsDaysCount: 0, noMaidaDaysCount: 0, noHotelFoodDaysCount: 0 },
        habitCounts: { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 },
        habitPercentages: { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 },
        streaks: { current: 0, longest: 0 }
      },
      dailyLogs: fallbackDaily,
      weeklyCheckins: fallbackWeekly
    });
  }
}
