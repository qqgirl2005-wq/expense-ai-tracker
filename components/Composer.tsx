"use client";

import { useState } from "react";

type Props = {
  onSubmit: (text: string) => Promise<boolean>;
};

export default function Composer({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    const ok = await onSubmit(value);
    setSending(false);
    if (ok) setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 pb-2">
      <div className="flex flex-1 items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-1.5 shadow-float ring-1 ring-line transition focus-within:ring-2 focus-within:ring-brand/40">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm">
          ✨
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
          enterKeyHint="send"
          placeholder={sending ? "AI 分析中…" : "午餐拉麵 180、跟小明搭車 300"}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-gray-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="送出"
          className="bg-brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-brand transition active:scale-90 disabled:bg-none disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
        {sending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        )}
        </button>
      </div>
    </form>
  );
}
