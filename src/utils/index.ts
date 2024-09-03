export function getNextDayIsoString(isoString: string): string {
  const date = new Date(isoString);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}
