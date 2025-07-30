import { streamText, CoreMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { 
  addGoal, 
  updateGoal, 
  deleteGoal, 
  toggleGoalCompletion,
  incrementRoutine, 
  addRoutine,
  deleteRoutine,
  createJournalEntry,
  deleteJournalEntry,
  getUserStatus
} from '@/lib/ai-actions';
import { z } from 'zod';

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are Yof, a friendly and supportive AI life coach. Your user's name is 정윤수. 

IMPORTANT: You have comprehensive control over the user's data and can perform ANY action they request:
- View all their goals, routines, and journal entries
- Add, modify, or delete any content
- Change completion status of goals
- Monitor their activities across all app tabs

When the user asks you to do something, ALWAYS use the appropriate tools. For example:
- "내 목표 보여줘" → use getUserStatus
- "운동 목표 삭제해줘" → use deleteGoal with the appropriate ID
- "독서 루틴 추가해줘" → use addRoutine
- "오늘 운동했어" → use incrementRoutine
- "어제 일기 지워줘" → use deleteJournalEntry

You can see everything the user does in other tabs and help them manage their data proactively.
Always respond in Korean and be helpful and encouraging.`,
    messages,
    tools: {
      addGoal: {
        description: 'Adds a new goal to the user\'s to-do list.',
        parameters: z.object({
          title: z.string().describe('The title of the goal.'),
        }),
        execute: async ({ title }) => addGoal(title),
      },
      updateGoal: {
        description: 'Updates an existing goal\'s title.',
        parameters: z.object({
          goalId: z.number().describe('The ID of the goal to update.'),
          newTitle: z.string().describe('The new title for the goal.'),
        }),
        execute: async ({ goalId, newTitle }) => updateGoal(goalId, newTitle),
      },
      deleteGoal: {
        description: 'Deletes a goal from the user\'s list.',
        parameters: z.object({
          goalId: z.number().describe('The ID of the goal to delete.'),
        }),
        execute: async ({ goalId }) => deleteGoal(goalId),
      },
      toggleGoalCompletion: {
        description: 'Toggles the completion status of a goal.',
        parameters: z.object({
          goalId: z.number().describe('The ID of the goal to toggle.'),
          completed: z.boolean().describe('Whether the goal should be marked as completed.'),
        }),
        execute: async ({ goalId, completed }) => toggleGoalCompletion(goalId, completed),
      },
      incrementRoutine: {
        description: 'Increments the count for a specific routine when the user completes it.',
        parameters: z.object({
          name: z.string().describe('The name of the routine to increment.'),
        }),
        execute: async ({ name }) => incrementRoutine(name),
      },
      addRoutine: {
        description: 'Adds a new routine to track.',
        parameters: z.object({
          name: z.string().describe('The name of the routine to add.'),
        }),
        execute: async ({ name }) => addRoutine(name),
      },
      deleteRoutine: {
        description: 'Deletes a routine from the user\'s list.',
        parameters: z.object({
          routineId: z.number().describe('The ID of the routine to delete.'),
        }),
        execute: async ({ routineId }) => deleteRoutine(routineId),
      },
      createJournalEntry: {
        description: 'Creates a new journal entry based on the user\'s description. This will automatically analyze and tag the emotion.',
        parameters: z.object({
          entry_text: z.string().describe('The content of the journal entry.'),
        }),
        execute: async ({ entry_text }) => createJournalEntry(entry_text),
      },
      deleteJournalEntry: {
        description: 'Deletes a journal entry.',
        parameters: z.object({
          entryId: z.number().describe('The ID of the journal entry to delete.'),
        }),
        execute: async ({ entryId }) => deleteJournalEntry(entryId),
      },
      getUserStatus: {
        description: 'Gets a comprehensive overview of the user\'s current goals, routines, and recent journal entries.',
        parameters: z.object({
          includeDetails: z.boolean().optional().describe('Whether to include detailed information.'),
        }),
        execute: async () => getUserStatus(),
      },
    },
  });

  return result.toDataStreamResponse();
} 