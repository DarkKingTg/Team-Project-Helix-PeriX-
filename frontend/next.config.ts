import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "26.212.115.194"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://perix-4936c.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
