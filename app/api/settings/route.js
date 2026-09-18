import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import UserSettings from '@/lib/models/UserSettings';
import { getFallbackSettings } from '@/lib/dataFallback';
import { invalidateCache } from '@/app/api/init/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  if (isDbConnected()) {
    try {
      let settings = await UserSettings.findOne({ key: 'default_goal' });
      if (!settings) {
        const fallback = getFallbackSettings();
        settings = await UserSettings.create({ key: 'default_goal', ...fallback });
      }
      return NextResponse.json(settings);
    } catch (e) {}
  }
  return NextResponse.json(getFallbackSettings());
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { startWeight, targetWeight, startDate, endDate, excludeSundays } = body;

    const startW = parseFloat(startWeight) || 90.0;
    const targetW = parseFloat(targetWeight) || 80.0;
    const startD = startDate || '2026-09-17';
    const endD = endDate || '2027-01-01';
    const excludeSun = !!excludeSundays;

    await dbConnect();
    if (isDbConnected()) {
      const updated = await UserSettings.findOneAndUpdate(
        { key: 'default_goal' },
        {
          $set: {
            startWeight: startW,
            targetWeight: targetW,
            startDate: startD,
            endDate: endD,
            excludeSundays: excludeSun
          }
        },
        { upsert: true, new: true }
      );
      invalidateCache();
      return NextResponse.json(updated);
    }

    invalidateCache();
    return NextResponse.json({
      key: 'default_goal',
      startWeight: startW,
      targetWeight: targetW,
      startDate: startD,
      endDate: endD,
      excludeSundays: excludeSun
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
