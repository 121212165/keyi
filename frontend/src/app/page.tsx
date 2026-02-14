'use client';

import { useEffect, useState } from 'react';
import { useStore, restoreUser } from '@/store';
import ChatInterface from '@/components/ChatInterface';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const { user, token, setUser } = useStore();
  const [mounted, setMounted] = useState(false);

  // 只在客户端挂载后恢复用户状态
  useEffect(() => {
    setMounted(true);
    if (!token && !user) {
      const saved = restoreUser();
      if (saved && saved.user && saved.token) {
        setUser(saved.user, saved.token);
      }
    }
  }, [setUser, token, user]);

  // 避免服务端渲染不匹配
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-warm-50 to-white">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-4">可意</div>
          <div className="text-gray-500">加载中...</div>
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
