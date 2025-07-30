"use client";

import { useState, useEffect, FormEvent } from 'react';
import { createClient } from '@/lib/supabase';
import type { JournalEntry } from '@/types';
import type { User } from '@supabase/supabase-js';
import SkeletonLoader from '@/components/SkeletonLoader';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCrossTab } from '@/lib/cross-tab-context';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
      
      await fetchEntries();
    };

    const fetchEntries = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching journal entries:', error);
        } else {
          setEntries(data as JournalEntry[]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const channel = supabase
      .channel('realtime-journal')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries' },
        () => {
          if (user) {
            fetchEntries();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  const handleAddEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (newEntry.trim() === '' || !user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ 
          entry_text: newEntry, 
          user_id: user.id,
          emotion: 'N/A' // 감정분석은 추후 별도 기능으로 분리
        }])
        .select();

      if (error) {
        console.error('Error creating journal entry:', error);
        alert('일기 저장에 실패했습니다.');
      } else if (data) {
        setNewEntry('');
        
        // 활동 브로드캐스트
        broadcastActivity({
          type: 'journal_add',
          page: '/journal',
          data: { entryLength: newEntry.length },
          description: `새 일기 작성 (${newEntry.length}자)`
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('일기 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-white mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-400 mb-4">일기를 작성하려면 먼저 로그인해주세요.</p>
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
      <h1 className="text-2xl font-bold mb-4 text-white">나의 일기</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <form onSubmit={handleAddEntry}>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="오늘 하루는 어땠나요?"
            rows={4}
            className="input w-full mb-2"
            disabled={isSubmitting}
          />
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '일기 저장하기'}
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2 text-white">이전 기록</h2>
        {loading ? (
          <SkeletonLoader count={3} className="h-24" />
        ) : entries.length > 0 ? (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.id} className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-300 whitespace-pre-wrap mb-2">
                  {entry.entry_text}
                </p>
                <div className="text-xs text-gray-400 flex justify-between items-center">
                   <span>{entry.emotion}</span>
                   <span>
                    {format(new Date(entry.created_at), 'yyyy년 M월 d일 HH:mm', {
                      locale: ko,
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">아직 작성된 일기가 없습니다</p>
            <p className="text-sm text-gray-500">첫 번째 일기를 작성해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPage; 