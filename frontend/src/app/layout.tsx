import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "可意 · AI 心理医生",
  description: "可意，温暖专业的AI心理健康助手：自由倾诉、CBT 认知疗法、系统脱敏、CBT-I 睡眠改善",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="min-h-screen" style={{ background: "#fbf6ee" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
