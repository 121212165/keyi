import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '焦虑自评量表 GAD-7 在线版：免费测试你的焦虑程度 | 可意AI',
  description:
    'GAD-7是广泛使用的焦虑自评量表，由7个问题组成，用于筛查广泛性焦虑障碍。在线免费测试，了解你的焦虑程度，获取专业建议和自助方法。',
  alternates: { canonical: 'https://keyi.app/gad7-anxiety-test' },
  openGraph: {
    title: '焦虑自评量表 GAD-7 在线版：免费测试你的焦虑程度',
    description: '在线免费测试，了解你的焦虑程度，获取专业建议和自助方法。',
  },
};

export default function GAD7Test() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '焦虑自评量表 GAD-7 在线版：免费测试你的焦虑程度',
    description: 'GAD-7是广泛使用的焦虑自评量表，由7个问题组成，用于筛查广泛性焦虑障碍。',
    author: { '@id': 'https://keyi.app/#organization' },
    publisher: { '@id': 'https://keyi.app/#organization' },
    mainEntityOfPage: 'https://keyi.app/gad7-anxiety-test',
    datePublished: '2026-06-14',
    dateModified: '2026-06-14',
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'GAD-7焦虑量表准吗？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GAD-7是经过大量研究验证的焦虑筛查工具，敏感度89%，特异度82%。但它只是筛查工具，不能替代专业诊断。如果得分较高，建议寻求专业心理咨询师的帮助。',
        },
      },
      {
        '@type': 'Question',
        name: 'GAD-7多少分算焦虑？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GAD-7评分标准：0-4分=无焦虑，5-9分=轻度焦虑，10-14分=中度焦虑，15-21分=重度焦虑。得分≥10分建议寻求专业帮助。',
        },
      },
      {
        '@type': 'Question',
        name: 'GAD-7和PHQ-9有什么区别？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GAD-7专门用于筛查焦虑障碍，PHQ-9用于筛查抑郁症。两者都是常用的自评量表，经常一起使用。如果你同时有焦虑和抑郁症状，建议两个都做。',
        },
      },
    ],
  };

  const questions = [
    '感到紧张、焦虑或烦躁',
    '不能停止或控制担忧',
    '对各种各样的事情担忧过多',
    '很难放松下来',
    '由于不安而无法静坐',
    '变得容易烦恼或急躁',
    '感到似乎将有可怕的事情发生',
  ];

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <article className="prose prose-lg max-w-none">
        <h1>焦虑自评量表 GAD-7 在线版</h1>

        <p className="text-xl text-gray-600 leading-relaxed">
          GAD-7（Generalized Anxiety Disorder 7-item Scale）是广泛使用的焦虑自评量表，
          由7个问题组成，用于筛查广泛性焦虑障碍。它由Spitzer等人于2006年开发，
          敏感度89%，特异度82%，是临床和研究中最常用的焦虑筛查工具之一。
        </p>

        <h2>什么是GAD-7？</h2>
        <p>
          GAD-7是一个简短的自评量表，用于评估过去两周内焦虑症状的严重程度。
          它包含7个问题，每个问题0-3分，总分0-21分。
          它被广泛用于初级保健、心理咨询和研究中。
        </p>

        <h2>GAD-7评分标准</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left">分数范围</th>
                <th className="border p-3 text-left">焦虑程度</th>
                <th className="border p-3 text-left">建议</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3">0-4分</td>
                <td className="border p-3 text-green-600 font-semibold">无焦虑</td>
                <td className="border p-3">保持良好的心理状态</td>
              </tr>
              <tr>
                <td className="border p-3">5-9分</td>
                <td className="border p-3 text-yellow-600 font-semibold">轻度焦虑</td>
                <td className="border p-3">可以尝试心理自助方法</td>
              </tr>
              <tr>
                <td className="border p-3">10-14分</td>
                <td className="border p-3 text-orange-600 font-semibold">中度焦虑</td>
                <td className="border p-3">建议寻求专业心理咨询</td>
              </tr>
              <tr>
                <td className="border p-3">15-21分</td>
                <td className="border p-3 text-red-600 font-semibold">重度焦虑</td>
                <td className="border p-3">强烈建议寻求专业帮助</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>GAD-7测试题目</h2>
        <p>在过去两周里，你有多少时候被以下问题所困扰？</p>
        <div className="space-y-4 my-8">
          {questions.map((q, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-2">{i + 1}. {q}</p>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>完全不会 (0分)</span>
                <span>好几天 (1分)</span>
                <span>半数以上天数 (2分)</span>
                <span>几乎每天 (3分)</span>
              </div>
            </div>
          ))}
        </div>

        <h2>如何解读GAD-7结果？</h2>
        <p>
          GAD-7只是一个筛查工具，不能替代专业诊断。如果你的得分≥10分，
          建议寻求专业心理咨询师的帮助。即使得分较低，如果你感到焦虑影响了日常生活，
          也可以寻求帮助。
        </p>

        <h2>焦虑了怎么办？</h2>
        <p>如果你发现自己有焦虑症状，可以尝试以下方法：</p>
        <ul>
          <li><strong>CBT认知疗法：</strong>识别和改变导致焦虑的负性思维模式</li>
          <li><strong>深呼吸练习：</strong>4-7-8呼吸法（吸气4秒，屏息7秒，呼气8秒）</li>
          <li><strong>正念冥想：</strong>专注于当下的感受，不评判</li>
          <li><strong>规律运动：</strong>每周3-5次，每次30分钟的有氧运动</li>
          <li><strong>限制咖啡因：</strong>咖啡因可能加重焦虑症状</li>
          <li><strong>充足睡眠：</strong>保持规律的作息时间</li>
        </ul>

        <h2>用AI辅助焦虑管理</h2>
        <p>
          AI心理医生可以帮你进行CBT认知三角记录，识别导致焦虑的自动化思维。
          它还可以引导你进行系统脱敏练习，逐步降低焦虑反应。
          虽然AI不能替代专业咨询，但可以作为日常焦虑管理的辅助工具。
        </p>
        <p>
          <Link href="/chat" className="text-primary-600 hover:text-primary-700 font-medium">
            → 用可意AI进行焦虑自助练习
          </Link>
        </p>
      </article>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">常见问题</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">GAD-7焦虑量表准吗？</h3>
            <p className="text-gray-600">GAD-7是经过大量研究验证的焦虑筛查工具，敏感度89%，特异度82%。但它只是筛查工具，不能替代专业诊断。如果得分较高，建议寻求专业心理咨询师的帮助。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">GAD-7多少分算焦虑？</h3>
            <p className="text-gray-600">GAD-7评分标准：0-4分=无焦虑，5-9分=轻度焦虑，10-14分=中度焦虑，15-21分=重度焦虑。得分≥10分建议寻求专业帮助。</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">GAD-7和PHQ-9有什么区别？</h3>
            <p className="text-gray-600">GAD-7专门用于筛查焦虑障碍，PHQ-9用于筛查抑郁症。两者都是常用的自评量表，经常一起使用。如果你同时有焦虑和抑郁症状，建议两个都做。</p>
          </div>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link href="/chat" className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
          用AI辅助焦虑管理
        </Link>
      </div>
    </main>
  );
}
