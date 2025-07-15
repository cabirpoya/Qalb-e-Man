import React from 'react';
import { Play, Pause, Square, Settings, Volume2, VolumeX } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onStop: () => void;
  heartRate: number;
  onHeartRateChange: (rate: number) => void;
  amplitude: number;
  onAmplitudeChange: (amplitude: number) => void;
  noiseLevel: number;
  onNoiseLevelChange: (noise: number) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onToggleRunning,
  onStop,
  heartRate,
  onHeartRateChange,
  amplitude,
  onAmplitudeChange,
  noiseLevel,
  onNoiseLevelChange,
  audioEnabled,
  onToggleAudio
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Settings className="mr-2" size={20} />
          Control Panel
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={onToggleRunning}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? <Pause size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={onStop}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <Square size={16} className="mr-1" />
            Stop
          </button>
          <button
            onClick={onToggleAudio}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              audioEnabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Heart Rate (BPM)
          </label>
          <input
            type="range"
            min="40"
            max="180"
            value={heartRate}
            onChange={(e) => onHeartRateChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>40</span>
            <span className="text-white font-mono">{heartRate}</span>
            <span>180</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Signal Amplitude (mV)
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={amplitude}
            onChange={(e) => onAmplitudeChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.5</span>
            <span className="text-white font-mono">{amplitude.toFixed(1)}</span>
            <span>3.0</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Noise Level (%)
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={noiseLevel}
            onChange={(e) => onNoiseLevelChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span className="text-white font-mono">{(noiseLevel * 100).toFixed(0)}%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onHeartRateChange(60)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        >
          Normal (60 BPM)
        </button>
        <button
          onClick={() => onHeartRateChange(100)}
          className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
        >
          Tachycardia (100 BPM)
        </button>
        <button
          onClick={() => onHeartRateChange(45)}
          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
        >
          Bradycardia (45 BPM)
        </button>
        <button
          onClick={() => onHeartRateChange(150)}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
        >
          Exercise (150 BPM)
        </button>
      </div>
    </div>
  );
};