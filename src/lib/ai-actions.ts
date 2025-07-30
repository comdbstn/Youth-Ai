'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';

// 도구 1: 목표 추가
export async function addGoal(title: string) {
  console.log(`[AI Action] 목표 추가 실행: ${title}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase.from('goals').insert({ title, user_id: user.id });
  if (error) return { error: `목표 추가 실패: ${error.message}` };
  
  revalidatePath('/'); // 홈 페이지 데이터 새로고침
  return { success: `"${title}" 목표를 성공적으로 추가했습니다.` };
}

// 도구 2: 목표 수정
export async function updateGoal(goalId: number, newTitle: string) {
  console.log(`[AI Action] 목표 수정 실행: ID ${goalId} -> ${newTitle}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('goals')
    .update({ title: newTitle })
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (error) return { error: `목표 수정 실패: ${error.message}` };
  
  revalidatePath('/');
  return { success: `목표를 "${newTitle}"로 수정했습니다.` };
}

// 도구 3: 목표 삭제
export async function deleteGoal(goalId: number) {
  console.log(`[AI Action] 목표 삭제 실행: ID ${goalId}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (error) return { error: `목표 삭제 실패: ${error.message}` };
  
  revalidatePath('/');
  return { success: '목표를 삭제했습니다.' };
}

// 도구 4: 목표 완료 토글
export async function toggleGoalCompletion(goalId: number, completed: boolean) {
  console.log(`[AI Action] 목표 완료 상태 변경: ID ${goalId} -> ${completed ? '완료' : '미완료'}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('goals')
    .update({ completed })
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (error) return { error: `목표 상태 변경 실패: ${error.message}` };
  
  revalidatePath('/');
  return { success: `목표를 ${completed ? '완료' : '미완료'}로 변경했습니다.` };
}

// 도구 5: 루틴 횟수 증가
export async function incrementRoutine(name: string) {
  console.log(`[AI Action] 루틴 횟수 증가 실행: ${name}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  // 루틴 이름으로 id 찾기 (대소문자 구분 없이)
  const { data: routines, error: findError } = await supabase
    .from('routines')
    .select('id, count')
    .ilike('name', `%${name}%`)
    .eq('user_id', user.id)
    .limit(1);

  if (findError || !routines || routines.length === 0) {
    return { error: `"${name}" 루틴을 찾을 수 없습니다.` };
  }
  const routine = routines[0];

  const { error } = await supabase
    .from('routines')
    .update({ count: routine.count + 1 })
    .eq('id', routine.id);
  
  if (error) return { error: `루틴 업데이트 실패: ${error.message}` };

  revalidatePath('/routines'); // 루틴 페이지 데이터 새로고침
  return { success: `"${name}" 루틴을 완료했습니다. 총 ${routine.count + 1}회 달성!` };
}

// 도구 6: 루틴 추가
export async function addRoutine(name: string) {
  console.log(`[AI Action] 루틴 추가 실행: ${name}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('routines')
    .insert({ name, user_id: user.id, count: 0 });

  if (error) return { error: `루틴 추가 실패: ${error.message}` };
  
  revalidatePath('/routines');
  return { success: `"${name}" 루틴을 추가했습니다.` };
}

// 도구 7: 루틴 삭제
export async function deleteRoutine(routineId: number) {
  console.log(`[AI Action] 루틴 삭제 실행: ID ${routineId}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', routineId)
    .eq('user_id', user.id);

  if (error) return { error: `루틴 삭제 실패: ${error.message}` };
  
  revalidatePath('/routines');
  return { success: '루틴을 삭제했습니다.' };
}

// 도구 8: 일기 작성 (감정 분석 추가)
export async function createJournalEntry(entry_text: string) {
  console.log(`[AI Action] 일기 작성 및 감정 분석 실행...`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  // AI를 사용하여 감정 분석
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { object: { emotion } } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      emotion: z.string().describe('The user\'s primary emotion from this list: "행복", "기쁨", "보통", "슬픔", "화남"'),
    }),
    prompt: `Analyze the following journal entry and determine the user's primary emotion. Entry: "${entry_text}"`,
  });

  const { error } = await supabase
    .from('journal_entries')
    .insert({ entry_text, emotion, user_id: user.id });

  if (error) return { error: `일기 작성 실패: ${error.message}` };

  revalidatePath('/journal');
  return { success: `오늘의 "${emotion}" 감정을 기록했습니다.` };
}

// 도구 9: 일기 삭제
export async function deleteJournalEntry(entryId: number) {
  console.log(`[AI Action] 일기 삭제 실행: ID ${entryId}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', user.id);

  if (error) return { error: `일기 삭제 실패: ${error.message}` };
  
  revalidatePath('/journal');
  return { success: '일기를 삭제했습니다.' };
}

// 도구 10: 전체 상태 조회
export async function getUserStatus() {
  console.log(`[AI Action] 사용자 상태 조회 실행`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  // 목표 조회
  const { data: goals } = await supabase
    .from('goals')
    .select('id, title, completed, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 루틴 조회
  const { data: routines } = await supabase
    .from('routines')
    .select('id, name, count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 최근 일기 조회
  const { data: journals } = await supabase
    .from('journal_entries')
    .select('id, entry_text, emotion, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const status = {
    goals: goals || [],
    routines: routines || [],
    recent_journals: journals || [],
    summary: {
      total_goals: goals?.length || 0,
      completed_goals: goals?.filter(g => g.completed).length || 0,
      total_routines: routines?.length || 0,
      total_routine_count: routines?.reduce((sum, r) => sum + (r.count || 0), 0) || 0,
      recent_journal_count: journals?.length || 0
    }
  };

  return { success: '사용자 상태를 조회했습니다.', data: status };
} 