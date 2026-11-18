import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允許同一個 Wi-Fi 內的手機用 IP 連進 dev server（只影響開發模式）
  allowedDevOrigins: ["192.168.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
