import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '免费在线心理咨询工具对比：2026年最佳AI心理医生推荐 | 可意AI',
  description:
    '对比2026年主流免费在线心理咨询工具：可意AI、ChatGPT心理咨询、Headspace、Calm等。从功能、价格、专业性、可用性等维度全面分析，帮你选择最适合的心理健康工具。',
  alternates: { canonical: 'https://565736.xyz/free-online-therapy' },
  openGraph: {
    title: '免费在线心理咨询工具对比：2026年最佳AI心理医生推荐',
    description: '对比2026年主流免费在线心理咨询工具，帮你选择最适合的心理健康工具。',
  },
};

export default function FreeOnlineTherapy() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '免费在线心理咨询工具对比：2026年最佳AI心理医生推荐',
    description: '对比2026年主流免费在线心理咨询工具，从功能、价格、专业性等维度全面分析。',
    author: { '@id': 'https://565736.xyz/#organization' },
    publisher: { '@id': 'https://565736.xyz/#organization' },
    mainEntityOfPage: 'https://565736.xyz/free-online-therapy',
    datePublished: '2026-06-14',
    dateModified: '2026-06-14',
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="prose prose-lg max-w-none">
        <h1>免费在线心理咨询工具对比：2026年最佳AI心理医生推荐</h1>

        <p className="text-xl text-gray-600 leading-relaxed">
          随着AI技术的发展，越来越多的免费在线心理咨询工具出现在市场上。
          这些工具不能替代专业心理咨询师，但可以作为日常情绪管理和心理自助的辅助手段。
          本文对比2026年主流的免费心理健康工具，帮你找到最适合的选择。
        </p>

        <h2>免费心理咨询工具对比</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left">工具</th>
                <th className="border p-3 text-left">价格</th>
                <th className="border p-3 text-left">专业疗法</th>
                <th className="border p-3 text-left">中文支持</th>
                <th className="border p-3 text-left">特色功能</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3 font-semibold">可意AI</td>
                <td className="border p-3">免费</td>
                <td className="border p-3">CBT + 系统脱敏</td>
                <td className="border p-3">原生中文</td>
                <td className="border p-3">认知三角记录、ANTs标记、脱敏训练</td>
              </tr>
              <tr>
                <td className="border p-3">ChatGPT</td>
                <td className="border p-3">免费/付费</td>
                <td className="border p-3">通用对话</td>
                <td className="border p-3">支持</td>
                <td className="border p-3">通用能力强，无专业疗法工具</td>
              </tr>
              <tr>
                <td className="border p-3">Headspace</td>
                <td className="border p-3">付费为主</td>
                <td className="border p-3">冥想/正念</td>
                <td className="border p-3">英文为主</td>
                <td className="border p-3">冥想课程、睡眠故事</td>
              </tr>
              <tr>
                <td className="border p-3">Calm</td>
                <td className="border p-3">付费为主</td>
                <td className="border p-3">冥想/放松</td>
                <td className="border p-3">英文为主</td>
                <td className="border p-3">睡眠音乐、呼吸练习</td>
              </tr>
              <tr>
                <td className="border p-3">Woebot</td>
                <td className="border p-3">免费</td>
                <td className="border p-3">CBT</td>
                <td className="border p-3">仅英文</td>
                <td className="border p-3">CBT对话机器人、情绪追踪</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>如何选择适合自己的工具？</h2>
        <p>选择心理咨询工具时，需要考虑以下几个因素：</p>
        <ul>
          <li><strong>语言：</strong>如果你的母语是中文，选择原生中文支持的工具会更自然</li>
          <li><strong>专业性：</strong>如果你想学习CBT等专业方法，选择有结构化疗法的工具</li>
          <li><strong>隐私：</strong>了解工具的数据存储和隐私政策</li>
          <li><strong>可用性：</strong>是否需要下载APP，是否支持网页使用</li>
        </ul>

        <h2>为什么选择可意AI？</h2>
        <p>可意AI在以下方面有独特优势：</p>
        <ul>
          <li><strong>原生中文：</strong>专门为中文用户设计，对话更自然</li>
          <li><strong>专业疗法：</strong>提供CBT认知三角记录、ANTs标记、系统脱敏等结构化工具</li>
          <li><strong>完全免费：</strong>所有功能免费使用，无隐藏收费</li>
          <li><strong>24小时在线：</strong>不需要预约，随时可以开始对话</li>
          <li><strong>隐私保护：</strong>对话内容加密存储，保护你的隐私</li>
        </ul>

        <h2>重要提醒</h2>
        <p>
          无论使用哪种工具，都要记住：AI心理咨询工具是辅助手段，不能替代专业心理咨询师。
          如果你正在经历严重的心理困扰、有自伤或自杀的想法，请立即联系专业心理危机热线。
        </p>
      </article>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">常见问题</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">免费心理咨询工具安全吗？</h3>
            <p className="text-gray-600">正规的免费心理咨询工具通常是安全的，但要注意选择有明确隐私政策的工具。可意AI使用加密存储对话内容，保护用户隐私。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI心理咨询和真人心理咨询哪个好？</h3>
            <p className="text-gray-600">两者各有优势。AI心理咨询适合日常情绪管理和自助练习，真人心理咨询适合处理深层心理问题。建议将AI工具作为辅助手段，严重问题仍需寻求专业帮助。</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">可意AI和其他AI心理医生有什么区别？</h3>
            <p className="text-gray-600">可意AI专注于提供结构化的心理治疗工具（CBT认知三角、ANTs标记、系统脱敏），而不仅仅是通用对话。它原生支持中文，完全免费，适合中文用户进行心理自助。</p>
          </div>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link href="/chat" className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
          免费体验可意AI
        </Link>
      </div>
    </main>
  );
}
