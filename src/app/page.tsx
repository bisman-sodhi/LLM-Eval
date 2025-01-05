"use client";
import Image from 'next/image';
import { useState, useEffect } from "react";
import Graphs from "./components/graphs";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Home() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testQuestion, setTestQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [agentMessages, setAgentMessages] = useState<Message[][]>([
    [{ role: "ai", content: "Hello! I'm Llama. How can I help?" }],
    [{ role: "ai", content: "Hello! I'm Gemma. How can I help?" }],
    [{ role: "ai", content: "Hello! I'm Mistral. How can I help?" }],
  ]);
  const [isLoading, setIsLoading] = useState([false, false, false]);
  const [scoreData, setScoreData] = useState<Array<{
    name: number;
    llamaScore: number;
    gemmaScore: number;
    mistralScore: number;
    conclusion: string;
    taskType: 'factual' | 'creative' | 'analytical';
  }>>([]);
  
  const [speedData, setSpeedData] = useState<Array<{
    name: number;
    llamaSpeed: number;
    gemmaSpeed: number;
    mistralSpeed: number;
  }>>([]);

  const handleSend = async () => {
    if (!testQuestion.trim()) return;
  
    const finalSystemPrompt = systemPrompt.trim() || "You are a helpful assistant";
    const finalExpectedAnswer = expectedAnswer.trim() || "";
    // Add user message to all agents
    setAgentMessages(prev => prev.map(messages => [
      { role: "user", content: testQuestion },
      ...messages
    ]));
    setSystemPrompt("");
    setTestQuestion("");
    setExpectedAnswer("");
    setIsLoading([true, true, true]);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          systemPrompt: finalSystemPrompt, 
          testQuestion, 
          expectedAnswer: finalExpectedAnswer 
        }),
      });

      const data = await response.json();

      // Map each response to the correct agent
      setAgentMessages(prev => prev.map((messages, idx) => [
        { 
          role: "ai", 
          content: idx === 0 ? data.llamaResponse : 
          idx === 1 ? data.gemmaResponse : 
          data.mistralResponse 
        },
        ...messages
      ]));
      
      // Update score data with new entry
      if (data?.judgeResponse?.scores) {
        setScoreData(prev => [...prev, {
          name: prev.length + 1,
          llamaScore: data.judgeResponse.scores[0],
          gemmaScore: data.judgeResponse.scores[1],
          mistralScore: data.judgeResponse.scores[2],
          conclusion: data.judgeResponse.conclusion,
          taskType: data.judgeResponse.taskType
        }]);
      }

      // Update speed data with new entry
      setSpeedData(prev => [...prev, {
        name: prev.length + 1,
        llamaSpeed: data.executionTimes.llama,
        gemmaSpeed: data.executionTimes.gemma,
        mistralSpeed: data.executionTimes.mistral
      }]);
            
  
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading([false, false, false]);
    }
  };

  const agentNames = ["Llama", "Gemma", "Mistral"];

return (
  <div className="flex flex-col min-h-screen bg-white">
    {/* App Title */}
    <div className="w-full bg-white border-b border-gray-200 p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        TriEval: Evaluate the chatbot responses generated by different LLMs
      </h1>
    </div>

    <div className="flex flex-1 relative">
      {/* Chat Section - 75% width */}
      <div className="w-3/4 overflow-y-auto">
        {/* Input Area */}
        <div className="w-full bg-gray-100 border-b border-gray-200 p-4 sticky top-0 z-10">
          {/* System Prompt */}
          <div className="max-w-6xl mx-auto mb-4">
              <div className="flex gap-3 items-center">
                  <input
                      type="text"
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      onKeyPress={e => e.key === "Enter" && handleSend()}
                      placeholder="Type your system prompt here... [optional]"
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  />
              </div>
          </div>

          {/* Test question */}
          <div className="max-w-6xl mx-auto mb-4">
              <div className="flex gap-3 items-center">
                  <input
                      type="text"
                      value={testQuestion}
                      onChange={e => setTestQuestion(e.target.value)}
                      onKeyPress={e => e.key === "Enter" && handleSend()}
                      placeholder="Type your question here..."
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  />
              </div>
          </div>

          {/* Expected answer */}
          <div className="max-w-6xl mx-auto">
              <div className="flex gap-3 items-center">
                  <input
                      type="text"
                      value={expectedAnswer}
                      onChange={e => setExpectedAnswer(e.target.value)}
                      onKeyPress={e => e.key === "Enter" && handleSend()}
                      placeholder="Type your expected answer here... [optional]"
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  />
                  <button
                      onClick={handleSend}
                      disabled={isLoading.some(Boolean)}
                      className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                      {isLoading.some(Boolean) ? "Sending..." : "Send"}
                  </button>
              </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex divide-x divide-gray-200 min-h-screen">
          {[0, 1, 2].map((agentIndex) => (
            <div key={agentIndex} className="flex-1 flex flex-col min-h-full">
              <div className="bg-gray-100 border-b border-gray-200 p-4">
                <h1 className="text-xl font-semibold text-gray-800">{agentNames[agentIndex]}</h1>
              </div>
              <ChatSection 
                messages={agentMessages[agentIndex]}
                isLoading={isLoading[agentIndex]}
                agentIndex={agentIndex}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Graphs Section - 25% width */}
      <div className="w-1/4 fixed right-0 top-0 bottom-0 bg-white border-l border-gray-200" 
           style={{ marginTop: '73px' }}>
        <div className="h-full overflow-y-auto bg-white">
          <Graphs scoreData={scoreData} speedData={speedData} />
        </div>
      </div>
    </div>
  </div>
);

// ChatSection component
function ChatSection({ messages, isLoading, agentIndex }: {
  messages: Message[];
  isLoading: boolean;
  agentIndex: number;
}) {
  const getAgentColor = (isAi: boolean) => {
    if (!isAi) return 'bg-blue-500 text-white'; // User messages are blue
    switch(agentIndex) {
      case 0: return 'bg-yellow-100 text-gray-800'; // Llama is yellow
      case 1: return 'bg-green-100 text-gray-800';  // Gemma is green
      case 2: return 'bg-red-100 text-gray-800';    // Mistral is red
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getAgentIcon = (agentIndex: number) => {
    switch(agentIndex) {
      case 0: return '/llama.png';
      case 1: return '/gemma.png';
      case 2: return '/mistral.png';
      default: return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 pt-4 bg-white h-full">
      <div className="px-4">
        {isLoading && (
          <div className="flex gap-4 mb-4">
            <div className="w-8 h-8 flex-shrink-0">
              <Image
                src={getAgentIcon(agentIndex)}
                alt={agentNames[agentIndex]}
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className={`px-4 py-2 rounded-2xl ${getAgentColor(true)}`}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 mb-4 ${
              msg.role === "ai" ? "justify-start" : "justify-end"
            }`}
          >
            {msg.role === "ai" && (
              <div className="w-8 h-8 flex-shrink-0">
                <Image
                  src={getAgentIcon(agentIndex)}
                  alt={agentNames[agentIndex]}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-2xl max-w-[80%] ${getAgentColor(msg.role === "ai")}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
}