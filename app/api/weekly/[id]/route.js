import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import WeeklyCheckin from '@/lib/models/WeeklyCheckin';

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
      const isNum = !isNaN(id);
      const query = isNum ? { weekNumber: Number(id) } : { _id: id };
      const checkin = await WeeklyCheckin.findOneAndUpdate(query, { $set: updateData }, { new: true, upsert: true });
      return NextResponse.json(checkin);
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ _id: `mem_w_${id}`, weekNumber: Number(id), ...updateData });
}
