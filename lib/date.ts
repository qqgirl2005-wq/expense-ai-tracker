// 所有日期都以 "YYYY-MM-DD" 字串處理，避免時區造成的日期偏移

export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const pad = (n: number) => String(n).padStart(2, "0");

export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-11" */
export function monthOf(date: string) {
  return date.slice(0, 7);
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** 該月份所有日期 */
export function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${month}-${pad(i + 1)}`);
}

export function weekdayOf(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function formatMonthTitle(month: string) {
  const [y, m] = month.split("-").map(Number);
  return { year: y, month: m };
}

export function formatMoney(n: number) {
  return Math.round(n).toLocaleString("zh-TW");
}
