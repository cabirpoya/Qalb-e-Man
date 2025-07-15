import React, { useRef, useEffect } from 'react';
import { ECGLead, ECGSettings } from '../types/medical';

interface MultiLeadDisplayProps {
  leads: ECGLead[];
  settings: ECGSettings;
  isRunning: boolean;
  timeWindow: number;
}

export const MultiLeadDisplay: React.FC<MultiLeadDisplayProps> = ({
  leads,
  settings,
  isRunning,
  timeWindow
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const drawECGGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#16a34a';
    ctx.globalAlpha = 0.3;
    
    // Major grid lines (5mm = 25px at standard scale)
    ctx.lineWidth = 1;
    const majorSpacing = 25;
    for (let x = 0; x <= width; x += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Minor grid lines (1mm = 5px)
    ctx.lineWidth = 0.5;
    const minorSpacing = 5;
    for (let x = 0; x <= width; x += minorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += minorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawLeadTrace = (
    ctx: CanvasRenderingContext2D,
    lead: ECGLead,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (!lead.enabled || lead.data.length === 0) return;

    const centerY = y + height / 2;
    const scale = settings.gain * 10; // Convert mm/mV to pixels
    
    ctx.strokeStyle = lead.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const samplesPerPixel = lead.data.length / width;
    
    for (let px = 0; px < width; px++) {
      const sampleIndex = Math.floor(px * samplesPerPixel);
      if (sampleIndex < lead.data.length) {
        const value = lead.data[sampleIndex];
        const plotY = centerY - value * scale;
        
        if (px === 0) {
          ctx.moveTo(x + px, plotY);
        } else {
          ctx.lineTo(x + px, plotY);
        }
      }
    }
    
    ctx.stroke();
    
    // Draw lead label
    ctx.fillStyle = lead.color;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(lead.name, x + 5, y + 20);
  };

  const renderMultiLead = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    drawECGGrid(ctx, width, height);
    
    const enabledLeads = leads.filter(lead => lead.enabled);
    
    if (settings.displayMode === '3x4') {
      // 3 columns, 4 rows
      const cols = 3;
      const rows = 4;
      const leadWidth = width / cols;
      const leadHeight = height / rows;
      
      enabledLeads.slice(0, 12).forEach((lead, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * leadWidth;
        const y = row * leadHeight;
        
        drawLeadTrace(ctx, lead, x, y, leadWidth, leadHeight);
      });
    } else if (settings.displayMode === '6x2') {
      // 6 columns, 2 rows
      const cols = 6;
      const rows = 2;
      const leadWidth = width / cols;
      const leadHeight = height / rows;
      
      enabledLeads.slice(0, 12).forEach((lead, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * leadWidth;
        const y = row * leadHeight;
        
        drawLeadTrace(ctx, lead, x, y, leadWidth, leadHeight);
      });
    } else if (settings.displayMode === 'rhythm') {
      // Single rhythm strip (usually Lead II)
      const rhythmLead = enabledLeads.find(lead => lead.id === 'II') || enabledLeads[0];
      if (rhythmLead) {
        drawLeadTrace(ctx, rhythmLead, 0, 0, width, height);
      }
    }
  };

  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        renderMultiLead();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      renderMultiLead();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [leads, settings, isRunning]);

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-mono text-lg">12-Lead ECG Display</h3>
        <div className="flex items-center space-x-4">
          <span className="text-green-400 text-sm font-mono">
            {settings.sweepSpeed} mm/s | {settings.gain} mm/mV
          </span>
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="w-full h-auto bg-slate-900 border border-slate-600 rounded"
      />
    </div>
  );
};