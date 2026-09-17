import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';
import { getFallbackDaily, getFallbackWeekly } from '@/lib/seed';

export async function GET() {
  await dbConnect();
  const dbReady = isDbConnected();

  let weeklyCheckins = [];
  let dailyLogs = [];

  if (dbReady) {
    try {
      weeklyCheckins = await WeeklyCheckin.find().sort({ weekNumber: 1 });
      dailyLogs = await DailyLog.find().sort({ date: 1 });
    } catch (e) {}
  }

  if (!weeklyCheckins || weeklyCheckins.length === 0) weeklyCheckins = getFallbackWeekly();
  if (!dailyLogs || dailyLogs.length === 0) dailyLogs = getFallbackDaily();

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
      if (d.sleepTarget) scores.sleepTargetDays++;
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

  return NextResponse.json(enrichedWeekly);
}
