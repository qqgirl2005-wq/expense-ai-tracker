import { formatMoney } from "@/lib/date";

type Props = {
  totals: number[]; // 12 個月
  highlight: number; // 目前所在月份（1-12）
  futureFrom: number; // 從第幾月開始算「未來」（13 = 沒有未來月份）
  onPick: (month: number) => void;
};

/** 年度 12 個月長條圖，點擊可跳到該月統計 */
export default function MonthlyBars({ totals, highlight, futureFrom, onPick }: Props) {
  const max = Math.max(...totals, 1);

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-ink">每月支出</h3>
        <span className="text-[11px] text-gray-400">點月份查看明細統計</span>
      </div>
      <div className="flex h-36 items-end gap-1.5">
        {totals.map((amount, i) => {
          const m = i + 1;
          const active = m === highlight;
          const future = m >= futureFrom;
          return (
            <button
              key={m}
              onClick={() => onPick(m)}
              disabled={future}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1 disabled:opacity-40"
            >
              <span
                className={`text-[9px] tabular-nums leading-none ${
                  active ? "font-semibold text-brand-strong" : "text-transparent"
                }`}
              >
                {amount ? formatMoney(amount) : ""}
              </span>
              <div
                className={`w-full rounded-lg transition-all group-active:scale-95 ${
                  active ? "bg-brand-gradient shadow-brand" : amount ? "bg-brand/20" : "bg-gray-100"
                }`}
                style={{ height: amount ? `${Math.max((amount / max) * 100, 4)}%` : "4px" }}
              />
              <span
                className={`text-[10px] tabular-nums ${
                  active ? "font-semibold text-brand-strong" : "text-gray-400"
                }`}
              >
                {m}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
