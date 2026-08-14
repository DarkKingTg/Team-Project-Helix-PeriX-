import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { I18nProvider } from "@/lib/i18n-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "PeriX – From Farm to Fork",
  description:
    "AI-powered intelligent food logistics and surplus rebalancing ecosystem.",
  keywords: [
    "food supply chain",
    "AI forecasting",
    "mandi prices",
    "agriculture",
    "demand prediction",
    "food waste reduction",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-full flex flex-col`} style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
