import { NextResponse } from 'next/server';
import { llmJudge } from '@/app/util/llmClient';
import { getGroqResponse } from '@/app/util/llmClient';
import { feedScore, feedSpeed, feedExperiment } from '@/db/index';
export async function POST(req: Request) {
  try {
    const { systemPrompt, testQuestion, expectedAnswer } = await req.json();
    console.log('API received:', { systemPrompt, testQuestion, expectedAnswer });

    // Get responses from each model
    const [llamaResponse, gemmaResponse, mistralResponse] = await Promise.all([
        getGroqResponse("llama-3.3-70b-versatile", systemPrompt, testQuestion),
        getGroqResponse("gemma2-9b-it", systemPrompt, testQuestion),
        getGroqResponse("mixtral-8x7b-32768", systemPrompt, testQuestion)
    ]);
    
    console.log('Model responses:', { llamaResponse, gemmaResponse, mistralResponse });

    const judgeResponse = await llmJudge(
      testQuestion,
      expectedAnswer,
      [llamaResponse.content, gemmaResponse.content, mistralResponse.content]
    );
    console.log('Judge response:', judgeResponse.conclusion);

    feedScore(judgeResponse.scores[0], judgeResponse.scores[1], judgeResponse.scores[2], judgeResponse.conclusion);
    feedSpeed(llamaResponse.executionTime, gemmaResponse.executionTime, mistralResponse.executionTime);
    feedExperiment(systemPrompt, testQuestion, expectedAnswer);

    const response = {
      judgeResponse,
      executionTimes: {
        llama: 1.5,
        gemma: 1.2,
        mistral: 1.0
      }
    };
    console.log('Final API response:', response);
    return NextResponse.json({
        llamaResponse: llamaResponse.content, 
        gemmaResponse: gemmaResponse.content, 
        mistralResponse: mistralResponse.content, 
        judgeResponse,
        executionTimes: {
            llama: llamaResponse.executionTime,
            gemma: gemmaResponse.executionTime,
            mistral: mistralResponse.executionTime
        }
     });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}