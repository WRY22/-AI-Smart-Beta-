import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "AI x Smart Beta 智能選股決策系統",
    description: "可解釋的量化投資決策輔助系統，協助投資人理解因子曝險、客製偏好與資金配置。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "AI x Smart Beta",
      description: "可解釋的量化投資決策",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "AI x Smart Beta 量化投資決策工作台" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "AI x Smart Beta",
      description: "可解釋的量化投資決策",
      images: [imageUrl],
    },
  };
}

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
