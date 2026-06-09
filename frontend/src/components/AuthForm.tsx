'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';

async function refreshTokenIfNeeded(token: string | null, refreshToken: string | null): Promise<string | null> {
  if (!token || !refreshToken) return token;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    if (Date.now() < expiresAt - 60000) return token; // still valid (1min buffer)
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.access_token;
    }
  } catch {}
  return token;
}

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.detail || '请求失败';
        if (msg.includes('Email not confirmed') || msg.includes('验证')) {
          throw new Error('请先验证邮箱后再登录。查收您的邮件，点击验证链接后刷新页面再试。');
        }
        throw new Error(msg);
      }

      setUser(data.user || { id: '', email }, data.access_token, data.refresh_token);
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#fbf6ee" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2.5rem", fontWeight: 400, color: "#2f5b4f", letterSpacing: "-0.02em" }} className="mb-2">
            林序
          </h1>
          <p style={{ color: "#7a6d63" }}>在林间找到安宁</p>
        </div>

        <div style={{ background: "#fffdf8", borderRadius: "16px", boxShadow: "0 20px 52px rgba(32,25,20,0.12)", padding: "2rem" }}>
          <h2 className="text-2xl font-semibold text-center mb-6" style={{ color: "#201914" }}>
            {isLogin ? '欢迎回来' : '创建账户'}
          </h2>

          {error && (
            <div style={{ background: "#fdf0ef", color: "#b33a3a" }} className="p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: "#f0f7f0", color: "#4f8a4f" }} className="p-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4c4037" }}>邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none"
                style={{ border: "1px solid #ded2c3", background: "#fffdf8", color: "#201914" }}
                onFocus={(e) => { e.target.style.borderColor = "#2f5b4f"; e.target.style.boxShadow = "0 0 0 3px rgba(47,91,79,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#ded2c3"; e.target.style.boxShadow = "none"; }}
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4c4037" }}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none"
                style={{ border: "1px solid #ded2c3", background: "#fffdf8", color: "#201914" }}
                onFocus={(e) => { e.target.style.borderColor = "#2f5b4f"; e.target.style.boxShadow = "0 0 0 3px rgba(47,91,79,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#ded2c3"; e.target.style.boxShadow = "none"; }}
                placeholder="请输入密码（至少6位）"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium transition disabled:opacity-50"
              style={{ background: "#2f5b4f", color: "#ffffff", borderRadius: "10px" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#274d43"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#2f5b4f"; }}
            >
              {loading ? '请稍候...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="text-sm transition"
              style={{ color: "#2f5b4f" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#274d43"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#2f5b4f"; }}
            >
              {isLogin ? '还没有账户？立即注册' : '已有账户？去登录'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "#f0f7f5", color: "#2f5b4f" }}>
              <p className="font-medium mb-1">注册说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>注册后会收到验证邮件</li>
                <li>请查收邮件并点击验证链接</li>
                <li>验证完成后即可登录</li>
              </ul>
            </div>
          )}

          <div className="mt-6 pt-6" style={{ borderTop: "1px solid #ded2c3" }}>
            <button
              type="button"
              onClick={() => { setUser(null, ''); window.location.reload(); }}
              className="w-full py-2 text-sm transition"
              style={{ color: "#7a6d63" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#4c4037"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#7a6d63"; }}
            >
              暂不登录，先试试
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
