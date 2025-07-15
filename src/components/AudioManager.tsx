import React, { useRef, useEffect } from 'react';

interface AudioManagerProps {
  enabled: boolean;
  onHeartbeat: () => void;
}

export const AudioManager: React.FC<AudioManagerProps> = ({ enabled, onHeartbeat }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.3;
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        gainNodeRef.current = null;
      }
    };
  }, [enabled]);

  const playHeartbeatSound = () => {
    if (!enabled || !audioContextRef.current || !gainNodeRef.current) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.connect(envelope);
    envelope.connect(gainNodeRef.current);

    // Create heartbeat sound (lub-dub)
    oscillator.frequency.setValueAtTime(80, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, context.currentTime + 0.1);
    
    envelope.gain.setValueAtTime(0, context.currentTime);
    envelope.gain.linearRampToValueAtTime(0.8, context.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);

    // Second sound (dub) after a short delay
    setTimeout(() => {
      if (!audioContextRef.current || !gainNodeRef.current) return;
      
      const osc2 = context.createOscillator();
      const env2 = context.createGain();

      osc2.connect(env2);
      env2.connect(gainNodeRef.current);

      osc2.frequency.setValueAtTime(60, context.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(30, context.currentTime + 0.08);
      
      env2.gain.setValueAtTime(0, context.currentTime);
      env2.gain.linearRampToValueAtTime(0.6, context.currentTime + 0.01);
      env2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);

      osc2.start(context.currentTime);
      osc2.stop(context.currentTime + 0.12);
    }, 100);
  };

  // Register the callback for external use
  React.useImperativeHandle(onHeartbeat, () => playHeartbeatSound, [enabled]);

  return null;
};