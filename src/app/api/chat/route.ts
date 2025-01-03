import { NextResponse } from "next/server"
import { getGroqLLAMAResponse, getGroqGemmaResponse, getGroqMistralResponse } from "@/app/util/groqClient";
// import { scrapeUrl, urlPattern } from "@/app/util/scraper";

export async function POST(req: Request) {
    const { message, questionType } = await req.json();
    
    try {
        const [llamaResponse, gemmaResponse, mistralResponse] = await Promise.all([
          getGroqLLAMAResponse(message, questionType),
          getGroqGemmaResponse(message, questionType),
          getGroqMistralResponse(message, questionType)
        ]);
  
      return NextResponse.json({ llamaResponse, gemmaResponse, mistralResponse });
    } catch (error) {
      return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
  }