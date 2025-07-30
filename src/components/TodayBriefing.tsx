"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import SkeletonLoader from './SkeletonLoader';
import { Sparkles, RefreshCw } from 'lucide-react';

const TodayBriefing = () => {
  const [briefing, setBriefing] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        setIsLoading(false);
        setError('로그인이 필요합니다.');
        return;
      }

      await fetchBriefing();
    };

    const fetchBriefing = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/briefing');
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('로그인이 필요합니다.');
          }
          throw new Error('브리핑을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        setBriefing(data.briefing || '브리핑을 불러오는 데 실패했습니다.');
      } catch (error) {
        console.error('Briefing error:', error);
        const errorMessage = error instanceof Error ? error.message : '브리핑을 불러오는 데 실패했습니다.';
        setError(errorMessage);
        setBriefing('');
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
      const response = await fetch('/api/briefing');
      if (!response.ok) {
        throw new Error('브리핑을 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      setBriefing(data.briefing || '브리핑을 불러오는 데 실패했습니다.');
    } catch (error) {
      console.error('Briefing error:', error);
      const errorMessage = error instanceof Error ? error.message : '브리핑을 불러오는 데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-400/30 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-white">오늘의 브리핑 ☀️</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-amber-200">로그인 후 주인님만을 위한 브리핑을 확인할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-400/30 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-white">주인님을 위한 오늘의 브리핑 ✨</h2>
        </div>
        {user && !isLoading && (
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="브리핑 새로고침"
          >
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3">
              <SkeletonLoader count={1} className="h-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">😔</div>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-amber-100 leading-relaxed whitespace-pre-wrap">{briefing}</p>
          <div className="mt-4 text-center">
            <div className="text-xs text-amber-300">
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayBriefing; 