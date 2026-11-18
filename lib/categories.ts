export const CATEGORIES = [
  "餐飲",
  "交通",
  "購物",
  "娛樂",
  "居住",
  "醫療",
  "教育",
  "旅遊",
  "其他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<Category, { icon: string; color: string; bg: string }> = {
  餐飲: { icon: "🍜", color: "#FB923C", bg: "#FFF3E8" },
  交通: { icon: "🚕", color: "#60A5FA", bg: "#ECF4FF" },
  購物: { icon: "🛍️", color: "#F472B6", bg: "#FEEEF6" },
  娛樂: { icon: "🎮", color: "#A78BFA", bg: "#F3EFFF" },
  居住: { icon: "🏠", color: "#2DD4BF", bg: "#E6FAF6" },
  醫療: { icon: "💊", color: "#F87171", bg: "#FFEFEF" },
  教育: { icon: "📚", color: "#FACC15", bg: "#FEF9E3" },
  旅遊: { icon: "✈️", color: "#22D3EE", bg: "#E5FAFD" },
  其他: { icon: "📦", color: "#94A3B8", bg: "#F1F4F8" },
};

export function categoryMeta(category: string) {
  return CATEGORY_META[category as Category] ?? CATEGORY_META["其他"];
}
