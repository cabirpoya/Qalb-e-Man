import React from "react";
import BLEConnect from "./components/BLEConnect";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import PoeticPrompt from "./components/PoeticPrompt";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-100 font-poetic">
      <div className="max-w-3xl mx-auto p-4">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-pink-700 mb-2">Qalb-e-Man</h1>
          <p className="text-lg text-gray-600 italic">“Caring for your heart, physically and emotionally.”</p>
        </header>
        <PoeticPrompt />
        <BLEConnect />
        <Alerts />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;