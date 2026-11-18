"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

const COPY = {
  login: {
    title: "歡迎回來",
    subtitle: "登入後繼續用一句話記帳",
    submit: "登入",
    switchText: "還沒有帳號？",
    switchLink: "免費註冊",
    switchHref: "/register",
  },
  register: {
    title: "建立帳號",
    subtitle: "30 秒開始，和夥伴共用一本帳",
    submit: "註冊並開始記帳",
    switchText: "已經有帳號了？",
    switchLink: "登入",
    switchHref: "/login",
  },
} as const;

const FEATURES = [
  { icon: "💬", title: "一句話記多筆", desc: "一次輸入好幾筆消費，AI 自動拆開" },
  { icon: "🏷️", title: "自動分類", desc: "餐飲、交通、購物… 不用自己選" },
  { icon: "👥", title: "多人分攤", desc: "誰付錢、幾人分，一眼看清楚" },
  { icon: "📊", title: "月／年統計", desc: "分類圓餅圖與每月趨勢" },
];

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      setSubmitting(false);
    }
  }

  return (
    <div className="relative isolate min-h-dvh w-full overflow-hidden text-ink">
      {/* 背景裝飾：柔光 + 細網格 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#CFF3E1] opacity-70 blur-3xl" />
        <div className="absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-[#FFE6CC] opacity-70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-[#E3EEFF] opacity-60 blur-3xl" />
        <div className="landing-grid absolute inset-0" />
      </div>

      {/* 導覽列 */}
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1.25rem)] sm:px-8">
        <Link href="/login" className="flex items-center gap-2.5">
          <span className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-lg shadow-brand">
            💸
          </span>
          <span className="text-[17px] font-semibold tracking-tight">AI 記帳本</span>
        </Link>
        <Link
          href={copy.switchHref}
          replace
          className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink shadow-card ring-1 ring-line backdrop-blur transition hover:bg-white"
        >
          {mode === "login" ? "註冊" : "登入"}
        </Link>
      </nav>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 [&>*]:min-w-0 gap-x-14 gap-y-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[auto_1fr] lg:pt-16">
        {/* 標題區 */}
        <section className="lg:col-start-1 lg:row-start-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-gray-600 shadow-card ring-1 ring-line backdrop-blur">
            <span className="bg-brand-gradient rounded-full px-2 py-0.5 text-[11px] font-semibold text-white">
              AI
            </span>
            自動拆帳・分類・統計
          </span>
          <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.6rem]">
            說一句話，
            <br />
            <span className="bg-gradient-to-r from-[#10B981] via-[#0E9F6E] to-[#0891B2] bg-clip-text text-transparent">
              帳就記好了。
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
            不用填表、不用選分類。像傳訊息一樣輸入花了什麼，AI
            幫你拆成一筆筆紀錄，還能和家人朋友共用同一本帳。
          </p>
        </section>

        {/* 登入／註冊卡片 */}
        <section className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 -z-10 rounded-[36px] bg-white/40 blur-xl" />
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3.5 rounded-[28px] bg-white p-6 shadow-float ring-1 ring-line sm:p-8"
            >
              <div className="mb-2">
                <h2 className="text-2xl font-semibold tracking-tight">{copy.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{copy.subtitle}</p>
              </div>

              {mode === "register" && (
                <Field label="名字" value={form.name} onChange={update("name")} autoComplete="name" placeholder="大家怎麼稱呼你" />
              )}
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
              />
              <Field
                label="密碼"
                type="password"
                value={form.password}
                onChange={update("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "register" ? "至少 8 個字元" : "輸入密碼"}
                minLength={mode === "register" ? 8 : undefined}
              />
              {mode === "register" && (
                <Field
                  label="驗證碼"
                  value={form.code}
                  onChange={update("code")}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="請輸入註冊驗證碼"
                />
              )}

              {error && (
                <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-gradient mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl font-medium text-white shadow-brand transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <>
                    {copy.submit}
                    <span aria-hidden>→</span>
                  </>
                )}
              </button>

              <p className="mt-1 text-center text-sm text-gray-500">
                {copy.switchText}
                <Link
                  href={copy.switchHref}
                  replace
                  className="ml-1 font-medium text-brand-strong underline-offset-4 hover:underline"
                >
                  {copy.switchLink}
                </Link>
              </p>
            </form>
          </div>
        </section>

        {/* 示範 + 功能 */}
        <section className="flex flex-col gap-6 lg:col-start-1 lg:row-start-2">
          <Demo />
          <ul className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="rounded-2xl bg-white/70 p-4 shadow-card ring-1 ring-line backdrop-blur"
              >
                <span className="text-xl">{f.icon}</span>
                <p className="mt-2 text-sm font-semibold tracking-tight">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{f.desc}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

/** 示範：一句話 → AI 拆成兩筆紀錄 */
function Demo() {
  return (
    <div className="rounded-[28px] bg-white/80 p-4 shadow-card ring-1 ring-line backdrop-blur sm:p-5">
      <div className="flex items-center gap-2 rounded-full bg-gray-50 py-1.5 pl-1.5 pr-4 ring-1 ring-line">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs">
          ✨
        </span>
        <span className="truncate text-sm text-ink">午餐拉麵 180、跟小明搭車 300</span>
      </div>

      <div className="my-3 flex items-center gap-2 pl-3 text-[11px] font-medium text-brand-strong">
        <span className="h-px w-6 bg-brand/30" />
        AI 整理成 2 筆
      </div>

      <div className="flex flex-col gap-2">
        <DemoRow icon="🍜" bg="#FFF3E8" title="午餐拉麵" sub="餐飲" amount="180" />
        <DemoRow icon="🚕" bg="#ECF4FF" title="搭車" sub="交通 · 2 人分攤" amount="300" each="150" />
      </div>
    </div>
  );
}

function DemoRow({
  icon,
  bg,
  title,
  sub,
  amount,
  each,
}: {
  icon: string;
  bg: string;
  title: string;
  sub: string;
  amount: string;
  each?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">
          <span className="mr-0.5 text-xs font-normal text-gray-400">$</span>
          {amount}
        </p>
        {each && <p className="text-[11px] tabular-nums text-gray-400">每人 {each}</p>}
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="pl-1 text-[13px] font-medium text-gray-600">{label}</span>
      <input
        required
        {...props}
        className="h-12 rounded-2xl bg-gray-50 px-4 text-base outline-none ring-1 ring-line transition placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-brand/50"
      />
    </label>
  );
}
