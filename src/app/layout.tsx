import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CrossTabProvider } from '@/lib/cross-tab-context';

const notoSansKr = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Youth Ai - 개인 AI 라이프 코치",
  description: "일상 관리와 자기계발을 위한 AI 기반 개인 라이프 코치 앱",
  keywords: "AI, 라이프코치, 일정관리, 자기계발, 개인비서",
  authors: [{ name: "Youth Ai Team" }],
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Youth Ai"
  },
  icons: {
    icon: "/next.svg",
    apple: "/next.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              background: linear-gradient(to bottom, transparent, rgb(17, 24, 39)) rgb(2, 6, 23) !important;
              color: white !important;
              min-height: 100vh !important;
            }
          `
        }} />
      </head>
      <body className={`${notoSansKr.className} bg-gray-900 text-white min-h-screen`}>
        <CrossTabProvider>
          <div className="flex justify-center min-h-screen">
            <main className="w-full max-w-md bg-gray-900/80 pb-20 relative">
              {children}
            </main>
          </div>
          <Navbar />
        </CrossTabProvider>
      </body>
    </html>
  );
}
