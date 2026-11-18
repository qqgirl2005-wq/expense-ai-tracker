export type Expense = {
  _id: string;
  /** 記帳者（每筆記帳都一定有） */
  user: { _id: string; name: string };
  rawText: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  payer: string | null;
  participants: string[];
  createdAt: string;
};
