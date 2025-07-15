import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, Settings } from 'lucide-react';

interface ECGDisplayProps {
  isRunning: boolean;
  heartRate: number;
  amplitude: number;
  noiseLevel: number;
  onHeartbeat: () => void;
}

export const ECGDisplay: React.FC<ECGDisplayProps> = ({
  isRunning,
  heartRate,
  amplitude,
  noiseLevel,
  onHeartbeat
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(heartRate);
  const [lastBeatTime, setLastBeatTime] = useState(0);

  const generateECGPoint = (t: number, heartRate: number): number => {
    const beatInterval = 60 / heartRate; // seconds per beat
    const phase = (t % beatInterval) / beatInterval * 2 * Math.PI;
    
    // QRS complex simulation
    let ecg = 0;
    if (phase > 1.5 && phase < 2.0) {
      ecg = 10 * Math.sin((phase - 1.5) * 20) * amplitude;
    } else if (phase > 2.0 && phase < 2.2) {
      ecg = -5 * Math.sin((phase - 2.0) * 30) * amplitude;
    } else if (phase > 2.2 && phase < 2.4) {
      ecg = 15 * Math.sin((phase - 2.2) * 25) * amplitude;
    } else {
      // P and T waves
      ecg = 2 * Math.sin(phase * 2) * amplitude + 1.5 * Math.sin(phase * 3) * amplitude;
    }
    
    // Add noise
    ecg += (Math.random() - 0.5) * noiseLevel * amplitude;
    
    return ecg;
  };

  const drawECGGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 0.5;
    
    // Major grid lines (5mm)
    const majorSpacing = 25;
    for (let x = 0; x <= width; x += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Minor grid lines (1mm)
    ctx.lineWidth = 0.2;
    const minorSpacing = 5;
    for (let x = 0; x <= width; x += minorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += minorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    
    let timeOffset = 0;

    const animate = () => {
      if (!isRunning) return;

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid
      drawECGGrid(ctx, width, height);
      
      // Draw ECG trace
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const samplesPerPixel = 0.01;
      let hasQRS = false;
      
      for (let x = 0; x < width; x++) {
        const t = timeOffset + x * samplesPerPixel;
        const ecgValue = generateECGPoint(t, heartRate);
        const y = centerY - ecgValue * 5;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        // Detect QRS complex for heartbeat sound
        if (Math.abs(ecgValue) > amplitude * 8 && !hasQRS) {
          hasQRS = true;
          const currentBeat = Date.now();
          if (currentBeat - lastBeatTime > 300) { // Debounce
            onHeartbeat();
            setLastBeatTime(currentBeat);
            
            // Calculate BPM
            if (lastBeatTime > 0) {
              const interval = (currentBeat - lastBeatTime) / 1000;
              const calculatedBpm = Math.round(60 / interval);
              if (calculatedBpm > 30 && calculatedBpm < 220) {
                setBpm(calculatedBpm);
              }
            }
          }
        }
      }
      
      ctx.stroke();
      
      // Update time
      timeOffset += 0.02;
      setCurrentTime(timeOffset);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, heartRate, amplitude, noiseLevel, onHeartbeat, lastBeatTime]);

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-white font-mono text-lg">Lead II ECG</h3>
          <div className="text-green-400 font-mono">
            <span className="text-sm">BPM: </span>
            <span className="text-xl font-bold">{bpm}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400 text-sm font-mono">
            {currentTime.toFixed(1)}s
          </span>
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full h-auto bg-slate-900 border border-slate-600 rounded"
      />
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-400">Amplitude</div>
          <div className="text-white font-mono">{amplitude.toFixed(1)}mV</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Rate</div>
          <div className="text-white font-mono">{heartRate} BPM</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Noise</div>
          <div className="text-white font-mono">{(noiseLevel * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
};