"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type PublicUser = { id: string; email: string; name: string; role: "user" | "admin" };

export default function UserMenu({ user }: { user: PublicUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // 離開首頁時記帳畫面會卸載，資料狀態也一併清掉
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="帳號"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white shadow-card ring-2 ring-white active:scale-95"
      >
        {user ? user.name.slice(0, 1).toUpperCase() : ""}
      </button>

      {open && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end">
          <button
            aria-label="關閉"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]"
          />
          <div className="pb-safe relative rounded-t-[28px] bg-white px-5 pt-3 shadow-float">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />
            {user && (
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    <span className="truncate">{user.name}</span>
                    {user.role === "admin" && (
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-strong">
                        管理員
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              disabled={loggingOut}
              className="mb-3 h-12 w-full rounded-2xl bg-red-50 font-medium text-red-600 active:scale-[0.98] disabled:opacity-60"
            >
              {loggingOut ? "登出中…" : "登出"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
