import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import { getFallbackDaily } from '@/lib/seed';

export async function GET() {
  await dbConnect();
  const dbReady = isDbConnected();

  if (dbReady) {
    try {
      const logs = await DailyLog.find().sort({ date: 1 });
      if (logs && logs.length > 0) return NextResponse.json(logs);
    } catch (e) {}
  }

  return NextResponse.json(getFallbackDaily());
}
