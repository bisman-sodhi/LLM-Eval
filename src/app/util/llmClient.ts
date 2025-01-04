import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const geminiAPIKey: string = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiAPIKey);
const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// one function for all models
export async function getGroqResponse(model: string, systemPrompt: string, testQuestion: string): Promise<{ content: string, executionTime: number }> { 
    const startTime = performance.now();
    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: testQuestion },
        ],
      });

      const endTime = performance.now();
      const executionTime = Number(((endTime - startTime)/1000).toFixed(2));
      console.log(`Execution time: ${executionTime} seconds`);
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error(`Invalid response from Groq API: ${JSON.stringify(response)}`);
      }
  
      return {
        content: response.choices[0]?.message.content || "No content received.",
        executionTime
      };
    } catch (error) {
      console.error("Error while calling Groq API:", error);
      throw new Error("Failed to fetch Groq API response");
    }
  }

interface Scores {
    helpfulness: number;
    relevance: number;
    accuracy: number;
    depth: number;
    creativity: number;
    conciseness: number;
}

export async function llmJudge(testQuestion: string, expectedAnswer: string[]): Promise<{ f1Scores: number[] }> {
    const judge_prompt = `
                        You are an impartial judge evaluating AI responses. Compare these responses to the question: "${testQuestion}"

                        Avoid any position biases and ensure that the order in which the responses were presented does not influence your decision. 
                        Do not favor certain names of the assistants. 

                        For each response, rate on a scale of 1-10 for these criteria (provide only numbers, no explanations):
                        - Helpfulness: How well it addresses the user's needs
                        - Relevance: How closely it relates to the question
                        - Accuracy: How factually correct it is
                        - Depth: How thorough the explanation is
                        - Creativity: How innovative or insightful the response is
                        - Conciseness: How efficiently it communicates

                        First provide the numerical scores in this exact format for each response:
                        Response 1 scores:
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Response 2 scores:
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Response 3 scores:
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Responses to evaluate:
                        1: ${expectedAnswer[0]}
                        2: ${expectedAnswer[1]}
                        3: ${expectedAnswer[2]}

                        Provide a structured analysis and conclude which response is best.`;

    try {
        const result = await gemini.generateContent(judge_prompt);
        const response = await result.response;
        const text = response.text();

        // Parse scores from the response
        const scores: Scores[] = [];
        const responseLines = text.split('\n');
        
        let currentScores: Partial<Scores> = {};
        for (const line of responseLines) {
            if (line.includes(':')) {
                const [criterion, scoreStr] = line.split(':').map((s: string) => s.trim());
                const score = parseInt(scoreStr);
                if (!isNaN(score) && score >= 0 && score <= 10) {
                    currentScores[criterion.toLowerCase() as keyof Scores] = score;
                    if (Object.keys(currentScores).length === 6) {
                        scores.push(currentScores as Scores);
                        currentScores = {};
                    }
                }
            }
        }

        // Calculate F1 scores
        const f1Scores = scores.map(score => calculateF1Score(score));
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(f1Scores);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        return { f1Scores };
    } catch (error) {
        console.error("Error in LLM Judge:", error);
        throw new Error("Failed to get judge's evaluation");
    }
}

function calculateF1Score(scores: Scores): number {
    const { helpfulness, relevance, accuracy, depth, creativity, conciseness } = scores;
  
    // Precision-like criteria
    const precision = (relevance + accuracy) / 2;
  
    // Recall-like criteria
    const recall = (helpfulness + depth + creativity + conciseness) / 4;
  
    // F1 Score calculation
    const f1Score = (2 * precision * recall) / (precision + recall);
  
    return Number(f1Score.toFixed(2)) || 0; // Return rounded to 2 decimal places
}
