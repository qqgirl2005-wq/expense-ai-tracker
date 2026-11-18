import CategoryList from "./stats/CategoryList";
import MonthlyBars from "./stats/MonthlyBars";
import SummaryCard from "./stats/SummaryCard";
import { formatMoney } from "@/lib/date";
import { groupByCategory, sumAmount, totalsByMonth } from "@/lib/stats";
import type { Expense } from "@/lib/types";

export type StatsMode = "month" | "year";

type Props = {
  mode: StatsMode;
  onModeChange: (mode: StatsMode) => void;
  month: string; // "YYYY-MM"，年度模式取前四碼當年份
  today: string;
  expenses: Expense[]; // 月模式為該月資料，年模式為該年資料
  loading: boolean;
  onPickMonth: (month: string) => void;
};

export default function StatsView({
  mode,
  onModeChange,
  month,
  today,
  expenses,
  loading,
  onPickMonth,
}: Props) {
  return (
    <div className="flex flex-col gap-3 px-4">
      <div className="flex rounded-full bg-white p-1 shadow-card ring-1 ring-line">
        {(["month", "year"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition ${
              mode === m ? "bg-brand-gradient text-white shadow-brand" : "text-gray-500"
            }`}
          >
            {m === "month" ? "月" : "年"}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <div className="h-44 animate-pulse rounded-[28px] bg-white/80 ring-1 ring-line" />
          <div className="h-56 animate-pulse rounded-[28px] bg-white/80 ring-1 ring-line" />
        </>
      ) : mode === "month" ? (
        <MonthStats month={month} today={today} expenses={expenses} />
      ) : (
        <YearStats month={month} today={today} expenses={expenses} onPickMonth={onPickMonth} />
      )}
    </div>
  );
}

function MonthStats({ month, today, expenses }: { month: string; today: string; expenses: Expense[] }) {
  const total = sumAmount(expenses);
  const groups = groupByCategory(expenses);

  // 日均：本月算到今天為止；過去月份以整月計；未來月份為 0
  const [y, m] = month.split("-").map(Number);
  const thisMonth = today.slice(0, 7);
  const daysElapsed =
    month === thisMonth ? Number(today.slice(8)) : month < thisMonth ? new Date(y, m, 0).getDate() : 0;

  return (
    <>
      <SummaryCard
        label={`${m}月支出`}
        total={total}
        groups={groups}
        metrics={[
          { label: "記帳筆數", value: String(expenses.length) },
          { label: "日均支出", value: `$${formatMoney(daysElapsed ? total / daysElapsed : 0)}` },
        ]}
      />
      <CategoryList groups={groups} total={total} emptyText="這個月還沒有任何支出" />
    </>
  );
}

function YearStats({
  month,
  today,
  expenses,
  onPickMonth,
}: {
  month: string;
  today: string;
  expenses: Expense[];
  onPickMonth: (month: string) => void;
}) {
  const year = month.slice(0, 4);
  const total = sumAmount(expenses);
  const groups = groupByCategory(expenses);
  const monthly = totalsByMonth(expenses);

  // 月均：今年算到本月為止；過去年份以 12 個月計；未來年份為 0
  const thisYear = today.slice(0, 4);
  const currentMonthNum = Number(today.slice(5, 7));
  const monthsElapsed = year === thisYear ? currentMonthNum : year < thisYear ? 12 : 0;
  const futureFrom = year === thisYear ? currentMonthNum + 1 : year < thisYear ? 13 : 1;

  return (
    <>
      <SummaryCard
        label={`${year}年支出`}
        total={total}
        groups={groups}
        metrics={[
          { label: "記帳筆數", value: String(expenses.length) },
          { label: "月均支出", value: `$${formatMoney(monthsElapsed ? total / monthsElapsed : 0)}` },
        ]}
      />
      <MonthlyBars
        totals={monthly}
        highlight={Number(month.slice(5, 7))}
        futureFrom={futureFrom}
        onPick={(m) => onPickMonth(`${year}-${String(m).padStart(2, "0")}`)}
      />
      <CategoryList groups={groups} total={total} emptyText="這一年還沒有任何支出" />
    </>
  );
}
