import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Info, Activity, Radio, Sun, ShieldAlert, AlertCircle, Volume2, VolumeX, RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';

// Sound Manager with procedural Web Audio synthesizer
class SpaceSoundSynth {
  private ctx: AudioContext | null = null;
  private backgroundHumGain: GainNode | null = null;
  private backgroundOsc: OscillatorNode | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy initialization on first user interaction
  }

  private initCtx() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.startBackgroundHum();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  private startBackgroundHum() {
    if (!this.ctx || !this.enabled) return;
    try {
      this.backgroundOsc = this.ctx.createOscillator();
      this.backgroundHumGain = this.ctx.createGain();
      
      this.backgroundOsc.type = 'sine';
      this.backgroundOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low G hum
      
      // Low-pass filter to make it warmer
      const lpFilter = this.ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(120, this.ctx.currentTime);
      
      this.backgroundHumGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      
      this.backgroundOsc.connect(lpFilter);
      lpFilter.connect(this.backgroundHumGain);
      this.backgroundHumGain.connect(this.ctx.destination);
      
      this.backgroundOsc.start();
    } catch (e) {
      // Ignored
    }
  }

  public setVolume(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopHum();
    } else {
      this.initCtx();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.startBackgroundHum();
    }
  }

  private stopHum() {
    try {
      if (this.backgroundOsc) {
        this.backgroundOsc.stop();
        this.backgroundOsc.disconnect();
        this.backgroundOsc = null;
      }
    } catch (e) {}
  }

  public playHover() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    
    try {
      const audioCtx = this.ctx;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const bq = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.04);

      bq.type = 'bandpass';
      bq.frequency.setValueAtTime(1000, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.004, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

      osc.connect(bq);
      bq.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const audioCtx = this.ctx;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      const gain2 = audioCtx.createGain();

      // Harmonic interval (Perfect Fourth)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, audioCtx.currentTime); // E6
      osc2.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12); // A6

      gain1.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

      gain2.gain.setValueAtTime(0.006, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);

      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.15);
      osc2.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  public playAlert() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const audioCtx = this.ctx;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const oscMod = audioCtx.createOscillator();
      const modGain = audioCtx.createGain();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, audioCtx.currentTime + 0.3);

      oscMod.type = 'sine';
      oscMod.frequency.setValueAtTime(35, audioCtx.currentTime);
      modGain.gain.setValueAtTime(40, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);

      // FM Synthesis
      oscMod.connect(modGain);
      modGain.connect(osc.frequency);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      oscMod.start();
      osc.start();
      
      oscMod.stop(audioCtx.currentTime + 0.35);
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  public playPitchSlide(freq: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const audioCtx = this.ctx;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.005, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  public updateHumVelocity(velocity: number) {
    if (!this.ctx || !this.backgroundOsc || !this.enabled) return;
    try {
      const baseFreq = 55;
      const targetFreq = baseFreq + Math.min(1.0, velocity * 8.0) * 110;
      this.backgroundOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.15);
      if (this.backgroundHumGain) {
        const targetGain = 0.015 + Math.min(0.03, velocity * 0.3);
        this.backgroundHumGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
      }
    } catch (e) {}
  }
}

const synthInstance = new SpaceSoundSynth();

// Types for 3D coordinates
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface RegionNode {
  id: string;
  name: string;
  sub: string;
  sphereX: number; // raw 3D offset relative to core radius
  sphereY: number;
  sphereZ: number;
  color: 'cyan' | 'red' | 'blue' | 'orange';
  temp: string;
  field: string;
  probability: string;
  status: string;
}

export const MagneticDynamics: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'magnetic' | 'velocity' | 'plasma' | 'current'>('magnetic');
  const [fieldStrength, setFieldStrength] = useState<number>(1820); // Gauss value
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('AR-3423'); // Highlighted AR-3423 by default
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [timeScale, setTimeScale] = useState<number>(1.0);

  // 3D rotation angles
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0.15, y: -0.45 });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0.001, y: 0.0015 });
  const sonarPulsRef = useRef<{ active: boolean; x: number; y: number; z: number; timer: number }[]>([]);

  // Coordinates on the sphere matching image locations
  const REGIONS: RegionNode[] = [
    { 
      id: 'AR-3418', 
      name: 'AR-3418', 
      sub: 'β', 
      sphereX: -1.05, sphereY: -0.32, sphereZ: 0.25, 
      color: 'cyan', 
      temp: '5,920 K', 
      field: '+1,540 Gauss', 
      probability: '14%', 
      status: 'STABLE CORE' 
    },
    { 
      id: 'AR-3417', 
      name: 'AR-3417', 
      sub: 'α - β', 
      sphereX: -0.85, sphereY: 0.62, sphereZ: 0.55, 
      color: 'blue', 
      temp: '6,140 K', 
      field: '-1,120 Gauss', 
      probability: '5%', 
      status: 'QUIESCENT' 
    },
    { 
      id: 'AR-3423', 
      name: 'AR-3423', 
      sub: 'β - γ - δ', 
      sphereX: 0.65, sphereY: -0.38, sphereZ: 0.72, 
      color: 'red', 
      temp: '14,800 K', 
      field: '+3,420 Gauss', 
      probability: '92%', 
      status: 'SEVERE FLARE WARN' 
    },
    { 
      id: 'AR-3425', 
      name: 'AR-3425', 
      sub: 'β', 
      sphereX: 0.95, sphereY: 0.18, sphereZ: 0.35, 
      color: 'orange', 
      temp: '8,200 K', 
      field: '+2,180 Gauss', 
      probability: '45%', 
      status: 'ACTIVE DIPOLES' 
    }
  ];

  // Particle list for continuous flowing stellar storms
  const flowingParticlesRef = useRef<{ loopIndex: number; progress: number; speed: number; size: number }[]>([]);
  const solarFlaresRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }[]>([]);

  // Shockwave ripples, prominence flares, and center pos trackers
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; color: string; speed: number; thickness: number }[]>([]);
  const prominencesRef = useRef<{ id: string; startPt: Point3D; endPt: Point3D; midPt: Point3D; life: number; speed: number; color: string; particles: { progress: number; speed: number; size: number }[] }[]>([]);
  const centerPosRef = useRef<{ cx: number; cy: number; rCore: number }>({ cx: 300, cy: 210, rCore: 100 });
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Sync volume state
  useEffect(() => {
    synthInstance.setVolume(isAudioOn);
    return () => {
      // Cleanup hum if tab is closed
      synthInstance.setVolume(false);
    };
  }, [isAudioOn]);

  // Handle automatic sonar pulse triggers on selection
  useEffect(() => {
    const node = REGIONS.find(r => r.id === selectedRegion);
    if (node) {
      sonarPulsRef.current.push({
        active: true,
        x: node.sphereX,
        y: node.sphereY,
        z: node.sphereZ,
        timer: 0
      });
    }
  }, [selectedRegion]);

  // Canvas Resize observer
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      window.requestAnimationFrame(() => {
        setDimensions({ 
          width: Math.max(width, 300), 
          height: Math.max(height, 350) 
        });
      });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Set up 3D lines and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localTime = 0;

    // Generate looping flows
    const flowCount = 150;
    if (flowingParticlesRef.current.length === 0) {
      for (let i = 0; i < flowCount; i++) {
        flowingParticlesRef.current.push({
          loopIndex: Math.floor(Math.random() * 56), // match magnetic loop indices
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          size: 0.6 + Math.random() * 1.5
        });
      }
    }

    const render = () => {
      localTime += 1 * timeScale;
      
      // Update dimensions
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2 + 10;
      const rCore = Math.min(dimensions.width, dimensions.height) * 0.17; // Radius of core sphere

      // Update center positions reference for click project/unproject
      centerPosRef.current = { cx, cy, rCore };

      // Modulate low-frequency space hum pitch based on rotation momentum speed
      const dragSpeed = Math.sqrt(velocityRef.current.x * velocityRef.current.x + velocityRef.current.y * velocityRef.current.y);
      synthInstance.updateHumVelocity(dragSpeed);

      // Apply drag inertial rotation
      if (!isDraggingRef.current) {
        rotationRef.current.y += velocityRef.current.y;
        rotationRef.current.x += velocityRef.current.x;
        velocityRef.current.x *= 0.95;
        velocityRef.current.y *= 0.95;
      }

      // Rotate coordinates function
      const rotate3D = (pt: Point3D): Point3D => {
        // Rotate around X axis
        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);
        const y1 = pt.y * cosX - pt.z * sinX;
        const z1 = pt.y * sinX + pt.z * cosX;

        // Rotate around Y axis
        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);
        const x2 = pt.x * cosY + z1 * sinY;
        const z2 = -pt.x * sinY + z1 * cosY;

        return { x: x2, y: y1, z: z2 };
      };

      // Clear with dark metallic cosmic background gradient
      ctx.fillStyle = '#020308';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Deep celestial stars & nebula background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let k = 0; k < 20; k++) {
        const starX = (Math.sin(k * 423) * 0.5 + 0.5) * dimensions.width;
        const starY = (Math.cos(k * 182) * 0.5 + 0.5) * dimensions.height;
        ctx.beginPath();
        ctx.arc(starX, starY, Math.sin(localTime * 0.02 + k) * 0.5 + 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ambient radial lighting
      const ambientGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(cx, cy));
      ambientGlow.addColorStop(0, 'rgba(15, 18, 36, 0.4)');
      ambientGlow.addColorStop(0.5, 'rgba(4, 5, 12, 0.8)');
      ambientGlow.addColorStop(1, '#020308');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Generate 3D paths for the magnetic dipole loops
      // Symmetrical loop networks: Cool cyan on left, blazing red on right
      interface Loop3D {
        path: Point3D[];
        color: string;
        side: 'left' | 'right' | 'crossing';
        index: number;
      }
      
      const loops: Loop3D[] = [];
      const loopCount = 42;

      for (let i = 0; i < loopCount; i++) {
        const side = i < loopCount / 2 ? 'left' : 'right';
        const progress = (i % (loopCount / 2)) / (loopCount / 2);
        const angleSpan = progress * Math.PI * 0.8;
        const radiusMultiplier = 1.1 + progress * 1.5;

        const pathPoints: Point3D[] = [];
        const resolution = 24;

        // Base hotspots
        let startPt: Point3D;
        let endPt: Point3D;
        let normalDir: Point3D;
        let loopColor: string;

        // Customise fields depending on tab mode
        const strengthFactor = fieldStrength / 1820;

        if (side === 'left') {
          // Left side loops (flowing out of south-west pole, bending back to north-west pole)
          startPt = { 
            x: -rCore * 0.8, 
            y: rCore * (0.3 + progress * 0.5), 
            z: rCore * Math.sin(progress * Math.PI) * 0.5 
          };
          endPt = { 
            x: -rCore * 0.8, 
            y: -rCore * (0.3 + progress * 0.5), 
            z: rCore * Math.sin(progress * Math.PI) * 0.5 
          };
          normalDir = { x: -1.4 - progress * 1.5, y: 0, z: Math.cos(progress * Math.PI) };
          loopColor = activeTab === 'velocity' ? 'rgba(0, 240, 255, 0.35)' :
                      activeTab === 'plasma' ? 'rgba(255, 180, 0, 0.28)' :
                      activeTab === 'current' ? `rgba(0, 255, 180, ${0.15 + progress * 0.2})` :
                      'rgba(0, 160, 255, 0.24)';
        } else {
          // Right side loops (flowing out of north-east pole, bending back to south-east)
          startPt = { 
            x: rCore * 0.8, 
            y: -rCore * (0.3 + (1 - progress) * 0.5), 
            z: rCore * Math.sin(progress * Math.PI) * 0.5 
          };
          endPt = { 
            x: rCore * 0.8, 
            y: rCore * (0.3 + (1 - progress) * 0.5), 
            z: rCore * Math.sin(progress * Math.PI) * 0.5 
          };
          normalDir = { x: 1.4 + (1 - progress) * 1.5, y: 0, z: Math.cos(progress * Math.PI) };
          loopColor = activeTab === 'velocity' ? 'rgba(255, 50, 0, 0.45)' :
                      activeTab === 'plasma' ? 'rgba(255, 80, 0, 0.42)' :
                      activeTab === 'current' ? `rgba(255, 150, 0, ${0.18 + progress * 0.2})` :
                      'rgba(255, 45, 0, 0.32)';
        }

        // Generate quadratic Bezier path in 3D
        // Stretch lines based on field strength scale
        const height = rCore * radiusMultiplier * (0.8 + strengthFactor * 0.2);
        const midPt: Point3D = {
          x: (startPt.x + endPt.x) / 2 + normalDir.x * height,
          y: (startPt.y + endPt.y) / 2 + normalDir.y * height,
          z: (startPt.z + endPt.z) / 2 + normalDir.z * height,
        };

        // Add magnetic waves/turbulence if current density or plasma is active
        const turbFreq = activeTab === 'plasma' ? 0.05 : activeTab === 'current' ? 0.02 : 0;
        const turbAmp = activeTab === 'plasma' ? 8 : activeTab === 'current' ? 3 : 0;

        for (let j = 0; j <= resolution; j++) {
          const t = j / resolution;
          // Quadratic bezier calculation
          let bx = (1 - t) * (1 - t) * startPt.x + 2 * (1 - t) * t * midPt.x + t * t * endPt.x;
          let by = (1 - t) * (1 - t) * startPt.y + 2 * (1 - t) * t * midPt.y + t * t * endPt.y;
          let bz = (1 - t) * (1 - t) * startPt.z + 2 * (1 - t) * t * midPt.z + t * t * endPt.z;

          // Add interactive viscous plasma lag (bend loop centered on drag velocity)
          const centerFactor = Math.sin(t * Math.PI); // peak bow in middle of loop
          const lagMultiplier = 160;
          bx -= velocityRef.current.y * lagMultiplier * centerFactor * (0.8 + progress * 0.5);
          by += velocityRef.current.x * lagMultiplier * centerFactor * (0.8 + progress * 0.5);
          bz -= (Math.abs(velocityRef.current.x) + Math.abs(velocityRef.current.y)) * (lagMultiplier * 0.4) * centerFactor;

          // Add turbulence wave ripple
          const wave = Math.sin(t * Math.PI * 3 + localTime * turbFreq) * turbAmp;
          pathPoints.push({
            x: bx + wave * (side === 'left' ? -0.2 : 0.2),
            y: by + wave * 0.2,
            z: bz + wave * 0.3
          });
        }

        loops.push({
          path: pathPoints,
          color: loopColor,
          side,
          index: i
        });
      }

      // Depth sort everything to render background loops behind, star core, then foreground loops!
      // Rotate and calculate depth projection
      const rotatedLoops = loops.map(loop => {
        const rotatedPath = loop.path.map(rotate3D);
        // Calculate average Z depth for sorting
        const avgZ = rotatedPath.reduce((sum, p) => sum + p.z, 0) / rotatedPath.length;
        return {
          ...loop,
          rotatedPath,
          avgZ
        };
      });

      // Sort based on depth (Z axis: more negative is further away)
      rotatedLoops.sort((a, b) => a.avgZ - b.avgZ);

      // Separate background vs foreground lines based on avgZ <= 0 or not
      const bgLoops = rotatedLoops.filter(l => l.avgZ < -rCore * 0.1);
      const fgLoops = rotatedLoops.filter(l => l.avgZ >= -rCore * 0.1);

      // Helper function to draw a loop path
      const drawLoopPath = (loop: typeof rotatedLoops[0]) => {
        ctx.beginPath();
        const p0 = loop.rotatedPath[0];
        ctx.moveTo(cx + p0.x, cy + p0.y);

        for (let j = 1; j < loop.rotatedPath.length; j++) {
          const p = loop.rotatedPath[j];
          ctx.lineTo(cx + p.x, cy + p.y);
        }

        // Premium bloom styling depending on tab
        ctx.strokeStyle = loop.color;
        ctx.lineWidth = activeTab === 'plasma' ? 1.4 : activeTab === 'current' ? 1.0 : 0.85;
        
        // Glow effect
        if (activeTab === 'plasma' || activeTab === 'velocity') {
          ctx.shadowColor = loop.side === 'left' ? '#00f0ff' : '#ff3300';
          ctx.shadowBlur = Math.sin(localTime * 0.01 + loop.index) * 4 + 6;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Flowing stardust particles traveling along paths
        flowingParticlesRef.current.forEach(p => {
          if (p.loopIndex % loopCount === loop.index) {
            p.progress += p.speed * (activeTab === 'velocity' ? 1.8 : 1.0);
            if (p.progress >= 1.0) p.progress = 0;

            const ptIndex = Math.floor(p.progress * (loop.rotatedPath.length - 1));
            const pt = loop.rotatedPath[ptIndex];
            if (pt) {
              const alpha = Math.sin(p.progress * Math.PI);
              ctx.fillStyle = loop.side === 'left' 
                ? `rgba(0, 240, 255, ${alpha * 0.85})` 
                : `rgba(255, 120, 0, ${alpha * 0.95})`;
              
              ctx.beginPath();
              ctx.arc(cx + pt.x, cy + pt.y, p.size * (activeTab === 'plasma' ? 1.5 : 1.0), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      };

      // ----------------------------------------------------------------------
      // PHASE 1: Render Background loops (Z is behind)
      // ----------------------------------------------------------------------
      bgLoops.forEach(drawLoopPath);

      // ----------------------------------------------------------------------
      // PHASE 2: Render 3D Star Sphere
      // ----------------------------------------------------------------------
      // Radial glow behind Sun
      const sunBackGlow = ctx.createRadialGradient(cx, cy, rCore * 0.4, cx, cy, rCore * 3.2);
      sunBackGlow.addColorStop(0, 'rgba(255, 90, 0, 0.22)');
      sunBackGlow.addColorStop(0.3, 'rgba(255, 140, 0, 0.08)');
      sunBackGlow.addColorStop(0.6, 'rgba(0, 180, 255, 0.02)');
      sunBackGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunBackGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, rCore * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp glowing outer coronal haze
      const coronaGrad = ctx.createRadialGradient(cx, cy, rCore * 0.8, cx, cy, rCore * 1.4);
      coronaGrad.addColorStop(0, 'rgba(255, 145, 0, 0.45)');
      coronaGrad.addColorStop(0.35, 'rgba(255, 90, 0, 0.2)');
      coronaGrad.addColorStop(0.7, 'rgba(0, 160, 255, 0.05)');
      coronaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, rCore * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Base Sun disk
      ctx.beginPath();
      ctx.arc(cx, cy, rCore, 0, Math.PI * 2);
      ctx.fillStyle = '#110502';
      ctx.fill();

      // Firestorm particle updates
      if (solarFlaresRef.current.length < 50) {
        // spawn particles
        const angle = Math.random() * Math.PI * 2;
        const rad = rCore * (0.8 + Math.random() * 0.18);
        solarFlaresRef.current.push({
          x: Math.cos(angle) * rad,
          y: Math.sin(angle) * rad,
          vx: Math.cos(angle) * (0.2 + Math.random() * 0.4),
          vy: Math.sin(angle) * (0.2 + Math.random() * 0.4),
          life: 0,
          maxLife: 30 + Math.random() * 50,
          size: 0.8 + Math.random() * 2,
          color: Math.random() > 0.4 ? 'rgba(255, 120, 0, 0.7)' : 'rgba(255, 60, 0, 0.8)'
        });
      }

      solarFlaresRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        // 3D Rotational shift on outer flare emissions
        const rotatedFlare = rotate3D({ x: p.x, y: p.y, z: rCore * 0.1 });

        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ff6a00';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(cx + rotatedFlare.x, cy + rotatedFlare.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      solarFlaresRef.current = solarFlaresRef.current.filter(p => p.life < p.maxLife);

      // Draw filament rings rotating under 3D spherical shading
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rCore, 0, Math.PI * 2);
      ctx.clip(); // Keep within solar boundaries

      // Solar plasma skin textures (gorgeous rotational depth mapping)
      const skinAngle = rotationRef.current.y * 0.5;
      const skinAngleX = rotationRef.current.x * 0.5;
      ctx.strokeStyle = 'rgba(255, 120, 0, 0.15)';
      ctx.lineWidth = 1.2;
      
      for (let s = -4; s <= 4; s++) {
        ctx.beginPath();
        const yOffset = (s / 5) * rCore;
        // Project a concentric latitude ring
        for (let a = 0; a <= 20; a++) {
          const latAngle = (a / 20) * Math.PI * 2 + skinAngle;
          const rLat = Math.sqrt(rCore * rCore - yOffset * yOffset);
          const rawX = Math.cos(latAngle) * rLat;
          const rawZ = Math.sin(latAngle) * rLat;

          // Rotate around X-axis for latitude tilt
          const finalY = yOffset * Math.cos(skinAngleX) - rawZ * Math.sin(skinAngleX);
          const finalX = rawX;

          if (a === 0) ctx.moveTo(cx + finalX, cy + finalY);
          else ctx.lineTo(cx + finalX, cy + finalY);
        }
        ctx.stroke();
      }

      // Add extra energetic plasma hot spots
      const hotSpots = [
        { x: -rCore * 0.4, y: -rCore * 0.2, size: rCore * 0.4 },
        { x: rCore * 0.5, y: -rCore * 0.3, size: rCore * 0.3 },
        { x: rCore * 0.2, y: rCore * 0.4, size: rCore * 0.35 }
      ];

      hotSpots.forEach((spot, idx) => {
        const spotRot = rotate3D({ x: spot.x, y: spot.y, z: rCore * 0.7 });
        if (spotRot.z > 0) { // On the front of the sphere
          const flareRad = spot.size * (1 + Math.sin(localTime * 0.05 + idx) * 0.08);
          const spotGlow = ctx.createRadialGradient(
            cx + spotRot.x, cy + spotRot.y, 1, 
            cx + spotRot.x, cy + spotRot.y, flareRad
          );
          spotGlow.addColorStop(0, '#FFFFFF');
          spotGlow.addColorStop(0.2, 'rgba(255, 230, 0, 0.9)');
          spotGlow.addColorStop(0.5, 'rgba(255, 100, 0, 0.4)');
          spotGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = spotGlow;
          ctx.beginPath();
          ctx.arc(cx + spotRot.x, cy + spotRot.y, flareRad, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Sphere shading overlay creating jaw-dropping volumetric 3D spherical depth!
      const sunShading = ctx.createRadialGradient(
        cx - rCore * 0.3, cy - rCore * 0.3, rCore * 0.1, 
        cx, cy, rCore
      );
      sunShading.addColorStop(0, 'rgba(255, 255, 255, 0.12)'); // soft light source highlight
      sunShading.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
      sunShading.addColorStop(0.8, 'rgba(0, 0, 0, 0.72)'); // volumetric core shadows
      sunShading.addColorStop(1, 'rgba(0, 0, 0, 0.98)'); // solid edge boundary back shadows
      ctx.fillStyle = sunShading;
      ctx.beginPath();
      ctx.arc(cx, cy, rCore, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ----------------------------------------------------------------------
      // PHASE 2.5: Holographic Cyber Containment Rings (Surreal grid layer)
      // ----------------------------------------------------------------------
      ctx.save();
      // Outer Concentric Ring 1 (Horizontal tilt rotating)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.beginPath();
      for (let a = 0; a <= 60; a++) {
        const theta = (a / 60) * Math.PI * 2;
        const rRing = rCore * 1.5;
        // Project a concentric circular orbit tilted around the Y axis
        const rPt = rotate3D({
          x: Math.cos(theta) * rRing,
          y: Math.sin(theta) * rRing * 0.2, // flat horizontal angle
          z: Math.sin(theta) * rRing * 0.4
        });
        if (a === 0) ctx.moveTo(cx + rPt.x, cy + rPt.y);
        else ctx.lineTo(cx + rPt.x, cy + rPt.y);
      }
      ctx.stroke();

      // Outer Concentric Ring 2 (Vertical polar tilt rotating)
      ctx.strokeStyle = 'rgba(255, 110, 0, 0.14)';
      ctx.beginPath();
      for (let a = 0; a <= 60; a++) {
        const theta = (a / 60) * Math.PI * 2;
        const rRing = rCore * 1.8;
        const rPt = rotate3D({
          x: Math.sin(theta) * rRing * 0.15,
          y: Math.cos(theta) * rRing,
          z: Math.sin(theta) * rRing * 0.35
        });
        if (a === 0) ctx.moveTo(cx + rPt.x, cy + rPt.y);
        else ctx.lineTo(cx + rPt.x, cy + rPt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ----------------------------------------------------------------------
      // PHASE 3: Render Sonar Radar pulses for selected region nodes on Star
      // ----------------------------------------------------------------------
      sonarPulsRef.current.forEach(p => {
        p.timer += 0.5 * timeScale;
        const realCoord = {
          x: p.x * rCore,
          y: p.y * rCore,
          z: p.z * rCore
        };
        const proj = rotate3D(realCoord);

        if (proj.z > 0) { // Render only if on front side
          const radius = p.timer * 2.2;
          const alpha = Math.max(0, 1 - p.timer / 40);
          ctx.strokeStyle = selectedRegion === 'AR-3423' 
            ? `rgba(255, 31, 31, ${alpha * 0.8})` 
            : `rgba(0, 240, 255, ${alpha * 0.8})`;
          
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx + proj.x, cy + proj.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      sonarPulsRef.current = sonarPulsRef.current.filter(p => p.timer < 40);

      // ----------------------------------------------------------------------
      // PHASE 4: Render Foreground loops (Z is in front)
      // ----------------------------------------------------------------------
      fgLoops.forEach(drawLoopPath);

      // ----------------------------------------------------------------------
      // PHASE 5: Draw 3D projected Nodes and label connectors
      // ----------------------------------------------------------------------
      REGIONS.forEach(node => {
        const realCoord = {
          x: node.sphereX * rCore,
          y: node.sphereY * rCore,
          z: node.sphereZ * rCore
        };
        const proj = rotate3D(realCoord);

        const isHovered = hoveredRegion === node.id;
        const isSelected = selectedRegion === node.id;
        const screenX = cx + proj.x;
        const screenY = cy + proj.y;

        // Save rotated screen position in node metadata dynamically for mouse clicks
        (node as any).screenX = screenX;
        (node as any).screenY = screenY;
        (node as any).depthZ = proj.z;

        // Render nodes only if they are on the front hemisphere for 100% realistic volumetric 3D!
        if (proj.z >= -rCore * 0.3) {
          // Glow background halo
          if (isSelected || isHovered) {
            const nodeGlow = ctx.createRadialGradient(screenX, screenY, 1, screenX, screenY, isSelected ? 15 : 10);
            nodeGlow.addColorStop(0, node.color === 'red' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 240, 255, 0.3)');
            nodeGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = nodeGlow;
            ctx.beginPath();
            ctx.arc(screenX, screenY, isSelected ? 15 : 10, 0, Math.PI * 2);
            ctx.fill();
          }

          // Concentric outer reticle
          ctx.strokeStyle = isSelected 
            ? (node.color === 'red' ? '#ff1e1e' : '#00f0ff') 
            : 'rgba(255,255,255,0.2)';
          ctx.lineWidth = isSelected ? 1.5 : 0.8;
          ctx.beginPath();
          ctx.arc(screenX, screenY, isSelected ? 7 : 5, 0, Math.PI * 2);
          ctx.stroke();

          // Shiny inner glass core
          ctx.fillStyle = isSelected 
            ? '#FFFFFF' 
            : (node.color === 'red' ? '#ff3232' : '#00bcff');
          ctx.beginPath();
          ctx.arc(screenX, screenY, isSelected ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();

          // Active red laser exfiltration beam for highlighted active AR-3423 region node
          if (node.id === 'AR-3423' && isSelected) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx, cy); // Anchor center core
            ctx.lineTo(screenX, screenY);
            ctx.strokeStyle = 'rgba(255, 31, 31, 0.45)';
            ctx.lineWidth = 1.4 + Math.sin(localTime * 0.1) * 0.5;
            ctx.shadowColor = '#ff1f1f';
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.restore();

            // Energy beam traveling particles outward
            const beamT = (localTime * 0.015) % 1.0;
            const bpx = cx + (screenX - cx) * beamT;
            const bpy = cy + (screenY - cy) * beamT;
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#ff1f1f';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(bpx, bpy, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // ----------------------------------------------------------------------
      // PHASE 6: Render Active Eruptive Solar Prominences
      // ----------------------------------------------------------------------
      prominencesRef.current.forEach(prom => {
        prom.life -= prom.speed * timeScale;
        
        // Generate Bezier path in 3D
        const pathPoints: Point3D[] = [];
        const resolution = 20;
        for (let j = 0; j <= resolution; j++) {
          const t = j / resolution;
          const bx = (1 - t) * (1 - t) * prom.startPt.x + 2 * (1 - t) * t * prom.midPt.x + t * t * prom.endPt.x;
          const by = (1 - t) * (1 - t) * prom.startPt.y + 2 * (1 - t) * t * prom.midPt.y + t * t * prom.endPt.y;
          const bz = (1 - t) * (1 - t) * prom.startPt.z + 2 * (1 - t) * t * prom.midPt.z + t * t * prom.endPt.z;
          pathPoints.push({ x: bx, y: by, z: bz });
        }

        const rotatedPath = pathPoints.map(rotate3D);
        
        // Draw the main plasma arc
        ctx.beginPath();
        ctx.moveTo(cx + rotatedPath[0].x, cy + rotatedPath[0].y);
        for (let j = 1; j < rotatedPath.length; j++) {
          ctx.lineTo(cx + rotatedPath[j].x, cy + rotatedPath[j].y);
        }
        
        ctx.strokeStyle = prom.color;
        ctx.lineWidth = 4.0 * prom.life;
        ctx.shadowColor = prom.color;
        ctx.shadowBlur = 18 * prom.life;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw shooting flare particles along this prominence path
        prom.particles.forEach(p => {
          p.progress += p.speed * timeScale;
          if (p.progress >= 1.0) p.progress = 0;

          const ptIndex = Math.floor(p.progress * (rotatedPath.length - 1));
          const pt = rotatedPath[ptIndex];
          if (pt) {
            const alpha = Math.sin(p.progress * Math.PI) * prom.life;
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = prom.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(cx + pt.x, cy + pt.y, p.size * (1 + prom.life * 1.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      });

      // Filter out dead prominences
      prominencesRef.current = prominencesRef.current.filter(p => p.life > 0);

      // ----------------------------------------------------------------------
      // PHASE 7: Render Explosive Shockwave Ripples (Overlay)
      // ----------------------------------------------------------------------
      shockwavesRef.current.forEach(sw => {
        sw.radius += sw.speed * timeScale;
        const alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = sw.thickness * alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 12 * alpha;
        
        // Beautiful dotted/dashed vector rings
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      });
      // Filter dead shockwaves
      shockwavesRef.current = shockwavesRef.current.filter(sw => sw.radius < sw.maxRadius);

      // ----------------------------------------------------------------------
      // PHASE 8: Cyber Reticle / Target Locking overlay on selected region node
      // ----------------------------------------------------------------------
      const targetNode = REGIONS.find(r => r.id === selectedRegion);
      if (targetNode) {
        const sX = (targetNode as any).screenX;
        const sY = (targetNode as any).screenY;
        const depthZ = (targetNode as any).depthZ;

        if (sX !== undefined && sY !== undefined && depthZ > -rCore * 0.3) {
          // Spin and expand brackets
          const pulseScale = 1.0 + Math.sin(localTime * 0.1) * 0.05;
          const size = 18 * pulseScale;
          const angle = localTime * 0.015;

          ctx.save();
          ctx.translate(sX, sY);
          ctx.rotate(angle);
          
          ctx.strokeStyle = targetNode.color === 'red' ? 'rgba(255, 50, 50, 0.85)' : 'rgba(0, 240, 255, 0.85)';
          ctx.lineWidth = 1.4;
          
          // Draw four bracket corners
          for (let b = 0; b < 4; b++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(size - 6, size);
            ctx.lineTo(size, size);
            ctx.lineTo(size, size - 6);
            ctx.stroke();
          }
          ctx.restore();

          // Hex telemetry labels floating beside the node
          ctx.fillStyle = targetNode.color === 'red' ? '#ff3232' : '#00f0ff';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`LOC: 3D_LAT_${targetNode.sphereX.toFixed(2)}`, sX + size + 8, sY - 6);
          ctx.fillText(`FLUX: ${(fieldStrength * (targetNode.color === 'red' ? 1.8 : 0.8)).toFixed(0)} GAUSS`, sX + size + 8, sY + 3);
          
          const hexCode = Math.floor(Math.sin(localTime * 0.01 + targetNode.sphereY) * 65535 + 65536).toString(16).toUpperCase();
          ctx.fillText(`SIG_HASH: 0x${hexCode}`, sX + size + 8, sY + 12);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dimensions, activeTab, fieldStrength, hoveredRegion, selectedRegion, timeScale]);

  // Handle canvas mouse movements for interactive 3D rotations & region triggers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked near a 3D projected region node to select it
    let clickedNode: RegionNode | null = null;
    let closestDist = 20; // click threshold

    REGIONS.forEach(node => {
      const sX = (node as any).screenX;
      const sY = (node as any).screenY;
      const depthZ = (node as any).depthZ;

      if (sX !== undefined && sY !== undefined && depthZ > -20) {
        const dist = Math.sqrt((mouseX - sX) ** 2 + (mouseY - sY) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          clickedNode = node;
        }
      }
    });

    if (clickedNode) {
      const node = clickedNode as RegionNode;
      setSelectedRegion(node.id);
      
      // Spawn a beautiful local shockwave at the clicked region node
      const { rCore } = centerPosRef.current;
      const sX = (node as any).screenX || mouseX;
      const sY = (node as any).screenY || mouseY;
      shockwavesRef.current.push({
        x: sX,
        y: sY,
        radius: 1,
        maxRadius: rCore * 1.5,
        color: node.color === 'red' ? 'rgba(255, 31, 31, 0.7)' : 'rgba(0, 240, 255, 0.7)',
        speed: 3,
        thickness: 2
      });

      if (node.id === 'AR-3423') {
        synthInstance.playAlert();
      } else {
        synthInstance.playClick();
      }
      return;
    }

    // Check if clicked the core sphere Sun disk
    const { cx, cy, rCore } = centerPosRef.current;
    const distToSun = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
    if (distToSun <= rCore) {
      // Find 3D coordinate of clicked surface on front hemisphere
      const localX = mouseX - cx;
      const localY = mouseY - cy;
      const localZ = Math.sqrt(Math.max(0, rCore * rCore - localX * localX - localY * localY));

      // Reverse rotate to find the original 3D surface point on Sun
      const unrotate3D = (pt: Point3D): Point3D => {
        // Reverse Y rotation
        const cosY = Math.cos(-rotationRef.current.y);
        const sinY = Math.sin(-rotationRef.current.y);
        const x1 = pt.x * cosY + pt.z * sinY;
        const z1 = -pt.x * sinY + pt.z * cosY;

        // Reverse X rotation
        const cosX = Math.cos(-rotationRef.current.x);
        const sinX = Math.sin(-rotationRef.current.x);
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
      };

      const surfacePt = unrotate3D({ x: localX, y: localY, z: localZ });

      // Create a prominence loop. It starts near surfacePt and loops back near surfacePt
      const len = Math.sqrt(surfacePt.x*surfacePt.x + surfacePt.y*surfacePt.y + surfacePt.z*surfacePt.z);
      const nx = surfacePt.x / (len || 1);
      const ny = surfacePt.y / (len || 1);
      const nz = surfacePt.z / (len || 1);

      // Define an orthogonal vector to create offset start and end points
      let ox = -ny;
      let oy = nx;
      let oz = 0;
      const olen = Math.sqrt(ox*ox + oy*oy);
      if (olen > 0) {
        ox /= olen;
        oy /= olen;
      } else {
        ox = 1; oy = 0;
      }

      const offsetDist = rCore * 0.3;
      const startPt = {
        x: surfacePt.x - ox * offsetDist,
        y: surfacePt.y - oy * offsetDist,
        z: surfacePt.z - oz * offsetDist
      };
      const endPt = {
        x: surfacePt.x + ox * offsetDist,
        y: surfacePt.y + oy * offsetDist,
        z: surfacePt.z + oz * offsetDist
      };

      // Control point of Bezier is pushed high outward along the normal
      const height = rCore * (1.1 + Math.random() * 1.4);
      const midPt = {
        x: surfacePt.x + nx * height,
        y: surfacePt.y + ny * height,
        z: surfacePt.z + nz * height
      };

      // Push prominence object
      prominencesRef.current.push({
        id: Math.random().toString(),
        startPt,
        endPt,
        midPt,
        life: 1.0,
        speed: 0.012,
        color: activeTab === 'magnetic' ? '#00f0ff' :
               activeTab === 'velocity' ? '#ff3200' :
               activeTab === 'plasma' ? '#ffaa00' : '#00ffa2',
        particles: Array.from({ length: 40 }).map(() => ({
          progress: Math.random() * 0.3,
          speed: 0.012 + Math.random() * 0.018,
          size: 1.2 + Math.random() * 2.5
        }))
      });

      // Spawn a giant shockwave expanding from click point
      shockwavesRef.current.push({
        x: mouseX,
        y: mouseY,
        radius: 1,
        maxRadius: rCore * 3.5,
        color: activeTab === 'magnetic' ? 'rgba(0, 240, 255, 0.65)' :
               activeTab === 'velocity' ? 'rgba(255, 45, 0, 0.65)' :
               activeTab === 'plasma' ? 'rgba(255, 176, 0, 0.65)' :
               'rgba(0, 255, 180, 0.65)',
        speed: 4.5,
        thickness: 3
      });

      // Play rich audio eruption effect
      synthInstance.playAlert();
    }

    // Otherwise, initiate 3D drag rotation
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Hover detection for 3D projected nodes
    let hovered: RegionNode | null = null;
    let closestDist = 16;

    REGIONS.forEach(node => {
      const sX = (node as any).screenX;
      const sY = (node as any).screenY;
      const depthZ = (node as any).depthZ;

      if (sX !== undefined && sY !== undefined && depthZ > -20) {
        const dist = Math.sqrt((mouseX - sX) ** 2 + (mouseY - sY) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          hovered = node;
        }
      }
    });

    if (hovered) {
      if (hoveredRegion !== (hovered as RegionNode).id) {
        setHoveredRegion((hovered as RegionNode).id);
        synthInstance.playHover();
      }
    } else {
      setHoveredRegion(null);
    }

    // Rotation dragging
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    rotationRef.current.y += deltaX * 0.0075;
    rotationRef.current.x += deltaY * 0.0075;

    velocityRef.current.y = deltaX * 0.0015;
    velocityRef.current.x = deltaY * 0.0015;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsDraggingSlider(false);
  };

  // Interactive Gauss Scale modifier
  const handleGaussClick = (val: number) => {
    setFieldStrength(val);
    synthInstance.playPitchSlide(val / 6);
  };

  // Drag-and-slide vertical Gauss slider tracker
  const handleSliderClickOrDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const pct = Math.max(0, Math.min(1, clickY / rect.height));
    // pct = 0 matches +3000, pct = 1 matches -3000
    const gauss = Math.round(3000 - pct * 6000);
    setFieldStrength(gauss);
    
    // Play pitch sweep feedback from synthesizer based on Gauss value
    synthInstance.playPitchSlide(Math.abs(gauss) / 5 + 150);
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    synthInstance.playClick();
  };

  // Detailed data dossier information for active selected node
  const activeNodeData = REGIONS.find(r => r.id === selectedRegion) || REGIONS[2];

  return (
    <div className="w-full h-full flex flex-col relative bg-[#010204]/90 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-white/5 bg-black/60 shrink-0 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff9100] animate-pulse" />
            <h1 className="text-sm font-black tracking-[0.2em] uppercase text-white">MAGNETIC DYNAMICS</h1>
          </div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-[#8a91a5]/50 uppercase mt-0.5">Field Evolution</p>
        </div>

        {/* Audio control toggler */}
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <button 
            onClick={() => {
              setIsAudioOn(!isAudioOn);
              synthInstance.playClick();
            }}
            className={cn(
              "p-2 rounded-xl border transition-all duration-300 flex items-center gap-2 text-[9px] font-black tracking-widest font-mono uppercase",
              isAudioOn 
                ? "bg-amber-neon/15 border-amber-neon/30 text-amber-neon shadow-[0_0_15px_rgba(255,176,0,0.1)]" 
                : "bg-white/5 border-white/10 text-[#8a91a5]/60 hover:text-white"
            )}
            title="Toggle Ambient Audio Synth Feed"
          >
            {isAudioOn ? <Volume2 size={10} /> : <VolumeX size={10} />}
            {isAudioOn ? "SYNTH ON" : "SYNTH OFF"}
          </button>
          
          <button 
            onClick={() => {
              rotationRef.current = { x: 0.15, y: -0.45 };
              setTimeScale(1.0);
              setFieldStrength(1820);
              synthInstance.playClick();
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#8a91a5]/60 hover:text-white hover:bg-white/10 transition-all duration-300"
            title="Reset 3D Space Coordinates"
          >
            <RotateCcw size={10} />
          </button>
        </div>
      </div>

      {/* Interactive sub-tabs selector matching image tabs row */}
      <div className="flex items-center gap-1.5 px-6 py-2.5 bg-[#03050b]/80 border-b border-white/5 shrink-0 overflow-x-auto scrollbar-none z-20">
        {(['magnetic', 'velocity', 'plasma', 'current'] as const).map(tab => {
          const labels = {
            magnetic: 'Magnetic Field',
            velocity: 'Velocity Field',
            plasma: 'Plasma Dynamics',
            current: 'Current Density'
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              onMouseEnter={() => synthInstance.playHover()}
              className={cn(
                "relative px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                isActive 
                  ? "text-amber-neon bg-[#ffae00]/5 border border-amber-neon/20 shadow-[inset_0_0_12px_rgba(255,176,0,0.05)]" 
                  : "text-[#8a91a5]/50 border border-transparent hover:text-white hover:bg-white/[0.02]"
              )}
            >
              {labels[tab]}
              {isActive && (
                <motion.div 
                  layoutId="activeSubTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-amber-neon shadow-[0_0_10px_#FFAA00]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Main 3D Space */}
      <div className="flex-1 min-h-0 relative flex" ref={containerRef}>
        
        {/* Floating region info triggers (Exact visual mapping matching image side overlays) */}
        {/* Left Regions: AR-3418, AR-3417 */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-30 pointer-events-none select-none">
          {/* AR-3418 */}
          <div 
            onClick={() => {
              setSelectedRegion('AR-3418');
              synthInstance.playClick();
            }}
            onMouseEnter={() => {
              setHoveredRegion('AR-3418');
              synthInstance.playHover();
            }}
            onMouseLeave={() => setHoveredRegion(null)}
            className={cn(
              "p-3.5 rounded-xl border pointer-events-auto cursor-pointer transition-all duration-300 flex flex-col min-w-[110px] transform hover:scale-105 active:scale-95",
              selectedRegion === 'AR-3418' 
                ? "bg-[#00d0ff]/10 border-[#00d0ff]/50 shadow-[0_0_20px_rgba(0,208,255,0.15)]" 
                : "bg-black/60 border-white/5 hover:border-white/25"
            )}
          >
            <span className="text-[10px] font-black tracking-widest text-white">AR-3418</span>
            <span className={cn(
              "text-[9px] font-mono mt-1 font-bold",
              selectedRegion === 'AR-3418' ? "text-[#00d0ff]" : "text-[#8a91a5]/50"
            )}>β</span>
          </div>

          {/* AR-3417 */}
          <div 
            onClick={() => {
              setSelectedRegion('AR-3417');
              synthInstance.playClick();
            }}
            onMouseEnter={() => {
              setHoveredRegion('AR-3417');
              synthInstance.playHover();
            }}
            onMouseLeave={() => setHoveredRegion(null)}
            className={cn(
              "p-3.5 rounded-xl border pointer-events-auto cursor-pointer transition-all duration-300 flex flex-col min-w-[110px] transform hover:scale-105 active:scale-95",
              selectedRegion === 'AR-3417' 
                ? "bg-[#00f0ff]/10 border-[#008cff]/50 shadow-[0_0_20px_rgba(0,140,255,0.15)]" 
                : "bg-black/60 border-white/5 hover:border-white/25"
            )}
          >
            <span className="text-[10px] font-black tracking-widest text-white">AR-3417</span>
            <span className={cn(
              "text-[9px] font-mono mt-1 font-bold",
              selectedRegion === 'AR-3417' ? "text-[#008cff]" : "text-[#8a91a5]/50"
            )}>α - β</span>
          </div>
        </div>

        {/* Right Regions: AR-3423 (Highlight red), AR-3425 */}
        <div className="absolute right-[100px] top-1/2 -translate-y-1/2 flex flex-col gap-8 z-30 pointer-events-none select-none">
          {/* AR-3423 (Active alert!) */}
          <div 
            onClick={() => {
              setSelectedRegion('AR-3423');
              synthInstance.playAlert();
            }}
            onMouseEnter={() => {
              setHoveredRegion('AR-3423');
              synthInstance.playHover();
            }}
            onMouseLeave={() => setHoveredRegion(null)}
            className={cn(
              "p-3.5 rounded-xl border pointer-events-auto cursor-pointer transition-all duration-300 flex flex-col min-w-[110px] transform hover:scale-105 active:scale-95 relative",
              selectedRegion === 'AR-3423' 
                ? "bg-red-950/20 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse" 
                : "bg-black/60 border-red-950/40 hover:border-red-500/40"
            )}
          >
            {/* Pulsing hazard node indicator */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-black tracking-widest text-white">AR-3423</span>
            <span className="text-[9px] font-mono mt-1 font-black text-red-500">β - γ - δ</span>
          </div>

          {/* AR-3425 */}
          <div 
            onClick={() => {
              setSelectedRegion('AR-3425');
              synthInstance.playClick();
            }}
            onMouseEnter={() => {
              setHoveredRegion('AR-3425');
              synthInstance.playHover();
            }}
            onMouseLeave={() => setHoveredRegion(null)}
            className={cn(
              "p-3.5 rounded-xl border pointer-events-auto cursor-pointer transition-all duration-300 flex flex-col min-w-[110px] transform hover:scale-105 active:scale-95",
              selectedRegion === 'AR-3425' 
                ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                : "bg-black/60 border-white/5 hover:border-white/25"
            )}
          >
            <span className="text-[10px] font-black tracking-widest text-white">AR-3425</span>
            <span className={cn(
              "text-[9px] font-mono mt-1 font-bold",
              selectedRegion === 'AR-3425' ? "text-amber-500" : "text-[#8a91a5]/50"
            )}>β</span>
          </div>
        </div>

        {/* Dynamic Canvas element */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* Drag rotation instructions */}
        <div className="absolute bottom-4 left-6 pointer-events-none opacity-20 text-[8px] font-mono uppercase tracking-[0.25em] text-white">
          [ Left-click + Drag inside to rotate 3D model space ]
        </div>

        {/* ----------------------------------------------------------------------
            Interactive Vertical Gauss Strength Bar matching exact replica design
            ---------------------------------------------------------------------- */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-14 flex flex-col items-center bg-black/60 border border-white/5 py-4 rounded-xl z-30 select-none">
          <span className="text-[7.5px] font-black tracking-wider text-[#8a91a5]/60 uppercase text-center mb-3 leading-tight font-mono">
            FIELD<br/>STRENGTH
          </span>
          <span className="text-[6.5px] font-mono text-[#8a91a5]/40 uppercase mb-1">Gauss</span>

          {/* Color Gradient Slidebar */}
          <div 
            ref={sliderRef}
            onMouseDown={(e) => {
              setIsDraggingSlider(true);
              handleSliderClickOrDrag(e);
            }}
            onMouseMove={(e) => {
              if (isDraggingSlider) {
                handleSliderClickOrDrag(e);
              }
            }}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            className="relative w-2.5 h-44 rounded-full bg-gradient-to-b from-red-600 via-orange-400 via-white via-cyan-300 to-blue-700 flex flex-col justify-between items-center py-1 border border-white/10 shadow-[inset_0_0_4px_rgba(0,0,0,0.8)] cursor-pointer"
          >
            
            {/* Interactive draggable node slider handle */}
            <div 
              className="absolute w-4 h-2 bg-white rounded border border-black shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none left-1/2 -translate-x-1/2 transition-all duration-75"
              style={{
                // Map Gauss (-3000 to +3000) to percentage (0% to 100% from top of colorbar)
                top: `${((3000 - fieldStrength) / 6000) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* Tick Markers */}
          <div className="flex flex-col items-center gap-2 mt-3 font-mono text-[7px] text-[#8a91a5]/50">
            <button onClick={() => handleGaussClick(3000)} className={cn("hover:text-red-500 transition-all font-bold", fieldStrength === 3000 && "text-red-500 font-black")}>3000</button>
            <button onClick={() => handleGaussClick(1500)} className={cn("hover:text-orange-400 transition-all font-bold", fieldStrength === 1500 && "text-orange-400 font-black")}>1500</button>
            <button onClick={() => handleGaussClick(0)} className={cn("hover:text-white transition-all font-bold", fieldStrength === 0 && "text-white font-black")}>0</button>
            <button onClick={() => handleGaussClick(-1500)} className={cn("hover:text-cyan-300 transition-all font-bold", fieldStrength === -1500 && "text-cyan-300 font-black")}>-1500</button>
            <button onClick={() => handleGaussClick(-3000)} className={cn("hover:text-blue-500 transition-all font-bold", fieldStrength === -3000 && "text-blue-500 font-black")}>-3000</button>
          </div>
        </div>

      </div>

      {/* Interactive Bottom Control Board & Region Dossier Data readout */}
      <div className="border-t border-white/5 bg-black/50 p-4 shrink-0 grid grid-cols-12 gap-4 items-center z-20">
        
        {/* Dynamic Simulation Controls */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5 border-r border-white/5 pr-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8a91a5]/60 font-mono">Simulation Pace</span>
            <span className="text-[9px] font-mono text-amber-neon font-black">{timeScale.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setTimeScale(0.2);
                synthInstance.playClick();
              }} 
              className={cn("px-2 py-1 rounded text-[8px] font-black font-mono uppercase transition-all", timeScale === 0.2 ? "bg-[#FFAA00]/20 text-amber-neon" : "bg-white/5 text-[#8a91a5]/40 hover:text-white")}
            >
              Slow
            </button>
            <button 
              onClick={() => {
                setTimeScale(1.0);
                synthInstance.playClick();
              }} 
              className={cn("px-2 py-1 rounded text-[8px] font-black font-mono uppercase transition-all", timeScale === 1.0 ? "bg-[#FFAA00]/20 text-amber-neon" : "bg-white/5 text-[#8a91a5]/40 hover:text-white")}
            >
              Normal
            </button>
            <button 
              onClick={() => {
                setTimeScale(2.5);
                synthInstance.playClick();
              }} 
              className={cn("px-2 py-1 rounded text-[8px] font-black font-mono uppercase transition-all", timeScale === 2.5 ? "bg-[#FFAA00]/20 text-amber-neon" : "bg-white/5 text-[#8a91a5]/40 hover:text-white")}
            >
              Hyper
            </button>
          </div>
        </div>

        {/* Region Dossier Readout */}
        <div className="col-span-12 md:col-span-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border",
              activeNodeData.color === 'red' ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-[#00f0ff]/10 border-[#00f0ff]/30 text-cyan-400"
            )}>
              <Sun size={14} className={cn(activeNodeData.color === 'red' && "animate-spin")} style={{ animationDuration: '60s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-white">{activeNodeData.name} Active Node Dossier</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[7px] font-black font-mono uppercase tracking-widest leading-none border",
                  activeNodeData.color === 'red' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-[#00f0ff]/10 border-[#00f0ff]/20 text-cyan-400"
                )}>
                  {activeNodeData.status}
                </span>
              </div>
              <p className="text-[8.5px] font-mono text-[#8a91a5]/50 uppercase tracking-widest mt-0.5">
                Current State metrics mapping active thermal magnetic filaments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono">
            <div className="text-left">
              <div className="text-[7.5px] text-[#8a91a5]/40 uppercase tracking-widest">Temperature</div>
              <div className="text-[10px] font-bold text-white mt-0.5">{activeNodeData.temp}</div>
            </div>
            <div className="text-left">
              <div className="text-[7.5px] text-[#8a91a5]/40 uppercase tracking-widest">Magnetism</div>
              <div className="text-[10px] font-bold text-white mt-0.5">{activeNodeData.field}</div>
            </div>
            <div className="text-left">
              <div className="text-[7.5px] text-[#8a91a5]/40 uppercase tracking-widest font-bold">Flare Prob.</div>
              <div className={cn(
                "text-[10px] font-black mt-0.5",
                activeNodeData.color === 'red' ? "text-red-500" : "text-cyan-400"
              )}>
                {activeNodeData.probability}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
