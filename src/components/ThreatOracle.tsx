import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Globe, ShieldAlert, Cpu, Zap, Radio, 
  RotateCcw, Info, Compass, ChevronRight, Activity, Navigation, Lightbulb,
  Clock
} from 'lucide-react';
import { ThreatForecastBranch } from '../types';

interface ThreatOracleProps {
  branches?: ThreatForecastBranch[];
  selectedBranch?: ThreatForecastBranch | null;
  onSelectBranch?: (branch: ThreatForecastBranch | null) => void;
}

interface TimelineState {
  label: string;
  sublabel: string;
  confidence: string;
  kpIndex: number;
  kpLabel: string;
  kpColor: string;
  dstIndex: number;
  gpsRisk: { level: string; val: number; desc: string; detail: string };
  satRisk: { level: string; val: number; desc: string; detail: string };
  radioRisk: { level: string; val: number; desc: string; detail: string };
  gridRisk: { level: string; val: number; desc: string; detail: string };
  aviationRisk: { level: string; val: number; desc: string; detail: string };
  solarActivity: {
    status: string;
    flux: string;
    flares: string;
    temperature: string;
    density: string;
  };
}

const TIMELINE_STEPS: { [key: string]: TimelineState } = {
  'NOW': {
    label: 'NOW',
    sublabel: 'CURRENT STATE',
    confidence: '98.5%',
    kpIndex: 3.2,
    kpLabel: 'NOMINAL',
    kpColor: 'text-green-400',
    dstIndex: -12,
    gpsRisk: { level: 'NOMINAL', val: 25, desc: 'Stable background ionosphere.', detail: 'Ionospheric scintillation index S4 is below 0.15. GNSS receiver carrier-to-noise density normal.' },
    satRisk: { level: 'NOMINAL', val: 18, desc: 'Quiet background radiation environment.', detail: 'No electrostatic discharge threats. Ambient plasma concentrations in high-Earth orbit are stable.' },
    radioRisk: { level: 'NOMINAL', val: 12, desc: 'Standard D-region absorption limits.', detail: 'HF wave propagation undisturbed over the sunlit hemisphere. Low attenuation levels.' },
    gridRisk: { level: 'NOMINAL', val: 10, desc: 'Neutral loop induction stable.', detail: 'Geomagnetically induced currents (GICs) below 1A. Transformers operating far below saturation.' },
    aviationRisk: { level: 'NOMINAL', val: 15, desc: 'Cosmic ray counts at background averages.', detail: 'Standard route dose equivalent rates are safe. Sub-polar HF aviation communications clear.' },
    solarActivity: { status: 'QUIESCENT CONVECTION', flux: '102 sfu', flares: 'C1.1 Class', temperature: '5,500°C', density: '4.2 p/cm³' }
  },
  '+15 MIN': {
    label: '+15 MIN',
    sublabel: 'SHOCKFRONT APPROACH',
    confidence: '95.8%',
    kpIndex: 5.0,
    kpLabel: 'ACTIVE',
    kpColor: 'text-yellow-500',
    dstIndex: -45,
    gpsRisk: { level: 'MODERATE', val: 52, desc: 'Minor phase scintillation on L1 signals.', detail: 'Scintillation Index (S4): 0.42. Minor dilution of precision observed in extreme high-latitude sectors.' },
    satRisk: { level: 'MODERATE', val: 42, desc: 'Low-energy plasma surface charging.', detail: 'Surface charging risks detected on high-altitude orbital platforms. Operators advised.' },
    radioRisk: { level: 'HIGH RISK', val: 74, desc: 'HF wave fade in polar cap region.', detail: 'Polar Cap Absorption event beginning. Signal fade margins reduced by 15dB on routes > 60°N.' },
    gridRisk: { level: 'NOMINAL', val: 28, desc: 'Local neutral current fluctuation.', detail: 'GIC spike below 5A in northern grid spans. Grid monitoring telemetry remains stable.' },
    aviationRisk: { level: 'MODERATE', val: 48, desc: 'Increased atmospheric ionization.', detail: 'Minor dosage elevation on high-altitude polar routes. Cosmic ray counts increased by 15%.' },
    solarActivity: { status: 'ERUPTIVE SHOCKFRONT', flux: '185 sfu', flares: 'M2.4 Class', temperature: '6,400°C', density: '14.5 p/cm³' }
  },
  '+1 HOUR': {
    label: '+1 HOUR',
    sublabel: 'INITIAL IMPACT',
    confidence: '94.2%',
    kpIndex: 6.8,
    kpLabel: 'SEVERE',
    kpColor: 'text-orange-500',
    dstIndex: -110,
    gpsRisk: { level: 'HIGH RISK', val: 82, desc: 'Severe ionospheric tracking loss.', detail: 'Scintillation Index (S4): 0.74. Carrier phase locks failing on L1/L5 links. Precision loss in progress.' },
    satRisk: { level: 'HIGH RISK', val: 84, desc: 'Deep electrostatic discharging risks.', detail: 'Dielectric discharge warnings on communication nodes. Star tracker disorientation due to proton flux.' },
    radioRisk: { level: 'HIGH RISK', val: 82, desc: 'Solar Flare Radio Blackout (R2).', detail: 'HF wave propagation blocked between 15-30 MHz over sunlit hemisphere. Polar routes severed.' },
    gridRisk: { level: 'MODERATE', val: 62, desc: 'Induced currents approaching limits.', detail: 'GIC spikes to 28A in high-latitude loops. Voltage stability margins degrading in northern spans.' },
    aviationRisk: { level: 'HIGH RISK', val: 78, desc: 'Radiation dosage alert in polar zones.', detail: 'Altitude dosage exceeding 35 uSv/hr. Polar route flight ceiling offsets mandated below 60° Lat.' },
    solarActivity: { status: 'CME SHOCKFRONT DEPLOYED', flux: '310 sfu', flares: 'X1.2 Flare', temperature: '9,500°C', density: '42.8 p/cm³' }
  },
  '+6 HOURS': {
    label: '+6 HOURS',
    sublabel: 'PEAK INTENSITY',
    confidence: '91.4%',
    kpIndex: 7.0, // Matches image 1 (7 SEVERE)
    kpLabel: 'SEVERE',
    kpColor: 'text-red-500',
    dstIndex: -198, // Matches image 1 (-198 nT)
    gpsRisk: { level: 'HIGH RISK', val: 96, desc: 'Total tracking breakdown across sectors.', detail: 'Scintillation Index (S4): 0.95. Multi-constellation receiver failures reported. Critical GNSS blackout.' },
    satRisk: { level: 'HIGH RISK', val: 92, desc: 'Dielectric breakdown & orbital drag spike.', detail: 'Upper atmospheric expansion increases drag by 180%. Star tracker blindings due to proton saturation.' },
    radioRisk: { level: 'MODERATE', val: 68, desc: 'D-region ionization absorption peaks.', detail: 'Widespread absorption on lower bands. Signal degradation remains severe across high latitude links.' },
    gridRisk: { level: 'HIGH RISK', val: 98, desc: 'Extreme induced currents exceeding 65A.', detail: 'Transformer core saturation threshold breached. Transformer thermal warnings active. Voltage collapse risk.' },
    aviationRisk: { level: 'MODERATE', val: 64, desc: 'Proton flux dose rate elevated.', detail: 'Altitude dose rates at 42 uSv/hr. Polar flight route restrictions extended to southern corridors.' },
    solarActivity: { status: 'IMPACTING MAGNETOSPHERE', flux: '445 sfu', flares: 'X2.8 Superflare', temperature: '14,200°C', density: '88.2 p/cm³' }
  },
  '+24 HOURS': {
    label: '+24 HOURS',
    sublabel: 'RECOVERY PHASE',
    confidence: '88.5%',
    kpIndex: 5.2,
    kpLabel: 'MINOR STORM',
    kpColor: 'text-orange-400',
    dstIndex: -80,
    gpsRisk: { level: 'MODERATE', val: 45, desc: 'Gradual ionospheric recombination.', detail: 'L1 carrier phase lock restoring. Multipath propagation errors and scintillation decaying slowly.' },
    satRisk: { level: 'MODERATE', val: 48, desc: 'Charging decaying, high proton flux.', detail: 'DIELECTRIC discharge danger clearing. Star tracker tracking restored to 95% efficiency.' },
    radioRisk: { level: 'NOMINAL', val: 28, desc: 'Absorption layers dissipating.', detail: 'HF wave propagation returning. Trans-polar frequencies > 18MHz restored with minor static.' },
    gridRisk: { level: 'MODERATE', val: 42, desc: 'Induced currents declining below 15A.', detail: 'Transformer thermal stresses returning to normal. Grid reactive power compensations steady.' },
    aviationRisk: { level: 'MODERATE', val: 38, desc: 'Proton flux levels decaying.', detail: 'Dose rates declining to 15 uSv/hr. Polar route altitude restrictions lifted below 75° Lat.' },
    solarActivity: { status: 'RECOVERY FLOWS', flux: '135 sfu', flares: 'M1.0 Class', temperature: '5,800°C', density: '19.5 p/cm³' }
  }
};

export const ThreatOracle: React.FC<ThreatOracleProps> = ({ branches, selectedBranch, onSelectBranch }) => {
  const [activeStep, setActiveStep] = useState<string>('+6 HOURS'); // Default to peak matching Image 1
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [rotationEarth, setRotationEarth] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<number>(0);
  const [localTime, setLocalTime] = useState<number>(0);

  // Smooth local timer for sparkline animation
  useEffect(() => {
    let animId: number;
    const tickTime = () => {
      setLocalTime(prev => prev + 0.02);
      animId = requestAnimationFrame(tickTime);
    };
    animId = requestAnimationFrame(tickTime);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Holographic 3D hover overlays
  const [hoveredElement, setHoveredElement] = useState<{
    type: 'SUN' | 'EARTH' | 'GPS' | 'SAT' | 'RADIO' | 'GRID' | 'AVIATION' | null;
    title: string;
    desc: string;
    tech: string;
    x: number;
    y: number;
  }>({ type: null, title: '', desc: '', tech: '', x: 0, y: 0 });

  const activeState = TIMELINE_STEPS[activeStep];
  const sunCanvasRef = useRef<HTMLCanvasElement>(null);
  const earthCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync with App.tsx branches if passed
  useEffect(() => {
    if (selectedBranch) {
      const name = selectedBranch.scenarioName.toLowerCase();
      // Map branches dynamically if they match a temporal forecast
      if (name.includes('peak') || name.includes('6h')) {
        setActiveStep('+6 HOURS');
      } else if (name.includes('initial') || name.includes('1h')) {
        setActiveStep('+1 HOUR');
      } else if (name.includes('shock') || name.includes('15m')) {
        setActiveStep('+15 MIN');
      } else if (name.includes('recovery') || name.includes('24h')) {
        setActiveStep('+24 HOURS');
      }
    }
  }, [selectedBranch]);

  const handleStepChange = (step: string) => {
    setActiveStep(step);
    // Find matching branch to update sidebar state consistently
    if (branches && onSelectBranch) {
      let matched: ThreatForecastBranch | null = null;
      if (step === '+6 HOURS') {
        matched = branches.find(b => b.scenarioName.toLowerCase().includes('peak') || b.scenarioName.includes('6h')) || null;
      } else if (step === '+1 HOUR') {
        matched = branches.find(b => b.scenarioName.toLowerCase().includes('initial') || b.scenarioName.includes('1h')) || null;
      } else if (step === '+15 MIN') {
        matched = branches.find(b => b.scenarioName.toLowerCase().includes('shock') || b.scenarioName.includes('15m')) || null;
      } else if (step === '+24 HOURS') {
        matched = branches.find(b => b.scenarioName.toLowerCase().includes('recovery') || b.scenarioName.includes('24h')) || null;
      }
      if (matched) onSelectBranch(matched);
    }
  };

  // Drag rotation on Earth
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = e.clientX;
  };

  const handleMouseMoveGlobal = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current;
    setRotationEarth(prev => prev + deltaX * 0.015);
    dragStartRef.current = e.clientX;
  };

  const handleMouseUpGlobal = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging]);

  // ANIMATE SOLAR EVOLUTION CONE
  useEffect(() => {
    const canvas = sunCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let localTimer = 0;

    const draw = () => {
      localTimer += 0.02;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const nowIndex = Object.keys(TIMELINE_STEPS).indexOf(activeStep);
      
      // Determine Sun color and flare size based on timeline selection
      let coreColor = 'rgba(255, 140, 0, 1)';
      let glowColor1 = 'rgba(255, 110, 0, 0.4)';
      let glowColor2 = 'rgba(255, 40, 0, 0.05)';
      let flareIntensity = 1.0;

      if (activeStep === 'NOW') {
        coreColor = 'rgba(255, 160, 0, 1)';
        glowColor1 = 'rgba(255, 110, 0, 0.3)';
        glowColor2 = 'rgba(255, 60, 0, 0.01)';
        flareIntensity = 0.5;
      } else if (activeStep === '+15 MIN') {
        coreColor = 'rgba(255, 130, 0, 1)';
        glowColor1 = 'rgba(255, 95, 0, 0.4)';
        glowColor2 = 'rgba(255, 45, 0, 0.05)';
        flareIntensity = 0.9;
      } else if (activeStep === '+1 HOUR') {
        coreColor = 'rgba(255, 95, 0, 1)';
        glowColor1 = 'rgba(255, 60, 0, 0.5)';
        glowColor2 = 'rgba(255, 20, 0, 0.1)';
        flareIntensity = 1.4;
      } else if (activeStep === '+6 HOURS') {
        coreColor = 'rgba(255, 60, 0, 1)';
        glowColor1 = 'rgba(255, 30, 0, 0.6)';
        glowColor2 = 'rgba(200, 0, 80, 0.15)';
        flareIntensity = 2.0;
      } else if (activeStep === '+24 HOURS') {
        coreColor = 'rgba(255, 110, 0, 1)';
        glowColor1 = 'rgba(255, 70, 0, 0.4)';
        glowColor2 = 'rgba(255, 30, 0, 0.08)';
        flareIntensity = 1.1;
      }

      // Draw Grid / Matrix Background lines (Image 1 Style)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Coordinates for Sun center (left side) and target end of cone (right side)
      const sunX = w * 0.22;
      const sunY = h * 0.52;
      const sunRadius = Math.min(w * 0.16, h * 0.32);

      // 1. Draw glowing background cone stretching to the right
      const coneGrad = ctx.createLinearGradient(sunX, sunY, w, sunY);
      coneGrad.addColorStop(0, `rgba(${activeStep === '+6 HOURS' ? '255,60,0' : '255,140,0'}, 0.28)`);
      coneGrad.addColorStop(0.4, `rgba(${activeStep === '+6 HOURS' ? '255,30,0' : '255,110,0'}, 0.12)`);
      coneGrad.addColorStop(0.8, `rgba(${activeStep === '+6 HOURS' ? '210,0,100' : '255,80,0'}, 0.03)`);
      coneGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY - sunRadius * 0.85);
      ctx.lineTo(w, sunY - sunRadius * 1.85);
      ctx.lineTo(w, sunY + sunRadius * 1.85);
      ctx.lineTo(sunX, sunY + sunRadius * 0.85);
      ctx.closePath();
      ctx.fill();

      // Cone guidelines
      ctx.strokeStyle = `rgba(255, 110, 0, ${0.1 + flareIntensity * 0.06})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(sunX, sunY - sunRadius * 0.85);
      ctx.lineTo(w, sunY - sunRadius * 1.85);
      ctx.moveTo(sunX, sunY + sunRadius * 0.85);
      ctx.lineTo(w, sunY + sunRadius * 1.85);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw 4 nested, glowing transparent evolution spheres along the cone
      const timelineNodes = Object.keys(TIMELINE_STEPS);
      timelineNodes.forEach((node, idx) => {
        if (idx === 0) return; // skip NOW
        const fraction = idx / (timelineNodes.length - 1);
        const nodeX = sunX + fraction * (w - sunX) * 0.85;
        const nodeY = sunY + (fraction - 0.1) * 12;
        const nodeRadius = sunRadius * (1.0 - fraction * 0.45);

        const isActive = node === activeStep;
        const isHovered = node === hoveredStep;

        // Draw connecting orbit ring
        ctx.strokeStyle = isActive 
          ? 'rgba(255, 140, 0, 0.4)' 
          : isHovered 
            ? 'rgba(255, 255, 255, 0.25)' 
            : 'rgba(255, 110, 0, 0.05)';
        ctx.lineWidth = isActive ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing translucent sphere fill
        const sphereGrad = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, nodeRadius);
        let sCol = '255, 120, 0';
        if (idx === 1) sCol = '255, 160, 0';
        else if (idx === 2) sCol = '255, 90, 0';
        else if (idx === 3) sCol = '255, 40, 50';
        else if (idx === 4) sCol = '190, 40, 160';

        sphereGrad.addColorStop(0, `rgba(${sCol}, ${isActive ? 0.42 : isHovered ? 0.25 : 0.05})`);
        sphereGrad.addColorStop(0.8, `rgba(${sCol}, ${isActive ? 0.20 : isHovered ? 0.12 : 0.02})`);
        sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Timeline node center tick
        ctx.fillStyle = isActive ? '#FFB000' : 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw streaming solar coronal wind particle trails
      ctx.fillStyle = `rgba(255, 176, 0, ${0.15 + flareIntensity * 0.1})`;
      for (let i = 0; i < 45; i++) {
        const pSpeed = 1.2 + (i % 5) * 0.6;
        const pOffset = (localTimer * pSpeed + i * 35) % (w - sunX * 0.95);
        const pX = sunX * 0.95 + pOffset;
        
        // Spread matches the evolution cone boundary
        const coneWidth = sunRadius * 0.75 + (pOffset / (w - sunX)) * sunRadius * 1.35;
        const pY = sunY + Math.sin(pOffset * 0.015 + i) * coneWidth * 0.85;

        if (pX < w) {
          ctx.beginPath();
          ctx.arc(pX, pY, 1.2 + (i % 3) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Draw massive parent Sun sphere on the left
      // Heavy outer solar atmospheric corona glow
      const sunGlow2 = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.8, sunX, sunY, sunRadius * 2.2);
      sunGlow2.addColorStop(0, glowColor1);
      sunGlow2.addColorStop(0.5, glowColor2);
      sunGlow2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunGlow2;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp inner corona
      const sunGlow1 = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.95, sunX, sunY, sunRadius * 1.15);
      sunGlow1.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      sunGlow1.addColorStop(0.15, coreColor);
      sunGlow1.addColorStop(1.0, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunGlow1;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Draw sunspot clusters and active coronal regions
      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 0.98, 0, Math.PI * 2);
      ctx.clip();

      // Convective patterns / noise cells
      for (let j = 0; j < 8; j++) {
        const spotX = sunX + Math.sin(localTimer * 0.05 + j * 4) * sunRadius * 0.65;
        const spotY = sunY + Math.cos(localTimer * 0.04 + j * 3.5) * sunRadius * 0.55;
        const spotR = sunRadius * (0.12 + Math.abs(Math.sin(localTimer * 0.5 + j)) * 0.12);

        const spotGrad = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, spotR);
        spotGrad.addColorStop(0, '#FFFFFF');
        spotGrad.addColorStop(0.3, '#FFB000');
        spotGrad.addColorStop(0.7, '#FF3D00');
        spotGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw interactive solar filament lines across surface
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = -sunRadius; x < sunRadius; x += 15) {
        const yOffset = Math.sin(x * 0.08 + localTimer) * 12;
        ctx.lineTo(sunX + x, sunY + yOffset);
      }
      ctx.stroke();

      ctx.restore();

      // Dynamic surface eruption arcs (Coronal Loops) jumping out
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.2 * flareIntensity;
      for (let k = 0; k < 4; k++) {
        const angle = localTimer * 0.12 + k * (Math.PI / 2);
        const arcX = sunX + Math.cos(angle) * sunRadius * 0.95;
        const arcY = sunY + Math.sin(angle) * sunRadius * 0.95;
        const loopRadius = 15 + Math.sin(localTimer * 2 + k) * 8 * flareIntensity;

        ctx.beginPath();
        ctx.arc(arcX, arcY, loopRadius, angle - 0.5, angle + 0.5);
        ctx.stroke();
      }
    };

    animFrame = requestAnimationFrame(function loop() {
      draw();
      animFrame = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animFrame);
  }, [activeStep, hoveredStep]);

  // ANIMATE GEOMAGNETIC EARTH CANVAS
  useEffect(() => {
    const canvas = earthCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let localTimer = 0;

    // Projected simple coordinates of earth's landmasses
    const landmassesRaw = [
      // North America
      { x: -0.35, y: -0.28, r: 0.15 },
      { x: -0.28, y: -0.4, r: 0.12 },
      { x: -0.42, y: -0.15, r: 0.1 },
      // South America
      { x: -0.15, y: 0.25, r: 0.12 },
      { x: -0.1, y: 0.45, r: 0.18 },
      // Eurasia / Africa
      { x: 0.35, y: -0.25, r: 0.22 },
      { x: 0.18, y: -0.1, r: 0.15 },
      { x: 0.22, y: 0.18, r: 0.25 },
      { x: 0.3, y: 0.38, r: 0.12 },
      // Australia / East Asia
      { x: 0.65, y: 0.22, r: 0.14 },
      { x: 0.55, y: -0.12, r: 0.1 }
    ];

    const drawEarth = () => {
      localTimer += 0.015;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.54;
      const er = Math.min(w * 0.32, h * 0.40);

      // 1. Draw glowing blue geomagnetic shield (magnetosphere bow shock)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Parabolic bow shock shield facing left (towards Sun)
      ctx.arc(cx + er * 0.5, cy, er * 1.8, Math.PI * 0.72, Math.PI * 1.28);
      ctx.stroke();

      // 2. Solar wind deflective field lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        const offset = i * er * 0.42;
        ctx.beginPath();
        ctx.moveTo(0, cy + offset * 0.5);
        ctx.bezierCurveTo(cx - er * 1.2, cy + offset, cx - er * 0.2, cy + offset * 1.6, w, cy + offset * 2.2);
        ctx.stroke();
      }

      // 3. Ambient space wind particles sweeping around magnetosphere
      ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
      for (let p = 0; p < 15; p++) {
        const pSpeed = 1.5 + (p % 3) * 0.5;
        const pX = (localTimer * 45 * pSpeed + p * 40) % w;
        const offset = ((p % 7) - 3) * er * 0.42;
        // Project onto deflected trajectory
        const curveFactor = Math.max(0, 1.0 - Math.abs(pX - cx) / (er * 1.5));
        const pY = cy + offset + curveFactor * (offset > 0 ? er * 0.65 : -er * 0.65);

        ctx.beginPath();
        ctx.arc(pX, pY, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Base deep ocean planet sphere
      const planetGrad = ctx.createRadialGradient(cx - er * 0.3, cy - er * 0.3, er * 0.1, cx, cy, er);
      planetGrad.addColorStop(0, '#10375c');
      planetGrad.addColorStop(0.6, '#081c30');
      planetGrad.addColorStop(1.0, '#02070e');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, er, 0, Math.PI * 2);
      ctx.fill();

      // 5. Draw 3D rotating landmasses (Continents with glowing night city lights)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, er * 0.98, 0, Math.PI * 2);
      ctx.clip();

      const activeRotation = rotationEarth + localTimer * 0.25;

      // Project spherical coordinates
      landmassesRaw.forEach(land => {
        // Rotate around Y axis
        const rotatedX = land.x + Math.sin(activeRotation * 0.15) * 0.8;
        // Normalize wrap between -1.2 and +1.2
        const wrapX = ((rotatedX + 1.2) % 2.4) - 1.2;

        if (wrapX > -1.0 && wrapX < 1.0) {
          // Spherical compression calculation
          const factorZ = Math.sqrt(1.0 - wrapX * wrapX);
          const px = cx + wrapX * er;
          const py = cy + land.y * factorZ * er;
          const pr = land.r * factorZ * er;

          // Draw continental mass
          ctx.fillStyle = 'rgba(7, 36, 17, 0.42)'; // deep forest continent
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();

          // Draw glittering yellow/gold city lights on night-side
          const isNightSide = wrapX > -0.2; // lights brighter as they rotate into shadow
          if (isNightSide) {
            const opacity = Math.min(0.85, (wrapX + 0.2) * 1.1);
            ctx.fillStyle = `rgba(255, 176, 0, ${opacity})`;
            ctx.beginPath();
            // Scatter 4-5 tiny points within the continent radius
            ctx.arc(px - pr * 0.2, py - pr * 0.1, 1.5, 0, Math.PI * 2);
            ctx.arc(px + pr * 0.3, py + pr * 0.2, 1.2, 0, Math.PI * 2);
            ctx.arc(px + pr * 0.1, py - pr * 0.3, 1.8, 0, Math.PI * 2);
            if (pr > 20) {
              ctx.arc(px - pr * 0.3, py + pr * 0.4, 1.0, 0, Math.PI * 2);
            }
            ctx.fill();
          }
        }
      });

      ctx.restore();

      // 6. Atmospheric edge glowing limb (Image 2 style)
      const atmosphericGlow = ctx.createRadialGradient(cx, cy, er - 3, cx, cy, er + 8);
      atmosphericGlow.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
      atmosphericGlow.addColorStop(0.3, 'rgba(0, 160, 255, 0.15)');
      atmosphericGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmosphericGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, er + 8, 0, Math.PI * 2);
      ctx.fill();

      // 7. Concentric Geomagnetic Auroral Wave Shockfronts (Image 1 centered ring waves)
      // Pulsing concentric circle loops over the high-latitude north pole area
      const pulseCount = 3;
      const poleX = cx;
      const poleY = cy - er * 0.42;

      ctx.strokeStyle = `rgba(${activeStep === '+6 HOURS' ? '255,60,0' : '255,140,0'}, 0.45)`;
      ctx.lineWidth = 1.5;

      for (let p = 0; p < pulseCount; p++) {
        const pulseProgress = (localTimer * 1.5 + p * (1 / pulseCount)) % 1.0;
        const pulseRadius = er * 0.18 + pulseProgress * er * 0.72;
        const opacity = Math.max(0, 1.0 - pulseProgress) * (activeStep === '+6 HOURS' ? 1.0 : 0.45);

        // Clip ring waves within the Earth sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, er, 0, Math.PI * 2);
        ctx.clip();

        ctx.strokeStyle = `rgba(${activeStep === '+6 HOURS' ? '255,60,0' : '255,140,0'}, ${opacity * 0.8})`;
        ctx.lineWidth = 2.0 - pulseProgress * 1.0;
        
        // Horizontal oval ring mapping
        ctx.beginPath();
        ctx.ellipse(poleX, poleY, pulseRadius, pulseRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    };

    animFrame = requestAnimationFrame(function loop() {
      drawEarth();
      animFrame = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animFrame);
  }, [rotationEarth, activeStep]);

  // Handle mouse moves for floating 3D holographic tooltips
  const handleCanvasMouseMove = (
    e: React.MouseEvent<HTMLDivElement>, 
    type: 'SUN' | 'EARTH' | 'GPS' | 'SAT' | 'RADIO' | 'GRID' | 'AVIATION'
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let title = '';
    let desc = '';
    let tech = '';

    if (type === 'SUN') {
      title = 'SOLAR DISK: CORE SCAN';
      desc = `Active region AR-3423 convective mass loops. Flare Class: ${activeState.solarActivity.flares}.`;
      tech = `FLUX: ${activeState.solarActivity.flux} | TEMP: ${activeState.solarActivity.temperature} | DENSITY: ${activeState.solarActivity.density}`;
    } else if (type === 'EARTH') {
      title = 'IONOSPHERE RADAR';
      desc = `Geomagnetic Shockfront compression interface. Auroral ionization levels peaking.`;
      tech = `PROXIMITY: 4.8 Re | Kp INDEX: ${activeState.kpIndex} | DST: ${activeState.dstIndex} nT`;
    } else if (type === 'GPS') {
      title = 'GPS CONSTELLATION';
      desc = activeState.gpsRisk.desc;
      tech = activeState.gpsRisk.detail;
    } else if (type === 'SAT') {
      title = 'SATELLITE COMMUNICATIONS';
      desc = activeState.satRisk.desc;
      tech = activeState.satRisk.detail;
    } else if (type === 'RADIO') {
      title = 'RADIO BROADCAST BAND';
      desc = activeState.radioRisk.desc;
      tech = activeState.radioRisk.detail;
    } else if (type === 'GRID') {
      title = 'TERRESTRIAL POWER GRID';
      desc = activeState.gridRisk.desc;
      tech = activeState.gridRisk.detail;
    } else if (type === 'AVIATION') {
      title = 'AVIATION POLAR ROUTES';
      desc = activeState.aviationRisk.desc;
      tech = activeState.aviationRisk.detail;
    }

    setHoveredElement({ type, title, desc, tech, x, y });
  };

  const handleCanvasMouseLeave = () => {
    setHoveredElement({ type: null, title: '', desc: '', tech: '', x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full min-h-[580px] relative bg-obsidian rounded-3xl border border-glass-border overflow-hidden flex flex-col justify-between select-none group font-sans">
      
      {/* Background Microdots and Frame Borders */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-80" />
        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/10" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/10" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-white/10" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/10" />
      </div>

      {/* TOP HEADER STATUS AREA (Image 1 style) */}
      <div className="p-6 pb-2 relative z-20 flex justify-between items-start select-none">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-neon animate-pulse shrink-0" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight font-sans text-glow-amber">
              SOLAR ORACLE
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-amber-neon uppercase tracking-[0.22em] font-mono mt-1 block">
            AI-POWERED SOLAR PRECOGNITION & IMPACT FORECASTING
          </span>
        </div>
        
        <div className="text-right">
          <div className="flex justify-end items-center gap-1.5 text-[8.5px] font-mono text-white/40 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-data animate-pulse shrink-0" />
            AI CONFIDENCE
          </div>
          <div className="text-2xl font-black text-cyan-data text-glow-cyan tracking-tight font-mono mt-0.5">
            {activeState.confidence}
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: MAIN ERUPTION CONE (Image 1 style) - Overlay removed to keep Sun disk fully visible and clear */}
      <div className="flex-1 min-h-[220px] relative p-6 z-20">
        
        {/* Dynamic Canvas representing Sun and CME funnel */}
        <div 
          className="absolute inset-0 z-10 cursor-crosshair"
          onMouseMove={(e) => handleCanvasMouseMove(e, 'SUN')}
          onMouseLeave={handleCanvasMouseLeave}
        >
          <canvas ref={sunCanvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* BOTTOM 3-COLUMN PANEL GRID (Image 1 Layout) */}
      <div className="grid grid-cols-12 gap-5 p-6 pt-2 border-t border-white/5 bg-black/35 backdrop-blur-md relative z-20 min-h-[220px]">
        
        {/* Left Column: Impact Simulation with Glowing Risk Rows */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-white/50 tracking-widest uppercase font-mono">IMPACT SIMULATION</span>
            <span className="px-2 py-0.5 rounded bg-red-threat/10 text-red-threat text-[7px] font-bold font-mono tracking-widest animate-pulse uppercase">
              LIVE SIMULATOR
            </span>
          </div>

          {[
            { id: 'GPS', label: 'GPS SIGNAL', r: activeState.gpsRisk },
            { id: 'SAT', label: 'SATELLITE COMM.', r: activeState.satRisk },
            { id: 'RADIO', label: 'RADIO BLACKOUT', r: activeState.radioRisk },
            { id: 'GRID', label: 'POWER GRID', r: activeState.gridRisk },
            { id: 'AVIATION', label: 'AVIATION RISK', r: activeState.aviationRisk }
          ].map((row) => (
            <div
              key={row.id}
              className="group/row flex items-center justify-between p-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] cursor-help transition-all relative"
              onMouseMove={(e) => handleCanvasMouseMove(e, row.id as any)}
              onMouseLeave={handleCanvasMouseLeave}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded bg-white/[0.02] text-white/45 group-hover/row:text-amber-neon group-hover/row:bg-amber-neon/5 transition-all`}>
                  {row.id === 'GPS' && <Navigation size={12} />}
                  {row.id === 'SAT' && <Cpu size={12} />}
                  {row.id === 'RADIO' && <Radio size={12} />}
                  {row.id === 'GRID' && <Zap size={12} />}
                  {row.id === 'AVIATION' && <Activity size={12} />}
                </div>
                <div className="font-mono text-left">
                  <div className="text-[9.5px] font-black tracking-wide text-white/70">{row.label}</div>
                  <div className={`text-[7px] font-black tracking-wider ${row.r.level === 'NOMINAL' ? 'text-green-400' : row.r.level === 'MODERATE' ? 'text-orange-400' : 'text-red-threat animate-pulse'}`}>
                    {row.r.level}
                  </div>
                </div>
              </div>

              {/* Progress bar matching Image 1 layout */}
              <div className="flex items-center gap-2">
                <div className="w-16 bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      row.r.level === 'NOMINAL' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' :
                      row.r.level === 'MODERATE' ? 'bg-orange-400 shadow-[0_0_8px_#f97316]' :
                      'bg-red-threat shadow-[0_0_8px_#ff1f1f]'
                    }`}
                    style={{ width: `${row.r.val}%` }}
                  />
                </div>
                <span className="text-[8px] font-bold font-mono text-white/30 min-w-[20px] text-right">{row.r.val}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center Column: 3D Planetary Earth Geomagnetic Shockfront */}
        <div 
          className="col-span-12 lg:col-span-4 relative flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border-x border-white/5 px-2 group/earth"
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => handleCanvasMouseMove(e, 'EARTH')}
          onMouseLeave={handleCanvasMouseLeave}
        >
          <div className="absolute top-2 left-4 pointer-events-none text-white/40 text-[7.5px] font-mono tracking-widest flex items-center gap-1.5 uppercase select-none">
            <Compass className="w-3 h-3 text-cyan-data animate-spin" style={{ animationDuration: '10s' }} />
            DRAG MOUSE TO ROTATE SYSTEM IN 3D
          </div>
          <canvas ref={earthCanvasRef} className="w-full h-[180px] block" />
        </div>

        {/* Right Column: Temporal Projection Timeline Selector (Magnetic Storm replaced as requested) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-neon animate-pulse" />
              <span className="text-[10px] font-black text-white/50 tracking-widest uppercase font-mono">TEMPORAL PROJECTION</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-data/10 text-cyan-data text-[7px] font-bold font-mono tracking-widest animate-pulse uppercase">
              ACTIVE MATRIX
            </span>
          </div>

          <div className="flex flex-col gap-1.5 justify-center">
            {Object.keys(TIMELINE_STEPS).map((step) => {
              const stepData = TIMELINE_STEPS[step];
              const isActive = activeStep === step;
              return (
                <button
                  key={step}
                  onClick={() => handleStepChange(step)}
                  onMouseEnter={() => setHoveredStep(step)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className={`group/step flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-amber-neon/15 border-amber-neon/45 text-white shadow-[0_0_15px_rgba(255,176,0,0.18)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-white/60 hover:text-white/90 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Active state indicator dot */}
                    <div className="relative flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full transition-all ${
                        isActive 
                          ? 'bg-amber-neon shadow-[0_0_8px_#ffb000]' 
                          : 'bg-white/20 group-hover/step:bg-white/40'
                      }`} />
                      {isActive && (
                        <div className="absolute w-4 h-4 rounded-full border border-amber-neon/40 animate-ping" />
                      )}
                    </div>
                    
                    <div className="font-mono text-left">
                      <div className={`text-[10px] font-black tracking-wide ${isActive ? 'text-amber-neon' : ''}`}>{step}</div>
                      <div className="text-[6.5px] text-white/40 uppercase tracking-widest">{stepData.sublabel}</div>
                    </div>
                  </div>

                  <div className="font-mono text-right flex flex-col items-end">
                    <div className="text-[9px] font-black text-cyan-data text-glow-cyan">{stepData.confidence}</div>
                    <div className="text-[6px] text-white/30 uppercase tracking-tight font-bold">CONFIDENCE</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DYNAMIC 3D DESCRIPTION HOLOGRAPHIC TOOLTIP/CARD */}
      <AnimatePresence>
        {hoveredElement.type && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 pointer-events-none bg-black/92 border border-amber-neon/30 p-4 rounded-2xl shadow-[0_0_25px_rgba(255,176,0,0.22)] backdrop-blur-md max-w-[340px] text-left font-mono"
            style={{
              left: `${hoveredElement.x + 25}px`,
              top: `${hoveredElement.y - 20}px`
            }}
          >
            {/* Holographic 3D Tilt Card Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-neon/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 border-b border-white/5 pb-1.5 mb-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-neon animate-pulse" />
              <span className="text-[10px] font-black text-amber-neon uppercase tracking-wider">{hoveredElement.title}</span>
            </div>
            <p className="text-white/80 text-[10px] leading-normal mb-1.5">
              {hoveredElement.desc}
            </p>
            <div className="text-[7.5px] text-white/40 leading-normal border-t border-white/5 pt-1.5 uppercase font-mono">
              {hoveredElement.tech}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
