import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';
import { getFallbackDaily, getFallbackWeekly } from '@/lib/seed';

export async function GET() {
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

  const START_WEIGHT = 90.0;
  const TARGET_WEIGHT = 80.0;
  const TOTAL_WEIGHT_TO_LOSE = 10.0;
  const TOTAL_DAYS = 107;

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

  // Sleep calculations (Extract numeric from sleepHoursNum or regex from sleepHours)
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
    if (log.date <= todayStr) daysElapsed++;

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

  // Rate of weight loss per week
  const weeksElapsed = Math.max(1, +(daysElapsed / 7).toFixed(1));
  const avgWeightLossPerWeek = +(weightLost / weeksElapsed).toFixed(2);

  return NextResponse.json({
    startWeight: START_WEIGHT,
    targetWeight: TARGET_WEIGHT,
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
  });
}
