'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore, restoreUser } from '@/store';
import { refreshTokenIfNeeded } from '@/lib/auth-session';
import { THERAPY_MODES } from '@/lib/therapy-modes';

export default function Home() {
  const router = useRouter();
  const { user, token, setUser } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setMounted(true);

      if (token || user) {
        return;
      }

      const saved = restoreUser();
      if (!saved?.user || !saved.token) {
        return;
      }

      const refreshed = await refreshTokenIfNeeded(saved.token, saved.refreshToken ?? null);

      if (!active) {
        return;
      }

      if (!refreshed.accessToken) {
        setUser(null);
        return;
      }

      setUser(saved.user, refreshed.accessToken, refreshed.refreshToken ?? undefined);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [setUser, token, user]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fbf6ee' }}>
        <div className="text-center">
          <div className="mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '2.5rem', fontWeight: 400, color: '#2f5b4f', letterSpacing: '-0.02em' }}>
            可意
          </div>
          <div style={{ color: '#7a6d63' }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: '#fbf6ee' }}>
      {/* 顶栏 */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}
      >
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '1.3rem', color: '#2f5b4f', fontWeight: 500 }}>
          可意 <span style={{ fontSize: '0.95rem', color: '#7a6d63', fontFamily: 'inherit' }}>AI 心理医生</span>
        </div>
        <button
          onClick={() => router.push('/chat')}
          className="px-4 py-2 text-sm rounded-full transition"
          style={{ color: '#2f5b4f', border: '1px solid rgba(47,91,79,0.35)', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(47,91,79,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {user ? '进入对话' : '登录 / 注册'}
        </button>
      </header>

      {/* Hero：先选择想做的事情 */}
      <section className="text-center px-6 pt-12 pb-10">
        <h1 className="text-3xl md:text-4xl" style={{ color: '#201914', fontWeight: 600, letterSpacing: '-0.01em' }}>
          先选一件你现在想做的事
        </h1>
        <p className="mt-3 text-base" style={{ color: '#7a6d63' }}>
          可意会针对你的选择，用最合适的专业方法陪你完成它
        </p>
      </section>

      {/* 模式卡片 */}
      <section className="px-6 pb-16" style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div className="grid gap-5 md:grid-cols-2">
          {THERAPY_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => router.push(`/chat?mode=${mode.id}`)}
              className="text-left p-6 transition hover:-translate-y-0.5"
              style={{ background: mode.gradient, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl" style={{ lineHeight: 1 }}>{mode.icon}</span>
                <div>
                  <div className="text-lg font-semibold" style={{ color: '#201914' }}>{mode.name}</div>
                  <div className="text-sm" style={{ color: mode.color }}>{mode.tagline}</div>
                </div>
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#4c4037' }}>{mode.description}</p>
              <ul className="space-y-1.5 mb-5">
                {mode.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#4c4037' }}>
                    <span style={{ color: mode.color }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm text-white transition"
                style={{ background: mode.color }}
              >
                开始{mode.shortName}
                <span aria-hidden>→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 免责声明 */}
      <footer className="px-6 pb-12 text-center" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div className="text-xs leading-relaxed" style={{ color: '#9a8f85' }}>
          可意AI是心理健康辅助工具，不能替代专业心理咨询师或精神科医生的诊断和治疗。
          如遇严重心理困扰或自伤念头，请立即联系：
          <br />
          全国24小时心理援助热线 400-161-9995 · 北京心理危机研究与干预中心 010-8295-1332
        </div>
      </footer>
    </main>
  );
}
