"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Sparkles, RefreshCw, Star } from 'lucide-react';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

const FortunePage = () => {
  const [fortune, setFortune] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (!user) {
          setIsLoading(false);
          setError('로그인이 필요합니다.');
          return;
        }

        await fetchFortune();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('인증 확인 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    const fetchFortune = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/fortune');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFortune(data.fortune || '운세를 불러올 수 없습니다.');
      } catch (error) {
        console.error('Error fetching fortune:', error);
        setError('운세를 불러오는 데 실패했습니다.');
        setFortune('');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetch();
  }, [supabase]);

  const handleRefresh = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fortune');
      if (!response.ok) {
        throw new Error('운세를 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      setFortune(data.fortune || '운세를 불러올 수 없습니다.');
    } catch (error) {
      console.error('Fortune refresh error:', error);
      setError('운세를 새로고침하는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              오늘의 운세 🔮
            </h1>
            <p className="text-purple-200 text-sm sm:text-base">주인님의 특별한 운세를 확인해보세요</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-400/30">
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-6xl mb-6">🔮</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">로그인이 필요합니다, 주인님</h2>
              <p className="text-purple-200 mb-6 text-sm sm:text-base">특별한 운세를 확인하려면 먼저 로그인해주세요.</p>
              <button 
                onClick={() => window.location.href = '/auth'} 
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              주인님의 운세
            </h1>
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
          </div>
          <p className="text-purple-200 text-sm sm:text-base">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>

        {/* 운세 카드 */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-purple-400/30 overflow-hidden">
          {/* 카드 헤더 */}
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-4 sm:p-6 border-b border-purple-400/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">오늘의 특별한 운세</h2>
                  <p className="text-purple-200 text-xs sm:text-sm">주인님만을 위한 맞춤 예언</p>
                </div>
              </div>
              {user && !isLoading && (
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm"
                  title="운세 새로고침"
                >
                  <RefreshCw className="w-4 h-4" />
                  새로고침
                </button>
              )}
            </div>
          </div>

          {/* 카드 내용 */}
          <div className="p-6 sm:p-8 lg:p-10">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <SkeletonLoader count={1} className="h-4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-6xl mb-6">😔</div>
                <p className="text-red-300 text-sm sm:text-base mb-6">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl sm:text-6xl lg:text-7xl mb-6 sm:mb-8">🌟</div>
                <div className="bg-white/5 rounded-xl p-6 sm:p-8 mb-6">
                  <p className="text-base sm:text-lg lg:text-xl text-purple-100 leading-relaxed whitespace-pre-wrap font-medium">
                    {fortune}
                  </p>
                </div>
                
                {/* 장식 요소들 */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8">
                  <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl p-4 sm:p-6 border border-yellow-400/30">
                    <div className="text-2xl sm:text-3xl mb-2">✨</div>
                    <p className="text-yellow-200 text-xs sm:text-sm font-medium">행운</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-400/20 to-red-500/20 rounded-xl p-4 sm:p-6 border border-pink-400/30">
                    <div className="text-2xl sm:text-3xl mb-2">💖</div>
                    <p className="text-pink-200 text-xs sm:text-sm font-medium">사랑</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl p-4 sm:p-6 border border-green-400/30">
                    <div className="text-2xl sm:text-3xl mb-2">💰</div>
                    <p className="text-green-200 text-xs sm:text-sm font-medium">재물</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 메시지 */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-xs sm:text-sm">
            주인님의 하루가 행복과 성공으로 가득하기를 바랍니다 ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default FortunePage; 