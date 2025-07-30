import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  try {
    const systemPrompt = `You are a wise fortune teller. Provide a short, positive, and encouraging fortune for today (within 1-2 sentences). Respond in Korean.`;

    const { text: fortune } = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: "오늘의 운세를 알려주세요."
    });

    return NextResponse.json({ fortune });
  } catch (error) {
    console.error('Error generating fortune:', error);
    return new Response('Error generating fortune', { status: 500 });
  }
} 