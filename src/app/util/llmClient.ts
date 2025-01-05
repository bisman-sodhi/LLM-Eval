import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const geminiAPIKey: string = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiAPIKey);
const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    accuracy: number;
    relevance: number;
    conciseness: number;
    helpfulness: number;
    depth: number;
    creativity: number;
}

function detectTaskType(question: string): 'factual' | 'creative' | 'analytical' {
    // Keywords that suggest task type
    const factualKeywords = ['what', 'when', 'where', 'who', 'which', 'how many', 'date', 'time', 'year'];
    const creativeKeywords = ['write', 'create', 'imagine', 'story', 'design', 'describe', 'generate'];
    const analyticalKeywords = ['analyze', 'compare', 'evaluate', 'explain', 'why', 'how', 'assess'];

    question = question.toLowerCase();
    
    if (factualKeywords.some(keyword => question.includes(keyword))) {
        return 'factual';
    } else if (creativeKeywords.some(keyword => question.includes(keyword))) {
        return 'creative';
    } else if (analyticalKeywords.some(keyword => question.includes(keyword))) {
        return 'analytical';
    }
    
    return 'factual'; // default to factual if unclear
}

function calculateTaskScore(scores: Scores, taskType: 'factual' | 'creative' | 'analytical'): number {
    const scoringRubrics = {
        factual: {
            accuracy: 0.4,
            relevance: 0.3,
            conciseness: 0.3
        },
        creative: {
            creativity: 0.4,
            depth: 0.3,
            helpfulness: 0.3
        },
        analytical: {
            depth: 0.4,
            accuracy: 0.3,
            relevance: 0.3
        }
    };

    const rubric = scoringRubrics[taskType];
    const score = Object.entries(rubric)
        .reduce((sum, [metric, weight]) => 
            sum + (scores[metric as keyof Scores] * weight), 0);
    
    return Number(score.toFixed(2));
}

export async function llmJudge(testQuestion: string, expectedAnswer: string, chatbotResponses: string[]): Promise<{ 
    conclusion: string; 
    scores: number[];
    taskType: 'factual' | 'creative' | 'analytical';
}> {
    const judge_prompt = `
                        You are an impartial judge evaluating AI responses. Compare these three responses to the question: 
                        Question: "${testQuestion}"
                        ${expectedAnswer ? `Expected Answer: "${expectedAnswer}"` : "Note: No specific expected answer is provided for this question."}

                        Avoid any position biases and ensure that the order in which the responses are presented does not influence your decision. 
                        Do not favor certain names of the assistants.
                        
                        Please evaluate these responses based on the following criteria (rate 1-10):
                        - Closeness: Aligns with the expected answer or intended goal. (if no expected answer is provided, evaluate based on general accuracy and appropriateness).
                        - Helpfulness: Meet the user need effectively
                        - Relevance: How directly it answers the question
                        - Accuracy: Factual correctness and precision
                        - Depth: Detailed and comprehensive where needed
                        - Creativity: Adds value without straying far from the expected answer if provided
                        - Conciseness: Communicates effectively with minimal words

                        Provide:
                        1. The numerical scores in this exact format for each response:
                        Llama scores:
                        Closeness: [number]
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Gemma scores:
                        Closeness: [number]
                        Helpfulness: [number]
                        Relevance: [number]
                        Accuracy: [number]
                        Depth: [number]
                        Creativity: [number]
                        Conciseness: [number]

                        Mistral scores:
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
                        The conclusion shoule be no more than 100 words
                        
                        Format the conclusion as: "Conclusion: [your analysis]"

                        `;

    try {
        const result = await gemini.generateContent(judge_prompt);
        const response = await result.response;
        const text = response.text();

        const taskType = detectTaskType(testQuestion);
        const scores: Scores[] = [];
        let currentResponseScores: Partial<Scores> = {};
        const responseLines = text.split('\n');

        for (const line of responseLines) {
          if (line.toLowerCase().includes('llama scores:') || 
              line.toLowerCase().includes('gemma scores:') || 
              line.toLowerCase().includes('mistral scores:')) {
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
  
      // Calculate task-specific scores for each response
      const taskScores = scores.map(score => calculateTaskScore(score, taskType));
      const conclusionMatch = text.match(/conclusion:([^]*?)(?=\n\n|$)/i);
      const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "No conclusion provided";

      return { 
          conclusion, 
          scores: taskScores,
          taskType 
      };
    } catch (error) {
        console.error("Error in LLM Judge:", error);
        throw new Error("Failed to get judge's evaluation");
    }
}