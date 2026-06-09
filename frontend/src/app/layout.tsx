import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "林序 · AI 心理陪伴",
  description: "林序，温暖专业的AI心理健康助手",
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
