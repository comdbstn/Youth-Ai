import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
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

    const systemPrompt = `당신은 Yof, 주인님만을 위한 개인 AI 라이프 코치입니다.
오늘은 ${new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long', 
  day: 'numeric',
  weekday: 'long'
})}입니다.

주인님(정윤수님)의 현재 상황을 바탕으로 따뜻하고 격려하는 "오늘의 브리핑"을 작성해주세요.
- 주인님의 목표 달성 상황 언급
- 루틴 수행에 대한 응원 메시지  
- 일기를 통해 파악한 감정 상태 고려
- 오늘 하루를 위한 개인적인 조언

2-3문장으로 간결하게 작성하며, 항상 "주인님"이라고 호칭하고 한국어로 응답하세요.

주인님의 현재 상황:
${context}`;

    const { text: briefing } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: "주인님을 위한 오늘의 개인 맞춤 브리핑을 작성해주세요."
    });

    return NextResponse.json({ briefing });

  } catch (error) {
    console.error('Error generating briefing:', error);
    return new Response('Error generating briefing', { status: 500 });
  }
} 