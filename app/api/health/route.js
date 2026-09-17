import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';

export async function GET() {
  await dbConnect();
  const dbReady = isDbConnected();

  let dailyCount = 107;
  let weeklyCount = 16;

  if (dbReady) {
    try {
      dailyCount = await DailyLog.countDocuments();
      weeklyCount = await WeeklyCheckin.countDocuments();
    } catch (e) {}
  }

  return NextResponse.json({
    status: 'ok',
    dbConnected: dbReady,
    dailyCount,
    weeklyCount
  });
}
