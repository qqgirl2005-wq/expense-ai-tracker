import { formatMoney } from "@/lib/date";
import type { CategoryGroup } from "@/lib/stats";

type Props = {
  label: string;
  total: number;
  groups: CategoryGroup[];
  metrics: { label: string; value: string }[];
};

/** 甜甜圈圖 + 右側指標 */
export default function SummaryCard({ label, total, groups, metrics }: Props) {
  // 用 conic-gradient 拼出各分類比例
  let running = 0;
  const gradient = groups
    .map(({ amount, meta }) => {
      const start = (running / total) * 100;
      running += amount;
      return `${meta.color} ${start}% ${(running / total) * 100}%`;
    })
    .join(", ");

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
      <div className="flex items-center gap-6">
        <div
          className="relative h-32 w-32 shrink-0 rounded-full"
          style={{ background: total ? `conic-gradient(${gradient})` : "#F1F2EE" }}
        >
          <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[11px] text-gray-400">{label}</span>
            <span className="text-lg font-semibold tracking-tight tabular-nums">${formatMoney(total)}</span>
          </div>
        </div>
        <dl className="flex flex-1 flex-col gap-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-xs text-gray-400">{m.label}</dt>
              <dd className="text-xl font-semibold tracking-tight tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
