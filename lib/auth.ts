import "server-only";
import { NextResponse } from "next/server";
import { connectDB } from "./mongodb";
import { getSession } from "./session";
import { UserModel } from "@/models/User";

/** 依 cookie 取得目前登入的使用者；未登入或帳號已不存在則回傳 null */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  await connectDB();
  return UserModel.findById(session.userId);
}

export function unauthorized() {
  return NextResponse.json({ error: "請先登入" }, { status: 401 });
}
