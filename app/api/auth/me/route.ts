import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { toPublicUser } from "@/models/User";

// GET /api/auth/me  取得目前登入的使用者
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ user: toPublicUser(user) });
}
