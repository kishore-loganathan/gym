export function getFallbackSettings() {
  return {
    startWeight: 90.0,
    targetWeight: 80.0,
    startDate: '2026-09-17',
    endDate: '2027-01-01'
  };
}

export function getFallbackDaily(startDateStr = '2026-09-17', endDateStr = '2027-01-01') {
  const list = [];
  let curr = new Date(startDateStr + 'T00:00:00Z');
  const end = new Date(endDateStr + 'T00:00:00Z');
  const totalMs = end.getTime() - curr.getTime();
  const totalDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)) + 1);

  let dayIdx = 0;
  while (curr <= end) {
    const dateStr = curr.toISOString().split('T')[0];
    const displayStr = curr.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    list.push({
      _id: `mem_${dateStr}`,
      date: dateStr,
      displayDate: displayStr,
      daysLeft: Math.max(0, totalDays - 1 - dayIdx),
      weight: null,
      proteinGrams: null,
      cardioMinutes: null,
      cardioTiming: '',
      sleepHoursNum: null,
      sleepHours: '',
      workout: false,
      homeFood: false,
      noSweets: false,
      noMaida: false,
      noHotelFood: false,
      sleepTarget: false,
      dailyNotes: ''
    });
    curr.setDate(curr.getDate() + 1);
    dayIdx++;
  }
  return list;
}

export function getFallbackWeekly(startDateStr = '2026-09-17', endDateStr = '2027-01-01') {
  const list = [];
  let curr = new Date(startDateStr + 'T00:00:00Z');
  const end = new Date(endDateStr + 'T00:00:00Z');
  const totalMs = end.getTime() - curr.getTime();
  const totalDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)) + 1);
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));

  for (let w = 1; w <= totalWeeks; w++) {
    if (curr > end) break;
    const dateStr = curr.toISOString().split('T')[0];
    const displayStr = curr.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    list.push({
      _id: `mem_w_${w}`,
      weekNumber: w,
      weekLabel: `Week ${w}`,
      date: dateStr,
      displayDate: displayStr,
      weight: null,
      waistCm: null,
      notes: '',
      scores: {
        workoutDays: 0, homeFoodDays: 0, noSweetsDays: 0, noMaidaDays: 0, noHotelFoodDays: 0, sleepTargetDays: 0, totalChecked: 0, overallConsistencyPct: 0
      }
    });
    curr.setDate(curr.getDate() + 7);
  }
  return list;
}
