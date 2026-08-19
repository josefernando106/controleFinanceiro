/** Parses a "YYYY-MM-DD" (or ISO datetime) string as local calendar date
 * components, avoiding the UTC-midnight-vs-local-timezone shift that
 * `new Date("YYYY-MM-DD")` introduces (it can roll the 1st of a month back
 * to the last day of the previous month in negative UTC offsets). */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Formats a "YYYY-MM-DD" (or ISO datetime) string as pt-BR (DD/MM/AAAA). */
export function formatDateBR(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("pt-BR");
}

/** Adds `months` calendar months to a "YYYY-MM-DD" date, clamping to the
 * target month's last day instead of rolling over (e.g. Jan 31 + 1 month
 * lands on Feb 28/29, not Mar 3). */
export function addMonthsClamped(dateStr: string, months: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetMonthFirst = new Date(year, month - 1 + months, 1);
  const lastDayOfTargetMonth = new Date(
    targetMonthFirst.getFullYear(),
    targetMonthFirst.getMonth() + 1,
    0
  ).getDate();
  const clampedDay = Math.min(day, lastDayOfTargetMonth);
  const resultYear = targetMonthFirst.getFullYear();
  const resultMonth = targetMonthFirst.getMonth() + 1;
  return `${resultYear.toString().padStart(4, "0")}-${resultMonth.toString().padStart(2, "0")}-${clampedDay
    .toString()
    .padStart(2, "0")}`;
}
