import { formatMoney } from "@/lib/date";
import type { CategoryGroup } from "@/lib/stats";

type Props = {
  groups: CategoryGroup[];
  total: number;
  emptyText: string;
};

export default function CategoryList({ groups, total, emptyText }: Props) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
      <h3 className="mb-4 text-sm font-semibold text-ink">分類支出</h3>
      {groups.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map(({ category, amount, count, meta }) => {
            const pct = (amount / total) * 100;
            return (
              <li key={category} className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg"
                  style={{ backgroundColor: meta.bg }}
                >
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-medium">
                      {category}
                      <span className="ml-1.5 text-xs font-normal text-gray-400">{count} 筆</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">${formatMoney(amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: meta.color }}
                      />
                    </div>
                    <span className="w-9 text-right text-[11px] tabular-nums text-gray-400">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
