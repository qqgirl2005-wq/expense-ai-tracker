import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { createSession } from "@/lib/session";
import { UserModel, toPublicUser } from "@/models/User";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "請輸入 Email"),
  password: z.string().min(1, "請輸入密碼"),
});

// POST /api/auth/login  body: { email, password }
export async function POST(request: Request) {
  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email, password } = parsed.data;

  try {
    await connectDB();
    const user = await UserModel.findOne({ email }).select("+password");
    // 帳號不存在或密碼錯誤都回同一句話，避免被拿來探測哪些 Email 有註冊
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }

    await createSession({ userId: String(user._id), role: user.role });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
