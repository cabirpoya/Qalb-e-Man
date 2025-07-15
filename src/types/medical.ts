export interface ECGLead {
  id: string;
  name: string;
  color: string;
  data: number[];
  enabled: boolean;
  placement: string;
  impedance: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  bmi: number;
  medicalHistory: MedicalCondition[];
  currentMedications: Medication[];
  allergies: string[];
  emergencyContact: EmergencyContact;
  admissionDate: Date;
  roomNumber: string;
  physicianName: string;
}

export interface MedicalCondition {
  condition: string;
  diagnosisDate: Date;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'chronic';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'iv' | 'im' | 'topical' | 'inhaled';
  startDate: Date;
  prescribedBy: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface VitalSigns {
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
    meanArterialPressure: number;
  };
  oxygenSaturation: number;
  temperature: number;
  respiratoryRate: number;
  centralVenousPressure?: number;
  pulmonaryWedgePressure?: number;
  cardiacOutput?: number;
  timestamp: Date;
}

export interface ArrhythmiaDetection {
  type: 'normal' | 'sinus_tachycardia' | 'sinus_bradycardia' | 'atrial_fibrillation' | 
        'atrial_flutter' | 'svt' | 'ventricular_tachycardia' | 'ventricular_fibrillation' |
        'pvc' | 'pac' | 'first_degree_av_block' | 'second_degree_av_block' | 'third_degree_av_block' |
        'bundle_branch_block' | 'st_elevation' | 'st_depression' | 'inverted_t_waves';
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' | 'life_threatening';
  description: string;
  clinicalSignificance: string;
  recommendedAction: string;
  confidence: number;
  timestamp: Date;
  duration?: number;
  heartRateRange?: { min: number; max: number };
}

export interface ECGSettings {
  sweepSpeed: 12.5 | 25 | 50; // mm/s
  gain: 2.5 | 5 | 10 | 20 | 40; // mm/mV
  filterSettings: {
    lowPass: number; // Hz
    highPass: number; // Hz
    notch50Hz: boolean;
    notch60Hz: boolean;
    muscleFilter: boolean;
    baselineWander: boolean;
  };
  displayMode: '3x4' | '6x2' | '12x1' | 'rhythm' | 'cabrera' | 'pediatric';
  calibration: {
    lastCalibrated: Date;
    calibrationPulse: number;
    offset: number[];
  };
  alarmLimits: {
    heartRateHigh: number;
    heartRateLow: number;
    stElevation: number;
    stDepression: number;
  };
}

export interface ClinicalMeasurements {
  prInterval: number; // ms
  qrsWidth: number; // ms
  qtInterval: number; // ms
  qtcInterval: number; // ms (corrected)
  axis: number; // degrees
  rWaveProgression: boolean;
  stSegmentDeviation: number[]; // mV per lead
  tWaveInversion: boolean[];
  qWaves: boolean[];
}

export interface ECGInterpretation {
  rhythm: string;
  rate: number;
  axis: string;
  intervals: {
    pr: string;
    qrs: string;
    qt: string;
    qtc: string;
  };
  morphology: string[];
  clinicalCorrelation: string;
  recommendations: string[];
  urgency: 'routine' | 'urgent' | 'stat' | 'critical';
  confidence: number;
  timestamp: Date;
}

export interface TrendData {
  timestamp: Date;
  heartRate: number;
  stSegment: number;
  arrhythmiaCount: number;
  oxygenSaturation: number;
  bloodPressure: { systolic: number; diastolic: number };
}

export interface AlarmEvent {
  id: string;
  type: 'arrhythmia' | 'vital_sign' | 'technical' | 'lead_off' | 'artifact';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolvedAt?: Date;
}