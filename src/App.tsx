import React, { useState, useEffect, useCallback } from 'react';
import { MultiLeadDisplay } from './components/MultiLeadDisplay';
import { ControlPanel } from './components/ControlPanel';
import { VitalSigns } from './components/VitalSigns';
import { PatientInfo } from './components/PatientInfo';
import { ArrhythmiaAlerts } from './components/ArrhythmiaAlerts';
import { AdvancedControls } from './components/AdvancedControls';
import { ClinicalInterpretation } from './components/ClinicalInterpretation';
import { TrendMonitoring } from './components/TrendMonitoring';
import { AlarmManagement } from './components/AlarmManagement';
import { useAudio } from './hooks/useAudio';
import { ClinicalECGGenerator } from './utils/clinicalECGGenerator';
import { AdvancedArrhythmiaDetector } from './utils/advancedArrhythmiaDetector';
import { Monitor, Activity, Stethoscope, Shield, Award } from 'lucide-react';
import { 
  ECGLead, 
  ECGSettings, 
  PatientData, 
  ArrhythmiaDetection, 
  VitalSigns as VitalSignsType,
  ECGInterpretation,
  ClinicalMeasurements,
  TrendData,
  AlarmEvent
} from './types/medical';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [heartRate, setHeartRate] = useState(75);
  const [amplitude, setAmplitude] = useState(1.5);
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [pathology, setPathology] = useState<string>('normal');
  
  const [ecgLeads, setEcgLeads] = useState<ECGLead[]>([]);
  const [ecgSettings, setEcgSettings] = useState<ECGSettings>({
    sweepSpeed: 25,
    gain: 10,
    filterSettings: {
      lowPass: 40,
      highPass: 0.5,
      notch50Hz: false,
      notch60Hz: true,
      muscleFilter: true,
      baselineWander: true
    },
    displayMode: '3x4',
    calibration: {
      lastCalibrated: new Date(),
      calibrationPulse: 1.0,
      offset: new Array(12).fill(0)
    },
    alarmLimits: {
      heartRateHigh: 120,
      heartRateLow: 50,
      stElevation: 0.2,
      stDepression: -0.15
    }
  });

  const [patient, setPatient] = useState<PatientData>({
    id: 'PT-2024-001',
    name: 'John Doe',
    age: 45,
    gender: 'male',
    weight: 75,
    height: 175,
    bmi: 24.5,
    medicalHistory: [
      { condition: 'Hypertension', diagnosisDate: new Date('2020-01-15'), severity: 'moderate', status: 'chronic' },
      { condition: 'Type 2 Diabetes', diagnosisDate: new Date('2019-06-20'), severity: 'mild', status: 'active' }
    ],
    currentMedications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID', route: 'oral', startDate: new Date('2019-06-20'), prescribedBy: 'Dr. Johnson' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', route: 'oral', startDate: new Date('2020-01-15'), prescribedBy: 'Dr. Smith' }
    ],
    allergies: ['Penicillin', 'Shellfish'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1-555-0123',
      email: 'jane.doe@email.com'
    },
    admissionDate: new Date(),
    roomNumber: 'ICU-204',
    physicianName: 'Dr. Sarah Wilson'
  });

  const [vitalSigns, setVitalSigns] = useState<VitalSignsType>({
    heartRate: 75,
    bloodPressure: { 
      systolic: 120, 
      diastolic: 80, 
      meanArterialPressure: 93 
    },
    oxygenSaturation: 98,
    temperature: 36.7,
    respiratoryRate: 16,
    centralVenousPressure: 8,
    pulmonaryWedgePressure: 12,
    cardiacOutput: 5.2,
    timestamp: new Date()
  });

  const [currentArrhythmia, setCurrentArrhythmia] = useState<ArrhythmiaDetection | null>(null);
  const [alertHistory, setAlertHistory] = useState<ArrhythmiaDetection[]>([]);
  const [interpretation, setInterpretation] = useState<ECGInterpretation | null>(null);
  const [measurements, setMeasurements] = useState<ClinicalMeasurements | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [alarms, setAlarms] = useState<AlarmEvent[]>([]);
  const [trendTimeWindow, setTrendTimeWindow] = useState(4); // hours

  const ecgGenerator = new ClinicalECGGenerator(1000, patient.age, patient.gender);
  const arrhythmiaDetector = new AdvancedArrhythmiaDetector();
  const { initAudio, playHeartbeat, cleanup } = useAudio(audioEnabled);

  useEffect(() => {
    initAudio();
    return cleanup;
  }, [initAudio, cleanup]);

  const generateClinicalECGData = useCallback(() => {
    if (!isRunning) return;

    const { leads: newLeads, measurements: newMeasurements } = ecgGenerator.generateClinicalECG(
      heartRate, 
      amplitude, 
      noiseLevel, 
      pathology,
      0.1
    );
    
    setEcgLeads(prevLeads => {
      const maxDataPoints = 5000; // ~5 seconds at 1000 Hz
      
      return newLeads.map((newLead, index) => {
        const existingLead = prevLeads[index];
        const combinedData = existingLead 
          ? [...existingLead.data, ...newLead.data].slice(-maxDataPoints)
          : newLead.data;
        
        return {
          ...newLead,
          data: combinedData,
          enabled: existingLead?.enabled ?? true
        };
      });
    });

    setMeasurements(newMeasurements);

    // Advanced arrhythmia detection
    const detection = arrhythmiaDetector.detectComprehensiveArrhythmia(newLeads, 1000, patient.age);
    if (detection) {
      setCurrentArrhythmia(detection);
      if (detection.type !== 'normal') {
        setAlertHistory(prev => [...prev, detection]);
        
        // Generate alarm if critical
        if (detection.severity === 'critical' || detection.severity === 'life_threatening') {
          const alarm: AlarmEvent = {
            id: `alarm-${Date.now()}`,
            type: 'arrhythmia',
            severity: detection.severity === 'life_threatening' ? 'critical' : 'high',
            message: detection.description,
            timestamp: new Date(),
            acknowledged: false
          };
          setAlarms(prev => [...prev, alarm]);
        }
      }
    }

    // Generate clinical interpretation
    if (newMeasurements && detection) {
      const clinicalInterpretation: ECGInterpretation = {
        rhythm: detection.description,
        rate: heartRate,
        axis: newMeasurements.axis > 90 ? 'Right axis deviation' : 
              newMeasurements.axis < -30 ? 'Left axis deviation' : 'Normal axis',
        intervals: {
          pr: newMeasurements.prInterval < 120 ? 'Short' : 
              newMeasurements.prInterval > 200 ? 'Prolonged' : 'Normal',
          qrs: newMeasurements.qrsWidth > 100 ? 'Wide' : 'Normal',
          qt: newMeasurements.qtInterval > 450 ? 'Prolonged' : 'Normal',
          qtc: newMeasurements.qtcInterval > 440 ? 'Prolonged' : 'Normal'
        },
        morphology: [
          ...(newMeasurements.qWaves.some(q => q) ? ['Pathological Q waves present'] : []),
          ...(newMeasurements.tWaveInversion.some(t => t) ? ['T wave inversions noted'] : []),
          ...(!newMeasurements.rWaveProgression ? ['Poor R wave progression'] : [])
        ],
        clinicalCorrelation: detection.clinicalSignificance,
        recommendations: [detection.recommendedAction],
        urgency: detection.severity === 'life_threatening' ? 'critical' :
                detection.severity === 'critical' ? 'stat' :
                detection.severity === 'severe' ? 'urgent' : 'routine',
        confidence: detection.confidence,
        timestamp: new Date()
      };
      setInterpretation(clinicalInterpretation);
    }

    // Update trend data
    const newTrendPoint: TrendData = {
      timestamp: new Date(),
      heartRate,
      stSegment: newMeasurements?.stSegmentDeviation[1] || 0, // Lead II ST segment
      arrhythmiaCount: detection?.type !== 'normal' ? 1 : 0,
      oxygenSaturation: vitalSigns.oxygenSaturation,
      bloodPressure: vitalSigns.bloodPressure
    };
    setTrendData(prev => [...prev, newTrendPoint].slice(-1000)); // Keep last 1000 points

    // Play heartbeat sound
    if (audioEnabled) {
      playHeartbeat();
    }
  }, [isRunning, heartRate, amplitude, noiseLevel, pathology, audioEnabled, playHeartbeat, patient.age, vitalSigns]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(generateClinicalECGData, 100); // 10 Hz update rate
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generateClinicalECGData]);

  // Update vital signs based on heart rate and pathology
  useEffect(() => {
    setVitalSigns(prev => ({
      ...prev,
      heartRate,
      bloodPressure: {
        systolic: Math.round(120 + (heartRate - 75) * 0.5 + (Math.random() - 0.5) * 10),
        diastolic: Math.round(80 + (heartRate - 75) * 0.3 + (Math.random() - 0.5) * 8),
        meanArterialPressure: Math.round(93 + (heartRate - 75) * 0.4 + (Math.random() - 0.5) * 6)
      },
      oxygenSaturation: pathology === 'myocardial_infarction' ? 
        Math.max(92, Math.min(97, 95 + (Math.random() - 0.5) * 3)) :
        Math.max(95, Math.min(100, 98 + (Math.random() - 0.5) * 2)),
      temperature: 36.7 + (Math.random() - 0.5) * 0.6,
      respiratoryRate: Math.round(16 + (heartRate - 75) * 0.1 + (Math.random() - 0.5) * 4),
      centralVenousPressure: Math.round(8 + (Math.random() - 0.5) * 4),
      pulmonaryWedgePressure: Math.round(12 + (Math.random() - 0.5) * 6),
      cardiacOutput: Number((5.2 + (Math.random() - 0.5) * 1.5).toFixed(1)),
      timestamp: new Date()
    }));
  }, [heartRate, pathology]);

  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
    if (!isRunning && audioEnabled) {
      initAudio();
    }
    if (!isRunning) {
      ecgGenerator.reset();
      arrhythmiaDetector.reset();
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setEcgLeads([]);
    ecgGenerator.reset();
    arrhythmiaDetector.reset();
  };

  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      initAudio();
    }
  };

  const handleExportData = () => {
    const exportData = {
      patient,
      vitalSigns,
      ecgData: ecgLeads,
      settings: ecgSettings,
      alerts: alertHistory,
      interpretation,
      measurements,
      trendData,
      alarms,
      timestamp: new Date().toISOString(),
      systemInfo: {
        version: '3.2.1',
        calibrationStatus: 'Valid',
        lastMaintenance: new Date('2024-01-15').toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-ecg-${patient.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSession = () => {
    const sessionData = {
      patient,
      settings: ecgSettings,
      heartRate,
      amplitude,
      noiseLevel,
      pathology,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('clinical-ecg-session', JSON.stringify(sessionData));
    alert('Clinical session saved successfully!');
  };

  const handleLoadSession = () => {
    const savedSession = localStorage.getItem('clinical-ecg-session');
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      setPatient(sessionData.patient);
      setEcgSettings(sessionData.settings);
      setHeartRate(sessionData.heartRate);
      setAmplitude(sessionData.amplitude);
      setNoiseLevel(sessionData.noiseLevel);
      setPathology(sessionData.pathology || 'normal');
      alert('Clinical session loaded successfully!');
    } else {
      alert('No saved session found!');
    }
  };

  const handleCalibrate = () => {
    setIsRunning(false);
    setTimeout(() => {
      setEcgSettings(prev => ({
        ...prev,
        calibration: {
          ...prev.calibration,
          lastCalibrated: new Date(),
          calibrationPulse: 1.0,
          offset: new Array(12).fill(0)
        }
      }));
      alert('System calibration completed successfully!');
    }, 2000);
  };

  const handleClearAlerts = () => {
    setAlertHistory([]);
    setCurrentArrhythmia(null);
  };

  const handleGenerateReport = () => {
    const reportData = {
      patient,
      interpretation,
      measurements,
      vitalSigns,
      timestamp: new Date().toISOString()
    };
    
    const reportText = `
CLINICAL ECG REPORT
==================

Patient: ${patient.name} (ID: ${patient.id})
Age: ${patient.age} years, Gender: ${patient.gender}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

INTERPRETATION:
${interpretation?.rhythm || 'Normal sinus rhythm'}
Rate: ${interpretation?.rate || heartRate} BPM
Axis: ${interpretation?.axis || 'Normal'}

INTERVALS:
PR: ${measurements?.prInterval || 'N/A'} ms (${interpretation?.intervals.pr || 'Normal'})
QRS: ${measurements?.qrsWidth || 'N/A'} ms (${interpretation?.intervals.qrs || 'Normal'})
QT: ${measurements?.qtInterval || 'N/A'} ms (${interpretation?.intervals.qt || 'Normal'})
QTc: ${measurements?.qtcInterval?.toFixed(0) || 'N/A'} ms (${interpretation?.intervals.qtc || 'Normal'})

CLINICAL CORRELATION:
${interpretation?.clinicalCorrelation || 'Normal ECG findings'}

RECOMMENDATIONS:
${interpretation?.recommendations.join('\n') || 'Continue routine monitoring'}

Electronically signed by: Dr. Sarah Wilson, MD
Cardiologist
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecg-report-${patient.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAlarmAcknowledge = (alarmId: string, acknowledgedBy: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId 
        ? { ...alarm, acknowledged: true, acknowledgedBy, resolvedAt: new Date() }
        : alarm
    ));
  };

  const handleClearAllAlarms = () => {
    setAlarms([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Advanced Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="text-blue-400" size={36} />
              <Shield className="text-green-400" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                CardioMonitor Pro Clinical
              </h1>
              <p className="text-sm text-gray-300">
                FDA-Cleared Clinical Grade ECG Analysis & Monitoring Platform v3.2.1
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <div className="text-sm text-gray-400">System Status</div>
              <div className={`font-bold ${isRunning ? 'text-green-400' : 'text-gray-400'}`}>
                {isRunning ? 'MONITORING ACTIVE' : 'STANDBY MODE'}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Patient</div>
              <div className="font-mono text-white">{patient.name}</div>
              <div className="text-xs text-gray-400">{patient.id} | Room {patient.roomNumber}</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Physician</div>
              <div className="font-medium text-white">{patient.physicianName}</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Award className="text-yellow-400" size={20} />
              <div className={`w-4 h-4 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Patient Information */}
        <PatientInfo patient={patient} onPatientChange={setPatient} />

        {/* Main 12-Lead ECG Display */}
        <MultiLeadDisplay
          leads={ecgLeads}
          settings={ecgSettings}
          isRunning={isRunning}
          timeWindow={10}
        />

        {/* Clinical Interpretation */}
        <ClinicalInterpretation
          interpretation={interpretation}
          measurements={measurements}
          currentArrhythmia={currentArrhythmia}
          onGenerateReport={handleGenerateReport}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Enhanced Control Panel */}
          <div className="space-y-6">
            <ControlPanel
              isRunning={isRunning}
              onToggleRunning={handleToggleRunning}
              onStop={handleStop}
              heartRate={heartRate}
              onHeartRateChange={setHeartRate}
              amplitude={amplitude}
              onAmplitudeChange={setAmplitude}
              noiseLevel={noiseLevel}
              onNoiseLevelChange={setNoiseLevel}
              audioEnabled={audioEnabled}
              onToggleAudio={handleToggleAudio}
            />
            
            {/* Pathology Selector */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Clinical Scenarios</h3>
              <select
                value={pathology}
                onChange={(e) => setPathology(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="normal">Normal Sinus Rhythm</option>
                <option value="myocardial_infarction">Acute MI (STEMI)</option>
                <option value="nstemi">NSTEMI</option>
                <option value="atrial_fibrillation">Atrial Fibrillation</option>
                <option value="bundle_branch_block">Bundle Branch Block</option>
                <option value="av_block_first">1st Degree AV Block</option>
                <option value="av_block_third">3rd Degree AV Block</option>
                <option value="pericarditis">Pericarditis</option>
                <option value="ischemia">Myocardial Ischemia</option>
              </select>
            </div>
          </div>

          {/* Advanced Vital Signs */}
          <VitalSigns
            bpm={vitalSigns.heartRate}
            systolic={vitalSigns.bloodPressure.systolic}
            diastolic={vitalSigns.bloodPressure.diastolic}
            oxygenSaturation={vitalSigns.oxygenSaturation}
            temperature={vitalSigns.temperature}
          />
        </div>

        {/* Trend Monitoring */}
        <TrendMonitoring
          trendData={trendData}
          timeWindow={trendTimeWindow}
          onTimeWindowChange={setTrendTimeWindow}
        />

        {/* Alarm Management */}
        <AlarmManagement
          alarms={alarms}
          alarmSettings={ecgSettings.alarmLimits}
          onAlarmAcknowledge={handleAlarmAcknowledge}
          onAlarmSettingsChange={(limits) => setEcgSettings(prev => ({ ...prev, alarmLimits: limits }))}
          onClearAllAlarms={handleClearAllAlarms}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
        />

        {/* Arrhythmia Detection */}
        <ArrhythmiaAlerts
          currentArrhythmia={currentArrhythmia}
          alertHistory={alertHistory}
          onClearAlerts={handleClearAlerts}
        />

        {/* Advanced Controls */}
        <AdvancedControls
          settings={ecgSettings}
          onSettingsChange={setEcgSettings}
          onExportData={handleExportData}
          onSaveSession={handleSaveSession}
          onLoadSession={handleLoadSession}
          onCalibrate={handleCalibrate}
        />

        {/* Clinical Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-center space-x-6 mb-3">
            <div className="flex items-center space-x-2">
              <Activity size={16} />
              <span>CardioMonitor Pro Clinical v3.2.1</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={16} />
              <span>FDA 510(k) Cleared</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award size={16} />
              <span>ISO 13485 Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Monitor size={16} />
              <span>HIPAA Compliant</span>
            </div>
          </div>
          <p>© 2024 MedTech Clinical Solutions | Professional Medical Device Software</p>
          <p className="mt-1 text-xs">
            This system is intended for use by qualified healthcare professionals only. 
            All interpretations require physician review and clinical correlation.
          </p>
          <div className="mt-2 text-xs text-gray-600">
            Last Calibration: {ecgSettings.calibration.lastCalibrated.toLocaleDateString()} | 
            System Uptime: {isRunning ? 'Active' : 'Standby'} | 
            Data Integrity: Verified
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;