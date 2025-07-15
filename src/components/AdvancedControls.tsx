import React from 'react';
import { Settings, Filter, Download, Save, Upload, Zap } from 'lucide-react';
import { ECGSettings } from '../types/medical';

interface AdvancedControlsProps {
  settings: ECGSettings;
  onSettingsChange: (settings: ECGSettings) => void;
  onExportData: () => void;
  onSaveSession: () => void;
  onLoadSession: () => void;
  onCalibrate: () => void;
}

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  settings,
  onSettingsChange,
  onExportData,
  onSaveSession,
  onLoadSession,
  onCalibrate
}) => {
  const handleDisplayModeChange = (mode: ECGSettings['displayMode']) => {
    onSettingsChange({ ...settings, displayMode: mode });
  };

  const handleFilterChange = (filterType: keyof ECGSettings['filterSettings'], value: number | boolean) => {
    onSettingsChange({
      ...settings,
      filterSettings: {
        ...settings.filterSettings,
        [filterType]: value
      }
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Settings className="mr-2" size={20} />
        Advanced Controls & Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Filter className="mr-2" size={16} />
            Display Configuration
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['3x4', '6x2', '12x1', 'rhythm'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleDisplayModeChange(mode)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      settings.displayMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {mode === '3x4' ? '3×4 Grid' :
                     mode === '6x2' ? '6×2 Grid' :
                     mode === '12x1' ? '12×1 Strip' : 'Rhythm Strip'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sweep Speed (mm/s)
                </label>
                <select
                  value={settings.sweepSpeed}
                  onChange={(e) => onSettingsChange({ ...settings, sweepSpeed: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value={12.5}>12.5</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gain (mm/mV)
                </label>
                <select
                  value={settings.gain}
                  onChange={(e) => onSettingsChange({ ...settings, gain: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={40}>40</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Signal Filtering</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Low Pass Filter (Hz)
              </label>
              <input
                type="range"
                min="30"
                max="150"
                value={settings.filterSettings.lowPass}
                onChange={(e) => handleFilterChange('lowPass', Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>30 Hz</span>
                <span className="text-white font-mono">{settings.filterSettings.lowPass} Hz</span>
                <span>150 Hz</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                High Pass Filter (Hz)
              </label>
              <input
                type="range"
                min="0.05"
                max="5"
                step="0.05"
                value={settings.filterSettings.highPass}
                onChange={(e) => handleFilterChange('highPass', Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.05 Hz</span>
                <span className="text-white font-mono">{settings.filterSettings.highPass} Hz</span>
                <span>5 Hz</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notchFilter"
                checked={settings.filterSettings.notch}
                onChange={(e) => handleFilterChange('notch', e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="notchFilter" className="text-sm font-medium text-gray-300">
                60 Hz Notch Filter
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onCalibrate}
          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <Zap size={16} className="mr-2" />
          Calibrate
        </button>
        
        <button
          onClick={onExportData}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download size={16} className="mr-2" />
          Export Data
        </button>
        
        <button
          onClick={onSaveSession}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Save size={16} className="mr-2" />
          Save Session
        </button>
        
        <button
          onClick={onLoadSession}
          className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          <Upload size={16} className="mr-2" />
          Load Session
        </button>
      </div>

      {/* Quick Presets */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => onSettingsChange({
              ...settings,
              sweepSpeed: 25,
              gain: 10,
              displayMode: '3x4'
            })}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            Standard
          </button>
          <button
            onClick={() => onSettingsChange({
              ...settings,
              sweepSpeed: 50,
              gain: 20,
              displayMode: 'rhythm'
            })}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            High Detail
          </button>
          <button
            onClick={() => onSettingsChange({
              ...settings,
              sweepSpeed: 12.5,
              gain: 5,
              displayMode: '6x2'
            })}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            Overview
          </button>
          <button
            onClick={() => onSettingsChange({
              ...settings,
              sweepSpeed: 25,
              gain: 10,
              displayMode: 'rhythm',
              filterSettings: { lowPass: 40, highPass: 0.5, notch: true }
            })}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};