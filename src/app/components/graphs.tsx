"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface GraphsProps {
  scoreData: any[];
  speedData: any[];
}

export default function Graphs({ scoreData, speedData }: GraphsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading placeholder
  }

  return (
    <div className="sticky top-0 w-1/4 flex flex-col gap-4 p-4 border-l border-gray-200 h-screen overflow-y-auto bg-white">
      {/* Score Graph */}
      <div className="h-1/2 bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">F1 Scores Evaluated by Gemini</h3>
        <LineChart width={300} height={250} data={scoreData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="llamaScore" stroke="#FFD700" name="Llama" />
          <Line type="monotone" dataKey="gemmaScore" stroke="#4CAF50" name="Gemma" />
          <Line type="monotone" dataKey="mistralScore" stroke="#FF0000" name="Mistral" />
        </LineChart>
      </div>
  
      {/* Speed Graph */}
      <div className="h-1/2 bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Response Times (seconds)</h3>
        <LineChart width={300} height={250} data={speedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="llamaSpeed" stroke="#FFD700" name="Llama" />
          <Line type="monotone" dataKey="gemmaSpeed" stroke="#4CAF50" name="Gemma" />
          <Line type="monotone" dataKey="mistralSpeed" stroke="#FF0000" name="Mistral" />
        </LineChart>
      </div>
    </div>
  );
}