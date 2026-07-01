import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, RefreshCw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const MathematicalObservatory: React.FC = () => {
  // Live metric state with realistic fluctuating ranges matching the screenshot
  const [physicsScore, setPhysicsScore] = useState<number>(0.94);
  const [residual, setResidual] = useState<number>(0.012);
  const [noveltyIndex, setNoveltyIndex] = useState<number>(91);
  
  // Dynamic chart path generator for the convergence curve
  const [chartPoints, setChartPoints] = useState<Point[]>([]);

  // 1. Initialize the convergence curve (exponential decay with noise)
  useEffect(() => {
    const points: Point[] = [];
    const totalPoints = 40;
    for (let i = 0; i < totalPoints; i++) {
      // Exponential decay formula: y starts high on left, decays to a baseline with random noise
      const x = i;
      const decay = Math.exp(-i / 8) * 55; // exponential decay height
      const baseline = 10;                 // steady state height from bottom
      const noise = Math.sin(i * 0.8) * 1.5 + (Math.random() - 0.5) * 1;
      // Invert Y so 0 is at the bottom of the 80px high container
      const y = 80 - (decay + baseline + noise);
      points.push({ x, y });
    }
    setChartPoints(points);
  }, []);

  // 2. Micro-fluctuations timer to make the board feel active and live
  useEffect(() => {
    const timer = setInterval(() => {
      // Physics score wiggles slightly around 0.94
      setPhysicsScore(prev => {
        const next = prev + (Math.random() - 0.5) * 0.004;
        return parseFloat(Math.max(0.92, Math.min(0.96, next)).toFixed(3));
      });

      // Residual wiggles slightly around 0.012
      setResidual(prev => {
        const next = prev + (Math.random() - 0.5) * 0.0005;
        return parseFloat(Math.max(0.008, Math.min(0.015, next)).toFixed(4));
      });

      // Novelty Index wiggles slightly around 91%
      setNoveltyIndex(prev => {
        const next = prev + (Math.random() - 0.5) * 0.3;
        return Math.max(89, Math.min(93, Math.round(next * 10) / 10));
      });

      // Gently ripple the tail of the convergence curve
      setChartPoints(prev => {
        if (prev.length === 0) return prev;
        return prev.map((p, idx) => {
          // The left side stays stable (historical), the tail on the right wiggles more
          if (idx < 15) return p;
          const shift = (Math.random() - 0.5) * 0.8;
          return {
            x: p.x,
            y: Math.max(10, Math.min(75, p.y + shift))
          };
        });
      });

    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Generate SVG path string from points
  const generatePath = () => {
    if (chartPoints.length === 0) return '';
    const width = 300; // SVG viewBox width
    const pointsStr = chartPoints.map((p, idx) => {
      // Scale x to match the container width
      const scaledX = (p.x / (chartPoints.length - 1)) * width;
      return `${idx === 0 ? 'M' : 'L'} ${scaledX} ${p.y}`;
    }).join(' ');
    return pointsStr;
  };

  const generateAreaPath = () => {
    if (chartPoints.length === 0) return '';
    const width = 300;
    const path = generatePath();
    // Close the path to form a fillable polygon at the bottom
    return `${path} L ${width} 80 L 0 80 Z`;
  };

  return (
    <div className="flex flex-col h-full justify-between select-none bg-glass text-white font-sans p-4.5">
      {/* 1. Header Row */}
      <div className="flex justify-between items-start pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          {/* Customized high-fidelity golden logo matching screenshot */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#FFB000] drop-shadow-[0_0_8px_rgba(255,176,0,0.2)]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Elegant Integral symbol */}
              <path d="M21 8C21 6 22.2 4.5 24 4.5C25.5 4.5 26.5 5.5 26.5 7C26.5 11 19.5 26 19.5 30C19.5 32 20.5 33.5 22.5 33.5C24.5 33.5 25.5 31.5 25.5 29.5" stroke="#FFB000" strokeWidth="2.2" strokeLinecap="round"/>
              {/* Planetary / Coordinate Tilted Orbit Ellipse */}
              <ellipse cx="20" cy="20" rx="14" ry="5.5" stroke="#FFB000" strokeWidth="1" strokeDasharray="2 3" transform="rotate(-15 20 20)" opacity="0.8"/>
              {/* Orbiting dot/body */}
              <circle cx="31.5" cy="17.5" r="2.5" fill="#FFB000"/>
            </svg>
          </div>
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.2em] text-white leading-tight">
              MATHEMATICAL
            </h4>
            <span className="text-[13px] font-black text-[#FFB000] uppercase tracking-[0.15em] text-glow-amber">
              OBSERVATORY
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
            <span className="text-[10px] font-mono text-[#00FF66] font-bold tracking-widest">
              ACTIVE
            </span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
            v4.8
          </div>
        </div>
      </div>

      {/* 2. CURRENT MODEL Panel with Formula */}
      <div className="py-3">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[9px] font-mono font-bold text-[#FFB000] tracking-[0.25em] uppercase opacity-90">
            CURRENT MODEL
          </span>
        </div>
        {/* Sleek, deep dark glass background equation display block */}
        <div className="bg-black/50 border border-white/5 rounded-2xl p-4.5 flex items-center justify-center relative overflow-hidden shadow-[inset_0_1px_8px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/20" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/20" />
          
          {/* Custom high-fidelity styled equation rendering */}
          <div className="flex items-center gap-3 font-serif italic text-lg lg:text-xl text-white select-none tracking-wide">
            {/* ∂E / ∂t fraction */}
            <div className="flex flex-col items-center justify-center font-serif">
              <span className="leading-none pb-1.5 border-b border-white/40 font-serif">∂E</span>
              <span className="leading-none pt-1.5 font-serif">∂t</span>
            </div>
            
            {/* Equals sign */}
            <span className="text-zinc-400 font-sans not-italic mx-0.5 text-base font-light">=</span>
            
            {/* alpha H */}
            <div className="flex items-center gap-1 font-serif">
              <span className="text-[#FFB000] font-sans not-italic font-light text-xl">α</span>
              <span className="font-serif">H</span>
            </div>
            
            {/* Plus sign */}
            <span className="text-zinc-500 font-sans not-italic mx-0.5 text-sm">+</span>
            
            {/* beta nabla B */}
            <div className="flex items-center gap-1 font-serif">
              <span className="text-[#FFB000] font-sans not-italic font-light text-xl">β</span>
              <span className="text-zinc-400 font-sans not-italic text-sm font-light">∇</span>
              <span className="font-serif">B</span>
            </div>
            
            {/* Minus sign */}
            <span className="text-zinc-500 font-sans not-italic mx-0.5 text-sm">-</span>
            
            {/* gamma J^2 */}
            <div className="flex items-center gap-0.5 font-serif">
              <span className="text-[#FFB000] font-sans not-italic font-light text-xl">γ</span>
              <span className="font-serif mr-0.5">J</span>
              <sup className="text-xs font-sans not-italic font-medium text-zinc-300 transform -translate-y-1">2</sup>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Metric Stats Rows with Dashed Borders */}
      <div className="flex flex-col py-2">
        {/* Physics Score Row */}
        <div className="flex items-center justify-between py-2.5 border-b border-dashed border-white/5">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider">PHYSICS SCORE</span>
          <span className="text-[14px] font-mono font-black text-[#00F0FF] text-glow-cyan">
            {physicsScore.toFixed(2)}
          </span>
        </div>

        {/* Residual Row */}
        <div className="flex items-center justify-between py-2.5 border-b border-dashed border-white/5">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider">RESIDUAL</span>
          <span className="text-[14px] font-mono font-black text-[#00F0FF] text-glow-cyan">
            {residual.toFixed(3)}
          </span>
        </div>

        {/* Novelty Index Row */}
        <div className="flex items-center justify-between py-2.5">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider">NOVELTY INDEX</span>
          <span className="text-[14px] font-mono font-black text-[#00F0FF] text-glow-cyan">
            {Math.round(noveltyIndex)}%
          </span>
        </div>
      </div>

      {/* 4. CONVERGENCE Sparkline & Grid Section */}
      <div className="pt-2 flex flex-col justify-end">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-mono font-black text-[#FFB000] tracking-[0.25em] uppercase opacity-90">
            CONVERGENCE
          </span>
        </div>
        
        {/* Line graph on coordinate system */}
        <div className="relative h-[80px] w-full bg-black/20 border border-white/5 rounded-xl overflow-hidden p-1.5 flex items-end">
          {/* Subtle Coordinate Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
            <div className="w-full border-t border-dashed border-white/10" />
            <div className="w-full border-t border-dashed border-white/10" />
            <div className="w-full border-t border-dashed border-white/10" />
          </div>
          <div className="absolute inset-0 flex justify-between px-4 py-1 pointer-events-none opacity-20">
            <div className="h-full border-l border-dashed border-white/10" />
            <div className="h-full border-l border-dashed border-white/10" />
            <div className="h-full border-l border-dashed border-white/10" />
            <div className="h-full border-l border-dashed border-white/10" />
          </div>

          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
            <defs>
              {/* Fade out blue/teal gradient under the line */}
              <linearGradient id="convergence-glow-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Filled Area */}
            {chartPoints.length > 0 && (
              <path
                d={generateAreaPath()}
                fill="url(#convergence-glow-grad)"
                className="transition-all duration-1000 ease-in-out"
              />
            )}

            {/* The Curve line */}
            {chartPoints.length > 0 && (
              <path
                d={generatePath()}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-1000 ease-in-out"
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(0,240,255,0.4))' }}
              />
            )}
            
            {/* Orbiting pulse dot at the tip of the curve */}
            {chartPoints.length > 0 && (
              <circle
                cx={(chartPoints[chartPoints.length - 1].x / (chartPoints.length - 1)) * 300}
                cy={chartPoints[chartPoints.length - 1].y}
                r="3.5"
                fill="#FFFFFF"
                className="animate-pulse"
                style={{ filter: 'drop-shadow(0px 0px 4px #00F0FF)' }}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
