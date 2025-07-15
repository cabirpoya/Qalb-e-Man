import { ArrhythmiaDetection, ECGLead } from '../types/medical';

export class AdvancedArrhythmiaDetector {
  private rrIntervals: number[] = [];
  private qrsHistory: Array<{ time: number; amplitude: number; width: number }> = [];
  private pWaveHistory: Array<{ time: number; amplitude: number; present: boolean }> = [];
  private stSegmentHistory: number[] = [];
  private lastAnalysisTime: number = 0;

  detectComprehensiveArrhythmia(
    ecgLeads: ECGLead[], 
    sampleRate: number,
    patientAge: number = 45
  ): ArrhythmiaDetection | null {
    const leadII = ecgLeads.find(lead => lead.id === 'II');
    const leadV1 = ecgLeads.find(lead => lead.id === 'V1');
    
    if (!leadII || leadII.data.length < sampleRate) return null;

    // Advanced QRS detection with morphology analysis
    const qrsComplexes = this.detectQRSWithMorphology(leadII.data, sampleRate);
    const pWaves = this.detectPWaves(leadII.data, sampleRate);
    
    if (qrsComplexes.length < 2) return null;

    // Calculate RR intervals and heart rate variability
    const newRRIntervals = this.calculateRRIntervals(qrsComplexes, sampleRate);
    this.rrIntervals = [...this.rrIntervals, ...newRRIntervals].slice(-50);

    if (this.rrIntervals.length < 5) return null;

    const heartRate = this.calculateHeartRate();
    const hrv = this.calculateHeartRateVariability();
    
    // Multi-parameter arrhythmia analysis
    const rhythmAnalysis = this.analyzeRhythm(pWaves, qrsComplexes, this.rrIntervals);
    const morphologyAnalysis = this.analyzeMorphology(qrsComplexes, leadII.data, leadV1?.data);
    const stAnalysis = this.analyzeSTSegment(ecgLeads);
    
    // Comprehensive arrhythmia classification
    return this.classifyArrhythmia(
      heartRate, 
      hrv, 
      rhythmAnalysis, 
      morphologyAnalysis, 
      stAnalysis,
      patientAge
    );
  }

  private detectQRSWithMorphology(data: number[], sampleRate: number) {
    const qrsComplexes: Array<{
      time: number;
      amplitude: number;
      width: number;
      morphology: 'normal' | 'wide' | 'bizarre' | 'notched';
    }> = [];

    // Adaptive threshold based on signal amplitude
    const signalPower = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
    const threshold = signalPower * 0.6;
    
    let lastQRS = -1;
    const minDistance = sampleRate * 0.25; // 250ms minimum between QRS

    for (let i = 10; i < data.length - 10; i++) {
      // Multi-point QRS detection algorithm
      const currentSlope = data[i] - data[i - 5];
      const futureSlope = data[i + 5] - data[i];
      
      if (Math.abs(data[i]) > threshold && 
          currentSlope > 0 && futureSlope < 0 &&
          i - lastQRS > minDistance) {
        
        // Analyze QRS morphology
        const qrsStart = Math.max(0, i - 20);
        const qrsEnd = Math.min(data.length - 1, i + 40);
        const qrsSegment = data.slice(qrsStart, qrsEnd);
        
        const width = this.calculateQRSWidth(qrsSegment, sampleRate);
        const morphology = this.classifyQRSMorphology(qrsSegment, width);
        
        qrsComplexes.push({
          time: i / sampleRate,
          amplitude: data[i],
          width,
          morphology
        });
        
        lastQRS = i;
      }
    }

    this.qrsHistory = [...this.qrsHistory, ...qrsComplexes].slice(-100);
    return qrsComplexes;
  }

  private detectPWaves(data: number[], sampleRate: number) {
    const pWaves: Array<{ time: number; amplitude: number; present: boolean }> = [];
    
    // P wave detection in the PR interval region
    for (let i = 0; i < data.length - sampleRate * 0.4; i += sampleRate * 0.8) {
      const prSegment = data.slice(i, i + Math.floor(sampleRate * 0.2));
      
      // Look for P wave characteristics
      const pWaveAmplitude = Math.max(...prSegment) - Math.min(...prSegment);
      const isPresent = pWaveAmplitude > 0.1 && pWaveAmplitude < 0.5;
      
      pWaves.push({
        time: i / sampleRate,
        amplitude: pWaveAmplitude,
        present: isPresent
      });
    }

    this.pWaveHistory = [...this.pWaveHistory, ...pWaves].slice(-50);
    return pWaves;
  }

  private calculateRRIntervals(qrsComplexes: any[], sampleRate: number): number[] {
    const intervals: number[] = [];
    
    for (let i = 1; i < qrsComplexes.length; i++) {
      const interval = (qrsComplexes[i].time - qrsComplexes[i - 1].time) * 1000; // ms
      if (interval > 300 && interval < 2000) { // Physiologically reasonable
        intervals.push(interval);
      }
    }
    
    return intervals;
  }

  private calculateHeartRate(): number {
    if (this.rrIntervals.length === 0) return 0;
    
    const avgRR = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
    return Math.round(60000 / avgRR);
  }

  private calculateHeartRateVariability(): number {
    if (this.rrIntervals.length < 5) return 0;
    
    const mean = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
    const variance = this.rrIntervals.reduce((sum, rr) => sum + Math.pow(rr - mean, 2), 0) / this.rrIntervals.length;
    
    return Math.sqrt(variance); // RMSSD approximation
  }

  private analyzeRhythm(pWaves: any[], qrsComplexes: any[], rrIntervals: number[]) {
    const pWaveConsistency = pWaves.filter(p => p.present).length / pWaves.length;
    const rrVariability = this.calculateHeartRateVariability() / (rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length);
    
    return {
      pWaveConsistency,
      rrVariability,
      regularRhythm: rrVariability < 0.1,
      atrialActivity: pWaveConsistency > 0.8
    };
  }

  private analyzeMorphology(qrsComplexes: any[], leadIIData: number[], leadV1Data?: number[]) {
    const wideQRS = qrsComplexes.filter(qrs => qrs.width > 120).length / qrsComplexes.length;
    const bizarreQRS = qrsComplexes.filter(qrs => qrs.morphology === 'bizarre').length / qrsComplexes.length;
    
    return {
      wideQRSPercentage: wideQRS,
      bizarreQRSPercentage: bizarreQRS,
      bundleBranchPattern: this.detectBundleBranchBlock(leadIIData, leadV1Data),
      ventricularOrigin: wideQRS > 0.5 && bizarreQRS > 0.3
    };
  }

  private analyzeSTSegment(ecgLeads: ECGLead[]) {
    const stDeviations: number[] = [];
    
    ecgLeads.forEach(lead => {
      if (lead.data.length > 0) {
        const stDeviation = this.calculateSTDeviation(lead.data);
        stDeviations.push(stDeviation);
      }
    });

    const significantElevation = stDeviations.filter(st => st > 0.1).length;
    const significantDepression = stDeviations.filter(st => st < -0.1).length;

    return {
      stElevation: significantElevation > 2,
      stDepression: significantDepression > 2,
      maxElevation: Math.max(...stDeviations),
      maxDepression: Math.min(...stDeviations)
    };
  }

  private classifyArrhythmia(
    heartRate: number,
    hrv: number,
    rhythmAnalysis: any,
    morphologyAnalysis: any,
    stAnalysis: any,
    patientAge: number
  ): ArrhythmiaDetection {
    
    // Life-threatening arrhythmias (highest priority)
    if (heartRate > 250 && morphologyAnalysis.ventricularOrigin) {
      return {
        type: 'ventricular_fibrillation',
        severity: 'life_threatening',
        description: 'Ventricular Fibrillation - Chaotic ventricular rhythm',
        clinicalSignificance: 'Immediate cardiac arrest risk',
        recommendedAction: 'IMMEDIATE DEFIBRILLATION - Call Code Blue',
        confidence: 0.95,
        timestamp: new Date(),
        heartRateRange: { min: heartRate - 20, max: heartRate + 20 }
      };
    }

    if (heartRate > 150 && heartRate < 250 && morphologyAnalysis.wideQRSPercentage > 0.8) {
      return {
        type: 'ventricular_tachycardia',
        severity: 'critical',
        description: 'Sustained Ventricular Tachycardia',
        clinicalSignificance: 'High risk of hemodynamic compromise',
        recommendedAction: 'Immediate cardioversion if unstable, antiarrhythmic therapy',
        confidence: 0.90,
        timestamp: new Date(),
        heartRateRange: { min: heartRate - 10, max: heartRate + 10 }
      };
    }

    // ST segment abnormalities
    if (stAnalysis.stElevation && stAnalysis.maxElevation > 0.2) {
      return {
        type: 'st_elevation',
        severity: 'critical',
        description: 'ST Elevation - Acute STEMI pattern',
        clinicalSignificance: 'Acute myocardial infarction in progress',
        recommendedAction: 'IMMEDIATE PCI or thrombolytic therapy - STEMI protocol',
        confidence: 0.88,
        timestamp: new Date()
      };
    }

    if (stAnalysis.stDepression && stAnalysis.maxDepression < -0.15) {
      return {
        type: 'st_depression',
        severity: 'severe',
        description: 'Significant ST Depression',
        clinicalSignificance: 'Myocardial ischemia or NSTEMI',
        recommendedAction: 'Urgent cardiology consultation, serial troponins',
        confidence: 0.82,
        timestamp: new Date()
      };
    }

    // Atrial arrhythmias
    if (!rhythmAnalysis.atrialActivity && rhythmAnalysis.rrVariability > 0.3) {
      return {
        type: 'atrial_fibrillation',
        severity: 'moderate',
        description: 'Atrial Fibrillation - Irregularly irregular rhythm',
        clinicalSignificance: 'Increased stroke risk, hemodynamic effects',
        recommendedAction: 'Rate control, anticoagulation assessment, rhythm vs rate strategy',
        confidence: 0.85,
        timestamp: new Date(),
        heartRateRange: { min: Math.min(...this.rrIntervals.map(rr => Math.round(60000/rr))), 
                         max: Math.max(...this.rrIntervals.map(rr => Math.round(60000/rr))) }
      };
    }

    // Heart rate abnormalities
    if (heartRate > 100) {
      const severity = heartRate > 150 ? 'severe' : heartRate > 120 ? 'moderate' : 'mild';
      return {
        type: 'sinus_tachycardia',
        severity,
        description: `Sinus Tachycardia - HR: ${heartRate} BPM`,
        clinicalSignificance: 'May indicate underlying pathology or physiological stress',
        recommendedAction: 'Identify and treat underlying cause, monitor hemodynamics',
        confidence: 0.92,
        timestamp: new Date(),
        heartRateRange: { min: heartRate - 5, max: heartRate + 5 }
      };
    }

    if (heartRate < 60) {
      const severity = heartRate < 40 ? 'severe' : heartRate < 50 ? 'moderate' : 'mild';
      return {
        type: 'sinus_bradycardia',
        severity,
        description: `Sinus Bradycardia - HR: ${heartRate} BPM`,
        clinicalSignificance: 'May cause hemodynamic compromise, especially in elderly',
        recommendedAction: 'Assess symptoms, consider pacing if symptomatic',
        confidence: 0.90,
        timestamp: new Date(),
        heartRateRange: { min: heartRate - 5, max: heartRate + 5 }
      };
    }

    // Bundle branch blocks
    if (morphologyAnalysis.bundleBranchPattern) {
      return {
        type: 'bundle_branch_block',
        severity: 'moderate',
        description: 'Bundle Branch Block - Wide QRS complexes',
        clinicalSignificance: 'May indicate underlying cardiac disease',
        recommendedAction: 'Echocardiogram, assess for structural heart disease',
        confidence: 0.78,
        timestamp: new Date()
      };
    }

    // PVCs
    if (morphologyAnalysis.bizarreQRSPercentage > 0.1 && morphologyAnalysis.bizarreQRSPercentage < 0.5) {
      return {
        type: 'pvc',
        severity: 'mild',
        description: 'Premature Ventricular Contractions',
        clinicalSignificance: 'Usually benign if structurally normal heart',
        recommendedAction: 'Monitor frequency, assess for underlying heart disease if frequent',
        confidence: 0.75,
        timestamp: new Date()
      };
    }

    // Normal rhythm
    return {
      type: 'normal',
      severity: 'normal',
      description: `Normal Sinus Rhythm - HR: ${heartRate} BPM`,
      clinicalSignificance: 'Normal cardiac electrical activity',
      recommendedAction: 'Continue routine monitoring',
      confidence: 0.95,
      timestamp: new Date(),
      heartRateRange: { min: heartRate - 5, max: heartRate + 5 }
    };
  }

  private calculateQRSWidth(qrsSegment: number[], sampleRate: number): number {
    // Calculate QRS width in milliseconds
    const threshold = Math.max(...qrsSegment) * 0.1;
    let start = 0, end = qrsSegment.length - 1;
    
    for (let i = 0; i < qrsSegment.length; i++) {
      if (Math.abs(qrsSegment[i]) > threshold) {
        start = i;
        break;
      }
    }
    
    for (let i = qrsSegment.length - 1; i >= 0; i--) {
      if (Math.abs(qrsSegment[i]) > threshold) {
        end = i;
        break;
      }
    }
    
    return ((end - start) / sampleRate) * 1000; // Convert to ms
  }

  private classifyQRSMorphology(qrsSegment: number[], width: number): 'normal' | 'wide' | 'bizarre' | 'notched' {
    if (width > 120) {
      // Check for bizarre morphology
      const peaks = this.findPeaks(qrsSegment);
      if (peaks.length > 3) return 'bizarre';
      if (peaks.length > 2) return 'notched';
      return 'wide';
    }
    return 'normal';
  }

  private findPeaks(data: number[]): number[] {
    const peaks: number[] = [];
    const threshold = Math.max(...data) * 0.3;
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  private detectBundleBranchBlock(leadIIData: number[], leadV1Data?: number[]): boolean {
    if (!leadV1Data) return false;
    
    // Simplified BBB detection based on QRS morphology in V1
    const v1Peaks = this.findPeaks(leadV1Data);
    const iiPeaks = this.findPeaks(leadIIData);
    
    // RBBB: RSR' pattern in V1, wide S in I
    // LBBB: Wide R in V1, QS in V1
    return v1Peaks.length > 2 || iiPeaks.length > 2;
  }

  private calculateSTDeviation(leadData: number[]): number {
    if (leadData.length < 100) return 0;
    
    // Find J point (end of QRS) and ST segment
    const qrsEnd = Math.floor(leadData.length * 0.35);
    const stSegment = leadData.slice(qrsEnd, qrsEnd + 40);
    const baseline = leadData.slice(0, 20);
    
    const stLevel = stSegment.reduce((a, b) => a + b, 0) / stSegment.length;
    const baselineLevel = baseline.reduce((a, b) => a + b, 0) / baseline.length;
    
    return stLevel - baselineLevel;
  }

  reset() {
    this.rrIntervals = [];
    this.qrsHistory = [];
    this.pWaveHistory = [];
    this.stSegmentHistory = [];
    this.lastAnalysisTime = 0;
  }
}