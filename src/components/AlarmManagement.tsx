import React, { useState } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AlarmEvent, ECGSettings } from '../types/medical';

interface AlarmManagementProps {
  alarms: AlarmEvent[];
  alarmSettings: ECGSettings['alarmLimits'];
  onAlarmAcknowledge: (alarmId: string, acknowledgedBy: string) => void;
  onAlarmSettingsChange: (settings: ECGSettings['alarmLimits']) => void;
  onClearAllAlarms: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const AlarmManagement: React.FC<AlarmManagementProps> = ({
  alarms,
  alarmSettings,
  onAlarmAcknowledge,
  onAlarmSettingsChange,
  onClearAllAlarms,
  audioEnabled,
  onToggleAudio
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [acknowledgedBy, setAcknowledgedBy] = useState('Dr. Smith');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/30 border-red-500 text-red-300';
      case 'high': return 'bg-orange-900/30 border-orange-500 text-orange-300';
      case 'medium': return 'bg-yellow-900/30 border-yellow-500 text-yellow-300';
      case 'low': return 'bg-blue-900/30 border-blue-500 text-blue-300';
      default: return 'bg-gray-900/30 border-gray-500 text-gray-300';
    }
  };

  const getAlarmIcon = (type: string) => {
    switch (type) {
      case 'arrhythmia': return <Activity size={16} />;
      case 'vital_sign': return <Bell size={16} />;
      case 'technical': return <Settings size={16} />;
      case 'lead_off': return <AlertTriangle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const activeAlarms = alarms.filter(alarm => !alarm.acknowledged);
  const acknowledgedAlarms = alarms.filter(alarm => alarm.acknowledged);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Bell className="mr-2" size={20} />
          Alarm Management System
          {activeAlarms.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
              {activeAlarms.length}
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-lg transition-colors ${
              audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Settings size={16} />
          </button>
          
          <button
            onClick={onClearAllAlarms}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
          <h3 className="text-lg font-medium text-white mb-4">Alarm Limits Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heart Rate High (BPM)
              </label>
              <input
                type="number"
                value={alarmSettings.heartRateHigh}
                onChange={(e) => onAlarmSettingsChange({
                  ...alarmSettings,
                  heartRateHigh: Number(e.target.value)
                })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heart Rate Low (BPM)
              </label>
              <input
                type="number"
                value={alarmSettings.heartRateLow}
                onChange={(e) => onAlarmSettingsChange({
                  ...alarmSettings,
                  heartRateLow: Number(e.target.value)
                })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ST Elevation (mV)
              </label>
              <input
                type="number"
                step="0.1"
                value={alarmSettings.stElevation}
                onChange={(e) => onAlarmSettingsChange({
                  ...alarmSettings,
                  stElevation: Number(e.target.value)
                })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ST Depression (mV)
              </label>
              <input
                type="number"
                step="0.1"
                value={alarmSettings.stDepression}
                onChange={(e) => onAlarmSettingsChange({
                  ...alarmSettings,
                  stDepression: Number(e.target.value)
                })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alarms */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-400" size={18} />
            Active Alarms ({activeAlarms.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeAlarms.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>No active alarms</p>
              </div>
            ) : (
              activeAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-4 rounded-lg border-2 ${getSeverityColor(alarm.severity)} ${
                    alarm.severity === 'critical' ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getAlarmIcon(alarm.type)}
                      <span className="ml-2 font-semibold uppercase">{alarm.severity}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Clock size={12} className="mr-1" />
                      {alarm.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{alarm.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={acknowledgedBy}
                      onChange={(e) => setAcknowledgedBy(e.target.value)}
                      placeholder="Acknowledged by..."
                      className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs flex-1 mr-2"
                    />
                    <button
                      onClick={() => onAlarmAcknowledge(alarm.id, acknowledgedBy)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acknowledged Alarms */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <CheckCircle className="mr-2 text-green-400" size={18} />
            Acknowledged Alarms ({acknowledgedAlarms.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {acknowledgedAlarms.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell size={48} className="mx-auto mb-2 opacity-50" />
                <p>No acknowledged alarms</p>
              </div>
            ) : (
              acknowledgedAlarms.slice(-10).reverse().map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-3 rounded border opacity-60 ${getSeverityColor(alarm.severity)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      {getAlarmIcon(alarm.type)}
                      <span className="ml-2 font-medium text-sm">{alarm.severity}</span>
                    </div>
                    <span className="text-xs">
                      {alarm.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-xs mb-2">{alarm.message}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>Ack by: {alarm.acknowledgedBy}</span>
                    {alarm.resolvedAt && (
                      <span>Resolved: {alarm.resolvedAt.toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alarm Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-red-400">
            {alarms.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-xs text-gray-400">Critical</div>
        </div>
        
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-orange-400">
            {alarms.filter(a => a.severity === 'high').length}
          </div>
          <div className="text-xs text-gray-400">High</div>
        </div>
        
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-yellow-400">
            {alarms.filter(a => a.severity === 'medium').length}
          </div>
          <div className="text-xs text-gray-400">Medium</div>
        </div>
        
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-blue-400">
            {alarms.filter(a => a.severity === 'low').length}
          </div>
          <div className="text-xs text-gray-400">Low</div>
        </div>
        
        <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-600">
          <div className="text-2xl font-mono font-bold text-green-400">
            {acknowledgedAlarms.length}
          </div>
          <div className="text-xs text-gray-400">Resolved</div>
        </div>
      </div>
    </div>
  );
};