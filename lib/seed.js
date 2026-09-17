import DailyLog from './models/DailyLog';
import WeeklyCheckin from './models/WeeklyCheckin';
import { getFallbackDaily, getFallbackWeekly } from './dataFallback';

export { getFallbackDaily, getFallbackWeekly };

export async function seedData(force = false) {
  try {
    const dailyCount = await DailyLog.countDocuments();
    const weeklyCount = await WeeklyCheckin.countDocuments();

    if (!force && dailyCount > 0 && weeklyCount > 0) {
      return { seeded: false, dailyCount, weeklyCount };
    }

    if (force) {
      await DailyLog.deleteMany({});
      await WeeklyCheckin.deleteMany({});
    }

    const dailyDocs = getFallbackDaily().map(d => {
      const { _id, ...rest } = d;
      return rest;
    });

    await DailyLog.insertMany(dailyDocs);

    const weeklyDocs = getFallbackWeekly().map(w => {
      const { _id, scores, ...rest } = w;
      return rest;
    });

    await WeeklyCheckin.insertMany(weeklyDocs);

    return { seeded: true, dailyCount: dailyDocs.length, weeklyCount: weeklyDocs.length };
  } catch (err) {
    console.error('Seed Error:', err);
    return { seeded: false, error: err.message };
  }
}
