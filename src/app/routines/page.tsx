"use client";

import { useState, useEffect, FormEvent } from 'react';
import { createClient } from '@/lib/supabase';
import type { Routine } from '@/types';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useCrossTab } from '@/lib/cross-tab-context';

const RoutinesPage = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { broadcastActivity } = useCrossTab();

  useEffect(() => {
    const fetchRoutines = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching routines:', error);
      } else {
        setRoutines(data as Routine[]);
      }
      setLoading(false);
    };

    fetchRoutines();

    const channel = supabase
      .channel('realtime-routines')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'routines' },
        (payload) => {
          fetchRoutines();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddRoutine = async (e: FormEvent) => {
    e.preventDefault();
    if (newRoutineName.trim() === '') return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('routines')
      .insert([{ name: newRoutineName, user_id: user.id, count: 0 }])
      .select();

    if (error) {
      console.error('Error adding routine:', error);
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
  };

  const incrementCount = async (id: number) => {
    const routine = routines.find((r) => r.id === id);
    if (!routine) return;

    const { error } = await supabase
      .from('routines')
      .update({ count: (routine.count || 0) + 1 })
      .eq('id', id);

    if (error) {
      console.error('Error incrementing routine:', error);
    } else {
      // 활동 브로드캐스트
      broadcastActivity({
        type: 'routine_increment',
        page: '/routines',
        data: { routineId: id, routineName: routine.name, newCount: (routine.count || 0) + 1 },
        description: `루틴 "${routine.name}" 완료 (총 ${(routine.count || 0) + 1}회)`
      });
    }
  };

  const handleResetRoutines = async () => {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return;

     const { error } = await supabase
       .from('routines')
       .update({ count: 0 })
       .eq('user_id', user.id);

     if (error) {
       console.error('Error resetting routines:', error);
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
  };

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