import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '什么是CBT认知行为疗法？完整指南 | 可意AI',
  description:
    'CBT（认知行为疗法）是循证级别最高的心理治疗方法之一，Meta分析显示对焦虑障碍效应量达0.73。了解CBT的核心原理、认知三角、自动化思维标记，以及如何用AI辅助CBT练习。',
  alternates: { canonical: 'https://keyi.app/what-is-cbt' },
  openGraph: {
    title: '什么是CBT认知行为疗法？完整指南',
    description: '了解CBT的核心原理、认知三角、自动化思维标记，以及如何用AI辅助CBT练习。',
  },
};

export default function WhatIsCBT() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '什么是CBT认知行为疗法？完整指南',
    description:
      'CBT（认知行为疗法）是循证级别最高的心理治疗方法之一，Meta分析显示对焦虑障碍效应量达0.73。',
    author: { '@id': 'https://keyi.app/#organization' },
    publisher: { '@id': 'https://keyi.app/#organization' },
    mainEntityOfPage: 'https://keyi.app/what-is-cbt',
    datePublished: '2026-06-14',
    dateModified: '2026-06-14',
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'CBT认知行为疗法有效吗？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '有效。CBT是目前循证级别最高的心理治疗方法，超过300项随机对照试验支持其有效性。Meta分析显示CBT对焦虑障碍的效应量为0.73（中等偏大），对抑郁症的效应量为0.66。',
        },
      },
      {
        '@type': 'Question',
        name: 'CBT和普通心理咨询有什么区别？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CBT更聚焦于"此时此地"的问题解决，而不是深入探索童年经历。它有明确的结构化技术（如认知三角记录、行为实验），通常6-20次即可见效，而精神分析可能需要数年。',
        },
      },
      {
        '@type': 'Question',
        name: 'CBT适合什么人？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CBT适合焦虑症、抑郁症、强迫症、创伤后应激障碍、社交恐惧、失眠等多种心理问题。它也适合想改善思维习惯、提升情绪管理能力的普通人。',
        },
      },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <article className="prose prose-lg max-w-none">
        <h1>什么是CBT认知行为疗法？</h1>

        <p className="text-xl text-gray-600 leading-relaxed">
          CBT（Cognitive Behavioral Therapy，认知行为疗法）是目前循证级别最高的心理治疗方法之一。
          它通过识别和改变负性思维模式来改善情绪和行为，超过300项随机对照试验支持其有效性。
          Meta分析显示，CBT对焦虑障碍的效应量达0.73，对抑郁症的效应量为0.66。
        </p>

        <h2>CBT的核心原理是什么？</h2>
        <p>
          CBT的核心假设是：不是事件本身让你痛苦，而是你对事件的解读（认知）决定了你的情绪和行为。
          这被称为"认知三角"模型——想法、感受和行为三者相互影响。
        </p>
        <p>
          例如，当你在会议上说错话时：
        </p>
        <ul>
          <li><strong>想法：</strong>"我太蠢了，大家都会看不起我"（负性自动化思维）</li>
          <li><strong>感受：</strong>焦虑、羞耻、沮丧</li>
          <li><strong>行为：</strong>以后不敢在会议上发言</li>
        </ul>
        <p>
          CBT帮助你识别这种思维模式，用更现实、更平衡的想法替代它，从而改变感受和行为。
        </p>

        <h2>什么是自动化思维（ANTs）？</h2>
        <p>
          自动化思维（Automatic Negative Thoughts，ANTs）是CBT中的核心概念。
          它们是大脑自动产生的、未经审视的负性想法，通常在你意识到之前就已经影响了你的情绪。
        </p>
        <p>常见的思维陷阱包括：</p>
        <ul>
          <li><strong>灾难化：</strong>"一定会出大问题"</li>
          <li><strong>非黑即白：</strong>"不完美就是失败"</li>
          <li><strong>读心术：</strong>"他一定觉得我很蠢"</li>
          <li><strong>过度概括：</strong>"我总是搞砸一切"</li>
        </ul>
        <p>
          识别ANTs是CBT的第一步。当你能觉察到这些自动化的思维陷阱时，你就有了选择不同想法的能力。
        </p>

        <h2>CBT有哪些核心技术？</h2>
        <p>CBT包含多种经过验证的技术，最常用的包括：</p>
        <ul>
          <li><strong>认知三角记录：</strong>记录引发情绪的事件、你的想法和感受，找出思维模式</li>
          <li><strong>行为实验：</strong>用实际行动检验你的负性预测是否真实</li>
          <li><strong>渐进式暴露：</strong>逐步面对恐惧情境，建立耐受力</li>
          <li><strong>苏格拉底式提问：</strong>通过提问挑战不合理信念</li>
          <li><strong>行为激活：</strong>通过增加积极活动来改善抑郁情绪</li>
        </ul>

        <h2>CBT和普通心理咨询有什么区别？</h2>
        <p>
          CBT更聚焦于"此时此地"的问题解决，而不是深入探索童年经历。
          它有明确的结构化技术，通常6-20次即可见效，而精神分析可能需要数年。
          CBT强调"自助"——咨询师会教你方法，让你在日常生活中练习。
        </p>

        <h2>如何用AI辅助CBT练习？</h2>
        <p>
          AI心理医生可以作为CBT练习的辅助工具。它可以帮你记录认知三角、标记自动化思维、
          提供苏格拉底式提问引导。虽然AI不能替代专业心理咨询师，但它可以让你随时随地进行CBT练习。
        </p>
        <p>
          <Link href="/chat" className="text-primary-600 hover:text-primary-700 font-medium">
            → 试试用可意AI进行CBT认知三角记录
          </Link>
        </p>
      </article>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">常见问题</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CBT认知行为疗法有效吗？</h3>
            <p className="text-gray-600">有效。CBT是目前循证级别最高的心理治疗方法，超过300项随机对照试验支持其有效性。Meta分析显示CBT对焦虑障碍的效应量为0.73（中等偏大），对抑郁症的效应量为0.66。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CBT和普通心理咨询有什么区别？</h3>
            <p className="text-gray-600">CBT更聚焦于"此时此地"的问题解决，而不是深入探索童年经历。它有明确的结构化技术（如认知三角记录、行为实验），通常6-20次即可见效。</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CBT适合什么人？</h3>
            <p className="text-gray-600">CBT适合焦虑症、抑郁症、强迫症、创伤后应激障碍、社交恐惧、失眠等多种心理问题。它也适合想改善思维习惯、提升情绪管理能力的普通人。</p>
          </div>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link href="/chat" className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
          免费体验CBT认知疗法
        </Link>
      </div>
    </main>
  );
}
