import { getFallbackDaily, getFallbackWeekly } from './dataFallback';

export function getInitialState() {
  const dailyLogs = getFallbackDaily();
  const weeklyCheckins = getFallbackWeekly();

  const START_WEIGHT = 90.0;
  const TARGET_WEIGHT = 80.0;
  const TOTAL_WEIGHT_TO_LOSE = 10.0;
  const TOTAL_DAYS = 107;

  return {
    stats: {
      startWeight: START_WEIGHT,
      targetWeight: TARGET_WEIGHT,
      totalToLose: TOTAL_WEIGHT_TO_LOSE,
      currentWeight: START_WEIGHT,
      latestLogDate: null,
      weightLost: 0,
      weightRemaining: TOTAL_WEIGHT_TO_LOSE,
      weightLossProgressPct: 0,
      avgWeightLossPerWeek: 0,
      totalDays: TOTAL_DAYS,
      daysElapsed: 1,
      daysRemaining: 106,
      weeksElapsed: 1,
      overallConsistencyPct: 0,
      totalCheckmarksAchieved: 0,
      totalCheckableUnits: TOTAL_DAYS * 6,
      averages: {
        avgProteinGrams: 0,
        totalProteinGrams: 0,
        proteinDaysLogged: 0,
        avgCardioMinutes: 0,
        totalCardioMinutes: 0,
        cardioDaysLogged: 0,
        avgSleepHours: 0,
        totalSleepHours: 0,
        sleepDaysLogged: 0,
        workoutDaysCount: 0,
        homeFoodDaysCount: 0,
        noSweetsDaysCount: 0,
        noMaidaDaysCount: 0,
        noHotelFoodDaysCount: 0
      },
      habitCounts: { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 },
      habitPercentages: { workout: 0, homeFood: 0, noSweets: 0, noMaida: 0, noHotelFood: 0, sleepTarget: 0 },
      streaks: { current: 0, longest: 0 }
    },
    dailyLogs,
    weeklyCheckins
  };
}
