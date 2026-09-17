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

  // 1. Weekly Reports (16 Weeks)
  let prevW = 90.0;
  const weeklyReports = weeklyCheckins.map((w) => {
    const wObj = w.toObject ? w.toObject() : { ...w };
    const wDate = new Date(wObj.date + 'T00:00:00Z');
    const endDate = new Date(wDate);
    endDate.setDate(endDate.getDate() + 6);
    const startStr = wDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const logsInWeek = dailyLogs.filter(d => d.date >= startStr && d.date <= endStr);
    
    // Protein avg in week
    const pLogs = logsInWeek.filter(d => d.proteinGrams !== null && d.proteinGrams > 0);
    const avgProtein = pLogs.length > 0 ? +(pLogs.reduce((s, d) => s + d.proteinGrams, 0) / pLogs.length).toFixed(1) : 0;

    // Cardio total & avg in week (Hours & Minutes)
    const cLogs = logsInWeek.filter(d => d.cardioMinutes !== null && d.cardioMinutes > 0);
    const totalCardioMins = cLogs.reduce((s, d) => s + d.cardioMinutes, 0);
    const cardioHours = Math.floor(totalCardioMins / 60);
    const cardioMinsRem = totalCardioMins % 60;
    const cardioFormatted = totalCardioMins > 0 ? `${cardioHours > 0 ? `${cardioHours}h ` : ''}${cardioMinsRem}m` : '0m';

    // Sleep total & avg in week (Hours & Minutes)
    let totalSleepMins = 0;
    let sleepDaysCount = 0;
    logsInWeek.forEach(d => {
      let mins = 0;
      if (d.sleepHoursNum !== null && d.sleepHoursNum > 0) {
        mins = Math.round(d.sleepHoursNum * 60);
      } else if (d.sleepHours) {
        const match = d.sleepHours.match(/(\d+(\.\d+)?)/);
        if (match) mins = Math.round(parseFloat(match[1]) * 60);
      }
      if (mins > 0) {
        totalSleepMins += mins;
        sleepDaysCount++;
      }
    });

    const avgSleepMins = sleepDaysCount > 0 ? Math.round(totalSleepMins / sleepDaysCount) : 0;
    const avgSleepH = Math.floor(avgSleepMins / 60);
    const avgSleepM = avgSleepMins % 60;
    const avgSleepFormatted = sleepDaysCount > 0 ? `${avgSleepH}h ${avgSleepM}m` : '--';

    let weightChange = null;
    if (wObj.weight !== null) {
      weightChange = +(wObj.weight - prevW).toFixed(2);
      prevW = wObj.weight;
    }

    const workoutDays = logsInWeek.filter(d => d.workout).length;
    const homeFoodDays = logsInWeek.filter(d => d.homeFood).length;

    return {
      weekNumber: wObj.weekNumber,
      weekLabel: wObj.weekLabel,
      startDate: wObj.displayDate,
      weight: wObj.weight,
      waistCm: wObj.waistCm,
      weightChange,
      avgProteinGrams: avgProtein,
      totalCardioMinutes: totalCardioMins,
      cardioFormatted,
      avgSleepHours: sleepDaysCount > 0 ? +(avgSleepMins / 60).toFixed(1) : 0,
      avgSleepFormatted,
      workoutDays,
      homeFoodDays,
      notes: wObj.notes
    };
  });

  // 2. Monthly Reports (Sep 2026, Oct 2026, Nov 2026, Dec 2026)
  const monthConfigs = [
    { monthKey: '2026-09', monthName: 'September 2026' },
    { monthKey: '2026-10', monthName: 'October 2026' },
    { monthKey: '2026-11', monthName: 'November 2026' },
    { monthKey: '2026-12', monthName: 'December 2026' }
  ];

  const monthlyReports = monthConfigs.map(({ monthKey, monthName }) => {
    const monthLogs = dailyLogs.filter(d => d.date.startsWith(monthKey));
    
    const pLogs = monthLogs.filter(d => d.proteinGrams !== null && d.proteinGrams > 0);
    const avgProtein = pLogs.length > 0 ? +(pLogs.reduce((s, d) => s + d.proteinGrams, 0) / pLogs.length).toFixed(1) : 0;

    // Cardio Mins & Hours
    const cLogs = monthLogs.filter(d => d.cardioMinutes !== null && d.cardioMinutes > 0);
    const totalCardioMins = cLogs.reduce((s, d) => s + d.cardioMinutes, 0);
    const cardioHours = Math.floor(totalCardioMins / 60);
    const cardioMinsRem = totalCardioMins % 60;
    const cardioFormatted = totalCardioMins > 0 ? `${cardioHours > 0 ? `${cardioHours}h ` : ''}${cardioMinsRem}m` : '0m';

    // Sleep Mins & Hours
    let totalSleepMins = 0;
    let sleepDaysCount = 0;
    monthLogs.forEach(d => {
      let mins = 0;
      if (d.sleepHoursNum !== null && d.sleepHoursNum > 0) {
        mins = Math.round(d.sleepHoursNum * 60);
      } else if (d.sleepHours) {
        const match = d.sleepHours.match(/(\d+(\.\d+)?)/);
        if (match) mins = Math.round(parseFloat(match[1]) * 60);
      }
      if (mins > 0) {
        totalSleepMins += mins;
        sleepDaysCount++;
      }
    });

    const avgSleepMins = sleepDaysCount > 0 ? Math.round(totalSleepMins / sleepDaysCount) : 0;
    const avgSleepH = Math.floor(avgSleepMins / 60);
    const avgSleepM = avgSleepMins % 60;
    const avgSleepFormatted = sleepDaysCount > 0 ? `${avgSleepH}h ${avgSleepM}m` : '--';

    const workoutDays = monthLogs.filter(d => d.workout).length;
    const totalMonthDays = monthLogs.length;

    const logsWithWeight = monthLogs.filter(d => d.weight !== null && d.weight > 0);
    const startMonthWeight = logsWithWeight.length > 0 ? logsWithWeight[0].weight : null;
    const endMonthWeight = logsWithWeight.length > 0 ? logsWithWeight[logsWithWeight.length - 1].weight : null;
    const monthWeightChange = (startMonthWeight !== null && endMonthWeight !== null) ? +(endMonthWeight - startMonthWeight).toFixed(2) : null;

    return {
      monthKey,
      monthName,
      totalDaysInMonth: totalMonthDays,
      startWeight: startMonthWeight,
      endWeight: endMonthWeight,
      monthWeightChange,
      avgProteinGrams: avgProtein,
      totalCardioMinutes: totalCardioMins,
      cardioFormatted,
      avgSleepHours: sleepDaysCount > 0 ? +(avgSleepMins / 60).toFixed(1) : 0,
      avgSleepFormatted,
      workoutDays,
      workoutConsistencyPct: totalMonthDays > 0 ? +((workoutDays / totalMonthDays) * 100).toFixed(1) : 0
    };
  });

  return NextResponse.json({
    weeklyReports,
    monthlyReports
  });
}
