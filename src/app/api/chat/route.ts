import { NextResponse } from "next/server"
import { getGroqResponse, llmJudge } from "@/app/util/llmClient";
import { feedScore, feedSpeed, feedExperiment } from "@/db/index";

export const judgeResponse = [];
export const executionTimes = [];

export async function POST(req: Request) {
    const { systemPrompt, testQuestion, expectedAnswer } = await req.json();
    try {
        const [llamaResponse, gemmaResponse, mistralResponse] = await Promise.all([
            getGroqResponse("llama-3.3-70b-versatile", systemPrompt, testQuestion),
            getGroqResponse("gemma2-9b-it", systemPrompt, testQuestion),
            getGroqResponse("mixtral-8x7b-32768", systemPrompt, testQuestion)
        ]);
        const judgeResponse = await llmJudge(testQuestion, [
            llamaResponse.content, 
            gemmaResponse.content, 
            mistralResponse.content]);
        
        feedScore(judgeResponse.f1Scores[0], judgeResponse.f1Scores[1], judgeResponse.f1Scores[2]);
        feedSpeed(llamaResponse.executionTime, gemmaResponse.executionTime, mistralResponse.executionTime);
        feedExperiment(systemPrompt, testQuestion, expectedAnswer);

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
      return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
  }