import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Globe, AlertTriangle, Orbit, Satellite, 
  Radio, ShieldCheck, RefreshCw, Crosshair 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface RiskEntropyChartProps {
  threatLevel: number;
  deceptionLogs: any[];
  attackerLogs: any[];
  metrics: {
    entropyRate: number;
    confusionProbability: number;
    engagementScore: number;
    intelligenceYield: number;
    adversaryACI: number;
    dnaSync: number;
  };
  riskRings: {
    malware: number;
    fraud: number;
    network: number;
    system: number;
  };
}

interface Hotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  baseRisk: number;
}

const HOTSPOTS: Hotspot[] = [
  { id: 'eur', name: 'Frankfurt C2 Syndicate', x: 0.48, y: 0.23, baseRisk: 0.94 },
  { id: 'ind', name: 'Jamtara Vishing Farm', x: 0.67, y: 0.47, baseRisk: 0.88 },
  { id: 'usa', name: 'Silicon Valley Gateway', x: 0.18, y: 0.32, baseRisk: 0.42 },
  { id: 'bra', name: 'São Paulo Overlay Farm', x: 0.30, y: 0.65, baseRisk: 0.70 },
  { id: 'nig', name: 'Lagos BEC Router Syndicate', x: 0.50, y: 0.54, baseRisk: 0.75 },
  { id: 'aus', name: 'Sydney Decoy Ground', x: 0.81, y: 0.70, baseRisk: 0.22 },
  { id: 'rus', name: 'Siberian Ransom Node', x: 0.76, y: 0.20, baseRisk: 0.92 }
];

// Helper to determine if normalized (x,y) falls within world map landmasses
const isInsideWorldMap = (x: number, y: number): boolean => {
  // Greenland
  if (Math.pow((x - 0.35) / 0.05, 2) + Math.pow((y - 0.11) / 0.06, 2) <= 1) return true;
  
  // North America
  if (Math.pow((x - 0.18) / 0.11, 2) + Math.pow((y - 0.27) / 0.11, 2) <= 1) return true; // Canada & US
  if (Math.pow((x - 0.11) / 0.07, 2) + Math.pow((y - 0.21) / 0.07, 2) <= 1) return true; // Alaska
  if (y > 0.38 && y < 0.50 && x > 0.17 && x < 0.24) return true; // Central America
  
  // South America
  if (Math.pow((x - 0.29) / 0.07, 2) + Math.pow((y - 0.64) / 0.16, 2) <= 1 && y > 0.44) {
    const taper = (0.82 - y) / 0.38;
    if (Math.abs(x - 0.29) < 0.07 * taper) return true;
  }
  
  // Europe
  if (Math.pow((x - 0.47) / 0.07, 2) + Math.pow((y - 0.22) / 0.06, 2) <= 1) return true;
  
  // Africa
  if (Math.pow((x - 0.50) / 0.08, 2) + Math.pow((y - 0.52) / 0.14, 2) <= 1 && y > 0.35) {
    if (y < 0.46) return true;
    const taper = (0.70 - y) / 0.24;
    if (Math.abs(x - 0.50) < 0.08 * taper) return true;
  }
  
  // Asia
  if (Math.pow((x - 0.70) / 0.16, 2) + Math.pow((y - 0.27) / 0.12, 2) <= 1) return true; // Main Asia
  if (Math.pow((x - 0.78) / 0.10, 2) + Math.pow((y - 0.17) / 0.07, 2) <= 1) return true; // Siberia
  if (Math.pow((x - 0.57) / 0.05, 2) + Math.pow((y - 0.38) / 0.04, 2) <= 1) return true; // Middle East
  if (Math.pow((x - 0.66) / 0.04, 2) + Math.pow((y - 0.45) / 0.06, 2) <= 1 && y > 0.37) return true; // India
  if (Math.pow((x - 0.75) / 0.04, 2) + Math.pow((y - 0.50) / 0.06, 2) <= 1 && y > 0.43) return true; // Indochina
  
  // Australia
  if (Math.pow((x - 0.81) / 0.06, 2) + Math.pow((y - 0.68) / 0.05, 2) <= 1) return true;
  
  // Japan
  if (Math.pow((x - 0.84) / 0.015, 2) + Math.pow((y - 0.28) / 0.05, 2) <= 1) return true;
  
  // UK
  if (Math.pow((x - 0.42) / 0.012, 2) + Math.pow((y - 0.20) / 0.02, 2) <= 1) return true;
  
  // Madagascar
  if (Math.pow((x - 0.58) / 0.015, 2) + Math.pow((y - 0.65) / 0.03, 2) <= 1) return true;
  
  // Indonesia / Philippines
  if (Math.pow((x - 0.78) / 0.05, 2) + Math.pow((y - 0.53) / 0.03, 2) <= 1) return true;

  return false;
};

export const RiskEntropyChart: React.FC<RiskEntropyChartProps> = ({
  threatLevel,
  deceptionLogs,
  attackerLogs,
  metrics,
  riskRings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string>('0.00s ago');
  const [aligningSatellites, setAligningSatellites] = useState(false);

  // Track coordinates and active elements
  const dotsRef = useRef<{ x: number; y: number; baseX: number; baseY: number; baseRisk: number; phase: number }[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; speed: number; opacity: number; color: string }[]>([]);
  const scannerRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0, active: false });

  // Sat links
  const satelliteLinks = useMemo(() => [
    { from: HOTSPOTS[0], to: HOTSPOTS[2], progress: 0.1 }, // Frankfurt -> Silicon Valley
    { from: HOTSPOTS[1], to: HOTSPOTS[0], progress: 0.4 }, // Jamtara -> Frankfurt
    { from: HOTSPOTS[1], to: HOTSPOTS[5], progress: 0.7 }, // Jamtara -> Sydney
    { from: HOTSPOTS[4], to: HOTSPOTS[0], progress: 0.2 }, // Lagos -> Frankfurt
    { from: HOTSPOTS[3], to: HOTSPOTS[0], progress: 0.5 }  // São Paulo -> Frankfurt
  ], []);

  // 3D perspective mouse tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Rotate max 8 degrees on hover
    const tiltX = -(mouseY / (height / 2)) * 8;
    const tiltY = (mouseX / (width / 2)) * 8;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
    setHoveredHotspot(null);
    mousePosRef.current.active = false;
  };

  // Canvas interaction
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    
    mousePosRef.current = { x: mx, y: my, active: true };
    
    // Check closest hotspot
    let found: Hotspot | null = null;
    for (const hs of HOTSPOTS) {
      const dx = mx - hs.x;
      const dy = my - hs.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 0.055) {
        found = hs;
        break;
      }
    }
    setHoveredHotspot(found);
  };

  // Click on map triggers high intensity sonar sweep
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    // Trigger radar sweep
    ripplesRef.current.push({
      x: mx,
      y: my,
      radius: 0,
      maxRadius: 0.5,
      speed: 0.015,
      opacity: 1.0,
      color: hoveredHotspot ? '#10B981' : '#00F0FF'
    });

    setLastScanTime('0.00s ago');
  };

  // Button triggers
  const triggerPulseScan = () => {
    ripplesRef.current.push({
      x: 0.5,
      y: 0.35,
      radius: 0,
      maxRadius: 0.85,
      speed: 0.02,
      opacity: 1.0,
      color: '#FFB000'
    });
    setLastScanTime('0.00s ago');
  };

  const triggerSatRealign = () => {
    setAligningSatellites(true);
    setTimeout(() => setAligningSatellites(false), 1500);

    // Blast a huge sweep from Sydney decoy
    ripplesRef.current.push({
      x: 0.81,
      y: 0.70,
      radius: 0,
      maxRadius: 1.0,
      speed: 0.025,
      opacity: 1.0,
      color: '#00F0FF'
    });
  };

  // Setup canvas sizes & dots array
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Populate 2D grid representation
      const cols = 68;
      const rows = 34;
      const newDots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c / (cols - 1);
          const y = r / (rows - 1);
          if (isInsideWorldMap(x, y)) {
            // Calculate base static risk coefficient based on hotspot weights
            let maxRisk = 0.12;
            for (const hs of HOTSPOTS) {
              const dx = x - hs.x;
              const dy = y - hs.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const influence = Math.max(0, 1 - dist / 0.28);
              const contribution = hs.baseRisk * influence;
              if (contribution > maxRisk) {
                maxRisk = contribution;
              }
            }
            newDots.push({
              x,
              y,
              baseX: x * rect.width,
              baseY: y * rect.height,
              baseRisk: maxRisk,
              phase: Math.random() * Math.PI * 2
            });
          }
        }
      }
      dotsRef.current = newDots;
    };

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(handleResize);
    });
    resizeObserver.observe(canvas);
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Main drawing requestAnimationFrame loop
  useEffect(() => {
    let lastTime = Date.now();
    
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext('2d');
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      if (!ctx || w === 0 || h === 0) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const time = Date.now();
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update scan timer label
      setLastScanTime(prev => {
        const currentSec = parseFloat(prev);
        if (isNaN(currentSec)) return '0.00s ago';
        const nextSec = currentSec + dt;
        return `${nextSec.toFixed(2)}s ago`;
      });

      // Update scan line
      scannerRef.current = (scannerRef.current + dt * 0.15) % 1.0;

      // Draw light background grid mesh
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw satellite connection lines (dashed bezier curves)
      satelliteLinks.forEach((link, idx) => {
        const startX = link.from.x * w;
        const startY = link.from.y * h;
        const endX = link.to.x * w;
        const endY = link.to.y * h;
        const midX = (startX + endX) / 2;
        const midY = Math.min(startY, endY) - 25; // bend curve upwards

        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 176, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animate moving energy packets on links
        link.progress = (link.progress + dt * 0.25) % 1.0;
        const t = link.progress;
        // Quad Bezier math
        const px = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
        const py = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? '#00F0FF' : '#FFB000';
        ctx.shadowColor = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(255, 176, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and draw active Sonar Ripples
      ripplesRef.current.forEach((rip, idx) => {
        rip.radius += rip.speed;
        rip.opacity -= dt * 1.2;

        if (rip.opacity > 0) {
          ctx.beginPath();
          ctx.arc(rip.x * w, rip.y * h, rip.radius * w, 0, Math.PI * 2);
          ctx.strokeStyle = rip.color;
          ctx.globalAlpha = rip.opacity * 0.4;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      });
      ripplesRef.current = ripplesRef.current.filter(r => r.opacity > 0);

      // Draw vertical scanner sweeping wave
      const scanLineX = scannerRef.current * w;
      ctx.beginPath();
      const grad = ctx.createLinearGradient(scanLineX - 40, 0, scanLineX + 5, 0);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(scanLineX - 40, 0, 45, h);

      // Draw Map dots
      const threatMultiplier = threatLevel / 100 + 0.3;
      dotsRef.current.forEach(dot => {
        const dotPX = dot.x * w;
        const dotPY = dot.y * h;

        // Dynamic weighted risk coefficient scaling
        let computedRisk = dot.baseRisk * threatMultiplier;
        
        // Enhance risk if active scan or ripples pass nearby
        let sizeBonus = 0;
        let brightnessBonus = 0;

        // Interactive Sonar ripples intersection boost
        ripplesRef.current.forEach(rip => {
          const rx = rip.x * w;
          const ry = rip.y * h;
          const distPx = Math.sqrt((dotPX - rx)*(dotPX - rx) + (dotPY - ry)*(dotPY - ry));
          const waveRadiusPx = rip.radius * w;

          // Check if dot falls on wave wavefront boundary (width 15px)
          if (Math.abs(distPx - waveRadiusPx) < 14) {
            sizeBonus += 1.5 * rip.opacity;
            brightnessBonus += 0.4 * rip.opacity;
            computedRisk += 0.25 * rip.opacity; // temporarily boost risk representation
          }
        });

        // Vertical scanning line highlight
        const distToScan = Math.abs(dotPX - scanLineX);
        if (distToScan < 30) {
          const scanFactor = (30 - distToScan) / 30;
          brightnessBonus += 0.35 * scanFactor;
          sizeBonus += 0.8 * scanFactor;
        }

        // Mouse hover ripple highlights
        if (mousePosRef.current.active) {
          const mx = mousePosRef.current.x * w;
          const my = mousePosRef.current.y * h;
          const distToMouse = Math.sqrt((dotPX - mx)*(dotPX - mx) + (dotPY - my)*(dotPY - my));
          if (distToMouse < 45) {
            const mouseFactor = (45 - distToMouse) / 45;
            brightnessBonus += 0.45 * mouseFactor;
            sizeBonus += 0.6 * mouseFactor;
          }
        }

        // Pulse dot scale with its phase sine wave
        const breathe = Math.sin(time * 0.0035 + dot.phase) * 0.4;
        const finalSize = Math.max(0.6, 1.2 + breathe + sizeBonus);

        // Map computedRisk directly to colors shown on user's reference image legend
        let dotColor = '#00F0FF'; // Very Low (Cyan)
        if (computedRisk >= 0.85) {
          dotColor = '#FF1F1F'; // Critical (Red)
        } else if (computedRisk >= 0.68) {
          dotColor = '#FF6600'; // High (Orange)
        } else if (computedRisk >= 0.48) {
          dotColor = '#FFB000'; // Moderate (Yellow/Amber)
        } else if (computedRisk >= 0.28) {
          dotColor = '#10B981'; // Low (Green)
        }

        ctx.fillStyle = dotColor;

        // Apply alpha glow transparency
        const baseAlpha = brightnessBonus > 0 ? Math.min(1.0, 0.45 + brightnessBonus) : 0.45;
        ctx.globalAlpha = baseAlpha;

        ctx.beginPath();
        ctx.arc(dotPX, dotPY, finalSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Hotspot rings & targeting elements
      HOTSPOTS.forEach((hs, idx) => {
        const hsX = hs.x * w;
        const hsY = hs.y * h;
        const isHoveredNode = hoveredHotspot?.id === hs.id;

        // Draw outer flashing beacon ring
        ctx.beginPath();
        ctx.arc(hsX, hsY, isHoveredNode ? 10 : 5, 0, Math.PI * 2);
        ctx.strokeStyle = hs.baseRisk > 0.8 ? '#FF1F1F' : hs.baseRisk > 0.5 ? '#FF6600' : '#10B981';
        ctx.lineWidth = isHoveredNode ? 2.0 : 1.0;
        ctx.globalAlpha = 0.55 + Math.sin(time * 0.006) * 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Solid core
        ctx.beginPath();
        ctx.arc(hsX, hsY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hs.baseRisk > 0.8 ? '#FF1F1F' : hs.baseRisk > 0.5 ? '#FF6600' : '#10B981';
        ctx.fill();

        // High Risk flashing radar text
        if (hs.baseRisk > 0.8 && idx % 3 === 0 && Math.sin(time * 0.003) > 0.7) {
          ctx.font = 'bold 6px monospace';
          ctx.fillStyle = '#FF1F1F';
          ctx.fillText('CRIT_WARN', hsX + 7, hsY - 2);
        }
      });

      // Special active Target Reticle tracking on Hovered Hotspot (3D Fighter HUD style)
      if (hoveredHotspot) {
        const hX = hoveredHotspot.x * w;
        const hY = hoveredHotspot.y * h;

        ctx.strokeStyle = '#FFB000';
        ctx.lineWidth = 1;
        
        // HUD dynamic rotating crosshair circles
        const rotationAngle = time * 0.002;
        ctx.save();
        ctx.translate(hX, hY);
        ctx.rotate(rotationAngle);
        
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();

        // Corner crosshair brackets
        ctx.setLineDash([]);
        const bracketSize = 5;
        const radiusOffset = 14;

        // Top Left Bracket
        ctx.beginPath();
        ctx.moveTo(hX - radiusOffset, hY - radiusOffset + bracketSize);
        ctx.lineTo(hX - radiusOffset, hY - radiusOffset);
        ctx.lineTo(hX - radiusOffset + bracketSize, hY - radiusOffset);
        ctx.stroke();

        // Top Right Bracket
        ctx.beginPath();
        ctx.moveTo(hX + radiusOffset, hY - radiusOffset + bracketSize);
        ctx.lineTo(hX + radiusOffset, hY - radiusOffset);
        ctx.lineTo(hX + radiusOffset - bracketSize, hY - radiusOffset);
        ctx.stroke();

        // Bottom Left Bracket
        ctx.beginPath();
        ctx.moveTo(hX - radiusOffset, hY + radiusOffset - bracketSize);
        ctx.lineTo(hX - radiusOffset, hY + radiusOffset);
        ctx.lineTo(hX - radiusOffset + bracketSize, hY + radiusOffset);
        ctx.stroke();

        // Bottom Right Bracket
        ctx.beginPath();
        ctx.moveTo(hX + radiusOffset, hY + radiusOffset - bracketSize);
        ctx.lineTo(hX + radiusOffset, hY + radiusOffset);
        ctx.lineTo(hX + radiusOffset - bracketSize, hY + radiusOffset);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [threatLevel, satelliteLinks, hoveredHotspot]);

  // Handle active metrics calculations based on threat levels
  const solarThreatStatus = threatLevel > 75 ? 'CRITICAL' : 'HIGH';
  const satelliteRiskStatus = threatLevel > 80 ? 'ALERT' : threatLevel > 50 ? 'MODERATE' : 'NOMINAL';
  const commsImpactStatus = threatLevel > 65 ? 'HIGH' : 'MODERATE';
  const systemStabilityStatus = threatLevel > 85 ? 'DEGRADED' : 'NOMINAL';

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.01 : 1}, ${isHovered ? 1.01 : 1}, 1)`,
        transition: isHovered ? 'none' : 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        transformStyle: 'preserve-3d'
      }}
      className="flex flex-col h-full justify-between select-none"
    >
      {/* 1. Header telemetry row */}
      <div className="flex justify-between items-start mb-3 shrink-0 border-b border-white/5 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="text-amber-neon animate-pulse" size={13} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Scoring Core Engine</h4>
          </div>
          <p className="text-[7px] font-mono text-white/30 uppercase tracking-widest mt-0.5">Arka predictive real-time feeds</p>
        </div>
        
        <div className="text-right">
          <div className={cn(
            "text-[9.5px] font-mono font-black transition-colors duration-300",
            threatLevel > 75 ? "text-red-threat animate-pulse" : "text-amber-neon text-glow-amber"
          )}>
            RISK LIMIT: {threatLevel > 75 ? 'BREACHED' : 'CONTAINED'}
          </div>
          <div className="text-[6.5px] font-mono text-white/40 tracking-wider">SEC v4.8 ACTIVE</div>
        </div>
      </div>

      {/* 2. Embedded Real-time Dot-Matrix Heatmap */}
      <div className="relative flex-1 min-h-0 bg-black/60 border border-white/5 rounded-2xl p-2.5 mb-3 flex flex-col overflow-hidden shrink-0">
        
        {/* Header inside the heat map container */}
        <div className="flex justify-between items-center mb-1.5 shrink-0 border-b border-white/5 pb-1">
          <div className="flex items-center gap-1.5">
            <Globe className="text-amber-neon animate-spin-slow" size={11} />
            <span className="text-[8.5px] font-mono text-white/70 uppercase tracking-wider font-extrabold">Global Risk Heat Map</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Clickable interactive actions */}
            <div className="flex gap-1">
              <button 
                onClick={triggerPulseScan}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 active:bg-amber-neon/20 border border-white/5 hover:border-amber-neon/30 text-[6.5px] font-mono font-black text-amber-neon uppercase tracking-wider transition-all duration-200 cursor-pointer"
                title="Force global sonar sweep"
              >
                Pulse Scan
              </button>
              <button 
                onClick={triggerSatRealign}
                className={cn(
                  "px-1.5 py-0.5 rounded border text-[6.5px] font-mono font-black uppercase tracking-wider transition-all duration-200 cursor-pointer",
                  aligningSatellites 
                    ? "bg-cyan-data/20 border-cyan-data text-cyan-data animate-pulse" 
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-cyan-data hover:border-cyan-data/30"
                )}
                title="Re-route telemetry links"
              >
                {aligningSatellites ? 'Syncing...' : 'Sat-Link'}
              </button>
            </div>
            
            <span className="text-[7.5px] font-mono text-white/50 flex gap-1.5">
              <span className="text-red-threat font-bold">PEAK RISK: {Math.round(threatLevel * 0.9 + 5)}%</span>
              <span className="opacity-30">|</span>
              <span className="text-cyan-data tracking-tighter">ENTROPY: {metrics.entropyRate.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Real Dynamic Interactive Canvas */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden">
          <canvas 
            ref={canvasRef} 
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair" 
          />
          
          {/* Scanning HUD overlay label */}
          <div className="absolute bottom-1 right-1 font-mono text-[6px] text-white/30 pointer-events-none select-none">
            SCANNER_LATENCY: {lastScanTime}
          </div>

          {/* Special Hover Hotspot Tooltip Overlay */}
          <AnimatePresence>
            {hoveredHotspot && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-1 left-1 bg-black/90 border border-amber-neon/40 rounded-xl p-2.5 backdrop-blur-md pointer-events-none z-20 shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-w-[150px] font-mono text-[7px] leading-normal"
              >
                <div className="text-amber-neon font-black uppercase tracking-wider border-b border-white/10 pb-1 mb-1.5 flex items-center justify-between">
                  <span>{hoveredHotspot.name}</span>
                  <span className="text-[5.5px] px-1 rounded bg-amber-neon/15 text-amber-neon border border-amber-neon/20 animate-pulse">ACTIVE</span>
                </div>
                <div className="text-white/60 space-y-1">
                  <div>TARGET INDEX: <span className="text-white font-bold">PROT_{hoveredHotspot.id.toUpperCase()}</span></div>
                  <div>THREAT LEVEL: <span className="text-red-threat font-bold">{(hoveredHotspot.baseRisk * 100).toFixed(0)}% CRIT</span></div>
                  <div>GEOLOCATION: <span className="text-cyan-data">{((0.5 - hoveredHotspot.y) * 180).toFixed(2)}° N, {((hoveredHotspot.x - 0.5) * 360).toFixed(2)}° E</span></div>
                  <div className="text-[6.5px] text-amber-neon/80 italic mt-1.5 uppercase font-black leading-none animate-pulse flex items-center gap-1">
                    <Crosshair size={7} />
                    <span>Click map to pulse-sweep</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend Row */}
        <div className="flex items-center justify-between text-[7px] font-mono text-white/40 mt-1.5 shrink-0 border-t border-white/5 pt-1.5">
          <span className="uppercase tracking-[0.1em] font-extrabold">Risk Level</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-[#00F0FF]" />VERY LOW</span>
            <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-[#10B981]" />LOW</span>
            <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-[#FFB000]" />MODERATE</span>
            <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-[#FF6600]" />HIGH</span>
            <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-[#FF1F1F]" />CRITICAL</span>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Micro-factor inline grids */}
      <div className="grid grid-cols-4 gap-1.5 shrink-0">
        {/* Metric 1 */}
        <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between min-h-[38px] transition-all hover:bg-white/[0.03] hover:border-white/10">
          <div className="flex items-center gap-1 text-white/40 font-mono text-[6.5px] font-bold uppercase tracking-wider">
            <Orbit size={8} className="text-red-threat" />
            <span>Solar Threat</span>
          </div>
          <span className={cn(
            "font-mono text-[9px] font-black uppercase mt-0.5",
            solarThreatStatus === 'CRITICAL' ? "text-red-threat animate-pulse" : "text-amber-neon"
          )}>
            {solarThreatStatus}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between min-h-[38px] transition-all hover:bg-white/[0.03] hover:border-white/10">
          <div className="flex items-center gap-1 text-white/40 font-mono text-[6.5px] font-bold uppercase tracking-wider">
            <Satellite size={8} className={cn("text-amber-neon", aligningSatellites ? "animate-spin" : "animate-spin-slow")} />
            <span>Satellite Risk</span>
          </div>
          <span className="font-mono text-[9px] font-black text-amber-neon uppercase mt-0.5">
            {satelliteRiskStatus}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between min-h-[38px] transition-all hover:bg-white/[0.03] hover:border-white/10">
          <div className="flex items-center gap-1 text-white/40 font-mono text-[6.5px] font-bold uppercase tracking-wider">
            <Radio size={8} className="text-red-threat animate-pulse" />
            <span>Comms Impact</span>
          </div>
          <span className={cn(
            "font-mono text-[9px] font-black uppercase mt-0.5",
            commsImpactStatus === 'HIGH' ? "text-red-threat" : "text-amber-neon"
          )}>
            {commsImpactStatus}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-1.5 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between min-h-[38px] transition-all hover:bg-white/[0.03] hover:border-white/10">
          <div className="flex items-center gap-1 text-white/40 font-mono text-[6.5px] font-bold uppercase tracking-wider">
            <ShieldCheck size={8} className="text-cyan-data" />
            <span>Stability</span>
          </div>
          <span className={cn(
            "font-mono text-[9px] font-black uppercase mt-0.5",
            systemStabilityStatus === 'DEGRADED' ? "text-amber-neon" : "text-cyan-data"
          )}>
            {systemStabilityStatus}
          </span>
        </div>
      </div>

      {/* 4. Warning Alert Footer Box */}
      <div className="mt-2.5 p-1.5 bg-[#FF1F1F]/5 border border-[#FF1F1F]/20 rounded-xl flex items-center gap-2 select-none shrink-0 min-h-[30px]">
        <AlertTriangle size={11} className={cn("text-red-threat shrink-0", threatLevel > 75 && "animate-bounce")} />
        <p className="text-[6.5px] text-white/50 font-mono leading-tight uppercase">
          {threatLevel > 75 
            ? "CRITICAL STATE: SEVERE BANKING TROJAN SIGNATURE MATCHES DETECTED IN ACTIVE HONEYPOTS. AUTOMATIC SANDBOX CONTAINMENT Protocols Active."
            : "MONITORING SYSTEM: Operational telemetry parameters remain within safe autonomous baseline indices."
          }
        </p>
      </div>
    </div>
  );
};
