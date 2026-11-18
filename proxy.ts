import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const AUTH_PAGES = ["/login", "/register"];

// 頁面層級的登入檢查：未登入導向 /login，已登入則不讓再進登入/註冊頁
// （API 路由不經過這裡，各自在 route handler 內檢查登入狀態）
export default async function proxy(req: NextRequest) {
  const session = await decrypt(req.cookies.get("session")?.value);
  const isAuthPage = AUTH_PAGES.includes(req.nextUrl.pathname);

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
