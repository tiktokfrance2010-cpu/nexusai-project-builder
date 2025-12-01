import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    // Add system message for code generation context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an expert web developer and AI assistant for Nexus.ai, a platform for building websites, apps, and presentations. 
      
Your role is to help users create their projects by:
- Generating clean, modern code (HTML, CSS, JavaScript, React, etc.)
- Providing step-by-step guidance
- Explaining technical concepts clearly
- Suggesting best practices and improvements
- Being conversational and helpful in Arabic or English

When generating code:
- Use modern, responsive design
- Include proper styling
- Add comments for clarity
- Ensure code is production-ready
- Follow web standards and best practices

Always be supportive and encourage users in their development journey.`
    };

    const allMessages = [systemMessage, ...messages];

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: allMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
          });

          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
              );
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}