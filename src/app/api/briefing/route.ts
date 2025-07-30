import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getContext } from '@/lib/context';

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const context = await getContext(user.id);

    const systemPrompt = `You are Yof, a friendly and supportive AI life coach. Your user's name is 정윤수.
Today is ${new Date().toLocaleDateString('ko-KR')}.
Based on the user's current situation (goals, routines, journals), provide a warm and encouraging "Today's Briefing".
Keep it concise, under 3-4 sentences.
Always respond in Korean.

User's context:
${context}`;

    const { text: briefing } = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: "오늘의 브리핑을 작성해줘."
    });


    return NextResponse.json({ briefing });

  } catch (error) {
    console.error('Error generating briefing:', error);
    return new Response('Error generating briefing', { status: 500 });
  }
} 