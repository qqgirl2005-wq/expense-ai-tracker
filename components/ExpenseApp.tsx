"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Composer from "./Composer";
import DateStrip from "./DateStrip";
import DayView from "./DayView";
import StatsView, { type StatsMode } from "./StatsView";
import TabBar, { type Tab } from "./TabBar";
import UserMenu, { type PublicUser } from "./UserMenu";
import { daysInMonth, formatMoney, formatMonthTitle, monthOf, shiftMonth, todayString } from "@/lib/date";
import type { Expense } from "@/lib/types";

type MonthData = { month: string; expenses: Expense[] };
type YearData = { year: string; expenses: Expense[] };
type Toast = { message: string; type: "success" | "error" };

/** 登入過期時丟出，由呼叫端導回登入頁 */
class UnauthorizedError extends Error {}

function assertAuthorized(res: Response) {
  if (res.status === 401) throw new UnauthorizedError("請先登入");
}

async function fetchExpenses(query: string) {
  const res = await fetch(`/api/expenses?${query}`);
  assertAuthorized(res);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "載入失敗");
  return body.expenses as Expense[];
}

export default function ExpenseApp() {
  const [today] = useState(todayString);
  const [month, setMonth] = useState(() => monthOf(today));
  const [selected, setSelected] = useState(today);
  const [tab, setTab] = useState<Tab>("list");
  const [statsMode, setStatsMode] = useState<StatsMode>("month");
  const [data, setData] = useState<MonthData | null>(null);
  const [yearData, setYearData] = useState<YearData | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const router = useRouter();
  const year = month.slice(0, 4);
  const yearMode = tab === "stats" && statsMode === "year";
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function showToast(message: string, type: Toast["type"] = "success") {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  // 登入過期 → 回登入頁；其他錯誤 → 顯示提示
  function handleError(err: unknown) {
    if (err instanceof UnauthorizedError) router.replace("/login");
    else showToast(err instanceof Error ? err.message : "發生錯誤", "error");
  }
  const onLoadError = useEffectEvent(handleError);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        assertAuthorized(res);
        if (res.ok) setUser((await res.json()).user);
      })
      .catch(onLoadError);
  }, []);

  // 切換月份時載入該月資料
  useEffect(() => {
    let cancelled = false;
    fetchExpenses(`month=${month}`)
      .then((expenses) => {
        if (!cancelled) setData({ month, expenses });
      })
      .catch((err) => {
        if (cancelled) return;
        setData({ month, expenses: [] });
        onLoadError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  // 年度統計：只有切到「年」時才載入
  useEffect(() => {
    if (!yearMode) return;
    let cancelled = false;
    fetchExpenses(`year=${year}`)
      .then((expenses) => {
        if (!cancelled) setYearData({ year, expenses });
      })
      .catch((err) => {
        if (cancelled) return;
        setYearData({ year, expenses: [] });
        onLoadError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [yearMode, year]);

  const loading = data?.month !== month;
  const yearLoading = yearData?.year !== year;
  const expenses = useMemo(() => (data?.month === month ? data.expenses : []), [data, month]);
  const days = useMemo(() => daysInMonth(month), [month]);

  const totalsByDate = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const x of expenses) totals[x.date] = (totals[x.date] ?? 0) + x.amount;
    return totals;
  }, [expenses]);

  const monthTotal = expenses.reduce((sum, x) => sum + x.amount, 0);
  const dayExpenses = expenses.filter((x) => x.date === selected);
  const { year: yearNum, month: monthNum } = formatMonthTitle(month);

  function openMonth(next: string) {
    setMonth(next);
    setSelected(next === monthOf(today) ? today : `${next}-01`);
  }

  // 年度模式下左右箭頭一次跳一年
  function goMonth(delta: number) {
    openMonth(shiftMonth(month, yearMode ? delta * 12 : delta));
  }

  // 從年度長條圖點某個月 → 切回該月統計
  function pickMonthFromYear(next: string) {
    openMonth(next);
    setStatsMode("month");
  }

  function goToday() {
    setMonth(monthOf(today));
    setSelected(today);
  }

  async function handleAdd(text: string) {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      assertAuthorized(res);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "記帳失敗");

      const added = body.expenses as Expense[];
      if (added.length === 0) {
        showToast("沒有偵測到消費，換個說法試試", "error");
        return false;
      }

      // 跳到新紀錄的日期；同月份直接併入，不同月份則切換月份重新載入
      const target = added[0].date;
      if (monthOf(target) === month) {
        setData((prev) => (prev ? { ...prev, expenses: [...added, ...prev.expenses] } : prev));
      } else {
        setMonth(monthOf(target));
      }
      // 年度資料若已載入，同步併入同一年的新紀錄
      setYearData((prev) =>
        prev
          ? { ...prev, expenses: [...added.filter((x) => x.date.startsWith(prev.year)), ...prev.expenses] }
          : prev,
      );
      setSelected(target);
      showToast(`已記下 ${added.length} 筆`);
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }

  return (
    <div className="app-canvas relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden text-ink sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[2.5rem] sm:shadow-float sm:ring-1 sm:ring-black/5">
      {/* Header */}
      <header className="px-4 pb-3 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 rounded-full bg-white/80 p-1 shadow-card ring-1 ring-line backdrop-blur">
            <button
              onClick={() => goMonth(-1)}
              aria-label={yearMode ? "上一年" : "上個月"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 active:scale-90"
            >
              <Chevron dir="left" />
            </button>
            <h1 className="min-w-[6.5rem] text-center text-[15px] font-semibold tracking-tight tabular-nums">
              {yearNum}年{!yearMode && `${monthNum}月`}
            </h1>
            <button
              onClick={() => goMonth(1)}
              aria-label={yearMode ? "下一年" : "下個月"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 active:scale-90"
            >
              <Chevron dir="right" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {selected !== today && (
              <button
                onClick={goToday}
                className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-brand-strong shadow-card ring-1 ring-line transition active:scale-95"
              >
                今天
              </button>
            )}
            <UserMenu user={user} />
          </div>
        </div>

        {tab === "list" && (
          <div className="relative mt-4 overflow-hidden rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
            {/* 卡片角落的柔和光暈 */}
            <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-brand-soft blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-[#FFF1DF] blur-2xl" />
            <div className="relative">
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                本月支出
              </p>
              <p className="mt-1.5 text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums">
                {loading ? (
                  <span className="text-gray-300">—</span>
                ) : (
                  <>
                    <span className="mr-1 align-top text-lg font-medium text-gray-400">$</span>
                    {formatMoney(monthTotal)}
                  </>
                )}
              </p>
              <div className="mt-4 flex gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-50 px-2.5 py-1 ring-1 ring-line">
                  {monthOf(today) === month ? "今日" : "當日"}{" "}
                  <b className="font-semibold tabular-nums text-ink">
                    ${formatMoney(totalsByDate[selected] ?? 0)}
                  </b>
                </span>
                <span className="rounded-full bg-gray-50 px-2.5 py-1 ring-1 ring-line">
                  共 <b className="font-semibold tabular-nums text-ink">{expenses.length}</b> 筆
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {tab === "list" && (
        <DateStrip
          days={days}
          selected={selected}
          today={today}
          totals={totalsByDate}
          onSelect={setSelected}
        />
      )}

      <main className="no-scrollbar flex-1 overflow-y-auto pb-4 pt-4">
        {tab === "list" ? (
          <DayView
            date={selected}
            expenses={dayExpenses}
            loading={loading}
            currentUserId={user?.id}
          />
        ) : (
          <StatsView
            mode={statsMode}
            onModeChange={setStatsMode}
            month={month}
            today={today}
            expenses={statsMode === "year" ? (yearLoading ? [] : (yearData?.expenses ?? [])) : expenses}
            loading={statsMode === "year" ? yearLoading : loading}
            onPickMonth={pickMonthFromYear}
          />
        )}
      </main>

      <footer className="bg-gradient-to-t from-white via-white/90 to-white/0 pt-2">
        {tab === "list" && <Composer onSubmit={handleAdd} />}
        <TabBar tab={tab} onChange={setTab} />
      </footer>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-[max(env(safe-area-inset-top),1rem)] z-10 flex justify-center px-4">
          <div
            className={`flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-medium shadow-float ring-1 ${
              toast.type === "error" ? "text-red-600 ring-red-100" : "text-ink ring-line"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white ${
                toast.type === "error" ? "bg-red-500" : "bg-brand"
              }`}
            >
              {toast.type === "success" ? "✓" : "!"}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}
