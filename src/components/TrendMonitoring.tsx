import React, { useRef, useEffect } from 'react';
import { TrendingUp, BarChart3, Activity, Clock } from 'lucide-react';
import { TrendData } from '../types/medical';

interface TrendMonitoringProps {
  trendData: TrendData[];
  timeWindow: number; // hours
  onTimeWindowChange: (hours: number) => void;
}

export const TrendMonitoring: React.FC<TrendMonitoringProps> = ({
  trendData,
  timeWindow,
  onTimeWindowChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawTrendChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || trendData.length === 0) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (time)
    for (let x = 0; x <= width; x += width / 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += height / 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    if (trendData.length < 2) return;
    
    // Filter data for time window
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow * 60 * 60 * 1000);
    const filteredData = trendData.filter(d => d.timestamp >= windowStart);
    
    if (filteredData.length < 2) return;
    
    // Draw heart rate trend
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const hrMin = Math.min(...filteredData.map(d => d.heartRate));
    const hrMax = Math.max(...filteredData.map(d => d.heartRate));
    const hrRange = hrMax - hrMin || 1;
    
    filteredData.forEach((data, index) => {
      const x = (index / (filteredData.length - 1)) * width;
      const y = height - ((data.heartRate - hrMin) / hrRange) * height * 0.8 - height * 0.1;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw ST segment trend
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const stMin = Math.min(...filteredData.map(d => d.stSegment));
    const stMax = Math.max(...filteredData.map(d => d.stSegment));
    const stRange = stMax - stMin || 1;
    
    filteredData.forEach((data, index) => {
      const x = (index / (filteredData.length - 1)) * width;
      const y = height - ((data.stSegment - stMin) / stRange) * height * 0.3 - height * 0.05;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw oxygen saturation trend
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    filteredData.forEach((data, index) => {
      const x = (index / (filteredData.length - 1)) * width;
      const y = height - ((data.oxygenSaturation - 90) / 10) * height * 0.3 - height * 0.65;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('HR', 10, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`${filteredData[filteredData.length - 1]?.heartRate || 0} BPM`, 35, 20);
    
    ctx.fillStyle = '#22c55e';
    ctx.fillText('ST', 10, 40);
    ctx.fillText(`${(filteredData[filteredData.length - 1]?.stSegment || 0).toFixed(2)} mV`, 35, 40);
    
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('SpO₂', 10, 60);
    ctx.fillText(`${filteredData[filteredData.length - 1]?.oxygenSaturation || 0}%`, 50, 60);
  };

  useEffect(() => {
    drawTrendChart();
  }, [trendData, timeWindow]);

  const calculateTrendStats = () => {
    if (trendData.length === 0) return null;
    
    const recent = trendData.slice(-10);
    const avgHR = recent.reduce((sum, d) => sum + d.heartRate, 0) / recent.length;
    const avgST = recent.reduce((sum, d) => sum + d.stSegment, 0) / recent.length;
    const avgSpO2 = recent.reduce((sum, d) => sum + d.oxygenSaturation, 0) / recent.length;
    const arrhythmiaRate = recent.reduce((sum, d) => sum + d.arrhythmiaCount, 0) / recent.length;
    
    return { avgHR, avgST, avgSpO2, arrhythmiaRate };
  };

  const stats = calculateTrendStats();

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <TrendingUp className="mr-2" size={20} />
          Trend Monitoring & Analytics
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-400" />
            <select
              value={timeWindow}
              onChange={(e) => onTimeWindowChange(Number(e.target.value))}
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              <option value={1}>1 Hour</option>
              <option value={4}>4 Hours</option>
              <option value={8}>8 Hours</option>
              <option value={24}>24 Hours</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-medium text-white mb-4">Multi-Parameter Trends</h3>
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full h-auto border border-slate-600 rounded"
            />
            <div className="mt-4 flex justify-between text-sm text-gray-400">
              <span>-{timeWindow}h</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <BarChart3 className="mr-2" size={18} />
              Trend Statistics
            </h3>
            
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Heart Rate:</span>
                  <span className="text-red-400 font-mono">{stats.avgHR.toFixed(0)} BPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg ST Segment:</span>
                  <span className="text-green-400 font-mono">{stats.avgST.toFixed(2)} mV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg SpO₂:</span>
                  <span className="text-blue-400 font-mono">{stats.avgSpO2.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Arrhythmia Rate:</span>
                  <span className="text-yellow-400 font-mono">{stats.arrhythmiaRate.toFixed(1)}/hr</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No trend data available</p>
            )}
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-medium text-white mb-4">Trend Alerts</h3>
            
            <div className="space-y-2">
              {stats && stats.avgHR > 100 && (
                <div className="p-2 bg-red-900/20 border border-red-500 rounded text-red-300 text-sm">
                  Sustained tachycardia trend detected
                </div>
              )}
              {stats && Math.abs(stats.avgST) > 0.1 && (
                <div className="p-2 bg-yellow-900/20 border border-yellow-500 rounded text-yellow-300 text-sm">
                  ST segment deviation trend
                </div>
              )}
              {stats && stats.avgSpO2 < 95 && (
                <div className="p-2 bg-orange-900/20 border border-orange-500 rounded text-orange-300 text-sm">
                  Oxygen saturation declining
                </div>
              )}
              {stats && stats.arrhythmiaRate > 5 && (
                <div className="p-2 bg-purple-900/20 border border-purple-500 rounded text-purple-300 text-sm">
                  Increased arrhythmia frequency
                </div>
              )}
              {(!stats || (stats.avgHR <= 100 && Math.abs(stats.avgST) <= 0.1 && stats.avgSpO2 >= 95 && stats.arrhythmiaRate <= 5)) && (
                <div className="p-2 bg-green-900/20 border border-green-500 rounded text-green-300 text-sm">
                  All trends within normal limits
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-medium text-white mb-4">Data Points</h3>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-white">{trendData.length}</div>
              <div className="text-sm text-gray-400">Total recordings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};