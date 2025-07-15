import { ArrhythmiaDetection } from '../types/medical';

export class ArrhythmiaDetector {
  private rrIntervals: number[] = [];
  private lastQRSTime: number = 0;
  private qrsHistory: number[] = [];

  detectArrhythmia(ecgData: number[], sampleRate: number): ArrhythmiaDetection | null {
    const qrsPositions = this.detectQRSComplexes(ecgData, sampleRate);
    
    if (qrsPositions.length < 2) return null;

    // Calculate RR intervals
    const newRRIntervals = [];
    for (let i = 1; i < qrsPositions.length; i++) {
      const rrInterval = (qrsPositions[i] - qrsPositions[i - 1]) / sampleRate * 1000; // ms
      newRRIntervals.push(rrInterval);
    }

    this.rrIntervals = [...this.rrIntervals, ...newRRIntervals].slice(-20); // Keep last 20

    if (this.rrIntervals.length < 5) return null;

    const avgRR = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
    const heartRate = 60000 / avgRR; // BPM

    // Detect various arrhythmias
    if (heartRate > 100) {
      if (this.detectAtrialFibrillation()) {
        return {
          type: 'afib',
          severity: 'high',
          description: 'Atrial Fibrillation detected - irregular rhythm',
          timestamp: new Date()
        };
      }
      if (heartRate > 150) {
        return {
          type: 'vtach',
          severity: 'critical',
          description: 'Ventricular Tachycardia - immediate attention required',
          timestamp: new Date()
        };
      }
      return {
        type: 'tachycardia',
        severity: heartRate > 120 ? 'medium' : 'low',
        description: `Tachycardia detected - HR: ${Math.round(heartRate)} BPM`,
        timestamp: new Date()
      };
    }

    if (heartRate < 60) {
      return {
        type: 'bradycardia',
        severity: heartRate < 40 ? 'high' : 'medium',
        description: `Bradycardia detected - HR: ${Math.round(heartRate)} BPM`,
        timestamp: new Date()
      };
    }

    if (this.detectPVCs()) {
      return {
        type: 'pvcs',
        severity: 'medium',
        description: 'Premature Ventricular Contractions detected',
        timestamp: new Date()
      };
    }

    return {
      type: 'normal',
      severity: 'low',
      description: `Normal sinus rhythm - HR: ${Math.round(heartRate)} BPM`,
      timestamp: new Date()
    };
  }

  private detectQRSComplexes(data: number[], sampleRate: number): number[] {
    const threshold = Math.max(...data) * 0.6;
    const qrsPositions: number[] = [];
    let lastQRS = -1;
    const minDistance = sampleRate * 0.3; // 300ms minimum between QRS

    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && 
          data[i] > data[i - 1] && 
          data[i] > data[i + 1] &&
          i - lastQRS > minDistance) {
        qrsPositions.push(i);
        lastQRS = i;
      }
    }

    return qrsPositions;
  }

  private detectAtrialFibrillation(): boolean {
    if (this.rrIntervals.length < 10) return false;
    
    // Calculate RR interval variability
    const mean = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
    const variance = this.rrIntervals.reduce((sum, rr) => sum + Math.pow(rr - mean, 2), 0) / this.rrIntervals.length;
    const coefficient = Math.sqrt(variance) / mean;
    
    // High variability suggests AFib
    return coefficient > 0.3;
  }

  private detectPVCs(): boolean {
    if (this.rrIntervals.length < 5) return false;
    
    // Look for compensatory pauses (long RR after short RR)
    for (let i = 1; i < this.rrIntervals.length; i++) {
      const current = this.rrIntervals[i];
      const previous = this.rrIntervals[i - 1];
      const avg = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;
      
      if (previous < avg * 0.8 && current > avg * 1.2) {
        return true;
      }
    }
    
    return false;
  }

  reset() {
    this.rrIntervals = [];
    this.lastQRSTime = 0;
    this.qrsHistory = [];
  }
}