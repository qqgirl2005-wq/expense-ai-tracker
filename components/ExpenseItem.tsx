import { categoryMeta } from "@/lib/categories";
import { formatMoney } from "@/lib/date";
import type { Expense } from "@/lib/types";

type Props = { expense: Expense; currentUserId?: string };

export default function ExpenseItem({ expense, currentUserId }: Props) {
  const meta = categoryMeta(expense.category);
  const recorder = expense.user;
  const isMine = recorder._id === currentUserId;
  const recorderName = isMine ? "我" : recorder.name;
  const sub = [
    expense.category,
    expense.payer && `${expense.payer}付款`,
    expense.participants.length > 1 && `${expense.participants.length} 人分攤`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 shadow-card ring-1 ring-line">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ backgroundColor: meta.bg }}
      >
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium tracking-tight text-ink">{expense.description}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
          <span
            title={`${recorder.name} 記的帳`}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full py-px pl-px pr-1.5 ${
              isMine ? "bg-brand-soft text-brand-strong" : "bg-gray-100 text-gray-500"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold text-white ${
                isMine ? "bg-brand-gradient" : "bg-gray-400"
              }`}
            >
              {recorder.name.slice(0, 1).toUpperCase()}
            </span>
            {recorderName}
          </span>
          <span className="truncate">{sub}</span>
        </p>
      </div>
      <div className="text-right">
        <p className="text-[15px] font-semibold tracking-tight tabular-nums text-ink">
          <span className="mr-0.5 text-xs font-normal text-gray-400">
            {expense.currency === "TWD" ? "$" : expense.currency}
          </span>
          {formatMoney(expense.amount)}
        </p>
        {expense.participants.length > 1 && (
          <p className="text-[11px] tabular-nums text-gray-400">
            每人 {formatMoney(expense.amount / expense.participants.length)}
          </p>
        )}
      </div>
    </li>
  );
}
