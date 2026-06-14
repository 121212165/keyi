import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          可意AI心理医生：免费在线 CBT 认知疗法 + 情绪疏导
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          可意AI是一款免费的AI心理医生应用，提供CBT认知行为疗法、系统脱敏训练和情绪疏导三种专业心理治疗模式。24小时在线，无需预约，支持中文对话。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition text-lg"
          >
            免费开始对话
          </Link>
          <a
            href="#features"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-lg"
          >
            了解更多
          </a>
        </div>
      </section>

      {/* What is Keyi */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">什么是可意AI心理医生？</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <p>
            可意AI是一款基于人工智能技术的心理健康辅助应用，由智谱AI GLM-4.7-Flash大模型驱动。
            它不是替代专业心理咨询师，而是作为一个24小时可用的倾听者和支持者，帮助用户在日常生活中进行情绪管理和心理自助。
          </p>
          <p>
            CBT（认知行为疗法）是目前循证级别最高的心理治疗方法之一，Meta分析显示其对焦虑障碍的效应量达0.73。
            可意AI将CBT的核心技术——认知三角记录和自动化思维标记——集成到AI对话中，让用户在聊天过程中自然地完成心理练习。
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">三种专业心理治疗模式</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">自由对话</h3>
            <p className="text-gray-600 leading-relaxed">
              普通的支持性对话模式。可意会用心倾听你的困扰，给予温暖的回应和理解。适合日常情绪倾诉、压力释放、寻求陪伴。
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">CBT 认知疗法</h3>
            <p className="text-gray-600 leading-relaxed">
              认知行为疗法模式，帮助识别和改变负性思维模式。支持认知三角记录（想法-感受-行为）和自动化思维标记（ANTs），让你看清思维陷阱。
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">系统脱敏</h3>
            <p className="text-gray-600 leading-relaxed">
              通过渐进式暴露克服特定恐惧或焦虑。从最轻微的刺激开始，逐步建立对恐惧情境的耐受力。适合恐飞、社交焦虑、特定恐惧症等。
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16 bg-gray-50 rounded-3xl my-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">如何使用可意AI？</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">1</div>
            <h4 className="font-semibold text-gray-900 mb-2">选择模式</h4>
            <p className="text-sm text-gray-600">根据需求选择自由对话、CBT认知疗法或系统脱敏</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">2</div>
            <h4 className="font-semibold text-gray-900 mb-2">开始对话</h4>
            <p className="text-sm text-gray-600">像和朋友聊天一样，说出你的困扰和感受</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">3</div>
            <h4 className="font-semibold text-gray-900 mb-2">获得引导</h4>
            <p className="text-sm text-gray-600">可意会用专业方法引导你理解自己的思维模式</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">4</div>
            <h4 className="font-semibold text-gray-900 mb-2">持续成长</h4>
            <p className="text-sm text-gray-600">记录情绪变化，在日常生活中练习新的思维方式</p>
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">适合谁使用？</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4 items-start">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">日常情绪管理</h4>
              <p className="text-gray-600">工作压力、人际关系困扰、情绪低落时需要一个倾听者</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">焦虑和恐惧自助</h4>
              <p className="text-gray-600">社交焦虑、特定恐惧症、考试焦虑等想通过练习改善</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">思维模式探索</h4>
              <p className="text-gray-600">想了解自己的思维习惯，识别负性自动化思维</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="text-2xl">✅</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">心理咨询前的准备</h4>
              <p className="text-gray-600">在见心理咨询师之前，先整理自己的想法和感受</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-2">⚠️ 重要提示</h3>
          <p className="text-amber-700 text-sm leading-relaxed">
            可意AI是心理健康辅助工具，不能替代专业心理咨询师或精神科医生的诊断和治疗。
            如果你正在经历严重的心理困扰、有自伤或自杀的想法，请立即联系专业心理危机热线：
            <strong> 全国24小时心理援助热线 400-161-9995</strong> 或
            <strong> 北京心理危机研究与干预中心 010-82951332</strong>。
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">常见问题</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">可意AI心理医生是免费的吗？</h3>
            <p className="text-gray-600">是的，可意AI目前完全免费使用。你可以无限次与AI心理医生对话，使用所有三种治疗模式。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI心理医生能替代真人心理咨询吗？</h3>
            <p className="text-gray-600">不能。可意AI是一个辅助工具，适合日常情绪管理和心理自助。对于严重的心理问题，建议寻求专业心理咨询师的帮助。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">什么是CBT认知行为疗法？</h3>
            <p className="text-gray-600">CBT（Cognitive Behavioral Therapy）是一种通过识别和改变负性思维模式来改善情绪和行为的心理治疗方法。它被广泛用于治疗焦虑、抑郁等心理问题，有大量科学研究支持其有效性。</p>
          </div>
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">我的对话内容会被保存吗？</h3>
            <p className="text-gray-600">注册用户的对话历史会被保存，方便你回顾和追踪情绪变化。我们重视你的隐私，对话内容仅用于提供服务。</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">系统脱敏疗法是什么？</h3>
            <p className="text-gray-600">系统脱敏是一种通过渐进式暴露来克服恐惧和焦虑的行为治疗方法。它从最轻微的刺激开始，让你逐步建立对恐惧情境的耐受力。可意AI会引导你完成整个脱敏过程。</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">准备好开始了吗？</h2>
        <p className="text-gray-600 mb-8 text-lg">无需预约，无需等待，24小时在线陪伴你。</p>
        <Link
          href="/chat"
          className="inline-block px-10 py-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition text-lg"
        >
          立即开始免费对话
        </Link>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>可意AI心理医生 — 温暖、专业、有同理心的AI心理健康助手</p>
        <p className="mt-2">基于循证心理学方法 · CBT认知行为疗法 · 系统脱敏疗法</p>
      </footer>
    </main>
  );
}
