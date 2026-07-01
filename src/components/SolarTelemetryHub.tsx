import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Radio, Activity, Wind } from 'lucide-react';
import { cn } from '../lib/utils';

// Helper component for the animated telemetry chart
interface ChartProps {
  data: number[];
  color: string;
  glowColor: string;
  width?: number;
  height?: number;
}

const TelemetryChart: React.FC<ChartProps> = ({
  data,
  color,
  glowColor,
  width = 160,
  height = 55
}) => {
  const minVal = Math.min(...data, 10);
  const maxVal = Math.max(...data, 100);
  const range = maxVal - minVal || 1;

  // Generate SVG path coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // Invert Y so higher value is at the top
    const y = height - ((val - minVal) / range) * (height - 10) - 5;
    return { x, y };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const lastPoint = points[points.length - 1];

  return (
    <div className="relative" style={{ width, height }}>
      {/* Chart SVG */}
      <svg width={width} height={height} className="overflow-visible select-none pointer-events-none">
        <defs>
          {/* Glow filter */}
          <filter id={`glow-${glowColor}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Vertical Grid Dashed Lines */}
        {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
          <line
            key={idx}
            x1={width * ratio}
            y1={0}
            x2={width * ratio}
            y2={height}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="0.75"
            strokeDasharray="2, 3"
          />
        ))}

        {/* The Sparkline Path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            style={{ filter: `drop-shadow(0px 0px 4px ${glowColor}80)` }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Glow point at the end of the line */}
        {lastPoint && (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4"
              fill="#FFFFFF"
              className="animate-pulse"
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="6"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              className="animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export const SolarTelemetryHub: React.FC = () => {
  const [utcTime, setUtcTime] = useState<string>('18:19:07');
  const [xRayVal, setXRayVal] = useState<number>(5.8);
  const [solarWindVal, setSolarWindVal] = useState<number>(427);

  // Sparkline data points history lists
  const [xRayHistory, setXRayHistory] = useState<number[]>([
    25, 28, 22, 35, 45, 30, 28, 38, 48, 42, 35, 55, 48, 52, 60, 68, 62, 70, 78, 85
  ]);
  const [solarWindHistory, setSolarWindHistory] = useState<number[]>([
    380, 395, 390, 410, 405, 415, 420, 412, 408, 418, 425, 422, 430, 428, 424, 429, 432, 435, 430, 427
  ]);

  // Live dynamic UTC clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fluctuating values logic to simulate real telemetry streams
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      // 1. Update X-Ray values slightly
      setXRayVal(prev => {
        const delta = (Math.random() - 0.5) * 0.2; // +/- 0.1
        const next = Math.max(5.0, Math.min(6.5, prev + delta));
        return parseFloat(next.toFixed(1));
      });

      // 2. Update Solar Wind values slightly
      setSolarWindVal(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 6); // +/- 3 km/s
        return Math.max(400, Math.min(460, prev + delta));
      });

      // 3. Update rolling line charts
      setXRayHistory(prev => {
        const nextVal = 40 + Math.sin(Date.now() / 3000) * 15 + (Math.random() - 0.5) * 10;
        const updated = [...prev.slice(1), Math.max(10, Math.min(100, nextVal))];
        return updated;
      });

      setSolarWindHistory(prev => {
        const nextVal = 420 + Math.cos(Date.now() / 4000) * 10 + (Math.random() - 0.5) * 5;
        const updated = [...prev.slice(1), nextVal];
        return updated;
      });

    }, 2000);

    return () => clearInterval(telemetryInterval);
  }, []);

  return (
    <div className="flex flex-col h-full justify-between p-4.5 select-none bg-glass text-white">
      {/* 1. Header Telemetry Row */}
      <div className="flex justify-between items-start pb-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <Radio className="text-[#FFB000]" size={20} />
          <div>
            <h4 className="text-sm font-sans font-bold tracking-wider text-white">SOLAR</h4>
            <span className="text-[9px] font-mono font-bold text-[#FFB000] uppercase tracking-widest">
              TELEMETRY HUB
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00FF66] font-bold tracking-widest">
              LIVE
            </span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
            UTC {utcTime}
          </div>
        </div>
      </div>

      {/* 2. X-Ray Flux Metric Card */}
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <div className="flex flex-col">
          {/* Label */}
          <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
            <Activity className="text-[#FF1F1F]" size={12} />
            <span className="text-[10px] font-mono uppercase tracking-widest">X-RAY FLUX</span>
          </div>
          {/* Huge Stat */}
          <div className="text-3xl font-bold tracking-tight text-[#FF1F1F] font-sans">
            M{xRayVal.toFixed(1)}
          </div>
          {/* Class active description */}
          <div className="text-[9px] font-mono uppercase tracking-wider mt-1.5 flex items-center gap-1">
            <span className="text-zinc-500">CLASS</span>
            <span className="text-[#FF1F1F] font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Sparkline Graphic */}
        <div className="flex items-center justify-end">
          <TelemetryChart 
            data={xRayHistory} 
            color="#FF1F1F" 
            glowColor="#FF1F1F" 
            width={140}
            height={48}
          />
        </div>
      </div>

      {/* 3. Solar Wind Metric Card */}
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <div className="flex flex-col">
          {/* Label */}
          <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
            <Wind className="text-[#00F0FF]" size={12} />
            <span className="text-[10px] font-mono uppercase tracking-widest">SOLAR WIND</span>
          </div>
          {/* Huge Stat */}
          <div className="text-3xl font-bold tracking-tight text-[#00F0FF] font-sans flex items-baseline gap-1">
            <span>{solarWindVal}</span>
            <span className="text-[10px] text-zinc-400 font-normal">km/s</span>
          </div>
          {/* Status nominal description */}
          <div className="text-[9px] font-mono uppercase tracking-wider mt-1.5 flex items-center gap-1">
            <span className="text-zinc-500">STATUS</span>
            <span className="text-[#00F0FF] font-bold">NOMINAL</span>
          </div>
        </div>

        {/* Sparkline Graphic */}
        <div className="flex items-center justify-end">
          <TelemetryChart 
            data={solarWindHistory} 
            color="#00F0FF" 
            glowColor="#00F0FF" 
            width={140}
            height={48}
          />
        </div>
      </div>

      {/* 4. Footer Satellite Link Row */}
      <div className="flex justify-center items-center pt-2.5 shrink-0">
        <div className="flex items-center gap-2 text-[9px] font-mono tracking-[0.15em] text-[#FFB000]/85 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000] animate-pulse" />
          <span>ADITYA-L1</span>
          <span className="text-zinc-600 font-light">|</span>
          <span>LINK STABLE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000] animate-pulse" />
        </div>
      </div>
    </div>
  );
};
