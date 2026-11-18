"use client";

import dynamic from "next/dynamic";

// 記帳畫面依賴使用者裝置的「今天」日期，只在瀏覽器端渲染以避免伺服器／瀏覽器日期不一致
const ExpenseApp = dynamic(() => import("@/components/ExpenseApp"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex h-dvh w-full max-w-md items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
    </div>
  ),
});

export default function Home() {
  return <ExpenseApp />;
}
