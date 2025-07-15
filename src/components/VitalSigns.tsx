import React from 'react';
import { Heart, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface VitalSignsProps {
  bpm: number;
  systolic: number;
  diastolic: number;
  oxygenSaturation: number;
  temperature: number;
}

export const VitalSigns: React.FC<VitalSignsProps> = ({
  bpm,
  systolic,
  diastolic,
  oxygenSaturation,
  temperature
}) => {
  const getHeartRateStatus = (rate: number) => {
    if (rate < 60) return { status: 'Bradycardia', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    if (rate > 100) return { status: 'Tachycardia', color: 'text-red-400', bg: 'bg-red-900/20' };
    return { status: 'Normal', color: 'text-green-400', bg: 'bg-green-900/20' };
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys > 140 || dia > 90) return { status: 'Hypertension', color: 'text-red-400' };
    if (sys < 90 || dia < 60) return { status: 'Hypotension', color: 'text-yellow-400' };
    return { status: 'Normal', color: 'text-green-400' };
  };

  const hrStatus = getHeartRateStatus(bpm);
  const bpStatus = getBPStatus(systolic, diastolic);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Activity className="mr-2" size={20} />
        Vital Signs Monitor
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${hrStatus.bg} border-slate-600`}>
          <div className="flex items-center justify-between mb-2">
            <Heart className={`${hrStatus.color}`} size={20} />
            <span className={`text-xs font-medium ${hrStatus.color}`}>
              {hrStatus.status}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">{bpm}</div>
          <div className="text-sm text-gray-400">BPM</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className={`${bpStatus.color}`} size={20} />
            <span className={`text-xs font-medium ${bpStatus.color}`}>
              {bpStatus.status}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {systolic}/{diastolic}
          </div>
          <div className="text-sm text-gray-400">mmHg</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-5 h-5 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-green-400">Normal</span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">{oxygenSaturation}%</div>
          <div className="text-sm text-gray-400">SpO₂</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-5 h-5 rounded-full bg-red-500"></div>
            <span className="text-xs font-medium text-green-400">Normal</span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">{temperature.toFixed(1)}°</div>
          <div className="text-sm text-gray-400">°C</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
        <div className="flex items-center text-sm text-gray-300">
          <AlertTriangle size={16} className="mr-2 text-yellow-400" />
          <span>Monitor Status: </span>
          <span className="ml-1 text-green-400 font-medium">All systems operational</span>
        </div>
      </div>
    </div>
  );
};