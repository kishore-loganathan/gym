export function isSunday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T00:00:00Z').getUTCDay() === 0;
}

export function excludeSundaysIf(logs, shouldExclude) {
  if (!shouldExclude) return logs;
  return logs.filter((d) => !isSunday(d.date));
}
