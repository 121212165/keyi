'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore, restoreUser } from '@/store';
import { refreshTokenIfNeeded } from '@/lib/auth-session';
import AuthForm from '@/components/AuthForm';
import ChatInterface from '@/components/ChatInterface';

function ChatPageInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') ?? 'general';

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
        <div style={{ color: '#7a6d63' }}>加载中...</div>
      </div>
    );
  }

  if (!user && !token) {
    return <AuthForm />;
  }

  return <ChatInterface initialMode={mode} />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#fbf6ee' }}>
          <div style={{ color: '#7a6d63' }}>加载中...</div>
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}
