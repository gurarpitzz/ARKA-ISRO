import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Link2, Database, Cpu, Target, Eye, LineChart, GitBranch, Sparkles, TrendingUp, Activity
} from 'lucide-react';

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

interface ARRegion {
  id: string;
  name: string;
  orbitIndex: number; // 0 = inner, 1 = middle, 2 = outer
  angle: number; // fixed angle for high-fidelity visual matching with image
  riskIndex: number;
  softXRay: string;
  hardXRay: string;
  instability: number;
  similarity: string;
  forecast: string;
  leadTime: string;
  status: string;
  color: 'red' | 'amber' | 'cyan' | 'orange';
}

const PRESET_REGIONS: ARRegion[] = [
  { 
    id: "AR-3423", 
    name: "AR-3423", 
    orbitIndex: 1, 
    angle: -Math.PI * 0.08, // right side, slightly up
    riskIndex: 92, 
    softXRay: "↗", 
    hardXRay: "↗", 
    instability: 0.92, 
    similarity: "94%", 
    forecast: "M-CLASS FLARE", 
    leadTime: "22 MINUTES", 
    status: "CANDIDATE HYPOTHESIS VALIDATED",
    color: 'red'
  },
  { 
    id: "AR-3418", 
    name: "AR-3418", 
    orbitIndex: 1, 
    angle: -Math.PI * 0.72, // top-left
    riskIndex: 68, 
    softXRay: "→", 
    hardXRay: "↗", 
    instability: 0.68, 
    similarity: "88%", 
    forecast: "C-CLASS FLARE", 
    leadTime: "45 MINUTES", 
    status: "UNDER OBSERVATION",
    color: 'amber'
  },
  { 
    id: "AR-3421", 
    name: "AR-3421", 
    orbitIndex: 2, 
    angle: -Math.PI * 0.5, // top
    riskIndex: 32, 
    softXRay: "↘", 
    hardXRay: "→", 
    instability: 0.32, 
    similarity: "71%", 
    forecast: "QUIET", 
    leadTime: "--", 
    status: "STABLE BASE STATE",
    color: 'cyan'
  },
  { 
    id: "AR-3422", 
    name: "AR-3422", 
    orbitIndex: 0, 
    angle: Math.PI, // left
    riskIndex: 78, 
    softXRay: "↗", 
    hardXRay: "↗", 
    instability: 0.78, 
    similarity: "91%", 
    forecast: "M-CLASS FLARE", 
    leadTime: "12 MINUTES", 
    status: "HIGHLY UNSTABLE",
    color: 'orange'
  },
  { 
    id: "AR-3425", 
    name: "AR-3425", 
    orbitIndex: 1, 
    angle: Math.PI * 0.12, // bottom-right
    riskIndex: 51, 
    softXRay: "→", 
    hardXRay: "↘", 
    instability: 0.51, 
    similarity: "82%", 
    forecast: "B-CLASS FLARE", 
    leadTime: "90 MINUTES", 
    status: "PERIODIC FLUCTUATIONS",
    color: 'orange'
  },
  { 
    id: "AR-3419", 
    name: "AR-3419", 
    orbitIndex: 2, 
    angle: Math.PI * 0.32, // bottom-right, lower down
    riskIndex: 15, 
    softXRay: "↘", 
    hardXRay: "↘", 
    instability: 0.15, 
    similarity: "65%", 
    forecast: "QUIET", 
    leadTime: "--", 
    status: "STABLE BASE STATE",
    color: 'cyan'
  },
  { 
    id: "AR-3420", 
    name: "AR-3420", 
    orbitIndex: 1, 
    angle: Math.PI * 0.5, // bottom
    riskIndex: 44, 
    softXRay: "→", 
    hardXRay: "→", 
    instability: 0.44, 
    similarity: "79%", 
    forecast: "B-CLASS FLARE", 
    leadTime: "120 MINUTES", 
    status: "LOW ACTIVITY",
    color: 'amber'
  },
  { 
    id: "AR-3417", 
    name: "AR-3417", 
    orbitIndex: 0, 
    angle: Math.PI * 0.72, // bottom-left
    riskIndex: 25, 
    softXRay: "↘", 
    hardXRay: "→", 
    instability: 0.25, 
    similarity: "70%", 
    forecast: "QUIET", 
    leadTime: "--", 
    status: "STABLE BASE STATE",
    color: 'cyan'
  }
];

interface TechHub {
  name: string;
  icon: React.ReactNode;
  angle: number;
}

export const ApkLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const constellationRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [selectedRegion, setSelectedRegion] = useState<ARRegion>(PRESET_REGIONS[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);

  // Dynamic particle effects for solar activity
  const solarParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }[]>([]);

  // High-fidelity cosmetic cosmic blue stardust flow particles
  const blueParticlesRef = useRef<{ t: number; speed: number; size: number; offset: number; pathType: 'upper' | 'lower' }[]>([]);

  // Web Audio Procedural Synth for tactile, immersive sound interaction
  const playSound = (type: 'hover' | 'click' | 'select') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!(window as any).cyberAudioCtx) {
        (window as any).cyberAudioCtx = new AudioContextClass();
      }
      const audioCtx = (window as any).cyberAudioCtx;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      if (type === 'hover') {
        // High-frequency subtle science-fiction sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.005, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else {
        // Harmonic futuristic chime (harmonized perfect fifths for pleasing sonic feedback)
        const osc2 = audioCtx.createOscillator();
        const gainNode2 = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1174.66, audioCtx.currentTime); // D6
        osc2.frequency.exponentialRampToValueAtTime(1760.00, audioCtx.currentTime + 0.15); // A6

        gainNode.gain.setValueAtTime(0.012, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

        gainNode2.gain.setValueAtTime(0.006, audioCtx.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc2.connect(gainNode2);
        gainNode2.connect(audioCtx.destination);

        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.18);
        osc2.stop(audioCtx.currentTime + 0.18);
      }
    } catch (err) {
      // Audio blocked or unsupported gracefully
    }
  };

  // Update canvas sizing responsively
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight || 480;
        setDimensions({ width, height });
        canvas.width = width;
        canvas.height = height;
      }
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Constellation Candidate Hypothesis Space rendering loop (Footer)
  useEffect(() => {
    const canvas = constellationRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 960;
    canvas.height = 95;

    let frameId: number;
    const count = 48;
    const points: { x: number; y: number; originY: number; size: number; phase: number; speed: number; alpha: number }[] = [];

    // Formulate nodes
    for (let i = 0; i < count; i++) {
      const rx = (i / (count - 1)) * canvas.width + (Math.random() - 0.5) * 12;
      const ry = 30 + Math.random() * 40;
      points.push({
        x: rx,
        y: ry,
        originY: ry,
        size: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.002,
        alpha: 0.15 + Math.random() * 0.3
      });
    }

    // Indices defining the validated hypothesis chain (golden path)
    const activePath = [2, 6, 11, 16, 21, 27, 32, 38, 43, 46];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();

      // Draw faint cyber connection web
      ctx.lineWidth = 0.5;
      for (let i = 0; i < count; i++) {
        const p1 = points[i];
        p1.y = p1.originY + Math.sin(time * p1.speed + p1.phase) * 6;

        for (let j = i + 1; j < Math.min(i + 4, count); j++) {
          const p2 = points[j];
          const dist = Math.abs(p1.x - p2.x);
          if (dist < 75) {
            const alpha = (1 - dist / 75) * 0.08;
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw background nodes
      for (let i = 0; i < count; i++) {
        const p = points[i];
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw beautiful highlighted candidate hypothesis chain (Golden path)
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 160, 0, 0.7)';
      
      let first = true;
      const chainCoords: { x: number; y: number }[] = [];

      activePath.forEach(idx => {
        const p = points[idx];
        if (p) {
          chainCoords.push({ x: p.x, y: p.y });
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      });
      ctx.stroke();

      // Wide glowing backing
      ctx.beginPath();
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = 'rgba(255, 140, 0, 0.1)';
      first = true;
      chainCoords.forEach(c => {
        if (first) {
          ctx.moveTo(c.x, c.y);
          first = false;
        } else {
          ctx.lineTo(c.x, c.y);
        }
      });
      ctx.stroke();

      // Draw chain targets
      chainCoords.forEach((c, idx) => {
        const isTargetNode = idx === chainCoords.length - 1;
        
        if (isTargetNode) {
          // Large target beacon on the right
          ctx.fillStyle = 'rgba(255, 160, 0, 0.2)';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 11 + Math.sin(time * 0.006) * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 160, 0, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#FF9100';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Animated signal pulse traversing the golden path
      const pulseSpeed = 0.0006;
      const progress = (time * pulseSpeed) % (chainCoords.length - 1);
      const segment = Math.floor(progress);
      const t = progress - segment;
      const n1 = chainCoords[segment];
      const n2 = chainCoords[segment + 1];
      if (n1 && n2) {
        const px = n1.x + (n2.x - n1.x) * t;
        const py = n1.y + (n2.y - n1.y) * t;

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF9100';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Main canvas animation loop (Hypothesis Solar Core & Elliptical Orbits)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      const cx = dimensions.width / 2 - 35;
      const cy = dimensions.height / 2;
      const time = Date.now();

      // Deep space canvas background
      ctx.fillStyle = '#010204';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // 1. Draw subtle background coordinate mesh lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - 360, cy); ctx.lineTo(cx + 360, cy);
      ctx.moveTo(cx, cy - 240); ctx.lineTo(cx, cy + 240);
      ctx.stroke();

      // Concentric structural scope/radar rings
      for (let d = 90; d <= 330; d += 60) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, d, d * 0.72, 0, 0, Math.PI * 2);
        ctx.strokeStyle = d === 150 ? 'rgba(255, 145, 0, 0.025)' : 'rgba(255, 255, 255, 0.008)';
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }

      // 2. SOLEXS & HELIOS subtle signal waves mapped directly on the left edge inside canvas
      const drawSignalSource = (startY: number, label: string) => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 0.8;
        let lastX = 20;
        let lastY = startY;
        ctx.moveTo(lastX, lastY);
        
        for (let x = 20; x < cx - 120; x += 10) {
          const dy = startY + Math.sin(x * 0.02 + time * 0.001) * 6 + Math.cos(x * 0.04 - time * 0.002) * 3;
          ctx.lineTo(x, dy);
          lastX = x;
          lastY = dy;
        }
        ctx.stroke();

        // Connector dots flowing to central hub
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        ctx.moveTo(lastX, lastY);
        ctx.quadraticCurveTo(cx - 100, cy, cx - 60, cy);
        ctx.stroke();
      };

      drawSignalSource(cy - 60, "SOLEXS");
      drawSignalSource(cy + 60, "HELIOS");

      // ----------------------------------------------------------------------
      // Cosmic Blue Stardust Flow Particles (Symmetrically wrapping the orbits)
      // ----------------------------------------------------------------------
      if (blueParticlesRef.current.length === 0) {
        for (let i = 0; i < 110; i++) {
          blueParticlesRef.current.push({
            t: Math.random(),
            speed: 0.001 + Math.random() * 0.0015,
            size: 0.6 + Math.random() * 1.6,
            offset: (Math.random() - 0.5) * 16,
            pathType: Math.random() > 0.5 ? 'upper' : 'lower'
          });
        }
      }

      // Cubic Bezier helper
      const getCubicBezierPoint = (
        t: number,
        p0: { x: number; y: number },
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        p3: { x: number; y: number }
      ) => {
        const oneMinusT = 1 - t;
        const x = Math.pow(oneMinusT, 3) * p0.x +
                  3 * Math.pow(oneMinusT, 2) * t * p1.x +
                  3 * oneMinusT * Math.pow(t, 2) * p2.x +
                  Math.pow(t, 3) * p3.x;
        const y = Math.pow(oneMinusT, 3) * p0.y +
                  3 * Math.pow(oneMinusT, 2) * t * p1.y +
                  3 * oneMinusT * Math.pow(t, 2) * p2.y +
                  Math.pow(t, 3) * p3.y;
        return { x, y };
      };

      blueParticlesRef.current.forEach((p) => {
        p.t += p.speed;
        if (p.t >= 1.0) {
          p.t = 0;
          p.speed = 0.001 + Math.random() * 0.0015;
          p.size = 0.6 + Math.random() * 1.6;
          p.offset = (Math.random() - 0.5) * 16;
        }

        let p0, p1, p2, p3;
        if (p.pathType === 'upper') {
          p0 = { x: 25, y: cy - 60 };
          p1 = { x: cx - 120, y: cy - 240 };
          p2 = { x: cx + 240, y: cy - 220 };
          p3 = { x: dimensions.width - 150, y: cy + 45 };
        } else {
          p0 = { x: 25, y: cy + 60 };
          p1 = { x: cx - 120, y: cy + 240 };
          p2 = { x: cx + 240, y: cy + 220 };
          p3 = { x: dimensions.width - 150, y: cy + 45 };
        }

        const basePt = getCubicBezierPoint(p.t, p0, p1, p2, p3);
        
        // Add lateral offset for atmospheric thickness
        const finalX = basePt.x + (p.pathType === 'upper' ? -p.offset * 0.3 : p.offset * 0.3);
        const finalY = basePt.y + p.offset;

        const alpha = Math.sin(p.t * Math.PI) * 0.58; // soft fade in/out
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(finalX, finalY, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ----------------------------------------------------------------------
      // Solar Core (Central Sun Star - Premium 3D Texturing)
      // ----------------------------------------------------------------------
      const sunRad = 52;

      // Render custom heat particle storm (Coronal Mass Ejections)
      if (solarParticlesRef.current.length < 35 && Math.random() > 0.4) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 0.3 + Math.random() * 0.6;
        solarParticlesRef.current.push({
          x: cx + Math.cos(pAngle) * sunRad * 0.8,
          y: cy + Math.sin(pAngle) * sunRad * 0.8 * 0.72,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed * 0.72,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          size: 1 + Math.random() * 2,
          color: Math.random() > 0.45 ? 'rgba(255, 110, 0, 0.6)' : 'rgba(255, 190, 10, 0.5)'
        });
      }

      // Update and draw solar fire storm particles
      solarParticlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        const alpha = 1 - (p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + p.life * 0.03), 0, Math.PI * 2);
        ctx.fill();
      });

      solarParticlesRef.current = solarParticlesRef.current.filter(p => p.life < p.maxLife);

      // Deep atmospheric outer solar halos (glorious ambient heat)
      const sunGrad = ctx.createRadialGradient(cx, cy, sunRad * 0.3, cx, cy, sunRad * 3.5);
      sunGrad.addColorStop(0, 'rgba(255, 80, 0, 0.25)');
      sunGrad.addColorStop(0.25, 'rgba(255, 120, 0, 0.09)');
      sunGrad.addColorStop(0.5, 'rgba(255, 50, 0, 0.02)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, sunRad * 3.5, sunRad * 3.5 * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright coronal ring
      const coronaGrad = ctx.createRadialGradient(cx, cy, sunRad * 0.75, cx, cy, sunRad * 1.4);
      coronaGrad.addColorStop(0, 'rgba(255, 180, 20, 0.75)');
      coronaGrad.addColorStop(0.4, 'rgba(255, 90, 0, 0.35)');
      coronaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, sunRad * 1.4, sunRad * 1.4 * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fiery plasma turbulent textures/filament lines rotating under shading (Exact replica feel)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.0001);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.28)';
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 12; k++) {
        const rAng = (k / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, sunRad * 1.12, sunRad * 0.62, rAng, 0, Math.PI * 1.3);
        ctx.stroke();
      }
      ctx.restore();

      // Sharp Solar Disk Core
      const diskGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRad);
      diskGrad.addColorStop(0, '#FFFFFF');
      diskGrad.addColorStop(0.15, '#FFE275');
      diskGrad.addColorStop(0.45, '#FF8D00');
      diskGrad.addColorStop(0.8, '#FF3700');
      diskGrad.addColorStop(1, '#7C0000');
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, sunRad, sunRad * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // High-tech 3D spherical shading overlay (Creates jaw-dropping volumetric depth!)
      const sunShade = ctx.createRadialGradient(cx - 15, cy - 15, sunRad * 0.1, cx + 5, cy + 5, sunRad * 1.15);
      sunShade.addColorStop(0, 'rgba(255, 255, 255, 0.42)'); // light source highlight
      sunShade.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
      sunShade.addColorStop(0.82, 'rgba(0, 0, 0, 0.72)'); // volumetric shadow
      sunShade.addColorStop(1, 'rgba(0, 0, 0, 0.95)'); // solid edge shadow
      ctx.fillStyle = sunShade;
      ctx.beginPath();
      ctx.ellipse(cx, cy, sunRad, sunRad * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw subtle coronal loops (magnetic energy lines on the Sun)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 8, 16, 0, Math.PI * 1.25, true);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 18, cy + 10, 11, -0.4, Math.PI * 0.82);
      ctx.stroke();

      // ----------------------------------------------------------------------
      // Elliptical Orbits (Inner, Middle, Outer)
      // ----------------------------------------------------------------------
      const orbitRadii = [
        { rx: 125, ry: 90 }, // Orbit 0
        { rx: 185, ry: 135 }, // Orbit 1
        { rx: 245, ry: 178 }  // Orbit 2
      ];

      orbitRadii.forEach((orb, index) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = index === 1 ? 'rgba(255, 145, 0, 0.08)' : 'rgba(0, 240, 255, 0.06)';
        ctx.lineWidth = 0.95;
        ctx.setLineDash([4, 10]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbit satellite indicator riding the loop
        const oAngle = (time * (0.0003 - index * 0.00007)) % (Math.PI * 2);
        const ox = cx + Math.cos(oAngle) * orb.rx;
        const oy = cy + Math.sin(oAngle) * orb.ry;
        ctx.fillStyle = index === 1 ? 'rgba(255, 145, 0, 0.6)' : 'rgba(0, 240, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(ox, oy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // ----------------------------------------------------------------------
      // Draw Region Nodes
      // ----------------------------------------------------------------------
      // 1. Calculate and collect all node positions first
      const calculatedPositions: { [key: string]: { x: number; y: number } } = {};
      PRESET_REGIONS.forEach((node) => {
        const orb = orbitRadii[node.orbitIndex];
        const oscillation = Math.sin(time * 0.0008 + node.angle) * 0.015;
        const finalAngle = node.angle + oscillation;
        calculatedPositions[node.id] = {
          x: cx + Math.cos(finalAngle) * orb.rx,
          y: cy + Math.sin(finalAngle) * orb.ry
        };
      });

      // Maintain positioning maps for mouse clicks
      setNodePositions(calculatedPositions);

      // 2. Draw beautifully connected dots (constellation lines linking adjacent nodes in chronological order)
      const loopOrder = [
        "AR-3421",
        "AR-3418",
        "AR-3422",
        "AR-3417",
        "AR-3420",
        "AR-3419",
        "AR-3425",
        "AR-3423"
      ];

      for (let i = 0; i < loopOrder.length; i++) {
        const idA = loopOrder[i];
        const idB = loopOrder[(i + 1) % loopOrder.length];
        const pA = calculatedPositions[idA];
        const pB = calculatedPositions[idB];

        if (pA && pB) {
          const isASelected = selectedRegion.id === idA;
          const isBSelected = selectedRegion.id === idB;
          const isAHovered = hoveredNode === idA;
          const isBHovered = hoveredNode === idB;

          // Connective line styles based on state
          let strokeStyle = 'rgba(0, 240, 255, 0.085)';
          let lineWidth = 0.85;
          let isGlowSegment = false;

          if (isAHovered || isBHovered) {
            strokeStyle = 'rgba(0, 240, 255, 0.65)';
            lineWidth = 1.4;
            isGlowSegment = true;
          } else if (isASelected || isBSelected) {
            strokeStyle = selectedRegion.color === 'red' ? 'rgba(255, 56, 56, 0.45)' : 'rgba(255, 145, 0, 0.4)';
            lineWidth = 1.15;
            isGlowSegment = true;
          }

          // Subtle curved line for futuristic high-tech constellation aesthetic
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          
          // Bezier control point slightly pulled towards the center to form a gorgeous web
          const midX = (pA.x + pB.x) / 2;
          const midY = (pA.y + pB.y) / 2;
          const pullFactor = 0.16;
          const ctrlX = midX + (cx - midX) * pullFactor;
          const ctrlY = midY + (cy - midY) * pullFactor;

          ctx.quadraticCurveTo(ctrlX, ctrlY, pB.x, pB.y);
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          // Animated particle traveling down hovered/active segments
          if (isGlowSegment) {
            const pulseT = (time * 0.0008) % 1.0;
            const px = (1 - pulseT) * (1 - pulseT) * pA.x + 2 * (1 - pulseT) * pulseT * ctrlX + pulseT * pulseT * pB.x;
            const py = (1 - pulseT) * (1 - pulseT) * pA.y + 2 * (1 - pulseT) * pulseT * ctrlY + pulseT * pulseT * pB.y;

            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = isAHovered || isBHovered ? '#00F0FF' : '#FF9100';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // 3. Draw individual region nodes on top of connections
      PRESET_REGIONS.forEach((node) => {
        const { x: nx, y: ny } = calculatedPositions[node.id];
        const isSelected = selectedRegion.id === node.id;
        const isHovered = hoveredNode === node.id;

        let dotColor = '#00F0FF';
        let glowColor = 'rgba(0, 240, 255, 0.35)';
        if (node.color === 'red') {
          dotColor = '#FF3838';
          glowColor = 'rgba(255, 56, 56, 0.45)';
        } else if (node.color === 'amber') {
          dotColor = '#FF9F1C';
          glowColor = 'rgba(255, 159, 28, 0.4)';
        } else if (node.color === 'orange') {
          dotColor = '#FF6B35';
          glowColor = 'rgba(255, 107, 53, 0.4)';
        }

        // Faint glowing golden connector beam radiating outward from Sun to node
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = node.color === 'red' ? 'rgba(255, 56, 56, 0.06)' : 'rgba(255, 145, 0, 0.05)';
        ctx.lineWidth = 0.7;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Radial beam light speed particles flowing outwards
        const beamT = (time * 0.0004 + node.orbitIndex * 0.25) % 1.0;
        const bpx = cx + (nx - cx) * beamT;
        const bpy = cy + (ny - cy) * beamT;
        ctx.fillStyle = node.color === 'red' ? 'rgba(255, 56, 56, 0.5)' : 'rgba(255, 159, 28, 0.4)';
        ctx.beginPath();
        ctx.arc(bpx, bpy, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Selected corner bracket reticle
        if (isSelected) {
          const s = 14;
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(nx - s, ny - s + 4); ctx.lineTo(nx - s, ny - s); ctx.lineTo(nx - s + 4, ny - s);
          ctx.moveTo(nx + s, ny - s + 4); ctx.lineTo(nx + s, ny - s); ctx.lineTo(nx + s - 4, ny - s);
          ctx.moveTo(nx - s, ny + s - 4); ctx.lineTo(nx - s, ny + s); ctx.lineTo(nx - s + 4, ny + s);
          ctx.moveTo(nx + s, ny + s - 4); ctx.lineTo(nx + s, ny + s); ctx.lineTo(nx + s - 4, ny + s);
          ctx.stroke();

          // Outer ambient target sonar radar ripple
          const ripR = 12 + (time * 0.015) % 18;
          const ripAlpha = 1 - (ripR - 12) / 18;
          ctx.strokeStyle = `rgba(${node.color === 'red' ? '255,56,56' : '0,240,255'}, ${ripAlpha * 0.35})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.arc(nx, ny, ripR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Hover pulsing ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(nx, ny, 11, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${node.color === 'red' ? '255,56,56' : '0,240,255'}, 0.15)`;
          ctx.fill();

          // Sparkle emitter on hover
          if (Math.random() > 0.4) {
            const hAngle = Math.random() * Math.PI * 2;
            const hDist = 8 + Math.random() * 8;
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(nx + Math.cos(hAngle) * hDist, ny + Math.sin(hAngle) * hDist, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Outer concentric detailed scope rings
        ctx.beginPath();
        ctx.arc(nx, ny, 8.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${node.color === 'red' ? '255,56,56' : '0,240,255'}, 0.25)`;
        ctx.lineWidth = 0.55;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.strokeStyle = dotColor;
        ctx.lineWidth = 0.95;
        ctx.stroke();

        // Premium 3D Glossy/Glass sphere rendering using offset radial lighting!
        const nodeGlassGrad = ctx.createRadialGradient(nx - 2, ny - 2, 0, nx, ny, 6.5);
        nodeGlassGrad.addColorStop(0, '#FFFFFF'); // Highlight source
        nodeGlassGrad.addColorStop(0.32, dotColor); // Base colored glass
        nodeGlassGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.65)'); // shadow falloff
        nodeGlassGrad.addColorStop(1, '#010204'); // black backing rim
        
        ctx.beginPath();
        ctx.arc(nx, ny, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = nodeGlassGrad;
        ctx.fill();

        // Core pinpoint light emitting point
        ctx.beginPath();
        ctx.arc(nx, ny, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = dotColor;
        ctx.shadowBlur = isSelected || isHovered ? 14 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Labels (High quality micro-typography matching the image)
        ctx.font = '8px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.45)';
        ctx.fillText(node.name, nx, ny - 12);

        ctx.font = '7.5px "Space Grotesk", sans-serif';
        ctx.fillStyle = isSelected ? dotColor : 'rgba(255,255,255,0.22)';
        ctx.fillText(node.name, nx, ny + 17);
      });

      // 4. Draw Laser Vector line from Selected Node to Dossier Panel on Right
      const selPos = calculatedPositions[selectedRegion.id];
      if (selPos) {
        const dossierX = dimensions.width - 150; // boundary matching compacted panel (w-[150px])
        const dossierY = cy + 45; // lower position

        ctx.beginPath();
        ctx.moveTo(selPos.x, selPos.y);
        ctx.lineTo((selPos.x + dossierX) / 2, (selPos.y + dossierY) / 2 - 10);
        ctx.lineTo(dossierX - 10, dossierY);
        ctx.lineTo(dossierX, dossierY);

        ctx.strokeStyle = selectedRegion.color === 'red' ? 'rgba(255, 56, 56, 0.45)' : 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [dimensions, selectedRegion, hoveredNode]);

  // Mouse moves for region node clicking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: string | null = null;
    PRESET_REGIONS.forEach(node => {
      const pos = nodePositions[node.id];
      if (pos) {
        const dx = mx - pos.x;
        const dy = my - pos.y;
        if (Math.sqrt(dx*dx + dy*dy) < 18) {
          found = node.id;
        }
      }
    });

    if (found !== hoveredNode) {
      setHoveredNode(found);
      if (found) {
        playSound('hover');
      }
    }
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      const region = PRESET_REGIONS.find(r => r.id === hoveredNode);
      if (region) {
        setSelectedRegion(region);
        playSound('click');
      }
    }
  };

  // Peripheral tech hub descriptors
  const peripheralHubs: TechHub[] = [
    { name: "CROSS-BAND CORRELATION", icon: <Link2 size={10} />, angle: -Math.PI * 0.45 },
    { name: "HISTORICAL MEMORY", icon: <Database size={10} />, angle: -Math.PI * 0.22 },
    { name: "PHYSICS CONSTRAINT ENGINE", icon: <Cpu size={10} />, angle: -Math.PI * 0.02 },
    { name: "SYMBOLIC DISCOVERY", icon: <LineChart size={10} />, angle: Math.PI * 0.18 },
    { name: "EXPLAINABILITY LAYER", icon: <Eye size={10} />, angle: Math.PI * 0.4 },
    { name: "FORECAST ENGINE", icon: <Target size={10} />, angle: Math.PI * 0.62 },
    { name: "CANDIDATE HYPOTHESIS SPACE", icon: <GitBranch size={10} />, angle: Math.PI * 0.85 },
    { name: "FEATURE EXTRACTION", icon: <Layers size={10} />, angle: -Math.PI * 0.72 }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#010204] rounded-2xl border border-white/5 overflow-hidden text-left font-sans relative select-none">
      
      {/* Immersive cyber matrix backdrops */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:25px_25px] opacity-30 mix-blend-color-dodge" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,110,0,0.02)_0%,transparent_75%)]" />

      {/* RE-WRITTEN MINIMAL HIGHEST-FIDELITY HYPOTHESIS FORGE TITLE HEADER (exactly as image) */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none space-y-0.5">
        <h3 className="text-[14px] font-black tracking-widest text-orange-400 font-mono uppercase">
          HYPOTHESIS FORGE
        </h3>
        <p className="text-[8px] font-mono text-white/35 uppercase tracking-widest leading-none">
          AI SCIENTIFIC REASONING & HYPOTHESIS EXPLORATION
        </p>
      </div>

      {/* SOLEXS & HELIOS SIGNAL STREAM COMPACT SIDE LABELS ON LEFT EDGE */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 z-20 flex flex-col gap-28 pointer-events-none font-mono">
        <div className="flex items-center gap-2 border border-white/5 bg-black/65 px-2.5 py-1.5 rounded-lg">
          <Activity size={10} className="text-cyan-400 animate-pulse" />
          <div className="text-left leading-none">
            <span className="text-[7.5px] text-white/40 block tracking-widest">SOLEXS</span>
            <span className="text-[7.5px] text-cyan-400 font-bold tracking-wider">SIGNAL STREAM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border border-white/5 bg-black/65 px-2.5 py-1.5 rounded-lg">
          <Activity size={10} className="text-cyan-400 animate-pulse" />
          <div className="text-left leading-none">
            <span className="text-[7.5px] text-white/40 block tracking-widest">HELIOS</span>
            <span className="text-[7.5px] text-cyan-400 font-bold tracking-wider">SIGNAL STREAM</span>
          </div>
        </div>
      </div>

      {/* CENTRAL STAGE & HUD SYSTEM */}
      <div className="flex-1 w-full relative min-h-0">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Layered Peripheral Tech Hub tags plotted dynamically around orbits */}
        {peripheralHubs.map((hub) => {
          const cx = dimensions.width / 2 - 35;
          const cy = dimensions.height / 2;
          const rx = 310;
          const ry = 220;

          // Compute absolute visual placement
          const hx = cx + Math.cos(hub.angle) * rx;
          const hy = cy + Math.sin(hub.angle) * ry;

          // Don't show if window is overly narrow
          if (dimensions.width < 640) return null;

          const isHovered = hoveredHub === hub.name;

          return (
            <div 
              key={hub.name}
              style={{ left: hx, top: hy }}
              onMouseEnter={() => {
                setHoveredHub(hub.name);
                playSound('hover');
              }}
              onMouseLeave={() => setHoveredHub(null)}
              onClick={() => playSound('click')}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 pointer-events-auto cursor-pointer transition-all duration-300"
            >
              <div className={`w-5 h-5 rounded-full bg-[#010204] flex items-center justify-center transition-all duration-300 ${
                isHovered 
                  ? "border-cyan-400 text-cyan-400 scale-110 shadow-[0_0_10px_rgba(0,240,255,0.45)]" 
                  : "border-white/20 text-white/60 hover:border-cyan-400/40 hover:text-cyan-300"
              } border`}>
                {hub.icon}
              </div>
              <div className={`text-[7px] font-black tracking-widest font-mono uppercase bg-black/65 border px-1.5 py-0.5 rounded transition-all duration-300 ${
                isHovered 
                  ? "border-cyan-400 text-white" 
                  : "border-white/5 text-white/45"
              }`}>
                {hub.name}
              </div>
            </div>
          );
        })}

        {/* COMPACTED DOSSIER PANEL HUD (40% LESSER SIZE) - POSITIONED LOWER */}
        <div className="absolute top-20 right-5 z-20 w-[140px] pointer-events-auto bg-black/90 border border-white/10 rounded-xl p-2.5 backdrop-blur-md shadow-[0_12px_28px_rgba(0,0,0,0.9)] space-y-2">
          
          <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1">
              <Target className="text-red-500 animate-pulse" size={9} />
              <span className="text-[7.5px] font-mono font-black text-red-500 tracking-wider">REGION LOCKED</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <label className="text-[6.5px] font-mono text-white/35 uppercase tracking-wider">REGION ID</label>
              <span className="text-[10px] font-black font-mono text-white">{selectedRegion.name}</span>
            </div>

            <div className="space-y-1 bg-white/[0.01] p-1 rounded-md border border-white/5 text-[7px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-white/35">SOFT X-RAY:</span>
                <span className="font-bold text-red-500 text-[7.5px] flex items-center gap-0.5">{selectedRegion.softXRay}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.03] pt-0.5 mt-0.5">
                <span className="text-white/35">HARD X-RAY:</span>
                <span className="font-bold text-red-500 text-[7.5px] flex items-center gap-0.5">{selectedRegion.hardXRay}</span>
              </div>
            </div>

            <div className="space-y-1 pt-0.5 text-[7px] font-mono">
              <div className="flex justify-between">
                <span className="text-white/35">INSTABILITY:</span>
                <span className="font-black text-red-500 text-[7.5px]">{selectedRegion.instability.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/35">SIMILARITY:</span>
                <span className="font-black text-emerald-400">{selectedRegion.similarity}</span>
              </div>
              <div className="flex justify-between pt-0.5 border-t border-white/5">
                <span className="text-white/35">FORECAST:</span>
                <span className="font-black text-red-500 text-[6.5px]">{selectedRegion.forecast.split(" ")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/35">LEAD TIME:</span>
                <span className="font-black text-amber-500 text-[6.5px]">{selectedRegion.leadTime}</span>
              </div>
              <div className="flex justify-between pt-0.5 border-t border-white/5">
                <span className="text-white/35">STATUS:</span>
                <span className="font-bold text-emerald-400 text-[5.8px] tracking-wide text-right truncate max-w-[80px]">
                  {selectedRegion.status}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-1.5 flex justify-end">
            <button className="text-[6.5px] font-mono text-white/40 hover:text-white uppercase tracking-wider flex items-center gap-0.5 transition-colors">
              VIEW DETAILS <span className="text-red-500 font-black">&gt;</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER MULTI-CHAIN CANDIDATE HYPOTHESIS SPACE */}
      <div className="bg-[#010204]/85 border-t border-white/10 p-3 shrink-0 flex flex-col backdrop-blur-md relative z-10">
        <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/5">
          <div>
            <span className="text-[8.5px] font-black tracking-widest text-orange-400 font-mono uppercase block">CANDIDATE HYPOTHESIS SPACE</span>
            <span className="text-[7px] text-white/30 uppercase tracking-widest font-mono block">EXPLORING SCIENTIFIC HYPOTHESES</span>
          </div>
          <span className="text-[7px] font-mono text-cyan-400/80 tracking-wider font-bold">GNN VALIDATED MODEL CHAIN STATE</span>
        </div>
        
        {/* Animated Constellation Canvas */}
        <div className="w-full h-11 overflow-hidden relative rounded-lg border border-white/5 bg-black/50">
          <canvas ref={constellationRef} className="w-full h-full block" />
        </div>
      </div>

    </div>
  );
};
