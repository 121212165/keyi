import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI心理医生推荐：24小时在线的免费AI心理咨询 | 可意AI',
  description:
    'AI心理医生是基于人工智能技术的心理健康辅助工具，提供CBT认知行为疗法、情绪疏导、系统脱敏等专业心理治疗模式。了解AI心理医生的工作原理、优势和局限性。',
  alternates: { canonical: 'https://565736.xyz/ai-psychologist' },
  openGraph: {
    title: 'AI心理医生推荐：24小时在线的免费AI心理咨询',
    description: '了解AI心理医生的工作原理、优势和局限性。',
  },
};

export default function AIPsychologist() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'AI心理医生推荐：24小时在线的免费AI心理咨询',
    description:
      'AI心理医生是基于人工智能技术的心理健康辅助工具，提供CBT认知行为疗法、情绪疏导等专业心理治疗模式。',
    author: { '@id': 'https://565736.xyz/#organization' },
    publisher: { '@id': 'https://565736.xyz/#organization' },
    mainEntityOfPage: 'https://565736.xyz/ai-psychologist',
    datePublished: '2026-06-14',
    dateModified: '2026-06-14',
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'AI心理医生靠谱吗？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI心理医生可以作为心理健康辅助工具，但不能替代专业心理咨询师。它适合日常情绪管理、心理自助和CBT练习。对于严重的心理问题，建议寻求专业帮助。',
        },
      },
      {
        '@type': 'Question',
        name: 'AI心理医生和真人心理咨询师有什么区别？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI心理医生的优势是24小时可用、无预约等待、无社交压力、完全免费。但它缺乏真人咨询师的深度共情能力、危机干预能力和个性化治疗方案制定能力。',
        },
      },
      {
        '@type': 'Question',
        name: '免费AI心理医生有哪些？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '可意AI是一款免费的AI心理医生应用，提供CBT认知行为疗法、系统脱敏训练和情绪疏导三种专业心理治疗模式。它基于智谱AI GLM-4.7-Flash大模型，支持中文对话。',
        },
      },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <article className="prose prose-lg max-w-none">
        <h1>AI心理医生：24小时在线的免费AI心理咨询</h1>

        <p className="text-xl text-gray-600 leading-relaxed">
          AI心理医生是基于大语言模型技术的心理健康辅助工具。它不是真人心理咨询师，
          而是一个24小时可用的倾听者和支持者，帮助你在日常生活中进行情绪管理和心理自助。
          可意AI提供CBT认知行为疗法、系统脱敏训练和情绪疏导三种专业模式。
        </p>

        <h2>AI心理医生是怎么工作的？</h2>
        <p>
          AI心理医生基于大语言模型（如智谱AI GLM-4.7-Flash）技术，通过自然语言对话的方式与用户交流。
          它被训练了大量心理咨询相关的知识，能够理解用户的情绪状态，提供支持性回应，
          并引导用户使用CBT等循证心理学方法进行自助。
        </p>

        <h2>AI心理医生的优势</h2>
        <ul>
          <li><strong>24小时可用：</strong>凌晨3点突然焦虑发作？AI心理医生随时在线</li>
          <li><strong>无预约等待：</strong>不需要排队等待，立即开始对话</li>
          <li><strong>零社交压力：</strong>不用担心被评判，可以完全坦诚地表达</li>
          <li><strong>完全免费：</strong>不需要支付高昂的咨询费用</li>
          <li><strong>结构化练习：</strong>提供CBT认知三角记录、ANTs标记等专业工具</li>
        </ul>

        <h2>AI心理医生的局限性</h2>
        <p>虽然AI心理医生有很多优势，但它也有明显的局限性：</p>
        <ul>
          <li>缺乏真人咨询师的深度共情能力</li>
          <li>无法进行危机干预</li>
          <li>不能做出医学诊断</li>
          <li>无法提供个性化的长期治疗方案</li>
          <li>对复杂的人际关系问题理解有限</li>
        </ul>

        <h2>什么时候应该用AI心理医生？</h2>
        <p>AI心理医生适合以下场景：</p>
        <ul>
          <li>日常情绪管理和压力释放</li>
          <li>学习和练习CBT等心理自助方法</li>
          <li>在见真人咨询师之前整理自己的想法</li>
          <li>社交焦虑、特定恐惧的自助练习</li>
          <li>情绪日记和思维模式追踪</li>
        </ul>

        <h2>什么时候应该找真人心理咨询师？</h2>
        <p>以下情况建议寻求专业帮助：</p>
        <ul>
          <li>有自伤或自杀的想法</li>
          <li>严重的抑郁或焦虑影响日常生活</li>
          <li>经历重大创伤或丧失</li>
          <li>长期的人际关系问题</li>
          <li>需要精神科药物治疗</li>
        </ul>

        <h2>可意AI心理医生的特色功能</h2>
        <p>可意AI提供三种专业心理治疗模式：</p>
        <ul>
          <li><strong>自由对话：</strong>像和朋友聊天一样倾诉困扰，获得温暖的回应</li>
          <li><strong>CBT认知疗法：</strong>通过认知三角记录和ANTs标记，识别和改变负性思维</li>
          <li><strong>系统脱敏：</strong>通过渐进式暴露，逐步克服恐惧和焦虑</li>
        </ul>
        <p>
          <Link href="/chat" className="text-primary-600 hover:text-primary-700 font-medium">
            → 立即免费体验可意AI心理医生
          </Link>
        </p>
      </article>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">常见问题</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI心理医生靠谱吗？</h3>
            <p className="text-gray-600">AI心理医生可以作为心理健康辅助工具，但不能替代专业心理咨询师。它适合日常情绪管理、心理自助和CBT练习。对于严重的心理问题，建议寻求专业帮助。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI心理医生和真人心理咨询师有什么区别？</h3>
            <p className="text-gray-600">AI心理医生的优势是24小时可用、无预约等待、无社交压力、完全免费。但它缺乏真人咨询师的深度共情能力、危机干预能力和个性化治疗方案制定能力。</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">免费AI心理医生有哪些？</h3>
            <p className="text-gray-600">可意AI是一款免费的AI心理医生应用，提供CBT认知行为疗法、系统脱敏训练和情绪疏导三种专业心理治疗模式。它基于智谱AI GLM-4.7-Flash大模型，支持中文对话。</p>
          </div>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link href="/chat" className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
          免费体验AI心理医生
        </Link>
      </div>
    </main>
  );
}
