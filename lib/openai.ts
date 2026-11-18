import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { CATEGORIES } from "./categories";

const ExpenseItemSchema = z.object({
  description: z.string().describe("簡短描述這筆消費，例如「午餐拉麵」"),
  amount: z.number().describe("金額，只填數字"),
  currency: z.string().describe("ISO 4217 幣別代碼，未提及時預設 TWD"),
  category: z.enum(CATEGORIES),
  date: z.string().describe("消費日期，格式 YYYY-MM-DD"),
  payer: z.string().nullable().describe("付款人姓名，未提及則為 null"),
  participants: z.array(z.string()).describe("一起分攤的人（含付款人），未提及則為空陣列"),
});

export const AnalysisSchema = z.object({
  items: z.array(ExpenseItemSchema).describe("文字中提到的每一筆消費"),
});

export type ExpenseAnalysis = z.infer<typeof AnalysisSchema>;

const client = new OpenAI(); // 自動讀取 process.env.OPENAI_API_KEY

export async function analyzeExpenseText(
  text: string,
  userName: string,
): Promise<ExpenseAnalysis> {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });

  const response = await client.responses.parse({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
    instructions: [
      "你是記帳助理，負責從使用者的文字中擷取消費紀錄。",
      `使用者的名字是「${userName}」，文字中的「我」都指這位使用者，付款人與分攤者請填名字而不是「我」。`,
      `今天日期是 ${today}（台北時間），請把「昨天」「上週五」等相對日期換算成實際日期；未提及日期則用今天。`,
      "一段文字可能包含多筆消費，請逐筆列出。若文字中沒有任何消費，回傳空的 items。",
    ].join("\n"),
    input: text,
    text: { format: zodTextFormat(AnalysisSchema, "expense_analysis") },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI 未回傳可解析的結果");
  }
  return response.output_parsed;
}
