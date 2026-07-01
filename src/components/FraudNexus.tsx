import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThreatNode, ThreatLink } from '../types';
import { 
  Zap, Radio, Activity, ShieldAlert, Orbit, Tv, Gauge, Compass, 
  Sun, Database, AlertOctagon, ArrowRight, ChevronRight, Play, Sparkles,
  RefreshCw, Info, Sliders, Layers, Power, Eye, Globe, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FraudNexusProps {
  nodes?: ThreatNode[];
  links?: ThreatLink[];
  isPlayingAutonomousMode?: boolean;
}

interface Subsystem {
  name: string;
  code: string;
  health: number;
  status: 'NOMINAL' | 'DEGRADED' | 'STANDBY';
  description: string;
}

const INITIAL_SUBSYSTEMS: Subsystem[] = [
  { name: 'Primary Core Spectrograph', code: 'PCS-992', health: 98, status: 'NOMINAL', description: 'Measures coronal emissions across far-UV wavelengths to identify initial CME thermal spikes.' },
  { name: 'High-Gain Antennas', code: 'HGA-332', health: 100, status: 'NOMINAL', description: 'Transfers high-bandwidth solar wind telemetry to ground base terminals without atmospheric distortion.' },
  { name: 'X-Ray Spectrometer (SOLEXS)', code: 'SLX-018', health: 94, status: 'NOMINAL', description: 'Tracks hard and soft solar X-ray flares to calculate rapid flare energy acceleration rates.' },
  { name: 'High energy L1 Orbit Spectrometer', code: 'HEL1-OS', health: 87, status: 'DEGRADED', description: 'Direct particles and interplanetary solar flares monitoring core. Currently experiencing high-magnetic strain.' },
  { name: 'Interplanetary Magnetometer', code: 'MAG-771', health: 100, status: 'NOMINAL', description: 'Monitors 3-axis magnetic field vector fluctuations in real-time solar space.' }
];

export const FraudNexus: React.FC<FraudNexusProps> = ({
  nodes,
  links,
  isPlayingAutonomousMode = false
}) => {
  // Global states matching Image 1 & Image 2
  const [selectedSensor, setSelectedSensor] = useState<'SOLEXS' | 'HEL1OS' | 'ADITYA-L1' | 'DSCOVR'>('SOLEXS');
  const [breachStatus, setBreachStatus] = useState<'ELEVATED' | 'CRITICAL' | 'STABLE'>('ELEVATED');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true); // Open by default for maximum cyberactivity!
  
  // Interactive variables
  const [cmeProbability, setCmeProbability] = useState<number>(72);
  const [cmeVelocity, setCmeVelocity] = useState<number>(1287);
  const [cmeDensity, setCmeDensity] = useState<number>(18.7);
  const [systemConfidence, setSystemConfidence] = useState<number>(91.3);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('Primary Core Spectrograph');
  const [activeSubsystems, setActiveSubsystems] = useState<Subsystem[]>(INITIAL_SUBSYSTEMS);

  // Active highlighted impact
  const [hoveredImpact, setHoveredImpact] = useState<string | null>(null);

  // Particle explosion trigger
  const [explosionActive, setExplosionActive] = useState<boolean>(false);
  const [activeRegionLock, setActiveRegionLock] = useState<string>('AR-3423');

  // Real-time fluctuating magnetic fields
  const [btVal, setBtVal] = useState<number>(-42.7);
  const [bzVal, setBzVal] = useState<number>(-36.2);

  // 3D canvas rendering controls
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interactive 3D drag rotation refs
  const rotationRef = useRef({ x: 0.25, y: -0.45 });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const lastMouseDownPos = useRef({ x: 0, y: 0 });
  const hoveredSubsystemRef = useRef<string | null>(null);

  // Floating sparks particles
  const particlesRef = useRef<{ x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, maxLife: number, color: string }[]>([]);

  // Telemetry stream logs
  const [sensorLogs, setSensorLogs] = useState<string[]>([]);

  // Telemetry logs generator
  useEffect(() => {
    const interval = setInterval(() => {
      setBtVal(prev => parseFloat((prev + (Math.random() - 0.5) * 1.8).toFixed(1)));
      setBzVal(prev => parseFloat((prev + (Math.random() - 0.5) * 1.4).toFixed(1)));
      setSystemConfidence(prev => Math.min(99.6, Math.max(84, parseFloat((prev + (Math.random() - 0.5) * 0.3).toFixed(1)))));

      const prefixes = {
        SOLEXS: ['[SOLEXS-L1]', '[FLARE-X-RAY]', '[DETECTOR-STB]'],
        HEL1OS: ['[HEL1OS-SPECT]', '[PARTICLE-BEAM]', '[IMF-MONITOR]'],
        'ADITYA-L1': ['[ADITYA-MAG]', '[ORBIT-VEC]', '[SOLAR-WIND]'],
        DSCOVR: ['[DSCOVR-SW]', '[EARTH-DEF]', '[SHOCK-FRONT]']
      };
      
      const actions = [
        `Convective core plasma velocity stabilized at ${cmeVelocity + Math.floor((Math.random() - 0.5) * 60)} km/s`,
        `Charged ion density flux: ${(cmeDensity + (Math.random() - 0.5) * 2.2).toFixed(2)} p/cm³`,
        `Active magnetic connection aligned with region spot ${activeRegionLock}`,
        `Geomagnetic storm prediction index: Kp=${Math.floor(cmeProbability / 12)}`,
        `X-Ray sensor feedback counts: ${Math.floor(Math.random() * 2200 + 1200)} counts/sec`,
        `Solar sub-surface turbulence indices showing convective pressure surge`
      ];

      const chosenPrefix = prefixes[selectedSensor][Math.floor(Math.random() * prefixes[selectedSensor].length)];
      const chosenAction = actions[Math.floor(Math.random() * actions.length)];
      
      setSensorLogs(prev => [
        `${chosenPrefix} ${chosenAction}`,
        ...prev.slice(0, 18)
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSensor, cmeVelocity, cmeDensity, activeRegionLock, cmeProbability]);

  // Initial logs reseed
  useEffect(() => {
    setSensorLogs([
      `[SYS-INIT] Telemetry downlink pipe locked to: ${selectedSensor}`,
      `[PORT-LOCK] Core 3-axis vector alignment matrix calibrated.`,
      `[FUSION] Multi-sensor telemetry active. Real-time solar threat scoring on.`
    ]);
  }, [selectedSensor]);

  // Sparkwave burst
  const triggerCmeDeceptionShield = () => {
    setExplosionActive(true);
    setTimeout(() => setExplosionActive(false), 800);

    const count = 150;
    const activeSpotLat = activeRegionLock === 'AR-3423' ? 15 : activeRegionLock === 'AR-3425' ? -25 : 45;
    const activeSpotLng = activeRegionLock === 'AR-3423' ? 65 : activeRegionLock === 'AR-3425' ? -15 : 120;

    const phi = (90 - activeSpotLat) * (Math.PI / 180);
    const theta = (activeSpotLng + 180) * (Math.PI / 180);
    const radius = 135;

    const sx = radius * Math.sin(phi) * Math.cos(theta);
    const sy = radius * Math.cos(phi);
    const sz = radius * Math.sin(phi) * Math.sin(theta);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      particlesRef.current.push({
        x: sx,
        y: sy,
        z: sz,
        vx: (Math.sin(phi) * Math.cos(theta) * speed) + (Math.random() - 0.5) * 5,
        vy: (Math.cos(phi) * speed) + (Math.random() - 0.5) * 5,
        vz: (Math.sin(phi) * Math.sin(theta) * speed) + (Math.random() - 0.5) * 5,
        life: 0,
        maxLife: 45 + Math.random() * 35,
        color: breachStatus === 'CRITICAL' ? '#FF1F1F' : '#FFAA00'
      });
    }

    setSensorLogs(prev => [
      `[ALERT] CORONAL MASS EJECTION BURST TRIGGERED AT ${activeRegionLock}!`,
      `[WARN] Kinetic shock front propagating outwards at ${cmeVelocity} km/s.`,
      `[SYS] Charged solar particle storm registered. Mitigation systems standby.`,
      ...prev
    ]);
  };

  // 3D Canvas rendering loop (No Three.js dependency needed, extremely fast HTML5 Canvas 3D projection)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        window.requestAnimationFrame(() => {
          canvas.width = width * window.devicePixelRatio;
          canvas.height = height * window.devicePixelRatio;
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
      }
    });
    resizeObserver.observe(container);

    const mouseHover = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const mousePos2D = { x: -1000, y: -1000 };

    const handleMouseMoveContainer = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseHover.targetX = (e.clientX - cx) / (rect.width / 2);
      mouseHover.targetY = (e.clientY - cy) / (rect.height / 2);
      mousePos2D.x = e.clientX - rect.left;
      mousePos2D.y = e.clientY - rect.top;
    };

    container.addEventListener('mousemove', handleMouseMoveContainer);

    // Cosmic Dust Starfield
    const cosmicDust: { x: number; y: number; z: number; vx: number; vy: number; vz: number; size: number; color: string }[] = [];
    for (let i = 0; i < 200; i++) {
      const radius = 150 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      cosmicDust.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        vz: (Math.random() - 0.5) * 0.1,
        size: 0.6 + Math.random() * 1.8,
        color: Math.random() > 0.7 ? 'rgba(0, 240, 255, 0.55)' : Math.random() > 0.35 ? 'rgba(255, 176, 0, 0.45)' : 'rgba(255, 255, 255, 0.55)'
      });
    }

    // Boiling Sunspot Cell granules
    const sunBoilCells: { theta: number; phi: number; r: number; speed: number }[] = [];
    for (let i = 0; i < 60; i++) {
      sunBoilCells.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        r: 10 + Math.random() * 16,
        speed: 1.5 + Math.random() * 2.5
      });
    }

    let localTimer = 0;

    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const sunRadius = Math.min(w * 0.42, h * 0.55);

      if (w === 0 || h === 0) {
        requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      localTimer += 0.004;

      // Draw Starfield
      const drawCosmicStarfield = (drawBackground: boolean) => {
        cosmicDust.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          const limit = 500;
          if (Math.abs(p.x) > limit) p.vx = -p.vx;
          if (Math.abs(p.y) > limit) p.vy = -p.vy;
          if (Math.abs(p.z) > limit) p.vz = -p.vz;

          const proj = project3D(p.x, p.y, p.z, 0.5);
          if (proj.visible) {
            const isBehind = proj.pz > 10;
            if (isBehind !== drawBackground) return;

            const dx = proj.px - sunCenterParallaxX;
            const dy = proj.py - sunCenterParallaxY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (isBehind && dist < sunRadius) return;

            const alpha = Math.max(0.15, Math.min(0.9, 1.1 - (proj.pz + 400) / 800));
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            
            const pulseSize = p.size * proj.scale * (1.0 + Math.sin(localTimer * 5 + p.x) * 0.3);
            ctx.arc(proj.px, proj.py, Math.max(0.5, pulseSize), 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1.0;
      };

      mouseHover.x += (mouseHover.targetX - mouseHover.x) * 0.08;
      mouseHover.y += (mouseHover.targetY - mouseHover.y) * 0.08;

      let shakeX = 0;
      let shakeY = 0;
      if (explosionActive) {
        shakeX = (Math.random() - 0.5) * 14;
        shakeY = (Math.random() - 0.5) * 14;
      }

      if (!isDraggingRef.current) {
        const factor = breachStatus === 'CRITICAL' ? 2.5 : breachStatus === 'ELEVATED' ? 1.0 : 0.3;
        rotationRef.current.y += 0.00075 * factor;
        rotationRef.current.x += Math.sin(localTimer * 0.4) * 0.00015 * factor;
      }

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const project3D = (x: number, y: number, z: number, parallaxScale: number = 1.0) => {
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        const paraX = mouseHover.x * 25 * parallaxScale;
        const paraY = mouseHover.y * 25 * parallaxScale;

        const fov = 420;
        const divisor = fov + z2;
        if (divisor <= 10) {
          return { px: w * 0.55, py: h * 0.45, pz: z2, scale: 0, visible: false };
        }
        const scale = fov / divisor;
        const px = x1 * scale + w * 0.55 + paraX + shakeX;
        const py = y2 * scale + h * 0.45 + paraY + shakeY;
        return { px, py, pz: z2, scale, visible: z2 < 340 && z2 > -400 };
      };

      // Satellite position framing - offset to match the 8:2 proportion
      const bx = -w * 0.16 + Math.sin(localTimer * 0.22) * 15;
      const by = 20 + Math.cos(localTimer * 0.32) * 12;
      const bz = -120;

      const satWorldProj = project3D(bx, by, bz, 1.4);
      const isSatelliteBehind = satWorldProj.visible && satWorldProj.pz > 0;

      const sunCenterParallaxX = w * 0.55 + mouseHover.x * 12 + shakeX;
      const sunCenterParallaxY = h * 0.45 + mouseHover.y * 12 + shakeY;

      // Draw high-tech HUD rings matching Image 1
      const drawHighTechHUD = () => {
        const ringRadii = [140, 180, 230, 290];
        ctx.lineWidth = 1;

        ringRadii.forEach((rad, rIdx) => {
          if (rIdx === 0) {
            ctx.strokeStyle = 'rgba(255, 110, 0, 0.12)';
            ctx.beginPath();
            ctx.arc(sunCenterParallaxX, sunCenterParallaxY, rad, 0, Math.PI * 2);
            ctx.stroke();
          } else if (rIdx === 1) {
            ctx.strokeStyle = 'rgba(255, 110, 0, 0.22)';
            ctx.setLineDash([3, 10]);
            ctx.beginPath();
            ctx.arc(sunCenterParallaxX, sunCenterParallaxY, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          } else if (rIdx === 2) {
            ctx.strokeStyle = 'rgba(255, 110, 0, 0.08)';
            ctx.beginPath();
            ctx.arc(sunCenterParallaxX, sunCenterParallaxY, rad, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 140, 0, 0.55)';
            ctx.font = '6px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let a = 0; a < 360; a += 15) {
              const angleRad = (a * Math.PI) / 180 + rotY * 0.35;
              const cosA = Math.cos(angleRad);
              const sinA = Math.sin(angleRad);

              ctx.strokeStyle = 'rgba(255, 110, 0, 0.25)';
              ctx.beginPath();
              ctx.moveTo(sunCenterParallaxX + cosA * rad, sunCenterParallaxY + sinA * rad);
              ctx.lineTo(sunCenterParallaxX + cosA * (rad + 6), sunCenterParallaxY + sinA * (rad + 6));
              ctx.stroke();

              if (a % 45 === 0) {
                const labelX = sunCenterParallaxX + cosA * (rad + 14);
                const labelY = sunCenterParallaxY + sinA * (rad + 14);
                ctx.fillText(`${a}°`, labelX, labelY);
              }
            }
          } else {
            ctx.strokeStyle = 'rgba(255, 110, 0, 0.05)';
            ctx.beginPath();
            ctx.arc(sunCenterParallaxX, sunCenterParallaxY, rad, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(sunCenterParallaxX - rad - 30, sunCenterParallaxY);
            ctx.lineTo(sunCenterParallaxX + rad + 30, sunCenterParallaxY);
            ctx.moveTo(sunCenterParallaxX, sunCenterParallaxY - rad - 30);
            ctx.lineTo(sunCenterParallaxX, sunCenterParallaxY + rad + 30);
            ctx.stroke();
          }
        });

        // Corner markings removed to maintain clean photograph view
      };

      // Draw Sun sphere
      const drawBlazingSun = () => {
        // Blazing flares - multiple layers for ultra hyperactive feel matching Image 1
        const numRays = 240;
        
        // Deep hot red layer
        ctx.strokeStyle = breachStatus === 'CRITICAL' ? 'rgba(255, 40, 0, 0.06)' : 'rgba(255, 90, 0, 0.04)';
        ctx.lineWidth = 2.0;
        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2 + localTimer * 0.03;
          const rayLen = sunRadius + 40 + Math.sin(localTimer * 4.5 + i * 2) * 25;
          const rx = sunCenterParallaxX + Math.cos(angle) * rayLen;
          const ry = sunCenterParallaxY + Math.sin(angle) * rayLen;
          ctx.beginPath();
          ctx.moveTo(sunCenterParallaxX, sunCenterParallaxY);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }

        // Mid-glow orange filament layer
        ctx.strokeStyle = 'rgba(255, 140, 0, 0.03)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < numRays; i += 2) {
          const angle = (i / numRays) * Math.PI * 2 - localTimer * 0.04;
          const rayLen = sunRadius + 75 + Math.cos(localTimer * 6.0 - i * 3) * 35;
          const rx = sunCenterParallaxX + Math.cos(angle) * rayLen;
          const ry = sunCenterParallaxY + Math.sin(angle) * rayLen;
          ctx.beginPath();
          ctx.moveTo(sunCenterParallaxX, sunCenterParallaxY);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }

        // Intense yellow spike corona spikes
        ctx.strokeStyle = 'rgba(255, 220, 80, 0.015)';
        ctx.lineWidth = 0.6;
        for (let i = 0; i < numRays; i += 3) {
          const angle = (i / numRays) * Math.PI * 2 + localTimer * 0.07;
          const rayLen = sunRadius + 110 + Math.sin(localTimer * 8.0 + i) * 55;
          const rx = sunCenterParallaxX + Math.cos(angle) * rayLen;
          const ry = sunCenterParallaxY + Math.sin(angle) * rayLen;
          ctx.beginPath();
          ctx.moveTo(sunCenterParallaxX, sunCenterParallaxY);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }

        // Atmosphere glows
        const sunGlow1 = ctx.createRadialGradient(sunCenterParallaxX, sunCenterParallaxY, sunRadius - 10, sunCenterParallaxX, sunCenterParallaxY, sunRadius + 60);
        sunGlow1.addColorStop(0, 'rgba(255, 50, 0, 0.7)');
        sunGlow1.addColorStop(0.4, 'rgba(255, 130, 0, 0.28)');
        sunGlow1.addColorStop(1, 'rgba(255, 20, 0, 0)');
        ctx.fillStyle = sunGlow1;
        ctx.beginPath();
        ctx.arc(sunCenterParallaxX, sunCenterParallaxY, sunRadius + 60, 0, Math.PI * 2);
        ctx.fill();

        const sunGlow2 = ctx.createRadialGradient(sunCenterParallaxX, sunCenterParallaxY, sunRadius - 40, sunCenterParallaxX, sunCenterParallaxY, sunRadius + 15);
        sunGlow2.addColorStop(0, 'rgba(255, 230, 0, 0.9)');
        sunGlow2.addColorStop(0.55, 'rgba(255, 90, 0, 0.35)');
        sunGlow2.addColorStop(1, 'rgba(255, 20, 0, 0)');
        ctx.fillStyle = sunGlow2;
        ctx.beginPath();
        ctx.arc(sunCenterParallaxX, sunCenterParallaxY, sunRadius + 15, 0, Math.PI * 2);
        ctx.fill();

        // Sun surface body
        const sunBodyGrad = ctx.createRadialGradient(sunCenterParallaxX, sunCenterParallaxY, 15, sunCenterParallaxX, sunCenterParallaxY, sunRadius);
        sunBodyGrad.addColorStop(0, '#FFFFFF');
        sunBodyGrad.addColorStop(0.18, '#FFE785');
        sunBodyGrad.addColorStop(0.42, '#FF9800');
        sunBodyGrad.addColorStop(0.78, '#E61E00');
        sunBodyGrad.addColorStop(1, '#330001');
        ctx.fillStyle = sunBodyGrad;
        ctx.beginPath();
        ctx.arc(sunCenterParallaxX, sunCenterParallaxY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Grid longitude mesh
        ctx.lineWidth = 0.5;
        const sunLatitudeLines = [-50, -25, 0, 25, 50];
        sunLatitudeLines.forEach(lat => {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          const rSub = sunRadius * Math.cos(lat * Math.PI / 180);
          const yOffset = sunRadius * Math.sin(lat * Math.PI / 180);

          for (let a = 0; a <= 360; a += 15) {
            const rRad = a * Math.PI / 180;
            const { px, py, visible } = project3D(rSub * Math.cos(rRad), yOffset, rSub * Math.sin(rRad), 0.9);
            if (visible) {
              if (a === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
          }
          ctx.stroke();
        });

        // Convective granules
        sunBoilCells.forEach((cell, idx) => {
          const pulse = Math.sin(localTimer * cell.speed + idx) * 3.2;
          const cRadius = cell.r + pulse;
          const driftTheta = cell.theta + localTimer * 0.015;

          const cx = sunRadius * Math.sin(cell.phi) * Math.cos(driftTheta);
          const cy = sunRadius * Math.cos(cell.phi);
          const cz = sunRadius * Math.sin(cell.phi) * Math.sin(driftTheta);

          const cellProj = project3D(cx, cy, cz, 0.95);
          if (cellProj.visible && cellProj.pz < 0) {
            const cellGrad = ctx.createRadialGradient(cellProj.px, cellProj.py, 1, cellProj.px, cellProj.py, Math.max(0.1, cRadius * cellProj.scale));
            cellGrad.addColorStop(0, 'rgba(255, 248, 190, 0.35)');
            cellGrad.addColorStop(0.55, 'rgba(255, 80, 0, 0.18)');
            cellGrad.addColorStop(1, 'rgba(255, 10, 0, 0)');

            ctx.fillStyle = cellGrad;
            ctx.beginPath();
            ctx.arc(cellProj.px, cellProj.py, Math.max(0.1, cRadius * cellProj.scale), 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Coronal magnetic arches swirling
        const sunspots = [
          { id: 'AR-3423', lat: 15, lng: 55, active: activeRegionLock === 'AR-3423' },
          { id: 'AR-3425', lat: -25, lng: -20, active: activeRegionLock === 'AR-3425' },
          { id: 'AR-3428', lat: 40, lng: 110, active: activeRegionLock === 'AR-3428' }
        ];

        sunspots.forEach((spot, index) => {
          const phi = (90 - spot.lat) * (Math.PI / 180);
          const theta = (spot.lng + 180) * (Math.PI / 180);

          const sx = sunRadius * Math.sin(phi) * Math.cos(theta);
          const sy = sunRadius * Math.cos(phi);
          const sz = sunRadius * Math.sin(phi) * Math.sin(theta);

          const spotProj = project3D(sx, sy, sz, 0.95);

          if (spotProj.visible && spotProj.pz < 10) {
            ctx.strokeStyle = spot.active ? '#FF1F1F' : '#FFAA00';
            ctx.lineWidth = spot.active ? 2.0 : 0.9;
            ctx.beginPath();
            const pRadius = (8 + Math.sin(localTimer * 7.0 + index) * 3) * spotProj.scale;
            ctx.arc(spotProj.px, spotProj.py, Math.max(0.1, pRadius), 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = spot.active ? '#FF1F1F' : '#FFB000';
            ctx.beginPath();
            ctx.arc(spotProj.px, spotProj.py, Math.max(0.1, 3.5 * spotProj.scale), 0, Math.PI * 2);
            ctx.fill();

            // Coordinate label tag
            ctx.font = '7px "JetBrains Mono", monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.fillText(`${spot.id} [${spot.active ? 'ACTIVE' : 'IDLE'}]`, spotProj.px + 10, spotProj.py - 2);

            // Magnetic loops
            const loopHeight = 1.35 + Math.sin(localTimer * 1.8 + index) * 0.12;
            const endLat = spot.lat + 18;
            const endLng = spot.lng + 28;
            const phiEnd = (90 - endLat) * (Math.PI / 180);
            const thetaEnd = (endLng + 180) * (Math.PI / 180);

            const ex = sunRadius * Math.sin(phiEnd) * Math.cos(thetaEnd);
            const ey = sunRadius * Math.cos(phiEnd);
            const ez = sunRadius * Math.sin(phiEnd) * Math.sin(thetaEnd);

            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;
            const mz = (sz + ez) / 2;
            const mLen = Math.sqrt(mx * mx + my * my + mz * mz);
            const cx = (mx / mLen) * sunRadius * loopHeight;
            const cy = (my / mLen) * sunRadius * loopHeight;
            const cz = (mz / mLen) * sunRadius * loopHeight;

            ctx.beginPath();
            ctx.strokeStyle = spot.active ? 'rgba(255, 50, 0, 0.75)' : 'rgba(255, 160, 0, 0.38)';
            ctx.lineWidth = spot.active ? 1.6 : 0.9;

            let lastPt = spotProj;
            const steps = 15;
            for (let i = 1; i <= steps; i++) {
              const t = i / steps;
              const invT = 1 - t;
              const lx = invT * invT * sx + 2 * invT * t * cx + t * t * ex;
              const ly = invT * invT * sy + 2 * invT * t * cy + t * t * ey;
              const lz = invT * invT * sz + 2 * invT * t * cz + t * t * ez;

              const lProj = project3D(lx, ly, lz, 0.95);
              if (lProj.visible) {
                ctx.moveTo(lastPt.px, lastPt.py);
                ctx.lineTo(lProj.px, lProj.py);
              }
              lastPt = lProj;
            }
            ctx.stroke();

            // Energy pulses on loops
            for (let k = 0; k < 2; k++) {
              const progress = ((localTimer * 0.5) + (k / 2)) % 1.0;
              const t = progress;
              const invT = 1 - t;
              
              const lx = invT * invT * sx + 2 * invT * t * cx + t * t * ex;
              const ly = invT * invT * sy + 2 * invT * t * cy + t * t * ey;
              const lz = invT * invT * sz + 2 * invT * t * cz + t * t * ez;
              
              const pProj = project3D(lx, ly, lz, 0.95);
              if (pProj.visible) {
                ctx.fillStyle = spot.active ? '#FF1F1F' : '#FFAA00';
                const pulseSize = (4 + Math.sin(localTimer * 9 + k) * 2) * pProj.scale;
                ctx.beginPath();
                ctx.arc(pProj.px, pProj.py, Math.max(0.7, pulseSize), 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(pProj.px, pProj.py, Math.max(0.3, pulseSize * 0.45), 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        });
      };

      // Draw high-fidelity satellite model matching Image 2
      const drawHighFidelitySatellite = () => {
        const localRotX = -0.55 + (mouseHover.y * 0.08) + Math.sin(localTimer * 0.4) * 0.04;
        const localRotY = -0.65 + (mouseHover.x * 0.08) + Math.cos(localTimer * 0.28) * 0.03;
        const localRotZ = 0.45 + Math.sin(localTimer * 0.18) * 0.02;

        const cosLX = Math.cos(localRotX);
        const sinLX = Math.sin(localRotX);
        const cosLY = Math.cos(localRotY);
        const sinLY = Math.sin(localRotY);
        const cosLZ = Math.cos(localRotZ);
        const sinLZ = Math.sin(localRotZ);

        const satLocProj = (lx: number, ly: number, lz: number) => {
          const sFactor = 0.70;
          const x = lx * sFactor;
          const y = (ly * sFactor) * cosLX - (lz * sFactor) * sinLX;
          const z = (ly * sFactor) * sinLX + (lz * sFactor) * cosLX;

          let x_y = x * cosLY - z * sinLY;
          let z_y = x * sinLY + z * cosLY;

          let rx = x_y * cosLZ - y * sinLZ;
          let ry = x_y * sinLZ + y * cosLZ;
          let rz = z_y;

          return project3D(bx + rx, by + ry, bz + rz, 1.4);
        };

        const sScale = satWorldProj.scale * 1.05;

        // Volumetric tracking laser beam
        const beamOrigin = satLocProj(0, 0, 0);
        if (beamOrigin.visible) {
          const sensorColors = {
            SOLEXS: { c1: 'rgba(0, 240, 255, 0.42)', c2: 'rgba(0, 240, 255, 0.01)', stroke: '#00F0FF' },
            HEL1OS: { c1: 'rgba(255, 110, 0, 0.42)', c2: 'rgba(255, 110, 0, 0.01)', stroke: '#FF6A00' },
            'ADITYA-L1': { c1: 'rgba(59, 130, 246, 0.42)', c2: 'rgba(59, 130, 246, 0.01)', stroke: '#3B82F6' },
            DSCOVR: { c1: 'rgba(16, 185, 129, 0.42)', c2: 'rgba(16, 185, 129, 0.01)', stroke: '#10B981' }
          };
          const beam = sensorColors[selectedSensor] || sensorColors.SOLEXS;

          ctx.beginPath();
          const beamGrad = ctx.createLinearGradient(beamOrigin.px, beamOrigin.py, sunCenterParallaxX, sunCenterParallaxY);
          beamGrad.addColorStop(0, beam.c1);
          beamGrad.addColorStop(0.9, beam.c2);
          ctx.fillStyle = beamGrad;

          const wCone = 16 * sScale;
          ctx.moveTo(beamOrigin.px - wCone, beamOrigin.py);
          ctx.lineTo(sunCenterParallaxX - 35, sunCenterParallaxY);
          ctx.lineTo(sunCenterParallaxX + 35, sunCenterParallaxY);
          ctx.lineTo(beamOrigin.px + wCone, beamOrigin.py);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.strokeStyle = beam.stroke;
          ctx.lineWidth = 1 * sScale;
          ctx.setLineDash([4, 6]);
          ctx.moveTo(beamOrigin.px, beamOrigin.py);
          ctx.lineTo(sunCenterParallaxX, sunCenterParallaxY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Subsystem Concentric Cylindrical Hull
        const drawConcentricCylinder = (radius: number, height: number, yOffset: number, baseColor: { r: number; g: number; b: number }) => {
          const facets = 8;
          const topCircle: any[] = [];
          const bottomCircle: any[] = [];

          for (let i = 0; i < facets; i++) {
            const ang = (i / facets) * Math.PI * 2;
            const cx = Math.cos(ang) * radius;
            const cz = Math.sin(ang) * radius;

            topCircle.push(satLocProj(cx, yOffset - height / 2, cz));
            bottomCircle.push(satLocProj(cx, yOffset + height / 2, cz));
          }

          for (let i = 0; i < facets; i++) {
            const nextI = (i + 1) % facets;
            const p1 = topCircle[i];
            const p2 = topCircle[nextI];
            const p3 = bottomCircle[nextI];
            const p4 = bottomCircle[i];

            if (p1.visible && p2.visible && p3.visible && p4.visible) {
              const facetAng = (i / facets) * Math.PI * 2 + localRotY;
              const sunAlign = Math.sin(facetAng);

              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.lineTo(p3.px, p3.py);
              ctx.lineTo(p4.px, p4.py);
              ctx.closePath();

              if (sunAlign > 0) {
                const lit = Math.floor(sunAlign * 140);
                ctx.fillStyle = `rgb(${baseColor.r + lit}, ${baseColor.g + Math.floor(lit * 0.45)}, ${baseColor.b})`;
              } else {
                const shadow = Math.floor(Math.abs(sunAlign) * 45);
                ctx.fillStyle = `rgb(${22 + shadow}, ${28 + shadow}, ${40 + shadow})`;
              }

              ctx.strokeStyle = 'rgba(255, 110, 0, 0.18)';
              ctx.lineWidth = 0.5 * sScale;
              ctx.fill();
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.moveTo(topCircle[0].px, topCircle[0].py);
          for (let i = 1; i < facets; i++) {
            ctx.lineTo(topCircle[i].px, topCircle[i].py);
          }
          ctx.closePath();
          ctx.fillStyle = '#060912';
          ctx.fill();
          ctx.stroke();
        };

        // Layers of Satellite Core
        drawConcentricCylinder(25, 7, 10, { r: 95, g: 65, b: 15 });
        drawConcentricCylinder(18, 30, -5, { r: 105, g: 72, b: 22 });
        drawConcentricCylinder(13, 9, -22, { r: 125, g: 82, b: 28 });

        // Concentric support rings
        const drawRing = (rad: number, yOffset: number, stroke: string, weight: number) => {
          const facets = 12;
          const ringPts: any[] = [];
          for (let i = 0; i < facets; i++) {
            const ang = (i / facets) * Math.PI * 2;
            ringPts.push(satLocProj(Math.cos(ang) * rad, yOffset, Math.sin(ang) * rad));
          }
          ctx.beginPath();
          ctx.moveTo(ringPts[0].px, ringPts[0].py);
          for (let i = 1; i < facets; i++) {
            ctx.lineTo(ringPts[i].px, ringPts[i].py);
          }
          ctx.closePath();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = weight * sScale;
          ctx.stroke();
        };

        drawRing(27, 10, '#ffaa00', 1.6);
        drawRing(18, -5, '#00f0ff', 0.9);
        drawRing(13, -22, '#ffffff', 1.0);

        // Diagonal high-precision Solar Panels
        const drawDiagonalSolarWing = (isLeft: boolean) => {
          const sign = isLeft ? -1 : 1;
          const lw1 = satLocProj(sign * 25, 0, -20);
          const lw2 = satLocProj(sign * 175, 0, -20);
          const lw3 = satLocProj(sign * 175, 0, 20);
          const lw4 = satLocProj(sign * 25, 0, 20);

          if (lw1.visible && lw2.visible && lw3.visible && lw4.visible) {
            ctx.beginPath();
            ctx.moveTo(lw1.px, lw1.py);
            ctx.lineTo(lw2.px, lw2.py);
            ctx.lineTo(lw3.px, lw3.py);
            ctx.lineTo(lw4.px, lw4.py);
            ctx.closePath();
            ctx.fillStyle = '#04060b';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.5 * sScale;
            ctx.fill();
            ctx.stroke();

            // Render detailed blue grids on panels
            const cells = 6;
            for (let c = 0; c < cells; c++) {
              const start = c / cells;
              const end = (c + 0.95) / cells;

              const c1 = {
                px: lw1.px + (lw2.px - lw1.px) * start,
                py: lw1.py + (lw2.py - lw1.py) * start
              };
              const c2 = {
                px: lw1.px + (lw2.px - lw1.px) * end,
                py: lw1.py + (lw2.py - lw1.py) * end
              };
              const c3 = {
                px: lw4.px + (lw3.px - lw4.px) * end,
                py: lw4.py + (lw3.py - lw4.py) * end
              };
              const c4 = {
                px: lw4.px + (lw3.px - lw4.px) * start,
                py: lw4.py + (lw3.py - lw4.py) * start
              };

              ctx.beginPath();
              ctx.moveTo(c1.px, c1.py);
              ctx.lineTo(c2.px, c2.py);
              ctx.lineTo(c3.px, c3.py);
              ctx.lineTo(c4.px, c4.py);
              ctx.closePath();

              const cellGrad = ctx.createLinearGradient(c1.px, c1.py, c3.px, c3.py);
              const sheen = Math.sin(localTimer * 1.6 + c * 0.45 + mouseHover.x * 2.2) * 0.5 + 0.5;

              cellGrad.addColorStop(0, '#0a1d3c');
              cellGrad.addColorStop(Math.max(0, Math.min(0.99, sheen - 0.15)), '#1e3c78');
              cellGrad.addColorStop(sheen, '#ffffff'); // metallic Specular reflective glint
              cellGrad.addColorStop(Math.max(0, Math.min(0.99, sheen + 0.15)), '#1e3c78');
              cellGrad.addColorStop(1, '#0a1d3c');

              ctx.fillStyle = cellGrad;
              ctx.strokeStyle = '#2563eb';
              ctx.lineWidth = 0.7 * sScale;
              ctx.fill();
              ctx.stroke();

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo((c1.px + c2.px) / 2, (c1.py + c2.py) / 2);
              ctx.lineTo((c4.px + c3.px) / 2, (c4.py + c3.py) / 2);
              ctx.stroke();
            }

            // support bracket
            const strutStart = satLocProj(sign * 25, 0, 0);
            const strutEnd = satLocProj(sign * 6, 0, 0);
            if (strutStart.visible && strutEnd.visible) {
              ctx.strokeStyle = '#b45309';
              ctx.lineWidth = 3.2 * sScale;
              ctx.beginPath();
              ctx.moveTo(strutStart.px, strutStart.py);
              ctx.lineTo(strutEnd.px, strutEnd.py);
              ctx.stroke();
            }
          }
        };

        drawDiagonalSolarWing(true);
        drawDiagonalSolarWing(false);

        // Antenna receiver dish
        const dishCenter = satLocProj(0, 20, 0);
        const dishL = satLocProj(-17, 36, 0);
        const dishR = satLocProj(17, 36, 0);
        const dishHorn = satLocProj(0, 46, 0);

        if (dishCenter.visible && dishL.visible && dishR.visible && dishHorn.visible) {
          ctx.beginPath();
          ctx.moveTo(dishL.px, dishL.py);
          ctx.quadraticCurveTo(dishCenter.px, dishCenter.py, dishR.px, dishR.py);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2.2 * sScale;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(dishL.px, dishL.py);
          ctx.quadraticCurveTo(dishCenter.px, dishCenter.py, dishR.px, dishR.py);
          ctx.lineTo(dishL.px, dishL.py);
          ctx.closePath();
          ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
          ctx.fill();

          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1 * sScale;
          ctx.beginPath();
          ctx.moveTo(dishCenter.px, dishCenter.py);
          ctx.lineTo(dishHorn.px, dishHorn.py);
          ctx.stroke();

          ctx.fillStyle = '#00F0FF';
          ctx.beginPath();
          ctx.arc(dishHorn.px, dishHorn.py, 2.5 * sScale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Magnetometer Science Sensor Boom stick
        const boomBase = satLocProj(0, -25, 0);
        const boomTip = satLocProj(-11, -73, 10);
        if (boomBase.visible && boomTip.visible) {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 0.9 * sScale;
          ctx.beginPath();
          ctx.moveTo(boomBase.px, boomBase.py);
          ctx.lineTo(boomTip.px, boomTip.py);
          ctx.stroke();

          ctx.fillStyle = '#ffaa00';
          ctx.beginPath();
          ctx.arc(boomTip.px, boomTip.py, 2.5 * sScale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pristine photographic composition without overlays
        hoveredSubsystemRef.current = null;
      };

      // Draw a subtle space nebula background
      const drawCosmicNebula = () => {
        // Soft orange solar wind glow near the sun
        const grad1 = ctx.createRadialGradient(sunCenterParallaxX, sunCenterParallaxY, sunRadius * 1.2, sunCenterParallaxX, sunCenterParallaxY, sunRadius * 3.0);
        grad1.addColorStop(0, 'rgba(255, 120, 0, 0.08)');
        grad1.addColorStop(0.5, 'rgba(255, 40, 0, 0.03)');
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, w, h);

        // Soft blue magnetic background glow on the far left (near Earth)
        const grad2 = ctx.createRadialGradient(w * 0.15, h * 0.5, 50, w * 0.15, h * 0.5, 300);
        grad2.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, w, h);
      };

      // Draw a highly realistic 3D Earth and Moon on the left to match Image 2
      const drawRealisticEarthAndMoon = () => {
        const ex = -280 + Math.sin(localTimer * 0.04) * 8;
        const ey = -40 + Math.cos(localTimer * 0.03) * 6;
        const ez = -20;

        const earthProj = project3D(ex, ey, ez, 0.8);
        if (earthProj.visible) {
          const earthRadius = 40 * earthProj.scale;

          // Ocean/Atmosphere Base gradient
          const earthGrad = ctx.createRadialGradient(
            earthProj.px - earthRadius * 0.3, 
            earthProj.py - earthRadius * 0.3, 
            2, 
            earthProj.px, 
            earthProj.py, 
            earthRadius
          );
          earthGrad.addColorStop(0, '#4fc3f7'); // Light blue specular glint from sun
          earthGrad.addColorStop(0.2, '#1e88e5'); // Earth ocean blue
          earthGrad.addColorStop(0.7, '#0d47a1'); // Deep ocean blue
          earthGrad.addColorStop(1.0, '#0a1d37'); // Shadow side
          
          ctx.fillStyle = earthGrad;
          ctx.beginPath();
          ctx.arc(earthProj.px, earthProj.py, earthRadius, 0, Math.PI * 2);
          ctx.fill();

          // Continents drawing (simulated 3D map projecting on a sphere)
          ctx.save();
          // Clip continents within Earth circle
          ctx.beginPath();
          ctx.arc(earthProj.px, earthProj.py, earthRadius, 0, Math.PI * 2);
          ctx.clip();

          // We draw landmasses that slide slowly across the Earth surface to simulate rotation
          const landRotation = localTimer * 0.05;
          ctx.fillStyle = 'rgba(76, 175, 80, 0.55)'; // green landmasses
          const landmasses = [
            { x: -0.6, y: -0.2, r: 0.22 },
            { x: -0.1, y: 0.1, r: 0.3 },
            { x: 0.4, y: -0.3, r: 0.18 },
            { x: -0.9, y: 0.3, r: 0.15 },
            { x: 0.8, y: 0.2, r: 0.25 }
          ];

          landmasses.forEach(land => {
            const rotX = ((land.x + landRotation) % 2.0) - 1.0; // Wrap coordinates
            if (Math.abs(rotX) < 1.0) {
              const lx = earthProj.px + rotX * earthRadius;
              const ly = earthProj.py + land.y * earthRadius;
              ctx.beginPath();
              ctx.arc(lx, ly, land.r * earthRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Soft curling white/grey clouds floating on top
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          const clouds = [
            { x: -0.4, y: -0.1, w: 0.4, h: 0.08 },
            { x: 0.2, y: 0.3, w: 0.5, h: 0.06 },
            { x: -0.8, y: 0.2, w: 0.3, h: 0.1 },
            { x: 0.5, y: -0.2, w: 0.4, h: 0.07 }
          ];
          clouds.forEach(cloud => {
            const rotX = ((cloud.x + landRotation * 1.3) % 2.0) - 1.0;
            if (Math.abs(rotX) < 1.0) {
              const cx = earthProj.px + rotX * earthRadius;
              const cy = earthProj.py + cloud.y * earthRadius;
              ctx.beginPath();
              ctx.ellipse(cx, cy, cloud.w * earthRadius, cloud.h * earthRadius, Math.PI / 12, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          ctx.restore();

          // Blue atmospheric edge glow (limb)
          const limbGrad = ctx.createRadialGradient(
            earthProj.px, 
            earthProj.py, 
            earthRadius - 1, 
            earthProj.px, 
            earthProj.py, 
            earthRadius + 6
          );
          limbGrad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
          limbGrad.addColorStop(0.3, 'rgba(0, 200, 255, 0.15)');
          limbGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = limbGrad;
          ctx.beginPath();
          ctx.arc(earthProj.px, earthProj.py, earthRadius + 6, 0, Math.PI * 2);
          ctx.fill();

          // Tiny Orbiting Moon
          const moonTheta = localTimer * 0.12;
          const mx = ex + Math.cos(moonTheta) * 55;
          const my = ey + Math.sin(moonTheta) * 12;
          const mz = ez + Math.sin(moonTheta) * 45;

          const moonProj = project3D(mx, my, mz, 0.8);
          if (moonProj.visible) {
            const moonRadius = 6 * moonProj.scale;
            
            // Shaded moon sphere
            const moonGrad = ctx.createRadialGradient(
              moonProj.px - moonRadius * 0.3,
              moonProj.py - moonRadius * 0.3,
              1,
              moonProj.px,
              moonProj.py,
              moonRadius
            );
            moonGrad.addColorStop(0, '#e0e0e0');
            moonGrad.addColorStop(0.6, '#9e9e9e');
            moonGrad.addColorStop(1.0, '#373737');

            ctx.fillStyle = moonGrad;
            ctx.beginPath();
            ctx.arc(moonProj.px, moonProj.py, moonRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };

      drawCosmicNebula();
      drawHighTechHUD();
      drawCosmicStarfield(true);

      if (isSatelliteBehind) {
        drawHighFidelitySatellite();
        drawRealisticEarthAndMoon();
        drawBlazingSun();
      } else {
        drawBlazingSun();
        drawRealisticEarthAndMoon();
        drawHighFidelitySatellite();
      }

      drawCosmicStarfield(false);

      // Energetic particles solar wind
      particlesRef.current.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        p.vx *= 0.985;
        p.vy *= 0.985;
        p.vz *= 0.985;

        const proj = project3D(p.x, p.y, p.z, 1.25);
        if (proj.visible) {
          const alpha = 1.0 - p.life / p.maxLife;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;

          ctx.beginPath();
          ctx.arc(proj.px, proj.py, Math.max(0.5, 2.6 * proj.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      ctx.globalAlpha = 1.0;

      // constant sun breeze particles
      if (Math.random() < 0.25) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.0 + Math.random() * 3.5;
        particlesRef.current.push({
          x: Math.cos(angle) * sunRadius * 0.35,
          y: Math.sin(angle) * sunRadius * 0.35,
          z: (Math.random() - 0.5) * 60,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 1.5,
          vz: (Math.random() - 0.5) * 3,
          life: 0,
          maxLife: 50 + Math.random() * 30,
          color: breachStatus === 'CRITICAL' ? 'rgba(255, 31, 31, 0.5)' : 'rgba(255, 176, 0, 0.45)'
        });
      }

      requestAnimationFrame(render);
    };

    render();

    return () => {
      container.removeEventListener('mousemove', handleMouseMoveContainer);
    };
  }, [breachStatus, activeRegionLock, selectedSensor, selectedSubsystem, explosionActive, systemConfidence, isRightPanelOpen, btVal, bzVal]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    lastMouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    rotationRef.current.y += deltaX * 0.0075;
    rotationRef.current.x += deltaY * 0.0075;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    isDraggingRef.current = false;

    const dragX = Math.abs(e.clientX - lastMouseDownPos.current.x);
    const dragY = Math.abs(e.clientY - lastMouseDownPos.current.y);
    if (dragX < 6 && dragY < 6) {
      if (hoveredSubsystemRef.current) {
        setSelectedSubsystem(hoveredSubsystemRef.current);
        setSensorLogs(prev => [
          `[SYS-CMD] LOCKED 3D TELEMETRY HUB ON FOCUS TARGET: ${hoveredSubsystemRef.current.toUpperCase()}`,
          `[SYS-CMD] Sensor analysis calibrated. Status: NOMINAL.`,
          ...prev
        ]);
      }
    }
  };

  const toggleSubsystemStatus = (name: string) => {
    setActiveSubsystems(prev => prev.map(sub => {
      if (sub.name === name) {
        const nextStatus = sub.status === 'NOMINAL' ? 'STANDBY' : sub.status === 'STANDBY' ? 'DEGRADED' : 'NOMINAL';
        const nextHealth = nextStatus === 'NOMINAL' ? 100 : nextStatus === 'STANDBY' ? 65 : 34;
        return { ...sub, status: nextStatus, health: nextHealth };
      }
      return sub;
    }));
    
    setSensorLogs(prev => [
      `[SYS-CMD] Subsystem diagnostic state manually altered: ${name}`,
      `[CONFIRM] Diagnostic parameters applied. Alignment nominal.`,
      ...prev
    ]);
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-obsidian border border-glass-border rounded-3xl flex flex-col overflow-hidden text-white relative">
      
      {/* Grid backdrop */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 mix-blend-color-dodge" />
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-all duration-1000",
        breachStatus === 'CRITICAL' ? 'bg-[radial-gradient(circle_at_center,rgba(255,31,31,0.08)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,rgba(255,176,0,0.05)_0%,transparent_70%)]'
      )} />

      {/* BREACH NEXUS HEADER BLOCK (Matching Image 1 EXACTLY) */}
      <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 bg-black/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2.5 rounded-2xl border transition-all duration-500 shadow-md",
            breachStatus === 'CRITICAL' ? 'bg-red-threat/10 border-red-threat/30 text-red-threat' : 'bg-amber-neon/10 border-amber-neon/30 text-amber-neon'
          )}>
            <Orbit className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-[#FFB000] uppercase font-mono">LIVE SOLAR INTEL ENGINE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-threat animate-ping" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight font-sans text-white uppercase flex items-center gap-3 mt-0.5">
              BREACH NEXUS 
              <span className={cn(
                "text-[9px] px-2.5 py-0.5 rounded-full border uppercase font-mono font-black tracking-wider shadow-sm",
                breachStatus === 'CRITICAL' ? 'bg-red-threat/10 border-red-threat/40 text-red-threat text-glow-red' : 
                breachStatus === 'ELEVATED' ? 'bg-amber-neon/10 border-amber-neon/40 text-amber-neon text-glow-amber' : 
                'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              )}>
                STATUS: {breachStatus}
              </span>
            </h1>
          </div>
        </div>

        {/* Counters & Simul Controls */}
        <div className="flex items-center gap-5 font-mono">
          <div className="hidden sm:block text-right">
            <span className="text-[8px] text-white/30 block uppercase tracking-widest">SYSTEM CONFIDENCE</span>
            <span className="text-sm font-black text-cyan-data text-glow-cyan">{systemConfidence.toFixed(1)}%</span>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[8px] text-white/30 block uppercase tracking-widest font-bold">X-RAY FLUX CLASS</span>
            <span className="text-sm font-black text-red-threat">M5.8 <span className="text-[9px] font-bold text-red-threat/60">[ACTIVE]</span></span>
          </div>
          
          {/* SIMULATE LEVEL Pill Selectors (Image 1 Style) */}
          <div className="bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 bg-[#0d0d0d]">
            <button 
              onClick={() => {
                setBreachStatus('STABLE');
                setSensorLogs(prev => [`[STATE-CHANGE] System threat state adjusted manually: STABLE`, ...prev]);
              }}
              className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300 border border-black", breachStatus === 'STABLE' ? 'bg-emerald-400 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-white/20 hover:bg-emerald-400')}
              title="STABLE Stage"
            />
            <button 
              onClick={() => {
                setBreachStatus('ELEVATED');
                setSensorLogs(prev => [`[STATE-CHANGE] System threat state adjusted manually: ELEVATED`, ...prev]);
              }}
              className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300 border border-black", breachStatus === 'ELEVATED' ? 'bg-amber-neon scale-125 shadow-[0_0_10px_rgba(255,176,0,0.8)]' : 'bg-white/20 hover:bg-amber-neon')}
              title="ELEVATED Stage"
            />
            <button 
              onClick={() => {
                setBreachStatus('CRITICAL');
                setSensorLogs(prev => [`[STATE-CHANGE] System threat state adjusted manually: CRITICAL`, ...prev]);
              }}
              className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300 border border-black", breachStatus === 'CRITICAL' ? 'bg-red-threat scale-125 shadow-[0_0_10px_rgba(255,31,31,0.8)]' : 'bg-white/20 hover:bg-red-threat')}
              title="CRITICAL Stage"
            />
            <span className="text-[8.5px] font-black text-white/50 tracking-wide ml-1">SIMULATE LEVEL</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD GRID BODY (2 or 3 Columns layout) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN PANEL: INPUT CONTROLS (Image 1 Style) */}
        <div className="w-full lg:w-[280px] border-r border-white/5 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar shrink-0 bg-black/40">
          
          {/* Ejection Warning Block */}
          <div className="bg-red-threat/5 border border-red-threat/10 rounded-2xl p-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-threat/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5 text-red-threat">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="text-[9px] font-black tracking-widest font-mono uppercase">SOLAR CORONAL EJECTION</span>
            </div>
            <div className="text-white font-black text-xs uppercase tracking-wide mb-1">CME DETECTED</div>
            <div className="text-lg font-black text-white leading-none tracking-tight mb-2">15h 42m</div>
            <p className="text-[8.5px] text-white/40 uppercase font-mono tracking-widest">
              EST. ARRIVAL: <span className="text-white font-bold">±2h 10m</span>
            </p>
          </div>

          {/* Interactive Probability Dial */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">PROBABILITY</span>
              <span className="text-[10px] font-bold font-mono text-red-threat text-glow-red">{cmeProbability}% HIGH IMPACT</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={cmeProbability} 
              onChange={(e) => {
                setCmeProbability(parseInt(e.target.value));
                setSensorLogs(prev => [`[PARAM-TWEAK] Updated CME threat score threshold probability to ${e.target.value}%`, ...prev]);
              }}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-threat"
            />
            <div className="flex justify-between items-center mt-2 text-[7.5px] font-mono text-white/30">
              <span>MIN RISK</span>
              <span>SEVERE CRITICAL</span>
            </div>
          </div>

          {/* Region Lock spot select */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono block">SOURCE REGION DETECTOR</span>
            
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'AR-3423', coords: 'β-γ-δ UNSTABLE', risk: 'HIGH' },
                { id: 'AR-3425', coords: 'α-β EXTREME', risk: 'CRITICAL' },
                { id: 'AR-3428', coords: 'γ-δ DECAYING', risk: 'STABLE' }
              ].map(spot => (
                <button
                  key={spot.id}
                  onClick={() => {
                    setActiveRegionLock(spot.id);
                    setSensorLogs(prev => [`[RADAR-LOCK] Locking antenna vectors and coordinate scanners to: ${spot.id}`, ...prev]);
                  }}
                  className={cn(
                    "flex justify-between items-center px-3 py-2 rounded-xl border text-left transition-all duration-300 group cursor-pointer",
                    activeRegionLock === spot.id 
                      ? 'bg-amber-neon/10 border-amber-neon/30 text-white shadow-[0_0_12px_rgba(255,176,0,0.15)] font-bold' 
                      : 'bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/[0.03] hover:border-white/10'
                  )}
                >
                  <div>
                    <div className="text-[10px] font-black font-mono group-hover:text-white transition-colors">{spot.id}</div>
                    <div className="text-[7.5px] text-white/30 font-mono mt-0.5">{spot.coords}</div>
                  </div>
                  <span className={cn(
                    "text-[7px] font-black px-1.5 py-0.5 rounded font-mono",
                    spot.risk === 'CRITICAL' ? 'bg-red-threat/10 text-red-threat' : 
                    spot.risk === 'HIGH' ? 'bg-amber-neon/10 text-amber-neon' : 'bg-emerald-500/10 text-emerald-400'
                  )}>
                    {spot.risk}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Velocity and density adjusters */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">VELOCITY MATRIX</span>
              <span className="text-[10px] font-bold font-mono text-cyan-data">{cmeVelocity} km/s</span>
            </div>
            <input 
              type="range" 
              min="300" 
              max="2800" 
              value={cmeVelocity} 
              onChange={(e) => {
                setCmeVelocity(parseInt(e.target.value));
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-data"
            />

            <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-1">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">PLASMA DENSITY</span>
              <span className="text-[10px] font-bold font-mono text-cyan-data">{cmeDensity} p/cm³</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="80" 
              value={cmeDensity} 
              onChange={(e) => {
                setCmeDensity(parseFloat(e.target.value));
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-data"
            />
          </div>

          <button
            onClick={triggerCmeDeceptionShield}
            className={cn(
              "w-full py-2.5 rounded-xl font-mono text-[9px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-center",
              breachStatus === 'CRITICAL' 
                ? 'bg-red-threat text-white hover:bg-red-600 shadow-red-threat/10' 
                : 'bg-amber-neon text-black hover:bg-amber-500 shadow-amber-neon/10'
            )}
          >
            TRIGGER CORONAL ERUPTION
          </button>

        </div>

        {/* MIDDLE COLUMN: ROTATING SUN AND HIGH-FIDELITY SATELLITE (Image 1 Viewport) */}
        <div className="flex-1 min-h-[350px] relative flex flex-col h-full overflow-hidden">
          
          {/* CANVAS STAGE VIEWPORT - Maximized to cover the entire center tab */}
          <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0">
            <canvas 
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full block"
            />

            {/* CME shockwave burst ripple overlay */}
            <AnimatePresence>
              {explosionActive && (
                <motion.div 
                  initial={{ opacity: 1, scale: 0.9 }}
                  animate={{ opacity: 0, scale: 1.35 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "absolute inset-0 pointer-events-none border-4 rounded-[36px] flex items-center justify-center bg-transparent z-10",
                    breachStatus === 'CRITICAL' ? 'border-red-threat/35' : 'border-amber-neon/35'
                  )}
                >
                  <div className="font-sans font-black text-2xl tracking-[0.3em] text-white uppercase bg-black/45 px-5 py-2 rounded-2xl border border-white/10 animate-ping">
                    CME BURST
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>



      </div>

      {/* FOOTER BAR */}
      <div className="p-3 border-t border-white/5 bg-black/90 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0 z-20">
        <div className="flex items-center gap-4 text-[8px] font-mono text-white/40">
          <span>COORDINATE MODEL: <strong className="text-white">MILITARY LEVEL SPEC v2</strong></span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">SYSTEM INTEGRITY: <strong className="text-amber-neon">HONEYPOT PROTECTED</strong></span>
          <span className="hidden md:inline">|</span>
          <span>DOWNLINK STREAM: <strong className="text-white">SYNCHRONIZED</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider font-bold">MONITORING CONTINUOUSLY</span>
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>

    </div>
  );
};
