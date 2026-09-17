import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import DailyLog from '@/lib/models/DailyLog';
import { invalidateCache } from '@/app/api/init/route';


export async function PUT(req, context) {
  await dbConnect();
  const dbReady = isDbConnected();
  
  let id;
  if (context && context.params) {
    const p = await Promise.resolve(context.params);
    id = p.id;
  }

  const updateData = await req.json();

  if (dbReady && id) {
    try {
      const log = await DailyLog.findOneAndUpdate(
        { date: id },
        { $set: updateData },
        { new: true, upsert: true }
      );
      invalidateCache();
      return NextResponse.json(log);
    } catch (e) {

      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ _id: `mem_${id}`, date: id, ...updateData });
}
