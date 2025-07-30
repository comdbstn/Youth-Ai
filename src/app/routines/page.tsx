"use client";

import { useState, useEffect, FormEvent } from 'react';
import { createClient } from '@/lib/supabase';
import type { Routine } from '@/types';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useCrossTab } from '@/lib/cross-tab-context';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

const RoutinesPage = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const { broadcastActivity } = useCrossTab();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setLoading(false);
        return;
      }
      
      await fetchRoutines();
    };

    const fetchRoutines = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('routines')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching routines:', error);
        } else {
          setRoutines(data as Routine[]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const channel = supabase
      .channel('realtime-routines')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'routines' },
        (payload) => {
          if (user) {
            fetchRoutines();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  const handleAddRoutine = async (e: FormEvent) => {
    e.preventDefault();
    if (newRoutineName.trim() === '' || !user) return;

    try {
      const { data, error } = await supabase
        .from('routines')
        .insert([{ name: newRoutineName, user_id: user.id, count: 0 }])
        .select();

      if (error) {
        console.error('Error adding routine:', error);
        alert('루틴 추가에 실패했습니다.');
      } else if (data) {
        setRoutines([...routines, data[0] as Routine]);
        setNewRoutineName('');
        
        // 활동 브로드캐스트
        broadcastActivity({
          type: 'user_action',
          page: '/routines',
          data: { routineName: newRoutineName },
          description: `새 루틴 추가: "${newRoutineName}"`
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('루틴 추가에 실패했습니다.');
    }
  };

  const incrementCount = async (id: number) => {
    if (!user) return;
    
    const routine = routines.find((r) => r.id === id);
    if (!routine) return;

    try {
      const { error } = await supabase
        .from('routines')
        .update({ count: (routine.count || 0) + 1 })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing routine:', error);
        alert('루틴 업데이트에 실패했습니다.');
      } else {
        // 활동 브로드캐스트
        broadcastActivity({
          type: 'routine_increment',
          page: '/routines',
          data: { routineId: id, routineName: routine.name, newCount: (routine.count || 0) + 1 },
          description: `루틴 "${routine.name}" 완료 (총 ${(routine.count || 0) + 1}회)`
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('루틴 업데이트에 실패했습니다.');
    }
  };

  const handleResetRoutines = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('routines')
        .update({ count: 0 })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error resetting routines:', error);
        alert('루틴 초기화에 실패했습니다.');
      } else {
        alert('모든 루틴 횟수가 초기화되었습니다.');
        
        // 활동 브로드캐스트
        broadcastActivity({
          type: 'user_action',
          page: '/routines',
          data: { action: 'reset_all' },
          description: '모든 루틴 횟수 초기화'
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('루틴 초기화에 실패했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-white mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-400 mb-4">루틴을 관리하려면 먼저 로그인해주세요.</p>
          <button 
            onClick={() => window.location.href = '/auth'} 
            className="btn-primary"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">나의 루틴</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <SkeletonLoader count={3} className="h-12" />
        ) : routines.length > 0 ? (
          <ul className="space-y-3">
            {routines.map((routine) => (
              <li
                key={routine.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <span className="text-lg font-medium">{routine.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-semibold text-blue-400">
                    {routine.count || 0}
                  </span>
                  <button
                    onClick={() => incrementCount(routine.id)}
                    className="btn-primary"
                  >
                    +1
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">아직 등록된 루틴이 없습니다</p>
            <p className="text-sm text-gray-500">새로운 루틴을 추가해보세요!</p>
          </div>
        )}
        <form onSubmit={handleAddRoutine} className="mt-4 flex">
          <input
            type="text"
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            placeholder="새 루틴 추가..."
            className="input flex-grow"
          />
          <button type="submit" className="btn-primary ml-2">
            추가
          </button>
        </form>

        {routines.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-white">루틴 초기화</h3>
            <p className="text-sm text-gray-400 mb-3">
              하루가 끝나면 모든 루틴 횟수를 0으로 초기화할 수 있습니다.
            </p>
            <button
              onClick={handleResetRoutines}
              className="btn-secondary w-full"
            >
              모든 루틴 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutinesPage; 