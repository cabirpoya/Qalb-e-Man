import { ECGLead } from '../types/medical';

export class ECGGenerator {
  private sampleRate: number = 500;
  private time: number = 0;
  
  constructor(sampleRate: number = 500) {
    this.sampleRate = sampleRate;
  }

  generateMultiLeadECG(
    heartRate: number,
    amplitude: number,
    noiseLevel: number,
    duration: number = 1
  ): ECGLead[] {
    const samples = Math.floor(duration * this.sampleRate);
    const timeStep = 1 / this.sampleRate;
    
    const leads: ECGLead[] = [
      { id: 'I', name: 'Lead I', color: '#ef4444', data: [], enabled: true },
      { id: 'II', name: 'Lead II', color: '#f97316', data: [], enabled: true },
      { id: 'III', name: 'Lead III', color: '#eab308', data: [], enabled: true },
      { id: 'aVR', name: 'aVR', color: '#22c55e', data: [], enabled: true },
      { id: 'aVL', name: 'aVL', color: '#06b6d4', data: [], enabled: true },
      { id: 'aVF', name: 'aVF', color: '#3b82f6', data: [], enabled: true },
      { id: 'V1', name: 'V1', color: '#8b5cf6', data: [], enabled: true },
      { id: 'V2', name: 'V2', color: '#ec4899', data: [], enabled: true },
      { id: 'V3', name: 'V3', color: '#f43f5e', data: [], enabled: true },
      { id: 'V4', name: 'V4', color: '#84cc16', data: [], enabled: true },
      { id: 'V5', name: 'V5', color: '#06b6d4', data: [], enabled: true },
      { id: 'V6', name: 'V6', color: '#6366f1', data: [], enabled: true },
    ];

    for (let i = 0; i < samples; i++) {
      const t = this.time + i * timeStep;
      
      leads.forEach((lead, index) => {
        const baseSignal = this.generateECGWaveform(t, heartRate, amplitude);
        const leadVariation = this.getLeadVariation(lead.id, baseSignal);
        const noise = (Math.random() - 0.5) * noiseLevel * amplitude;
        lead.data.push(leadVariation + noise);
      });
    }

    this.time += duration;
    return leads;
  }

  private generateECGWaveform(t: number, heartRate: number, amplitude: number): number {
    const beatInterval = 60 / heartRate;
    const phase = (t % beatInterval) / beatInterval * 2 * Math.PI;
    
    let ecg = 0;
    
    // P wave (0.1-0.3)
    if (phase > 0.2 && phase < 0.8) {
      ecg += 0.25 * amplitude * Math.sin((phase - 0.2) * 10);
    }
    
    // QRS complex (1.5-2.0)
    if (phase > 1.5 && phase < 2.0) {
      const qrsPhase = (phase - 1.5) * 20;
      ecg += 15 * amplitude * Math.sin(qrsPhase) * Math.exp(-Math.pow(qrsPhase - Math.PI, 2));
    }
    
    // T wave (3.0-4.5)
    if (phase > 3.0 && phase < 4.5) {
      ecg += 0.35 * amplitude * Math.sin((phase - 3.0) * 4);
    }
    
    return ecg;
  }

  private getLeadVariation(leadId: string, baseSignal: number): number {
    const variations: Record<string, number> = {
      'I': 1.0,
      'II': 1.2,
      'III': 0.8,
      'aVR': -0.6,
      'aVL': 0.7,
      'aVF': 1.1,
      'V1': -0.3,
      'V2': 0.5,
      'V3': 1.5,
      'V4': 1.8,
      'V5': 1.3,
      'V6': 1.0,
    };
    
    return baseSignal * (variations[leadId] || 1.0);
  }

  reset() {
    this.time = 0;
  }
}