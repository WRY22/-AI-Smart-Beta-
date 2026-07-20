import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI x Smart Beta 智能選股決策系統",
  description: "可解釋的量化投資決策輔助系統，協助一般投資人理解因子曝險、客製偏好與資金配置。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
