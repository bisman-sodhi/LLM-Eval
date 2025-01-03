import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
// ... rest of the file remains the same ...
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// const questionType = "general";

export async function getGroqLLAMAResponse(message: string, questionType: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: `You are an expert in ${questionType} knowledge. Give factual answers.` },
    { role: "user", content: message },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
    });

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error(`Invalid response from Groq API: ${JSON.stringify(response)}`);
    }

    return response.choices[0]?.message.content || "No content received.";
  } catch (error) {
    console.error("Error while calling Groq API:", error);
    throw new Error("Failed to fetch Groq API response");
  }
}

export async function getGroqGemmaResponse(message: string, questionType: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: "system", content: `You are an chatbot answering ${questionType} questions. Give factual answers.` },
      { role: "user", content: message },
    ];
  
    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "gemma2-9b-it",
        messages,
      });
  
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error(`Invalid response from Groq API: ${JSON.stringify(response)}`);
      }
  
      return response.choices[0]?.message.content || "No content received.";
    } catch (error) {
      console.error("Error while calling Groq API:", error);
      throw new Error("Failed to fetch Groq API response");
    }
  }

  export async function getGroqMistralResponse(message: string, questionType: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: "system", content: `You are an chatbot answering ${questionType} questions. Give factual answers.` },
      { role: "user", content: message },
    ];
  
    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "mixtral-8x7b-32768",
        messages,
      });
  
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error(`Invalid response from Groq API: ${JSON.stringify(response)}`);
      }
  
      return response.choices[0]?.message.content || "No content received.";
    } catch (error) {
      console.error("Error while calling Groq API:", error);
      throw new Error("Failed to fetch Groq API response");
    }
  }





