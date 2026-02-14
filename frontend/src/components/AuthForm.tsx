'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { setUser } = useStore();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 检查是否需要邮箱验证
        if (data.detail?.includes('Email not confirmed') || data.detail?.includes('验证')) {
          throw new Error('请先验证邮箱后再登录。查收您的邮件，点击验证链接后刷新页面再试。');
        }
        throw new Error(data.detail || '请求失败');
      }

      setUser(data.user || { id: '', email }, data.access_token);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-warm-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">可意</h1>
          <p className="text-gray-600">温暖、专业、有同理心的AI心理助手</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            {isLogin ? '欢迎回来' : '创建账户'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="请输入密码（至少6位）"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? '请稍候...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              {isLogin ? '还没有账户？立即注册' : '已有账户？去登录'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <p className="font-medium mb-1">注册说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>注册后会收到验证邮件</li>
                <li>请查收邮件并点击验证链接</li>
                <li>验证完成后即可登录</li>
              </ul>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => { setUser(null, ''); window.location.reload(); }}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              暂不登录，先试试
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
