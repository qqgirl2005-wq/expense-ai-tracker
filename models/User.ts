import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // 存的是 bcrypt 雜湊，不是明碼；預設查詢不帶出
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, default: "user" },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof UserSchema>;

export const UserModel: Model<User> =
  (models.User as Model<User>) ?? model<User>("User", UserSchema);

/** 回傳給前端的使用者資料（不含密碼） */
export function toPublicUser(user: { _id: unknown; email: string; name: string; role: string }) {
  return { id: String(user._id), email: user.email, name: user.name, role: user.role as Role };
}
