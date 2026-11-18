import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { analyzeExpenseText } from "@/lib/openai";
import { ExpenseModel } from "@/models/Expense";

function errorResponse(scope: string, err: unknown) {
  console.error(scope, err);
  const message = err instanceof Error ? err.message : "未知錯誤";
  return NextResponse.json({ error: message }, { status: 500 });
}

// POST /api/expenses  body: { text: string }
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let text: unknown;
  try {
    ({ text } = await request.json());
  } catch {
    return NextResponse.json({ error: "請傳入 JSON 格式的 body" }, { status: 400 });
  }

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text 不可為空" }, { status: 400 });
  }

  try {
    const analysis = await analyzeExpenseText(text.trim(), user.name);

    const inserted = analysis.items.length
      ? await ExpenseModel.insertMany(
          analysis.items.map((item) => ({ ...item, rawText: text.trim(), user: user._id })),
        )
      : [];
    // 帶出記帳者名字，前端才能顯示「誰記的」
    const saved = await ExpenseModel.populate(inserted, { path: "user", select: "name" });

    return NextResponse.json({ analysis, expenses: saved }, { status: 201 });
  } catch (err) {
    return errorResponse("[POST /api/expenses]", err);
  }
}

// GET /api/expenses?month=YYYY-MM  取得該月份所有紀錄
// GET /api/expenses?year=YYYY      取得該年度所有紀錄
// 都不帶則回傳最近 50 筆
// 這是共同記帳本：所有成員的紀錄都會回傳，並附上記帳者名字
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const params = new URL(request.url).searchParams;
  const month = params.get("month");
  const year = params.get("year");
  if (month && !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "month 格式應為 YYYY-MM" }, { status: 400 });
  }
  if (year && !/^\d{4}$/.test(year)) {
    return NextResponse.json({ error: "year 格式應為 YYYY" }, { status: 400 });
  }

  // date 存成 "YYYY-MM-DD" 字串，字典序比較即可做範圍查詢
  const range = month
    ? { $gte: `${month}-01`, $lte: `${month}-31` }
    : year
      ? { $gte: `${year}-01-01`, $lte: `${year}-12-31` }
      : null;

  try {
    const found = await ExpenseModel.find(range ? { date: range } : {})
      .sort({ date: -1, createdAt: -1 })
      .limit(range ? 10000 : 50)
      .populate("user", "name")
      .lean();
    // 每筆記帳都必須有使用者；若記帳者帳號已不存在（populate 回 null）就不回傳
    const expenses = found.filter((e) => e.user != null);
    return NextResponse.json({ expenses });
  } catch (err) {
    return errorResponse("[GET /api/expenses]", err);
  }
}
