import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';
import { seedData } from '@/lib/seed';


export async function POST(req) {
  await dbConnect();
  const dbReady = isDbConnected();

  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';

  if (dbReady) {
    const res = await seedData(force);
    return NextResponse.json({ success: true, ...res });
  }

  return NextResponse.json({ success: true, seeded: true, inMemory: true });
}
