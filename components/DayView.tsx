import ExpenseItem from "./ExpenseItem";
import { formatMoney, weekdayOf } from "@/lib/date";
import type { Expense } from "@/lib/types";

type Props = {
  date: string;
  expenses: Expense[];
  loading: boolean;
  currentUserId?: string;
};

export default function DayView({ date, expenses, loading, currentUserId }: Props) {
  const total = expenses.reduce((sum, x) => sum + x.amount, 0);
  const [, m, d] = date.split("-").map(Number);

  return (
    <section className="px-4">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          {m}月{d}日 <span className="ml-0.5 font-normal text-gray-400">週{weekdayOf(date)}</span>
        </h2>
        {expenses.length > 0 && (
          <p className="text-xs text-gray-400">
            當日支出{" "}
            <span className="text-sm font-semibold tabular-nums text-ink">${formatMoney(total)}</span>
          </p>
        )}
      </div>

      {loading ? (
        <ul className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[72px] animate-pulse rounded-[20px] bg-white/80 ring-1 ring-line" />
          ))}
        </ul>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center rounded-[28px] border border-dashed border-gray-200 bg-white/60 py-12 text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-2xl">
            🌱
          </span>
          <p className="text-sm font-medium text-gray-600">這天還沒有記帳</p>
          <p className="mt-1 text-xs text-gray-400">在下方輸入一句話，AI 幫你記</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {expenses.map((x) => (
            <ExpenseItem key={x._id} expense={x} currentUserId={currentUserId} />
          ))}
        </ul>
      )}
    </section>
  );
}
