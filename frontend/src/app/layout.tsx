import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "可意AI心理医生：免费在线 CBT 认知疗法 + 情绪疏导 | 24小时AI心理咨询",
  description:
    "免费AI心理医生，提供CBT认知行为疗法、系统脱敏训练、情绪记录分析。24小时在线，无需预约，支持中文。基于循证心理学方法，帮助识别和改变负性思维模式。",
  keywords: [
    "AI心理医生",
    "在线心理咨询",
    "CBT认知疗法",
    "免费心理辅导",
    "情绪疏导",
    "系统脱敏",
    "焦虑自助",
    "心理健康",
  ],
  openGraph: {
    title: "可意AI心理医生：免费在线 CBT 认知疗法 + 情绪疏导",
    description:
      "24小时在线的AI心理医生，提供CBT认知行为疗法、系统脱敏训练和情绪疏导。免费使用，无需预约。",
    type: "website",
    locale: "zh_CN",
    siteName: "可意AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "可意AI心理医生：免费在线 CBT 认知疗法",
    description: "24小时在线的AI心理医生，基于循证心理学方法，免费使用。",
  },
  alternates: {
    canonical: "https://keyi.app",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://keyi.app/#organization",
        name: "可意AI",
        url: "https://keyi.app",
        description: "温暖、专业、有同理心的AI心理健康助手",
        sameAs: ["https://github.com/121212165/keyi"],
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://keyi.app/#software",
        name: "可意AI心理医生",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
        description:
          "免费AI心理医生应用，提供CBT认知行为疗法、系统脱敏训练和情绪疏导三种专业心理治疗模式。",
        author: {
          "@id": "https://keyi.app/#organization",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://keyi.app/#website",
        url: "https://keyi.app",
        name: "可意AI心理医生",
        publisher: {
          "@id": "https://keyi.app/#organization",
        },
      },
    ],
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
          {children}
        </div>
      </body>
    </html>
  );
}
