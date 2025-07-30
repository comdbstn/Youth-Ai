"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { Goal } from '@/types';
import type { User } from '@supabase/supabase-js';
import SkeletonLoader from '@/components/SkeletonLoader';
import TodayBriefing from '@/components/TodayBriefing';
import { useCrossTab } from '@/lib/cross-tab-context';
import { Plus, Target, CheckCircle, Circle, Crown, TrendingUp } from 'lucide-react';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClient();
  const { broadcastActivity } = useCrossTab();

  const fetchGoals = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
      } else {
        setGoals(data as Goal[]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          await fetchGoals(user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setAuthLoading(false);
        if (!user) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchGoals(session.user);
      } else {
        setUser(null);
        setGoals([]);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, fetchGoals]);

  // Realtime 설정을 별도 useEffect로 분리
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-goals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        () => {
          fetchGoals(user);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchGoals]);

  const handleAddGoal = async (e: FormEvent) => {
    e.preventDefault();
    if (newGoal.trim() === '' || !user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ title: newGoal, user_id: user.id }])
        .select();

      if (error) {
        console.error('Error adding goal:', error);
        alert('목표 추가에 실패했습니다.');
      } else if (data) {
        setGoals([data[0] as Goal, ...goals]);
        setNewGoal('');
        
        // 활동 브로드캐스트
        broadcastActivity({
          type: 'goal_add',
          page: '/',
          data: { goalTitle: newGoal },
          description: `새 목표 추가: "${newGoal}"`
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('목표 추가에 실패했습니다.');
    }
  };

  const toggleGoal = async (id: number, completed: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed })
        .eq('id', id);

      if (error) {
        console.error('Error updating goal:', error);
        alert('목표 업데이트에 실패했습니다.');
      } else {
        const goalTitle = goals.find(g => g.id === id)?.title || '';
        setGoals(
          goals.map((goal) =>
            goal.id === id ? { ...goal, completed } : goal
          )
        );
        
        // 활동 브로드캐스트
        broadcastActivity({
          type: 'goal_complete',
          page: '/',
          data: { goalId: id, goalTitle, completed },
          description: `목표 "${goalTitle}" ${completed ? '완료' : '미완료'}로 변경`
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('목표 업데이트에 실패했습니다.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200 text-lg">주인님을 위해 준비 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">Youth Ai</h1>
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-200">주인님만을 위한 개인 AI 라이프 코치</p>
          </div>
          
          <div className="mb-8">
            <TodayBriefing />
          </div>

          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 lg:p-10 border border-white/20 max-w-2xl mx-auto">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-6">👑</div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">환영합니다, 주인님</h2>
              <p className="text-blue-200 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">Youth Ai를 사용하려면 먼저 로그인해주세요.</p>
              <button 
                onClick={() => window.location.href = '/auth'} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 lg:px-10 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base lg:text-lg"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
              안녕하세요, 주인님!
            </h1>
          </div>
          <p className="text-blue-200 text-sm sm:text-base lg:text-lg">오늘도 멋진 하루를 만들어보세요</p>
        </div>

        {/* 브리핑 */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <TodayBriefing />
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-400/30 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-400" />
              <span className="text-xl sm:text-2xl lg:text-3xl">🎯</span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{totalGoals}</div>
            <div className="text-blue-200 text-xs sm:text-sm lg:text-base">총 목표 개수</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-green-400/30 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-400" />
              <span className="text-xl sm:text-2xl lg:text-3xl">✅</span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{completedGoals}</div>
            <div className="text-green-200 text-xs sm:text-sm lg:text-base">완료한 목표</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-400/30 hover:scale-105 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-400" />
              <span className="text-xl sm:text-2xl lg:text-3xl">📊</span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{completionRate}%</div>
            <div className="text-purple-200 text-xs sm:text-sm lg:text-base">달성률</div>
          </div>
        </div>

        {/* 목표 관리 섹션 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {/* 섹션 헤더 */}
          <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 p-4 sm:p-6 lg:p-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">주인님의 목표</h2>
                <p className="text-blue-200 text-xs sm:text-sm lg:text-base">성공을 향한 여정을 함께 관리해드립니다</p>
              </div>
              {totalGoals > 0 && (
                <div className="bg-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                  <span className="text-blue-200 text-xs sm:text-sm lg:text-base font-medium">
                    {completedGoals}/{totalGoals} 완료
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* 새 목표 추가 */}
            <form onSubmit={handleAddGoal} className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="새로운 목표를 입력해주세요, 주인님"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 sm:py-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 sm:p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">추가</span>
                </button>
              </div>
            </form>

            {/* 목표 목록 */}
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 sm:p-6">
                    <SkeletonLoader count={1} className="h-5 sm:h-6" />
                  </div>
                ))}
              </div>
            ) : goals.length > 0 ? (
              <div className="grid gap-3 sm:gap-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`group bg-white/5 hover:bg-white/10 rounded-xl p-4 sm:p-6 transition-all duration-300 border border-white/10 hover:border-white/20 ${
                      goal.completed ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => toggleGoal(goal.id, !goal.completed)}
                        className="flex-shrink-0 transition-transform hover:scale-110"
                      >
                        {goal.completed ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-400 hover:text-blue-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm sm:text-base lg:text-lg font-medium block ${
                            goal.completed
                              ? 'line-through text-gray-400'
                              : 'text-white'
                          }`}
                        >
                          {goal.title}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-xs sm:text-sm text-gray-400 text-right">
                          {new Date(goal.created_at).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6">🎯</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl text-white mb-2 sm:mb-4 font-semibold">아직 목표가 없습니다, 주인님</h3>
                <p className="text-blue-200 text-sm sm:text-base lg:text-lg">첫 번째 목표를 설정해서 성공의 여정을 시작해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
