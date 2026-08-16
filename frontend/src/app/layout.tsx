import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://565736.xyz";

export const metadata: Metadata = {
  title: "可意AI心理医生：免费在线 CBT 认知疗法 + 睡眠改善(CBT-I) + 情绪疏导 | 24小时AI心理咨询",
  description:
    "免费AI心理医生，提供CBT认知行为疗法、系统脱敏训练、失眠认知行为疗法(CBT-I)睡眠改善和情绪疏导。24小时在线，无需预约，支持中文。基于循证心理学方法，帮助识别和改变负性思维模式。",
  keywords: [
    "AI心理医生",
    "在线心理咨询",
    "CBT认知疗法",
    "免费心理辅导",
    "情绪疏导",
    "系统脱敏",
    "CBT-I",
    "失眠改善",
    "睡眠改善",
    "焦虑自助",
    "心理健康",
  ],
  openGraph: {
    title: "可意AI心理医生：免费在线 CBT 认知疗法 + 睡眠改善 + 情绪疏导",
    description:
      "24小时在线的AI心理医生，提供CBT认知行为疗法、CBT-I睡眠改善、系统脱敏训练和情绪疏导。免费使用，无需预约。",
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
    canonical: SITE_URL,
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
        "@id": `${SITE_URL}/#organization`,
        name: "可意AI",
        url: SITE_URL,
        description: "温暖、专业、有同理心的AI心理健康助手",
        sameAs: ["https://github.com/121212165/keyi"],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: "可意AI心理医生",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
        description:
          "免费AI心理医生应用，提供CBT认知行为疗法、CBT-I睡眠改善、系统脱敏训练和情绪疏导四种专业心理模式。",
        author: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "可意AI心理医生",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  };

  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <div className="min-h-screen" style={{ background: "#fbf6ee" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
