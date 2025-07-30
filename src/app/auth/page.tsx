"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_AUTH_EMAIL || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // 개인용 앱이므로 간단한 로그인만
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 사용자가 없으면 자동으로 생성 (개인용)
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            setMessage('계정이 생성되었습니다! 로그인 중...');
            // 회원가입 후 바로 로그인 시도
            setTimeout(async () => {
              const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (!loginError) {
                router.push('/');
              }
            }, 1000);
            return;
          }
        } else {
          throw error;
        }
      }

      if (data.user) {
        router.push('/');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Youth Ai</h1>
          <p className="text-gray-400">개인 AI 라이프 코치</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input w-full"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="input w-full"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? '처리 중...' : '로그인'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('생성') || message.includes('로그인 중') 
              ? 'bg-green-900/50 text-green-300' 
              : 'bg-red-900/50 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>개인용 앱입니다.</p>
          <p>처음 사용시 계정이 자동으로 생성됩니다.</p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
} 