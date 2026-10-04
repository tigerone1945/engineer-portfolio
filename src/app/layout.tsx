import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
  title: {
    default: "Yozo Maeda | AI Agent / DX Engineer",
    template: "%s | Yozo Maeda",
  },
  description:
    "業務課題をAIエージェントとして設計・実装し、本番運用まで担うエンジニアのポートフォリオ。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
