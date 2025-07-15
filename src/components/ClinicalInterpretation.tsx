import React from 'react';
import { FileText, Brain, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { ECGInterpretation, ClinicalMeasurements, ArrhythmiaDetection } from '../types/medical';

interface ClinicalInterpretationProps {
  interpretation: ECGInterpretation | null;
  measurements: ClinicalMeasurements | null;
  currentArrhythmia: ArrhythmiaDetection | null;
  onGenerateReport: () => void;
}

export const ClinicalInterpretation: React.FC<ClinicalInterpretationProps> = ({
  interpretation,
  measurements,
  currentArrhythmia,
  onGenerateReport
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500';
      case 'stat': return 'text-orange-400 bg-orange-900/20 border-orange-500';
      case 'urgent': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'routine': return 'text-green-400 bg-green-900/20 border-green-500';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
  };

  const getIntervalStatus = (value: number, normal: { min: number; max: number }) => {
    if (value < normal.min) return { status: 'Short', color: 'text-yellow-400' };
    if (value > normal.max) return { status: 'Prolonged', color: 'text-red-400' };
    return { status: 'Normal', color: 'text-green-400' };
  };

  const normalRanges = {
    pr: { min: 120, max: 200 },
    qrs: { min: 60, max: 100 },
    qt: { min: 350, max: 450 },
    qtc: { min: 350, max: 440 }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Brain className="mr-2" size={20} />
          Clinical ECG Interpretation & Analysis
        </h2>
        <button
          onClick={onGenerateReport}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <FileText size={16} className="mr-2" />
          Generate Report
        </button>
      </div>

      {interpretation && (
        <div className={`p-4 rounded-lg border-2 mb-6 ${getUrgencyColor(interpretation.urgency)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {interpretation.urgency === 'critical' || interpretation.urgency === 'stat' ? (
                <AlertCircle className="mr-2 animate-pulse" size={20} />
              ) : (
                <CheckCircle className="mr-2" size={20} />
              )}
              <span className="font-bold text-lg uppercase">{interpretation.urgency} INTERPRETATION</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock size={16} className="mr-1" />
              {interpretation.timestamp.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">Primary Rhythm</h4>
              <p className="text-lg font-mono">{interpretation.rhythm}</p>
              <p className="text-sm opacity-80">Rate: {interpretation.rate} BPM</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Electrical Axis</h4>
              <p className="text-lg font-mono">{interpretation.axis}</p>
              <p className="text-sm opacity-80">Confidence: {(interpretation.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          {interpretation.morphology.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Morphological Findings</h4>
              <ul className="list-disc list-inside space-y-1">
                {interpretation.morphology.map((finding, index) => (
                  <li key={index} className="text-sm">{finding}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Clinical Correlation</h4>
            <p className="text-sm">{interpretation.clinicalCorrelation}</p>
          </div>

          {interpretation.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {measurements && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="mr-2" size={18} />
              Interval Measurements
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">PR Interval:</span>
                <div className="text-right">
                  <span className="text-white font-mono">{measurements.prInterval} ms</span>
                  <span className={`ml-2 text-xs ${getIntervalStatus(measurements.prInterval, normalRanges.pr).color}`}>
                    {getIntervalStatus(measurements.prInterval, normalRanges.pr).status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">QRS Width:</span>
                <div className="text-right">
                  <span className="text-white font-mono">{measurements.qrsWidth} ms</span>
                  <span className={`ml-2 text-xs ${getIntervalStatus(measurements.qrsWidth, normalRanges.qrs).color}`}>
                    {getIntervalStatus(measurements.qrsWidth, normalRanges.qrs).status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">QT Interval:</span>
                <div className="text-right">
                  <span className="text-white font-mono">{measurements.qtInterval} ms</span>
                  <span className={`ml-2 text-xs ${getIntervalStatus(measurements.qtInterval, normalRanges.qt).color}`}>
                    {getIntervalStatus(measurements.qtInterval, normalRanges.qt).status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">QTc (Corrected):</span>
                <div className="text-right">
                  <span className="text-white font-mono">{measurements.qtcInterval.toFixed(0)} ms</span>
                  <span className={`ml-2 text-xs ${getIntervalStatus(measurements.qtcInterval, normalRanges.qtc).color}`}>
                    {getIntervalStatus(measurements.qtcInterval, normalRanges.qtc).status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Electrical Axis:</span>
                <div className="text-right">
                  <span className="text-white font-mono">{measurements.axis.toFixed(0)}°</span>
                  <span className={`ml-2 text-xs ${
                    measurements.axis >= -30 && measurements.axis <= 90 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {measurements.axis >= -30 && measurements.axis <= 90 ? 'Normal' : 'Deviated'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-4">Morphological Analysis</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">R Wave Progression:</span>
                <span className={`font-mono ${measurements.rWaveProgression ? 'text-green-400' : 'text-yellow-400'}`}>
                  {measurements.rWaveProgression ? 'Normal' : 'Poor'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Pathological Q Waves:</span>
                <span className={`font-mono ${measurements.qWaves.some(q => q) ? 'text-red-400' : 'text-green-400'}`}>
                  {measurements.qWaves.some(q => q) ? 'Present' : 'Absent'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">T Wave Inversions:</span>
                <span className={`font-mono ${measurements.tWaveInversion.some(t => t) ? 'text-yellow-400' : 'text-green-400'}`}>
                  {measurements.tWaveInversion.some(t => t) ? 'Present' : 'Absent'}
                </span>
              </div>
              
              <div>
                <span className="text-gray-300 block mb-2">ST Segment Deviations:</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {measurements.stSegmentDeviation.slice(0, 12).map((deviation, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-400">
                        {['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'][index]}:
                      </span>
                      <span className={`font-mono ${
                        Math.abs(deviation) > 0.1 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentArrhythmia && currentArrhythmia.type !== 'normal' && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
            <AlertCircle className="mr-2 animate-pulse" size={18} />
            Active Arrhythmia Alert
          </h3>
          <p className="text-white mb-2">{currentArrhythmia.description}</p>
          <p className="text-red-300 text-sm mb-2">
            <strong>Clinical Significance:</strong> {currentArrhythmia.clinicalSignificance}
          </p>
          <p className="text-red-200 text-sm">
            <strong>Recommended Action:</strong> {currentArrhythmia.recommendedAction}
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Automated ECG Analysis System v3.2.1</span>
          <span>Last Analysis: {new Date().toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This automated interpretation is for clinical decision support only. 
          All ECGs should be reviewed by a qualified physician for final interpretation.
        </p>
      </div>
    </div>
  );
};