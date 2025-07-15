import { useCallback, useRef } from 'react';

export const useAudio = (enabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!enabled || audioContextRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }, [enabled]);

  const playHeartbeat = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;

    const context = audioContextRef.current;
    
    // Resume context if it's suspended (required for user interaction)
    if (context.state === 'suspended') {
      context.resume();
    }

    // Create heartbeat sound
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // First sound (lub)
    oscillator.frequency.setValueAtTime(80, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);

    // Second sound (dub)
    setTimeout(() => {
      const osc2 = context.createOscillator();
      const gain2 = context.createGain();

      osc2.connect(gain2);
      gain2.connect(context.destination);

      osc2.frequency.setValueAtTime(60, context.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(30, context.currentTime + 0.08);
      
      gain2.gain.setValueAtTime(0, context.currentTime);
      gain2.gain.linearRampToValueAtTime(0.25, context.currentTime + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);

      osc2.start(context.currentTime);
      osc2.stop(context.currentTime + 0.12);
    }, 100);
  }, [enabled]);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return { initAudio, playHeartbeat, cleanup };
};