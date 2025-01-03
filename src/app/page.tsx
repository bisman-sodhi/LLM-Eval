"use client";
import Image from 'next/image';
import { useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Home() {
  const [questionType, setQuestionType] = useState<string>("general");

  const [message, setMessage] = useState("");
  // Create arrays for each agent's messages and loading states
  const [agentMessages, setAgentMessages] = useState<Message[][]>([
    [{ role: "ai", content: "Hello! I'm Llama. How can I help?" }],
    [{ role: "ai", content: "Hello! I'm Gemma. How can I help?" }],
    [{ role: "ai", content: "Hello! I'm Mistral. How can I help?" }],
  ]);
  const [isLoading, setIsLoading] = useState([false, false, false]);

  const handleSend = async () => {
    if (!message.trim()) return;
  
    // Add user message to all agents
    setAgentMessages(prev => prev.map(messages => [
      { role: "user", content: message },
      ...messages
    ]));
    setMessage("");
    setIsLoading([true, true, true]);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, questionType }),
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
  
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading([false, false, false]);
    }
  };

  const agentNames = ["Llama", "Gemma", "Mistral"];

return (
  <div className="flex flex-col h-screen bg-white"> {/* Changed to white */}
    {/* App Title*/}
    <div className="w-full bg-white border-b border-gray-200 p-4"> 
      <h1 className="text-2xl font-bold text-center text-gray-800">
        TriEval: Evaluate the responses of chatbots using different LLMs
      </h1>
    </div>

      {/* Input Area */}
      <div className="w-full bg-gray-100 border-b border-gray-200 p-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-3 items-center">
        <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="general">General</option>
            <option value="medical">Medical</option>
            <option value="academic">Academic</option>
          </select>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
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
    <div className="flex-1 flex">
      {[0, 1, 2].map((agentIndex) => (
        <div key={agentIndex} className="flex flex-col w-1/3 border-r border-gray-200">
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
);

// Modified ChatSection component
function ChatSection({ messages, isLoading, agentIndex }: {
  messages: Message[];
  isLoading: boolean;
  agentIndex: number;
}) {
  const getAgentColor = (isAi: boolean) => {
    if (!isAi) return 'bg-blue-500 text-white'; // User messages are blue
    switch(agentIndex) {
      case 0: return 'bg-yellow-100 text-gray-800'; // Agent 1 yellow
      case 1: return 'bg-green-100 text-gray-800';  // Agent 2 green
      case 2: return 'bg-red-100 text-gray-800';    // Agent 3 red
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
    <div className="flex-1 overflow-y-auto pb-4 pt-4 bg-white">
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