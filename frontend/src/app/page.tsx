'use client';

import { useEffect, useState } from 'react';
import { useStore, restoreUser } from '@/store';
import ChatInterface from '@/components/ChatInterface';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const { user, token, setUser } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token && !user) {
      const saved = restoreUser();
      if (saved && saved.user && saved.token) {
        setUser(saved.user, saved.token, saved.refreshToken ?? undefined);
      }
    }
  }, [setUser, token, user]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fbf6ee" }}>
        <div className="text-center">
          <div className="mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2.5rem", fontWeight: 400, color: "#2f5b4f", letterSpacing: "-0.02em" }}>
            林序
          </div>
          <div style={{ color: "#7a6d63" }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {token && user ? <ChatInterface /> : <AuthForm />}
    </main>
  );
}
