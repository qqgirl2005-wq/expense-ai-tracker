import { categoryMeta } from "./categories";
import type { Expense } from "./types";

export type CategoryGroup = {
  category: string;
  amount: number;
  count: number;
  meta: ReturnType<typeof categoryMeta>;
};

export function sumAmount(expenses: Expense[]) {
  return expenses.reduce((sum, x) => sum + x.amount, 0);
}

/** 依分類加總，金額由大到小排序 */
export function groupByCategory(expenses: Expense[]): CategoryGroup[] {
  const grouped: Record<string, { amount: number; count: number }> = {};
  for (const x of expenses) {
    grouped[x.category] ??= { amount: 0, count: 0 };
    grouped[x.category].amount += x.amount;
    grouped[x.category].count += 1;
  }
  return Object.entries(grouped)
    .map(([category, v]) => ({ category, ...v, meta: categoryMeta(category) }))
    .sort((a, b) => b.amount - a.amount);
}

/** 依月份加總，回傳長度 12 的陣列（index 0 = 1 月） */
export function totalsByMonth(expenses: Expense[]) {
  const totals = Array<number>(12).fill(0);
  for (const x of expenses) totals[Number(x.date.slice(5, 7)) - 1] += x.amount;
  return totals;
}
