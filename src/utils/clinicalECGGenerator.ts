import { ECGLead, ClinicalMeasurements } from '../types/medical';

export class ClinicalECGGenerator {
  private sampleRate: number = 1000; // High resolution for clinical accuracy
  private time: number = 0;
  private patientAge: number = 45;
  private patientGender: 'male' | 'female' = 'male';
  
  constructor(sampleRate: number = 1000, patientAge: number = 45, patientGender: 'male' | 'female' = 'male') {
    this.sampleRate = sampleRate;
    this.patientAge = patientAge;
    this.patientGender = patientGender;
  }

  generateClinicalECG(
    heartRate: number,
    amplitude: number,
    noiseLevel: number,
    pathology: string = 'normal',
    duration: number = 10
  ): { leads: ECGLead[], measurements: ClinicalMeasurements } {
    const samples = Math.floor(duration * this.sampleRate);
    const timeStep = 1 / this.sampleRate;
    
    // Define 12-lead system with anatomical positioning
    const leads: ECGLead[] = [
      { id: 'I', name: 'Lead I', color: '#ef4444', data: [], enabled: true, placement: 'Limb Lead (LA-RA)', impedance: 2.1, quality: 'excellent' },
      { id: 'II', name: 'Lead II', color: '#f97316', data: [], enabled: true, placement: 'Limb Lead (LL-RA)', impedance: 1.8, quality: 'excellent' },
      { id: 'III', name: 'Lead III', color: '#eab308', data: [], enabled: true, placement: 'Limb Lead (LL-LA)', impedance: 2.3, quality: 'good' },
      { id: 'aVR', name: 'aVR', color: '#22c55e', data: [], enabled: true, placement: 'Augmented (RA)', impedance: 1.9, quality: 'excellent' },
      { id: 'aVL', name: 'aVL', color: '#06b6d4', data: [], enabled: true, placement: 'Augmented (LA)', impedance: 2.0, quality: 'good' },
      { id: 'aVF', name: 'aVF', color: '#3b82f6', data: [], enabled: true, placement: 'Augmented (LL)', impedance: 1.7, quality: 'excellent' },
      { id: 'V1', name: 'V1', color: '#8b5cf6', data: [], enabled: true, placement: '4th ICS, R sternal border', impedance: 2.2, quality: 'good' },
      { id: 'V2', name: 'V2', color: '#ec4899', data: [], enabled: true, placement: '4th ICS, L sternal border', impedance: 1.6, quality: 'excellent' },
      { id: 'V3', name: 'V3', color: '#f43f5e', data: [], enabled: true, placement: 'Between V2 and V4', impedance: 1.9, quality: 'excellent' },
      { id: 'V4', name: 'V4', color: '#84cc16', data: [], enabled: true, placement: '5th ICS, midclavicular', impedance: 2.1, quality: 'good' },
      { id: 'V5', name: 'V5', color: '#06b6d4', data: [], enabled: true, placement: '5th ICS, anterior axillary', impedance: 2.4, quality: 'fair' },
      { id: 'V6', name: 'V6', color: '#6366f1', data: [], enabled: true, placement: '5th ICS, midaxillary', impedance: 2.0, quality: 'good' },
    ];

    let prInterval = 160; // Normal PR interval (120-200ms)
    let qrsWidth = 90;   // Normal QRS width (60-100ms)
    let qtInterval = 400; // Normal QT interval
    
    // Apply pathological modifications
    switch (pathology) {
      case 'myocardial_infarction':
        prInterval = 180;
        qrsWidth = 110;
        break;
      case 'bundle_branch_block':
        qrsWidth = 140;
        break;
      case 'av_block_first':
        prInterval = 240;
        break;
      case 'av_block_third':
        prInterval = Math.random() * 400 + 200;
        break;
      case 'atrial_fibrillation':
        prInterval = 0; // No P waves
        break;
    }

    for (let i = 0; i < samples; i++) {
      const t = this.time + i * timeStep;
      
      leads.forEach((lead, index) => {
        const baseSignal = this.generatePhysiologicalWaveform(
          t, heartRate, amplitude, pathology, prInterval, qrsWidth, qtInterval
        );
        const leadVariation = this.getAnatomicalLeadVariation(lead.id, baseSignal, pathology);
        const physiologicalNoise = this.addPhysiologicalNoise(leadVariation, noiseLevel);
        const artifactNoise = this.addTechnicalArtifacts(physiologicalNoise, lead.impedance);
        
        lead.data.push(artifactNoise);
      });
    }

    // Calculate clinical measurements
    const measurements: ClinicalMeasurements = {
      prInterval,
      qrsWidth,
      qtInterval,
      qtcInterval: this.calculateQTc(qtInterval, heartRate),
      axis: this.calculateElectricalAxis(leads),
      rWaveProgression: this.assessRWaveProgression(leads),
      stSegmentDeviation: this.calculateSTDeviation(leads),
      tWaveInversion: this.detectTWaveInversion(leads),
      qWaves: this.detectPathologicalQWaves(leads)
    };

    this.time += duration;
    return { leads, measurements };
  }

  private generatePhysiologicalWaveform(
    t: number, 
    heartRate: number, 
    amplitude: number, 
    pathology: string,
    prInterval: number,
    qrsWidth: number,
    qtInterval: number
  ): number {
    const beatInterval = 60 / heartRate;
    const phase = (t % beatInterval) / beatInterval * 2 * Math.PI;
    
    let ecg = 0;
    
    // P wave (atrial depolarization) - 80-100ms duration
    if (pathology !== 'atrial_fibrillation' && phase > 0.1 && phase < 0.4) {
      const pPhase = (phase - 0.1) / 0.3 * Math.PI;
      ecg += 0.15 * amplitude * Math.sin(pPhase) * this.getAgeGenderModifier('p_wave');
    }
    
    // Atrial fibrillation - irregular baseline
    if (pathology === 'atrial_fibrillation' && phase < 1.5) {
      ecg += 0.05 * amplitude * (Math.random() - 0.5) * Math.sin(phase * 20);
    }
    
    // PR segment (isoelectric)
    // QRS complex (ventricular depolarization) - highly detailed
    if (phase > 1.4 && phase < 1.8) {
      const qrsPhase = (phase - 1.4) / 0.4;
      
      // Q wave (if pathological)
      if (qrsPhase < 0.15 && (pathology === 'myocardial_infarction' || pathology === 'old_mi')) {
        ecg -= 0.3 * amplitude * Math.sin(qrsPhase * Math.PI / 0.15);
      }
      
      // R wave (main deflection)
      if (qrsPhase > 0.1 && qrsPhase < 0.6) {
        const rPhase = (qrsPhase - 0.1) / 0.5;
        let rAmplitude = 1.2 * amplitude;
        
        // Modify for bundle branch blocks
        if (pathology === 'bundle_branch_block') {
          rAmplitude *= 0.8;
          // Add notching
          rAmplitude += 0.2 * amplitude * Math.sin(rPhase * Math.PI * 3);
        }
        
        ecg += rAmplitude * Math.sin(rPhase * Math.PI) * this.getAgeGenderModifier('r_wave');
      }
      
      // S wave
      if (qrsPhase > 0.6 && qrsPhase < 0.9) {
        const sPhase = (qrsPhase - 0.6) / 0.3;
        ecg -= 0.4 * amplitude * Math.sin(sPhase * Math.PI);
      }
    }
    
    // ST segment - critical for MI detection
    if (phase > 1.8 && phase < 2.8) {
      let stElevation = 0;
      
      if (pathology === 'stemi') {
        stElevation = 0.3 * amplitude; // Significant ST elevation
      } else if (pathology === 'nstemi') {
        stElevation = -0.15 * amplitude; // ST depression
      } else if (pathology === 'pericarditis') {
        stElevation = 0.1 * amplitude; // Mild ST elevation
      }
      
      ecg += stElevation;
    }
    
    // T wave (ventricular repolarization)
    if (phase > 2.5 && phase < 4.0) {
      const tPhase = (phase - 2.5) / 1.5 * Math.PI;
      let tAmplitude = 0.25 * amplitude;
      
      // T wave inversions in pathology
      if (pathology === 'myocardial_infarction' || pathology === 'ischemia') {
        tAmplitude *= -0.8; // Inverted T waves
      }
      
      ecg += tAmplitude * Math.sin(tPhase) * this.getAgeGenderModifier('t_wave');
    }
    
    // U wave (sometimes visible)
    if (phase > 4.0 && phase < 4.5) {
      const uPhase = (phase - 4.0) / 0.5 * Math.PI;
      ecg += 0.05 * amplitude * Math.sin(uPhase);
    }
    
    return ecg;
  }

  private getAnatomicalLeadVariation(leadId: string, baseSignal: number, pathology: string): number {
    // Anatomically accurate lead variations based on cardiac vector
    const leadVectors: Record<string, { x: number; y: number; z: number }> = {
      'I': { x: 1, y: 0, z: 0 },
      'II': { x: 0.5, y: 0.866, z: 0 },
      'III': { x: -0.5, y: 0.866, z: 0 },
      'aVR': { x: -0.866, y: -0.5, z: 0 },
      'aVL': { x: 0.866, y: -0.5, z: 0 },
      'aVF': { x: 0, y: 1, z: 0 },
      'V1': { x: 0, y: 0, z: -0.9 },
      'V2': { x: 0, y: 0, z: -0.7 },
      'V3': { x: 0, y: 0, z: -0.3 },
      'V4': { x: 0, y: 0, z: 0.3 },
      'V5': { x: 0, y: 0, z: 0.7 },
      'V6': { x: 0, y: 0, z: 0.9 },
    };

    const vector = leadVectors[leadId];
    let multiplier = 1.0;

    // Calculate projection based on cardiac electrical axis
    if (pathology === 'left_axis_deviation') {
      multiplier = vector.x * 0.8 + vector.y * 0.6;
    } else if (pathology === 'right_axis_deviation') {
      multiplier = vector.x * 0.6 + vector.y * 0.8;
    } else {
      // Normal axis
      multiplier = vector.x * 0.7 + vector.y * 0.7 + vector.z * 0.5;
    }

    // Lead-specific pathological changes
    if (pathology === 'anterior_mi' && ['V1', 'V2', 'V3', 'V4'].includes(leadId)) {
      multiplier *= 0.6; // Reduced amplitude in anterior leads
    } else if (pathology === 'inferior_mi' && ['II', 'III', 'aVF'].includes(leadId)) {
      multiplier *= 0.5; // Changes in inferior leads
    } else if (pathology === 'lateral_mi' && ['I', 'aVL', 'V5', 'V6'].includes(leadId)) {
      multiplier *= 0.7; // Lateral wall changes
    }

    return baseSignal * Math.abs(multiplier);
  }

  private addPhysiologicalNoise(signal: number, noiseLevel: number): number {
    // Realistic physiological noise sources
    const muscleArtifact = (Math.random() - 0.5) * noiseLevel * 0.3;
    const respiratoryVariation = Math.sin(Date.now() / 1000 * 0.3) * noiseLevel * 0.1;
    const powerLineInterference = Math.sin(Date.now() / 1000 * 60 * 2 * Math.PI) * noiseLevel * 0.05;
    
    return signal + muscleArtifact + respiratoryVariation + powerLineInterference;
  }

  private addTechnicalArtifacts(signal: number, impedance: number): number {
    // Technical artifacts based on electrode impedance
    const impedanceNoise = (impedance - 2.0) * 0.02 * (Math.random() - 0.5);
    const motionArtifact = Math.random() < 0.001 ? (Math.random() - 0.5) * 2 : 0;
    
    return signal + impedanceNoise + motionArtifact;
  }

  private getAgeGenderModifier(component: string): number {
    let modifier = 1.0;
    
    // Age-related changes
    if (this.patientAge > 65) {
      switch (component) {
        case 'p_wave': modifier *= 1.2; break;
        case 'r_wave': modifier *= 0.9; break;
        case 't_wave': modifier *= 0.8; break;
      }
    }
    
    // Gender-related differences
    if (this.patientGender === 'female') {
      switch (component) {
        case 'r_wave': modifier *= 0.85; break;
        case 't_wave': modifier *= 1.1; break;
      }
    }
    
    return modifier;
  }

  private calculateQTc(qtInterval: number, heartRate: number): number {
    // Bazett's formula for QT correction
    const rrInterval = 60000 / heartRate; // in ms
    return qtInterval / Math.sqrt(rrInterval / 1000);
  }

  private calculateElectricalAxis(leads: ECGLead[]): number {
    // Calculate electrical axis using leads I and aVF
    const leadI = leads.find(l => l.id === 'I');
    const leadAVF = leads.find(l => l.id === 'aVF');
    
    if (!leadI || !leadAVF || leadI.data.length === 0) return 60; // Default normal axis
    
    const iAmplitude = Math.max(...leadI.data) - Math.min(...leadI.data);
    const avfAmplitude = Math.max(...leadAVF.data) - Math.min(...leadAVF.data);
    
    return Math.atan2(avfAmplitude, iAmplitude) * 180 / Math.PI;
  }

  private assessRWaveProgression(leads: ECGLead[]): boolean {
    // Check normal R wave progression in precordial leads
    const precordialLeads = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
    const rWaveAmplitudes: number[] = [];
    
    precordialLeads.forEach(leadId => {
      const lead = leads.find(l => l.id === leadId);
      if (lead && lead.data.length > 0) {
        rWaveAmplitudes.push(Math.max(...lead.data));
      }
    });
    
    // Normal progression: R waves should generally increase from V1 to V6
    for (let i = 1; i < rWaveAmplitudes.length - 1; i++) {
      if (rWaveAmplitudes[i] < rWaveAmplitudes[i - 1] * 0.8) {
        return false; // Poor R wave progression
      }
    }
    
    return true;
  }

  private calculateSTDeviation(leads: ECGLead[]): number[] {
    // Calculate ST segment deviation for each lead
    return leads.map(lead => {
      if (lead.data.length === 0) return 0;
      
      // Find ST segment (approximately 80ms after QRS)
      const stSegmentStart = Math.floor(lead.data.length * 0.4);
      const stSegmentEnd = Math.floor(lead.data.length * 0.6);
      
      if (stSegmentEnd > lead.data.length) return 0;
      
      const stSegment = lead.data.slice(stSegmentStart, stSegmentEnd);
      const baseline = lead.data.slice(0, Math.floor(lead.data.length * 0.1));
      
      const stLevel = stSegment.reduce((a, b) => a + b, 0) / stSegment.length;
      const baselineLevel = baseline.reduce((a, b) => a + b, 0) / baseline.length;
      
      return stLevel - baselineLevel;
    });
  }

  private detectTWaveInversion(leads: ECGLead[]): boolean[] {
    return leads.map(lead => {
      if (lead.data.length === 0) return false;
      
      // Find T wave region (last third of the cycle)
      const tWaveStart = Math.floor(lead.data.length * 0.6);
      const tWaveEnd = Math.floor(lead.data.length * 0.9);
      
      if (tWaveEnd > lead.data.length) return false;
      
      const tWave = lead.data.slice(tWaveStart, tWaveEnd);
      const maxT = Math.max(...tWave);
      const minT = Math.min(...tWave);
      
      // T wave is inverted if the negative deflection is greater
      return Math.abs(minT) > Math.abs(maxT);
    });
  }

  private detectPathologicalQWaves(leads: ECGLead[]): boolean[] {
    return leads.map(lead => {
      if (lead.data.length === 0) return false;
      
      // Find Q wave region (beginning of QRS)
      const qWaveStart = Math.floor(lead.data.length * 0.25);
      const qWaveEnd = Math.floor(lead.data.length * 0.35);
      
      if (qWaveEnd > lead.data.length) return false;
      
      const qWave = lead.data.slice(qWaveStart, qWaveEnd);
      const minQ = Math.min(...qWave);
      const rWave = Math.max(...lead.data.slice(qWaveEnd, Math.floor(lead.data.length * 0.5)));
      
      // Pathological Q wave: >25% of R wave amplitude and >40ms duration
      return Math.abs(minQ) > rWave * 0.25;
    });
  }

  reset() {
    this.time = 0;
  }
}