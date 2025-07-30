import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CrossTabProvider } from "@/lib/cross-tab-context";

const notoSansKr = Noto_Sans_KR({ 
  subsets: ["latin"],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "Youth Ai - 당신의 AI 라이프 코치",
  description: "목표 관리, 루틴 추적, 일기 작성, AI 코칭을 통해 더 나은 삶을 만들어보세요.",
  keywords: "AI 라이프코치, 목표관리, 루틴추적, 일기, 자기계발",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1f2937",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Youth Ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>
        <CrossTabProvider>
          <main className="max-w-md mx-auto min-h-screen bg-gray-900/80 pb-20">
            {children}
          </main>
          <Navbar />
        </CrossTabProvider>
      </body>
    </html>
  );
}
