import React from 'react';
import { AlertTriangle, Heart, Activity, Clock, Bell } from 'lucide-react';
import { ArrhythmiaDetection } from '../types/medical';

interface ArrhythmiaAlertsProps {
  currentArrhythmia: ArrhythmiaDetection | null;
  alertHistory: ArrhythmiaDetection[];
  onClearAlerts: () => void;
}

export const ArrhythmiaAlerts: React.FC<ArrhythmiaAlertsProps> = ({
  currentArrhythmia,
  alertHistory,
  onClearAlerts
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
  };

  const getArrhythmiaIcon = (type: string) => {
    switch (type) {
      case 'tachycardia':
      case 'vtach':
        return <Heart className="animate-pulse" size={20} />;
      case 'bradycardia':
        return <Heart size={20} />;
      case 'afib':
        return <Activity size={20} />;
      case 'pvcs':
        return <Activity size={20} />;
      default:
        return <Heart size={20} />;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Bell className="mr-2" size={20} />
          Arrhythmia Detection & Alerts
        </h2>
        <button
          onClick={onClearAlerts}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
        >
          Clear History
        </button>
      </div>

      {/* Current Alert */}
      {currentArrhythmia && (
        <div className={`p-4 rounded-lg border-2 mb-6 ${getSeverityColor(currentArrhythmia.severity)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {getArrhythmiaIcon(currentArrhythmia.type)}
              <span className="ml-2 font-semibold text-lg uppercase">
                {currentArrhythmia.type.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Clock size={16} className="mr-1" />
              {currentArrhythmia.timestamp.toLocaleTimeString()}
            </div>
          </div>
          <p className="text-sm opacity-90">{currentArrhythmia.description}</p>
          {currentArrhythmia.severity === 'critical' && (
            <div className="mt-2 p-2 bg-red-800/30 rounded border border-red-600">
              <div className="flex items-center text-red-300 text-sm font-medium">
                <AlertTriangle size={16} className="mr-1 animate-pulse" />
                CRITICAL ALERT - Immediate medical attention required
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alert History */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Recent Alerts</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {alertHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity size={48} className="mx-auto mb-2 opacity-50" />
              <p>No alerts recorded</p>
            </div>
          ) : (
            alertHistory.slice(-10).reverse().map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${getSeverityColor(alert.severity)} opacity-75`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getArrhythmiaIcon(alert.type)}
                    <span className="ml-2 font-medium">
                      {alert.type.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <span className="text-xs">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-80">{alert.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-white">
            {alertHistory.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-xs text-red-400">Critical</div>
        </div>
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-white">
            {alertHistory.filter(a => a.severity === 'high').length}
          </div>
          <div className="text-xs text-orange-400">High</div>
        </div>
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-white">
            {alertHistory.filter(a => a.severity === 'medium').length}
          </div>
          <div className="text-xs text-yellow-400">Medium</div>
        </div>
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-white">
            {alertHistory.filter(a => a.type === 'normal').length}
          </div>
          <div className="text-xs text-green-400">Normal</div>
        </div>
      </div>
    </div>
  );
};