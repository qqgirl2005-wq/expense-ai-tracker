import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { createSession } from "@/lib/session";
import { UserModel, toPublicUser } from "@/models/User";

// 註冊驗證碼：目前先寫死，之後可改成從環境變數或資料庫讀取
const REGISTER_CODE = "love";

const RegisterSchema = z.object({
  email: z.email("Email 格式不正確").trim().toLowerCase(),
  password: z.string().min(8, "密碼至少 8 個字元").max(100),
  name: z.string().trim().min(1, "請輸入名字").max(30, "名字最多 30 個字"),
  code: z.string().trim().min(1, "請輸入驗證碼"),
});

// POST /api/auth/register  body: { email, password, name, code }
export async function POST(request: Request) {
  const parsed = RegisterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email, password, name, code } = parsed.data;

  // 驗證碼只在伺服器端比對，前端看不到正確答案
  if (code !== REGISTER_CODE) {
    return NextResponse.json({ error: "驗證碼錯誤" }, { status: 403 });
  }

  try {
    await connectDB();
    if (await UserModel.exists({ email })) {
      return NextResponse.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }

    const user = await UserModel.create({
      email,
      password: await bcrypt.hash(password, 10),
      name,
      // role 不開放註冊時自訂，一律為一般使用者
    });

    await createSession({ userId: String(user._id), role: user.role });
    return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
