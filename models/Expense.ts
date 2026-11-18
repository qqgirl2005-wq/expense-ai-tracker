import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { CATEGORIES } from "@/lib/categories";

const ExpenseSchema = new Schema(
  {
    // 記下這筆帳的使用者
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rawText: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "TWD" },
    category: { type: String, enum: CATEGORIES, default: "其他" },
    date: { type: String, required: true }, // YYYY-MM-DD
    payer: { type: String, default: null },
    participants: { type: [String], default: [] },
  },
  { timestamps: true },
);

// 最常見的查詢：某段日期內（所有成員）的紀錄
ExpenseSchema.index({ date: -1 });

export type Expense = InferSchemaType<typeof ExpenseSchema>;

// 避免 hot reload 時重複註冊 model
export const ExpenseModel: Model<Expense> =
  (models.Expense as Model<Expense>) ?? model<Expense>("Expense", ExpenseSchema);
