import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hol'Damn It! - The Ultimate Equity Challenge",
  description: "텍사스 홀덤의 승률을 맞추는 퀴즈 게임. 5단계 난이도를 클리어하고 홀덤의 신이 되어보세요!",
  keywords: ["포커", "홀덤", "텍사스 홀덤", "카드 게임", "확률", "게임", "에퀴티"],
  authors: [{ name: "Hol'Damn It!" }],
  openGraph: {
    title: "Hol'Damn It! - The Ultimate Equity Challenge",
    description: "텍사스 홀덤의 승률을 맞추는 퀴즈 게임",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0e1a]`}
      >
        {children}
      </body>
    </html>
  );
}
