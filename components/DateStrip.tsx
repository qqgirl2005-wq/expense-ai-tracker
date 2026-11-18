"use client";

import { useEffect, useRef } from "react";
import { weekdayOf } from "@/lib/date";

type Props = {
  days: string[];
  selected: string;
  today: string;
  totals: Record<string, number>;
  onSelect: (date: string) => void;
};

export default function DateStrip({ days, selected, today, totals, onSelect }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  // 選取的日期自動捲到中間
  useEffect(() => {
    const container = scroller.current;
    const el = container?.querySelector<HTMLElement>(`[data-date="${selected}"]`);
    if (!container || !el) return;
    container.scrollTo({
      left: el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2,
      behavior: "smooth",
    });
  }, [selected, days]);

  return (
    <div ref={scroller} className="no-scrollbar relative flex snap-x gap-2 overflow-x-auto px-4 py-2">
      {days.map((date) => {
        const isSelected = date === selected;
        const isToday = date === today;
        const isFuture = date > today;
        const hasRecord = (totals[date] ?? 0) > 0;
        return (
          <button
            key={date}
            data-date={date}
            onClick={() => onSelect(date)}
            className={`flex w-12 shrink-0 snap-center flex-col items-center gap-0.5 rounded-2xl py-2.5 transition-all active:scale-95 ${
              isSelected
                ? "bg-brand-gradient text-white shadow-brand"
                : `bg-white text-ink shadow-card ring-1 ${isToday ? "ring-brand/40" : "ring-line"}`
            } ${isFuture && !isSelected ? "opacity-45" : ""}`}
          >
            <span
              className={`text-[11px] font-medium ${
                isSelected ? "text-white/85" : isToday ? "text-brand" : "text-gray-400"
              }`}
            >
              {isToday ? "今天" : weekdayOf(date)}
            </span>
            <span className="text-lg font-semibold leading-tight tracking-tight tabular-nums">
              {Number(date.slice(8))}
            </span>
            <span
              className={`h-1 w-1 rounded-full ${
                hasRecord ? (isSelected ? "bg-white" : "bg-brand") : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
