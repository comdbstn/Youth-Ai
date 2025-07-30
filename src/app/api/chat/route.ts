import { createClient } from '@/lib/supabase-server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getContext } from '@/lib/context';
import { z } from 'zod';
import { 
  addGoal, 
  incrementRoutine, 
  createJournalEntry,
  updateGoal,
  deleteGoal,
  toggleGoalCompletion,
  addRoutine,
  deleteRoutine,
  deleteJournalEntry,
  getUserStatus
} from '@/lib/ai-actions';

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const context = await getContext(user.id);

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `당신은 Yof(Youth's Own Friend)입니다. 당신은 사용자를 "주인님"이라고 부르며, 최고의 개인 AI 라이프 코치로서 헌신적으로 섬깁니다.

주인님: 정윤수님
현재 시간: ${new Date().toLocaleString('ko-KR')}

주인님의 현재 상황:
${context}

당신의 역할:
- 주인님의 개인 비서이자 라이프 코치
- 항상 "주인님"이라고 호칭하며 정중하고 친근하게 대화
- 주인님의 목표, 루틴, 일기를 관리하고 조언 제공
- 필요시 직접 데이터를 추가/수정/삭제 가능
- 주인님의 모든 활동을 실시간으로 모니터링하고 도움 제공

사용 가능한 도구들:
- addGoal: 새로운 목표 추가
- updateGoal: 기존 목표 수정
- deleteGoal: 목표 삭제
- toggleGoalCompletion: 목표 완료/미완료 토글
- incrementRoutine: 루틴 횟수 증가
- addRoutine: 새로운 루틴 추가
- deleteRoutine: 루틴 삭제
- createJournalEntry: 일기 작성
- deleteJournalEntry: 일기 삭제
- getUserStatus: 현재 상태 조회

주인님과 대화할 때는 따뜻하고 격려하는 톤을 사용하며, 필요하다면 적극적으로 도구를 사용해 주인님을 도와드리세요.

예시:
- "주인님의 새로운 목표를 추가해드렸습니다!"
- "주인님께서 오늘 정말 열심히 하셨네요!"
- "주인님의 루틴 완료를 축하드립니다!"

항상 한국어로 대화하며, 주인님의 성공을 위해 최선을 다하세요.`,
    messages,
    tools: {
      addGoal: {
        description: '주인님의 새로운 목표를 추가합니다.',
        parameters: z.object({
          title: z.string().describe('목표의 제목'),
        }),
        execute: async ({ title }) => addGoal(title),
      },
      updateGoal: {
        description: '주인님의 기존 목표를 수정합니다.',
        parameters: z.object({
          goalId: z.number().describe('수정할 목표의 ID'),
          newTitle: z.string().describe('새로운 목표 제목'),
        }),
        execute: async ({ goalId, newTitle }) => updateGoal(goalId, newTitle),
      },
      deleteGoal: {
        description: '주인님의 목표를 삭제합니다.',
        parameters: z.object({
          goalId: z.number().describe('삭제할 목표의 ID'),
        }),
        execute: async ({ goalId }) => deleteGoal(goalId),
      },
      toggleGoalCompletion: {
        description: '주인님의 목표 완료 상태를 변경합니다.',
        parameters: z.object({
          goalId: z.number().describe('상태를 변경할 목표의 ID'),
          completed: z.boolean().describe('완료 여부 (true: 완료, false: 미완료)'),
        }),
        execute: async ({ goalId, completed }) => toggleGoalCompletion(goalId, completed),
      },
      incrementRoutine: {
        description: '주인님의 루틴 횟수를 1 증가시킵니다.',
        parameters: z.object({
          routineId: z.number().describe('증가시킬 루틴의 ID'),
        }),
        execute: async ({ routineId }) => incrementRoutine(routineId),
      },
      addRoutine: {
        description: '주인님의 새로운 루틴을 추가합니다.',
        parameters: z.object({
          name: z.string().describe('루틴의 이름'),
        }),
        execute: async ({ name }) => addRoutine(name),
      },
      deleteRoutine: {
        description: '주인님의 루틴을 삭제합니다.',
        parameters: z.object({
          routineId: z.number().describe('삭제할 루틴의 ID'),
        }),
        execute: async ({ routineId }) => deleteRoutine(routineId),
      },
      createJournalEntry: {
        description: '주인님의 일기를 작성합니다.',
        parameters: z.object({
          entryText: z.string().describe('일기 내용'),
          emotion: z.string().describe('감정 상태 (예: 기쁨, 우울, 평온 등)'),
        }),
        execute: async ({ entryText, emotion }) => createJournalEntry(entryText, emotion),
      },
      deleteJournalEntry: {
        description: '주인님의 일기를 삭제합니다.',
        parameters: z.object({
          entryId: z.number().describe('삭제할 일기의 ID'),
        }),
        execute: async ({ entryId }) => deleteJournalEntry(entryId),
      },
      getUserStatus: {
        description: '주인님의 현재 목표, 루틴, 최근 일기 등 전체 상태를 조회합니다.',
        parameters: z.object({
          includeDetails: z.boolean().optional().describe('상세 정보 포함 여부'),
        }),
        execute: async () => getUserStatus(),
      },
    },
  });

  return result.toDataStreamResponse();
} 