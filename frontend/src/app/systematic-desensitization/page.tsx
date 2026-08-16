import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '系统脱敏疗法：逐步克服恐惧和焦虑的科学方法 | 可意AI',
  description:
    '系统脱敏是一种通过渐进式暴露来克服恐惧和焦虑的行为治疗方法。了解系统脱敏的三个步骤：放松训练、建立焦虑等级、逐步暴露。适合恐飞症、社交焦虑、特定恐惧症。',
  alternates: { canonical: 'https://565736.xyz/systematic-desensitization' },
  openGraph: {
    title: '系统脱敏疗法：逐步克服恐惧和焦虑的科学方法',
    description: '了解系统脱敏的三个步骤：放松训练、建立焦虑等级、逐步暴露。',
  },
};

export default function SystematicDesensitization() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '系统脱敏疗法：逐步克服恐惧和焦虑的科学方法',
    description: '系统脱敏是一种通过渐进式暴露来克服恐惧和焦虑的行为治疗方法。',
    author: { '@id': 'https://565736.xyz/#organization' },
    publisher: { '@id': 'https://565736.xyz/#organization' },
    mainEntityOfPage: 'https://565736.xyz/systematic-desensitization',
    datePublished: '2026-06-14',
    dateModified: '2026-06-14',
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '系统脱敏疗法要多久才能见效？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '系统脱敏通常需要6-12次治疗才能见效，每次治疗约45-60分钟。具体时间取决于恐惧的严重程度和个人的配合程度。轻度恐惧可能3-4次就有明显改善。',
        },
      },
      {
        '@type': 'Question',
        name: '系统脱敏可以自己做吗？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '轻度的恐惧和焦虑可以通过AI辅助工具进行自助式系统脱敏练习。但对于严重的恐惧症或创伤相关问题，建议在专业心理咨询师指导下进行。',
        },
      },
      {
        '@type': 'Question',
        name: '系统脱敏和暴露疗法有什么区别？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '系统脱敏是暴露疗法的一种，但它是"渐进式"的——从最轻微的刺激开始，逐步增加强度。而标准暴露疗法可能直接面对最恐惧的情境（满灌法）。系统脱敏更适合焦虑敏感的人群。',
        },
      },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <article className="prose prose-lg max-w-none">
        <h1>系统脱敏疗法：逐步克服恐惧和焦虑的科学方法</h1>

        <p className="text-xl text-gray-600 leading-relaxed">
          系统脱敏（Systematic Desensitization）是一种通过渐进式暴露来克服恐惧和焦虑的行为治疗方法。
          由南非心理学家Joseph Wolpe在1958年提出，至今仍是治疗恐惧症和焦虑障碍的有效方法之一。
          核心原理是：通过在放松状态下逐步接触恐惧刺激，让大脑重新学习"这个刺激不危险"。
        </p>

        <h2>系统脱敏的三个步骤</h2>

        <h3>第一步：放松训练</h3>
        <p>
          在开始暴露之前，你需要学会一种放松技术。最常用的是渐进式肌肉放松——
          从脚趾开始，逐步收紧和放松全身各部位的肌肉。
          其他方法包括深呼吸、冥想和正念练习。
        </p>

        <h3>第二步：建立焦虑等级</h3>
        <p>
          列出让你恐惧或焦虑的情境，按焦虑程度从0（完全放松）到10（极度恐惧）打分。
          例如，恐飞症的焦虑等级可能是：
        </p>
        <ul>
          <li>1分：看到飞机的图片</li>
          <li>3分：听到飞机起飞的声音</li>
          <li>5分：在机场候机</li>
          <li>7分：坐在飞机座位上</li>
          <li>9分：飞机起飞</li>
          <li>10分：飞机遇到颠簸</li>
        </ul>

        <h3>第三步：逐步暴露</h3>
        <p>
          从焦虑等级最低的情境开始，在放松状态下想象或实际接触这个情境。
          当你在这个刺激下能保持放松时，再进入下一个等级。
          这个过程让大脑逐渐学会"这个刺激不危险"的反应。
        </p>

        <h2>系统脱敏适合治疗什么？</h2>
        <p>系统脱敏已被证明对以下问题有效：</p>
        <ul>
          <li><strong>特定恐惧症：</strong>恐高、恐飞、恐蛇、恐血等</li>
          <li><strong>社交焦虑：</strong>害怕公开演讲、社交场合紧张</li>
          <li><strong>考试焦虑：</strong>考试前过度紧张影响发挥</li>
          <li><strong>广场恐惧症：</strong>害怕拥挤或封闭空间</li>
          <li><strong>表演焦虑：</strong>上台前过度紧张</li>
        </ul>

        <h2>系统脱敏要多久才能见效？</h2>
        <p>
          系统脱敏通常需要6-12次治疗才能见效，每次治疗约45-60分钟。
          具体时间取决于恐惧的严重程度和个人的配合程度。
          轻度恐惧可能3-4次就有明显改善。
          重要的是坚持练习，不要跳过步骤。
        </p>

        <h2>如何用AI辅助系统脱敏？</h2>
        <p>
          AI心理医生可以引导你完成系统脱敏的整个过程。它会帮你建立焦虑等级、
          在每个步骤提供放松指导、记录你的进步。虽然AI不能替代专业咨询师，
          但它可以让你在自己舒适的环境中进行练习。
        </p>
        <p>
          <Link href="/chat" className="text-primary-600 hover:text-primary-700 font-medium">
            → 试试用可意AI进行系统脱敏练习
          </Link>
        </p>
      </article>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">常见问题</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">系统脱敏疗法要多久才能见效？</h3>
            <p className="text-gray-600">系统脱敏通常需要6-12次治疗才能见效，每次治疗约45-60分钟。具体时间取决于恐惧的严重程度和个人的配合程度。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">系统脱敏可以自己做吗？</h3>
            <p className="text-gray-600">轻度的恐惧和焦虑可以通过AI辅助工具进行自助式系统脱敏练习。但对于严重的恐惧症或创伤相关问题，建议在专业心理咨询师指导下进行。</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">系统脱敏和暴露疗法有什么区别？</h3>
            <p className="text-gray-600">系统脱敏是暴露疗法的一种，但它是"渐进式"的——从最轻微的刺激开始，逐步增加强度。而标准暴露疗法可能直接面对最恐惧的情境。</p>
          </div>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link href="/chat" className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
          免费体验系统脱敏
        </Link>
      </div>
    </main>
  );
}
