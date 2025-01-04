import { NextResponse } from "next/server"
import { getGroqResponse, llmJudge } from "@/app/util/llmClient";
// import { scrapeUrl, urlPattern } from "@/app/util/scraper";

export async function POST(req: Request) {
    const { testQuestion, systemPrompt } = await req.json();
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
        
        console.log(JSON.stringify({
            llamaResponse: llamaResponse.content, 
            gemmaResponse: gemmaResponse.content, 
            mistralResponse: mistralResponse.content, 
            judgeResponse,
            executionTimes: {
                llama: llamaResponse.executionTime,
                gemma: gemmaResponse.executionTime,
                mistral: mistralResponse.executionTime
            }
         }));

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