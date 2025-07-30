import { createClient } from './supabase-server';
import { format } from 'date-fns';

export async function getContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('id, title, completed, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: routines, error: routinesError } = await supabase
    .from('routines')
    .select('id, name, count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: journal, error: journalError } = await supabase
    .from('journal_entries')
    .select('id, entry_text, emotion, created_at')
    .eq('user_id', userId)
    .limit(3)
    .order('created_at', { ascending: false });

  if (goalsError) console.error('Error fetching goals:', goalsError.message);
  if (routinesError) console.error('Error fetching routines:', routinesError.message);
  if (journalError) console.error('Error fetching journal:', journalError.message);

  let context = '';

  // 현재 시간과 날짜 정보
  context += `현재 시간: ${new Date().toLocaleString('ko-KR')}\n\n`;

  // 목표 정보 (ID 포함)
  if (goals && goals.length > 0) {
    context += '📋 현재 목표 목록:\n';
    goals.forEach(g => {
      context += `- [ID: ${g.id}] ${g.title} (${g.completed ? '✅완료' : '⏳미완료'})\n`;
    });
    context += '\n';
  } else {
    context += '📋 설정된 목표가 없습니다.\n\n';
  }

  // 루틴 정보 (ID 포함)
  if (routines && routines.length > 0) {
    context += '💪 현재 루틴 목록:\n';
    routines.forEach(r => {
      context += `- [ID: ${r.id}] ${r.name} (오늘 ${r.count || 0}회 완료)\n`;
    });
    context += '\n';
  } else {
    context += '💪 등록된 루틴이 없습니다.\n\n';
  }

  // 최근 일기 정보 (ID 포함)
  if (journal && journal.length > 0) {
    context += '📝 최근 일기 목록:\n';
    journal.forEach((entry) => {
      const date = format(new Date(entry.created_at), 'M월 d일');
      const preview = entry.entry_text.length > 50 
        ? entry.entry_text.substring(0, 50) + '...' 
        : entry.entry_text;
      context += `- [ID: ${entry.id}] ${date}: ${preview} (감정: ${entry.emotion})\n`;
    });
    context += '\n';
  } else {
    context += '📝 작성된 일기가 없습니다.\n\n';
  }

  // 요약 통계
  context += '📊 요약:\n';
  context += `- 총 목표: ${goals?.length || 0}개 (완료: ${goals?.filter(g => g.completed).length || 0}개)\n`;
  context += `- 총 루틴: ${routines?.length || 0}개 (총 완료 횟수: ${routines?.reduce((sum, r) => sum + (r.count || 0), 0) || 0}회)\n`;
  context += `- 총 일기: ${journal?.length || 0}개\n\n`;

  context += '💡 참고: 사용자가 ID를 언급하지 않더라도, 목표나 루틴 이름으로 찾아서 적절한 ID를 사용하여 작업할 수 있습니다.';

  return context;
} 