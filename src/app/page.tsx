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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Youth Ai</h1>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-lg text-blue-200">주인님만을 위한 개인 AI 라이프 코치</p>
          </div>
          
          <div className="mb-8">
            <TodayBriefing />
          </div>

          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-6xl mb-6">👑</div>
              <h2 className="text-2xl font-bold text-white mb-4">환영합니다, 주인님</h2>
              <p className="text-blue-200 mb-8">Youth Ai를 사용하려면 먼저 로그인해주세요.</p>
              <button 
                onClick={() => window.location.href = '/auth'} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              안녕하세요, 주인님!
            </h1>
          </div>
          <p className="text-blue-200">오늘도 멋진 하루를 만들어보세요</p>
        </div>

        {/* 브리핑 */}
        <div className="mb-8">
          <TodayBriefing />
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/30 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-blue-400" />
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{totalGoals}</div>
              <div className="text-blue-200 text-sm">총 목표 개수</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{completedGoals}</div>
              <div className="text-green-200 text-sm">완료한 목표</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{completionRate}%</div>
            <div className="text-purple-200 text-sm">달성률</div>
          </div>
        </div>

        {/* 목표 관리 섹션 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {/* 섹션 헤더 */}
          <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 p-6 border-b border-white/10">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">주인님의 목표</h2>
              <p className="text-blue-200 text-sm">성공을 향한 여정을 함께 관리해드립니다</p>
              {totalGoals > 0 && (
                <div className="bg-white/10 rounded-lg px-4 py-2 mt-4 inline-block">
                  <span className="text-blue-200 text-sm font-medium">
                    {completedGoals}/{totalGoals} 완료
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* 새 목표 추가 */}
            <form onSubmit={handleAddGoal} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="새로운 목표를 입력해주세요, 주인님"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* 목표 목록 */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4">
                    <SkeletonLoader count={1} className="h-6" />
                  </div>
                ))}
              </div>
            ) : goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300 border border-white/10 hover:border-white/20 ${
                      goal.completed ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleGoal(goal.id, !goal.completed)}
                        className="flex-shrink-0 transition-transform hover:scale-110"
                      >
                        {goal.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-blue-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-base font-medium block ${
                            goal.completed
                              ? 'line-through text-gray-400'
                              : 'text-white'
                          }`}
                        >
                          {goal.title}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-xs text-gray-400 text-right">
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
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-xl text-white mb-4 font-semibold">아직 목표가 없습니다, 주인님</h3>
                <p className="text-blue-200">첫 번째 목표를 설정해서 성공의 여정을 시작해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
