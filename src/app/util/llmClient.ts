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
    closeness: number;
    helpfulness: number;
    relevance: number;
    accuracy: number;
    depth: number;
    creativity: number;
    conciseness: number;
}

function calculateF1Score(scores: Scores): number {
  // Validate that all required scores are present
  const requiredScores = ['closeness', 'helpfulness', 'relevance', 'accuracy', 'depth', 'creativity', 'conciseness'];
  
  const missingScores = requiredScores.filter(score => !(score in scores));
  if (missingScores.length > 0) {
      console.error('Missing scores:', missingScores);
      return 0;
  }

  const { closeness, helpfulness, relevance, accuracy, depth, creativity, conciseness } = scores;
  
  // Log all scores before calculation
  console.log('Processing complete score set:', {
      closeness, helpfulness, relevance, accuracy, depth, creativity, conciseness
  });

  // Precision calculation
  const precision = (relevance + accuracy + closeness) / 3;
  console.log('Precision:', precision);

  // Recall calculation
  const recall = (helpfulness + depth + creativity + conciseness) / 4;
  console.log('Recall:', recall);

  // F1 Score calculation
  if (precision + recall === 0) return 0;
  const f1Score = (2 * precision * recall) / (precision + recall);
  
  return Number(f1Score.toFixed(2));
}

export async function llmJudge(testQuestion: string, expectedAnswer: string, chatbotResponses: string[]): Promise<{conclusion: string, f1Scores: number[] }> {
    const judge_prompt = `
                        You are an impartial judge evaluating AI responses. Compare these three responses to the question: 
                        Question: "${testQuestion}"
                        ${expectedAnswer ? `Expected Answer: "${expectedAnswer}"` : "Note: No specific expected answer is provided for this question."}

                        Avoid any position biases and ensure that the order in which the responses are presented does not influence your decision. 
                        Do not favor certain names of the assistants.
                        
                        Please evaluate these responses based on the following criteria (rate 1-10):
                        - Closeness: How well it matches the expected answer (if no expected answer is provided, evaluate based on general accuracy and appropriateness).
                        - Helpfulness: How effectively it addresses the user's needs
                        - Relevance: How directly it answers the question
                        - Accuracy: Factual correctness and precision
                        - Depth: Thoroughness and level of detail
                        - Creativity: Innovative thinking and unique insights
                        - Conciseness: Efficiency and clarity of communication

                        Provide:
                        1. The numerical scores in this exact format for each response:
                        Response 1 scores:
                        Closeness: [number]
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Response 2 scores:
                        Closeness: [number]
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Response 3 scores:
                        Closeness: [number]
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Responses to evaluate:
                        1: ${chatbotResponses[0]}
                        2: ${chatbotResponses[1]}
                        3: ${chatbotResponses[2]}

                        2. A brief but detailed conclusion comparing the responses, highlighting:
                        - Which model performed best overall and why
                        - Key strengths and weaknesses of each response
                        - Specific examples from the responses to support your evaluation
                        
                        Format the conclusion as: "Conclusion: [your analysis]"

                        `;

    try {
        const result = await gemini.generateContent(judge_prompt);
        const response = await result.response;
        const text = response.text();

        // Parse scores from the response
        const scores: Scores[] = [];
        const responseLines = text.split('\n');
        
        let currentScores: Partial<Scores> = {};
        let currentResponseScores: Partial<Scores> | null = null;

        for (const line of responseLines) {
          if (line.toLowerCase().includes('response') && line.includes('scores:')) {
              if (currentResponseScores && Object.keys(currentResponseScores).length > 0) {
                  scores.push(currentResponseScores as Scores);
              }
              currentResponseScores = {};
              continue;
          }
  
          if (currentResponseScores && line.includes(':')) {
              const [criterion, scoreStr] = line.split(':').map((s: string) => s.trim());
              const cleanedScoreStr = scoreStr.replace(/[^\d.]/g, '');
              const score = parseFloat(cleanedScoreStr);
  
              if (!isNaN(score) && score >= 0 && score <= 10) {
                  const key = criterion.toLowerCase() as keyof Scores;
                  currentResponseScores[key] = score;
              }
          }
      }
  
      // Don't forget to add the last set of scores
      if (currentResponseScores && Object.keys(currentResponseScores).length > 0) {
          scores.push(currentResponseScores as Scores);
      }
  
      console.log('Parsed score sets:', scores);
  
      // Calculate F1 scores
      const f1Scores = scores.map((scoreSet, index) => {
          console.log(`Calculating F1 score for response ${index + 1}:`, scoreSet);
          return calculateF1Score(scoreSet);
      });
        const conclusionMatch = text.match(/conclusion:([^]*?)(?=\n\n|$)/i);
        const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "No conclusion provided";
        // Validate results
        if (f1Scores.length !== 3) {
          throw new Error("Failed to calculate scores for all responses");
        }

        if (!conclusion) {
          throw new Error("Failed to extract conclusion from response");
        }
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(f1Scores);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(conclusion);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        return { conclusion, f1Scores };
    } catch (error) {
        console.error("Error in LLM Judge:", error);
        throw new Error("Failed to get judge's evaluation");
    }
}


