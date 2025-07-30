"use client";

import { useState, useEffect, FormEvent } from 'react';
import { createClient } from '@/lib/supabase';
import type { Goal } from '@/types';
import SkeletonLoader from '@/components/SkeletonLoader';
import TodayBriefing from '@/components/TodayBriefing';
import { useCrossTab } from '@/lib/cross-tab-context';

export default function HomePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { broadcastActivity } = useCrossTab();

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
      } else {
        setGoals(data as Goal[]);
      }
      setLoading(false);
    };

    fetchGoals();

    const channel = supabase
      .channel('realtime-goals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        (payload) => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddGoal = async (e: FormEvent) => {
    e.preventDefault();
    if (newGoal.trim() === '') return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .insert([{ title: newGoal, user_id: user.id }])
      .select();

    if (error) {
      console.error('Error adding goal:', error);
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
  };

  const toggleGoal = async (id: number, completed: boolean) => {
    const { error } = await supabase
      .from('goals')
      .update({ completed })
      .eq('id', id);

    if (error) {
      console.error('Error updating goal:', error);
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
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">홈</h1>
      <TodayBriefing />
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-bold mb-2 text-white">오늘의 목표</h2>
        {loading ? (
          <SkeletonLoader count={3} className="h-8" />
        ) : goals.length > 0 ? (
          <ul className="space-y-2">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className={`flex items-center justify-between p-2 rounded ${
                  goal.completed ? 'bg-green-900/50' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`${
                    goal.completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {goal.title}
                </span>
                <button
                  onClick={() => toggleGoal(goal.id, !goal.completed)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  {goal.completed ? '취소' : '완료'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">아직 설정된 목표가 없습니다</p>
            <p className="text-sm text-gray-500">새로운 목표를 추가해보세요!</p>
          </div>
        )}
        <form onSubmit={handleAddGoal} className="mt-4 flex">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="새 목표 추가..."
            className="input flex-grow"
          />
          <button type="submit" className="btn-primary ml-2">
            추가
          </button>
        </form>
      </div>
    </div>
  );
}
