import React from "react";

const prompts = [
  "“Let each heartbeat remind you: you are poetry in motion.”",
  "“In every rhythm, a new story unfolds.”",
  "“Breathe easy, for your heart is heard here.”"
];

const PoeticPrompt: React.FC = () => {
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  return (
    <div className="rounded-lg bg-blue-50 text-blue-700 p-3 mb-4 text-center font-medium italic shadow">
      {prompt}
    </div>
  );
};

export default PoeticPrompt;