import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitBranch, Cpu, Database, Zap, Sparkles, RefreshCw, 
  ChevronRight, Brain, AlertCircle, Play, Volume2, VolumeX, Eye, Info
} from 'lucide-react';
import { cn } from '../lib/utils';

// Sound Synth for Nexus Discovery
class ScientificSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialization of AudioContext on user interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val ? 0.08 : 0, this.ctx.currentTime, 0.05);
    }
  }

  public toggle() {
    this.enabled = !this.enabled;
    this.setEnabled(this.enabled);
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }

  // Play a gorgeous multi-frequency chord when a hypothesis converges
  public playDiscovery() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    const now = this.ctx.currentTime;
    const freqs = [329.63, 392.00, 523.25, 659.25, 783.99]; // C Major chord / high-tech vibe

    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.4);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6 + idx * 0.1);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain || this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.8 + idx * 0.1);
    });
  }

  // Play a soft dynamic hover beep proportional to the coordinate's X axis
  public playNodeHover(freq: number) {
    this.init();
    if (!this.ctx || !this.enabled) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.015, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // Play high pitch sweep when selecting a hypothesis
  public playSelectSweep() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.03, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      // Lowpass filter for analog warm feel
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }
}

const nexusSynth = new ScientificSynth();

// Interfaces
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface TreeNode3D {
  id: string;
  name: string;
  type: 'observation' | 'feature' | 'search' | 'evaluation' | 'selection';
  description: string;
  originalPos: Point3D; // 3D coordinates in model space
  color: string;
  confidence: number;
  physicsScore: number;
  simplicityScore: number;
  leadTime: string;
  hash: string;
}

interface TreeLink {
  source: string;
  target: string;
  color: string;
}

// Predefined 3D Hypothesis Evolution Tree Data
const NODES_3D: TreeNode3D[] = [
  // LAYER 0: Observations (Root)
  {
    id: 'OBS-01',
    name: 'Observations Ingest',
    type: 'observation',
    description: 'High-frequency solar observatory magnetic flux stream & threat vector inputs',
    originalPos: { x: -220, y: 0, z: 0 },
    color: '#00f0ff',
    confidence: 100,
    physicsScore: 1.0,
    simplicityScore: 1.0,
    leadTime: 'Instant',
    hash: '0x8FA4'
  },
  // LAYER 1: Feature Transformation
  {
    id: 'FEAT-01',
    name: 'Vector Field Curvature',
    type: 'feature',
    description: 'Deconstructs vector potential curvature and differential geometry tensor profiles',
    originalPos: { x: -110, y: -50, z: -40 },
    color: '#a855f7',
    confidence: 96,
    physicsScore: 0.98,
    simplicityScore: 0.92,
    leadTime: '3 min',
    hash: '0x1C9B'
  },
  {
    id: 'FEAT-02',
    name: 'Plasma Shear Gradient',
    type: 'feature',
    description: 'Calculates local shear gradients and non-force-free magnetic parameters',
    originalPos: { x: -110, y: 10, z: 50 },
    color: '#a855f7',
    confidence: 92,
    physicsScore: 0.95,
    simplicityScore: 0.88,
    leadTime: '5 min',
    hash: '0xFE31'
  },
  {
    id: 'FEAT-03',
    name: 'Helicity Flux Divergence',
    type: 'feature',
    description: 'Evaluates localized magnetic helicity divergence across active region footprints',
    originalPos: { x: -110, y: 60, z: -30 },
    color: '#a855f7',
    confidence: 90,
    physicsScore: 0.91,
    simplicityScore: 0.95,
    leadTime: '4 min',
    hash: '0x7E12'
  },
  // LAYER 2: Hypothesis Search (Wide Web)
  {
    id: 'HYP-01',
    name: 'Shear Cascade Model',
    type: 'search',
    description: 'Simulates magnetic shear triggering a secondary runaway reconnection cascade',
    originalPos: { x: 0, y: -90, z: -70 },
    color: '#3b82f6',
    confidence: 91,
    physicsScore: 0.94,
    simplicityScore: 0.87,
    leadTime: '22 min',
    hash: '0x4827' // Selected default
  },
  {
    id: 'HYP-02',
    name: 'Flux Rope Inversion',
    type: 'search',
    description: 'Heliospheric flux rope twist inversion causing localized plasma instability loops',
    originalPos: { x: 0, y: -40, z: 60 },
    color: '#3b82f6',
    confidence: 84,
    physicsScore: 0.89,
    simplicityScore: 0.81,
    leadTime: '14 min',
    hash: '0x3011'
  },
  {
    id: 'HYP-03',
    name: 'Coupled Wave Resonance',
    type: 'search',
    description: 'Thermal coupling between adjacent filaments driven by acoustic wave synchronization',
    originalPos: { x: 0, y: 10, z: -30 },
    color: '#3b82f6',
    confidence: 78,
    physicsScore: 0.79,
    simplicityScore: 0.85,
    leadTime: '31 min',
    hash: '0x5120'
  },
  {
    id: 'HYP-04',
    name: 'Decoy Wave Superposition',
    type: 'search',
    description: 'Anomalous exfiltration vector posing as high-entropy background radiation pulses',
    originalPos: { x: 0, y: 50, z: 70 },
    color: '#3b82f6',
    confidence: 95,
    physicsScore: 0.97,
    simplicityScore: 0.91,
    leadTime: '8 min',
    hash: '0x9214'
  },
  {
    id: 'HYP-05',
    name: 'Stochastic Heat Injection',
    type: 'search',
    description: 'Micro-scale current dissipation spikes triggering chaotic magnetic field expansions',
    originalPos: { x: 0, y: 100, z: -50 },
    color: '#3b82f6',
    confidence: 67,
    physicsScore: 0.71,
    simplicityScore: 0.96,
    leadTime: '45 min',
    hash: '0x1102'
  },
  // LAYER 3: Hypothesis Evaluation
  {
    id: 'EVAL-01',
    name: 'Thermodynamic Check',
    type: 'evaluation',
    description: 'Validates entropy laws, radiation loss bounds, and kinetic temperature scales',
    originalPos: { x: 110, y: -45, z: -30 },
    color: '#f97316',
    confidence: 89,
    physicsScore: 0.93,
    simplicityScore: 0.85,
    leadTime: '12 min',
    hash: '0x88BC'
  },
  {
    id: 'EVAL-02',
    name: 'MHD Solvability Index',
    type: 'evaluation',
    description: 'Confirms magnetohydrodynamic tensor solvability under extreme high-beta plasma',
    originalPos: { x: 110, y: 10, z: 30 },
    color: '#f97316',
    confidence: 94,
    physicsScore: 0.96,
    simplicityScore: 0.82,
    leadTime: '15 min',
    hash: '0x56DE'
  },
  {
    id: 'EVAL-03',
    name: 'Topological Field Lock',
    type: 'evaluation',
    description: 'Verifies continuous magnetic linkage invariant conservations under spatial distortions',
    originalPos: { x: 110, y: 65, z: -40 },
    color: '#f97316',
    confidence: 91,
    physicsScore: 0.90,
    simplicityScore: 0.94,
    leadTime: '9 min',
    hash: '0xC62A'
  },
  // LAYER 4: Selection/Discovery (Converged Sink)
  {
    id: 'SELECT-01',
    name: 'Nexus Discovery Target',
    type: 'selection',
    description: 'Validated, physics-preserving, high-certainty scientific discovery model',
    originalPos: { x: 220, y: 0, z: 0 },
    color: '#eab308', // Gold
    confidence: 98,
    physicsScore: 0.98,
    simplicityScore: 0.89,
    leadTime: 'Validated',
    hash: '0xFA88'
  }
];

const LINKS_3D: TreeLink[] = [
  // Root to Layer 1
  { source: 'OBS-01', target: 'FEAT-01', color: 'rgba(0, 240, 255, 0.25)' },
  { source: 'OBS-01', target: 'FEAT-02', color: 'rgba(0, 240, 255, 0.25)' },
  { source: 'OBS-01', target: 'FEAT-03', color: 'rgba(0, 240, 255, 0.25)' },

  // Layer 1 to Layer 2
  { source: 'FEAT-01', target: 'HYP-01', color: 'rgba(168, 85, 247, 0.25)' },
  { source: 'FEAT-01', target: 'HYP-02', color: 'rgba(168, 85, 247, 0.25)' },
  { source: 'FEAT-02', target: 'HYP-02', color: 'rgba(168, 85, 247, 0.25)' },
  { source: 'FEAT-02', target: 'HYP-03', color: 'rgba(168, 85, 247, 0.25)' },
  { source: 'FEAT-02', target: 'HYP-04', color: 'rgba(168, 85, 247, 0.25)' },
  { source: 'FEAT-03', target: 'HYP-04', color: 'rgba(168, 85, 247, 0.25)' },
  { source: 'FEAT-03', target: 'HYP-05', color: 'rgba(168, 85, 247, 0.25)' },

  // Layer 2 to Layer 3
  { source: 'HYP-01', target: 'EVAL-01', color: 'rgba(59, 130, 246, 0.25)' },
  { source: 'HYP-02', target: 'EVAL-01', color: 'rgba(59, 130, 246, 0.25)' },
  { source: 'HYP-02', target: 'EVAL-02', color: 'rgba(59, 130, 246, 0.25)' },
  { source: 'HYP-03', target: 'EVAL-02', color: 'rgba(59, 130, 246, 0.25)' },
  { source: 'HYP-04', target: 'EVAL-03', color: 'rgba(59, 130, 246, 0.25)' },
  { source: 'HYP-05', target: 'EVAL-03', color: 'rgba(59, 130, 246, 0.25)' },

  // Layer 3 to Layer 4
  { source: 'EVAL-01', target: 'SELECT-01', color: 'rgba(249, 115, 22, 0.35)' },
  { source: 'EVAL-02', target: 'SELECT-01', color: 'rgba(249, 115, 22, 0.35)' },
  { source: 'EVAL-03', target: 'SELECT-01', color: 'rgba(249, 115, 22, 0.35)' }
];

export const NexusDiscovery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stats ticking hyperactively
  const [hypGenerated, setHypGenerated] = useState<number>(12842);
  const [hypEvaluated, setHypEvaluated] = useState<number>(12118);
  const [hypSurvived, setHypSurvived] = useState<number>(24);
  const [discoveryRate, setDiscoveryRate] = useState<number>(0.19);

  // Selected hypothesis details
  const [selectedHyp, setSelectedHyp] = useState<TreeNode3D>(NODES_3D.find(n => n.id === 'HYP-01')!);
  const [hoveredNode, setHoveredNode] = useState<TreeNode3D | null>(null);
  const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Terminal reasoning log drawer state
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Sound toggle
  const [soundOn, setSoundOn] = useState(true);

  // Ref to hold the active typing interval to clear on unmount / duplicate calls
  const typingIntervalRef = useRef<any>(null);

  // 3D Rotation angles and drag states
  const rotationRef = useRef<Point3D>({ x: -0.15, y: -0.25, z: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0.003, y: 0.002 }); // inertia
  const pulseScaleRef = useRef(1.0);

  // Animated photon particles running along the tree links
  const particlesRef = useRef<{ linkIndex: number; progress: number; speed: number; size: number; color: string }[]>([]);

  // Local shockwaves from clicking on nodes
  const clickRipplesRef = useRef<{ x: number; y: number; r: number; maxR: number; opacity: number; color: string }[]>([]);

  // Ticking stats effect (hyperactive simulator)
  useEffect(() => {
    const interval = setInterval(() => {
      setHypGenerated(prev => prev + Math.floor(Math.random() * 8) + 4);
      setHypEvaluated(prev => prev + Math.floor(Math.random() * 7) + 4);
      if (Math.random() > 0.95) {
        setHypSurvived(prev => prev + 1);
        setDiscoveryRate(prev => {
          const newVal = (prev + (Math.random() * 0.01 - 0.005));
          return Math.max(0.15, Math.min(0.24, parseFloat(newVal.toFixed(4))));
        });
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Sync sound settings
  useEffect(() => {
    nexusSynth.setEnabled(soundOn);
  }, [soundOn]);

  // Seed initial flying photons along links
  useEffect(() => {
    const initialParticles = Array.from({ length: 45 }).map(() => ({
      linkIndex: Math.floor(Math.random() * LINKS_3D.length),
      progress: Math.random(),
      speed: 0.008 + Math.random() * 0.015,
      size: 1.5 + Math.random() * 2,
      color: Math.random() > 0.4 ? '#00f0ff' : '#ffb300'
    }));
    particlesRef.current = initialParticles;
  }, []);

  // Build the live interactive Canvas 3D rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localTime = 0;

    // Handle high-DPI scaling
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = rect?.width || 600;
      const height = rect?.height || 360;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D rotation projection helper
    const project3D = (pt: Point3D, cx: number, cy: number, scale: number) => {
      // Rotation X
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      let y1 = pt.y * cosX - pt.z * sinX;
      let z1 = pt.y * sinX + pt.z * cosX;

      // Rotation Y
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      let x2 = pt.x * cosY + z1 * sinY;
      let z2 = -pt.x * sinY + z1 * cosY;

      // Rotation Z (Subtle pitch)
      const cosZ = Math.cos(rotationRef.current.z);
      const sinZ = Math.sin(rotationRef.current.z);
      let x3 = x2 * cosZ - y1 * sinZ;
      let y3 = x2 * sinZ + y1 * cosZ;

      // Simple perspective projection
      const dist = 480;
      const fov = dist / (dist + z2);
      return {
        x: cx + x3 * fov * scale,
        y: cy + y3 * fov * scale,
        depthZ: z2,
        scaleFactor: fov
      };
    };

    const render = () => {
      localTime += 1;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Deep space grid and nebula style background clearing
      ctx.fillStyle = '#020308';
      ctx.fillRect(0, 0, width, height);

      // Render cosmic background gridlines radiating in perspective
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Slowly damp the velocity for 3D rotation inertia
      if (!isDraggingRef.current) {
        rotationRef.current.y += velocityRef.current.y;
        rotationRef.current.x += velocityRef.current.x;
        velocityRef.current.y *= 0.96;
        velocityRef.current.x *= 0.96;
      }

      const cx = width / 2;
      const cy = height / 2;
      const scaleMultiplier = Math.min(width, height) / 500 * 1.05;

      // ---------------------------------------------------------
      // PROJECT ALL NODES INTO 2D SCREEN SPACE
      // ---------------------------------------------------------
      const projectedNodesMap = new Map<string, { x: number; y: number; depthZ: number; scaleFactor: number; node: TreeNode3D }>();

      NODES_3D.forEach(node => {
        const proj = project3D(node.originalPos, cx, cy, scaleMultiplier);
        projectedNodesMap.set(node.id, {
          x: proj.x,
          y: proj.y,
          depthZ: proj.depthZ,
          scaleFactor: proj.scaleFactor,
          node
        });

        // Save on node object for easy click detection
        (node as any).screenX = proj.x;
        (node as any).screenY = proj.y;
        (node as any).depthZ = proj.depthZ;
      });

      // ---------------------------------------------------------
      // PHASE 1: DRAW CONNECTING HYPOTHESIS LINES WITH FLUID DEPTH
      // ---------------------------------------------------------
      LINKS_3D.forEach(link => {
        const sourceProj = projectedNodesMap.get(link.source);
        const targetProj = projectedNodesMap.get(link.target);

        if (sourceProj && targetProj) {
          ctx.beginPath();
          ctx.moveTo(sourceProj.x, sourceProj.y);

          // Draw a curved bezier line for that fluid sci-fi look
          const midX = (sourceProj.x + targetProj.x) / 2;
          const midY = (sourceProj.y + targetProj.y) / 2 - 25 * scaleMultiplier * Math.sin(localTime * 0.01 + sourceProj.x * 0.005);
          
          ctx.quadraticCurveTo(midX, midY, targetProj.x, targetProj.y);

          // Deep gradient color from left blue/cyan to right gold/orange
          const isTargetDiscovery = link.target === 'SELECT-01';
          const linkGrad = ctx.createLinearGradient(sourceProj.x, sourceProj.y, targetProj.x, targetProj.y);
          if (isTargetDiscovery) {
            linkGrad.addColorStop(0, 'rgba(249, 115, 22, 0.1)');
            linkGrad.addColorStop(1, 'rgba(234, 179, 8, 0.45)');
          } else if (link.source === 'OBS-01') {
            linkGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
            linkGrad.addColorStop(1, 'rgba(168, 85, 247, 0.15)');
          } else {
            linkGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
            linkGrad.addColorStop(1, 'rgba(59, 130, 246, 0.35)');
          }

          ctx.strokeStyle = linkGrad;
          ctx.lineWidth = selectedHyp.id === link.source || selectedHyp.id === link.target ? 2.5 : 1.2;
          ctx.stroke();
        }
      });

      // ---------------------------------------------------------
      // PHASE 2: UPDATE AND DRAW FLYING PHOTON PARTICLES
      // ---------------------------------------------------------
      particlesRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1.0) {
          p.progress = 0;
          p.linkIndex = Math.floor(Math.random() * LINKS_3D.length);
        }

        const link = LINKS_3D[p.linkIndex];
        const sProj = projectedNodesMap.get(link.source);
        const tProj = projectedNodesMap.get(link.target);

        if (sProj && tProj) {
          const t = p.progress;
          // Interpolate with bezier curve matches
          const midX = (sProj.x + tProj.x) / 2;
          const midY = (sProj.y + tProj.y) / 2 - 25 * scaleMultiplier * Math.sin(localTime * 0.01 + sProj.x * 0.005);

          const px = (1 - t) * (1 - t) * sProj.x + 2 * (1 - t) * t * midX + t * t * tProj.x;
          const py = (1 - t) * (1 - t) * sProj.y + 2 * (1 - t) * t * midY + t * t * tProj.y;

          // Depth size modulation
          const depthScale = (100 - (sProj.depthZ + tProj.depthZ)/2) / 100;
          const r = p.size * Math.max(0.3, Math.min(2.0, depthScale));

          ctx.fillStyle = link.target === 'SELECT-01' ? '#f59e0b' : '#00f0ff';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // ---------------------------------------------------------
      // PHASE 3: DRAW EXPANDING EXPLOSION SHOCKWAVES
      // ---------------------------------------------------------
      clickRipplesRef.current.forEach(rip => {
        rip.r += 3.2;
        rip.opacity = Math.max(0, 1 - rip.r / rip.maxR);
        ctx.strokeStyle = rip.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = rip.color;
        ctx.shadowBlur = 10 * rip.opacity;
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 0;
      });
      clickRipplesRef.current = clickRipplesRef.current.filter(rip => rip.opacity > 0);

      // ---------------------------------------------------------
      // PHASE 4: RENDER 3D NODES SORTED BY DEPTH (BACK TO FRONT)
      // ---------------------------------------------------------
      const sortedProjections = Array.from(projectedNodesMap.values()).sort((a, b) => b.depthZ - a.depthZ);

      sortedProjections.forEach(({ x, y, depthZ, scaleFactor, node }) => {
        const isSelected = selectedHyp.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

        // Size modulated by perspective and interactive highlights
        const baseSize = node.type === 'selection' ? 18 : node.type === 'observation' ? 12 : 9;
        const radius = baseSize * scaleFactor * (isSelected ? 1.35 : isHovered ? 1.2 : 1.0) * scaleMultiplier;

        // Visual outer aura glow for selected or converged discovery nodes
        if (isSelected || node.type === 'selection' || isHovered) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isSelected ? 22 : 14;
        }

        // Draw multiple nested glowing circular frames
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Outer neon orbital ring for selected elements
        if (isSelected) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle locking ticks
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1;
          for (let i = 0; i < 4; i++) {
            const angle = (localTime * 0.02) + (i * Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * (radius + 9), y + Math.sin(angle) * (radius + 9));
            ctx.lineTo(x + Math.cos(angle) * (radius + 14), y + Math.sin(angle) * (radius + 14));
            ctx.stroke();
          }
        } else if (isHovered) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Mini core inside
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // High-tech node labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.hash, x, y - radius - 8);
      });

      // Render subtle holographic bounding sphere overlay around the whole cluster
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 260 * scaleMultiplier, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [selectedHyp, hoveredNode]);

  // Click on canvas to select node, spawn ripple, trigger sound
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Detect if clicked inside any node circle
    let clickedNode: TreeNode3D | null = null;
    let minDistance = 22; // threshold distance to trigger click

    NODES_3D.forEach(node => {
      const sX = (node as any).screenX;
      const sY = (node as any).screenY;

      if (sX !== undefined && sY !== undefined) {
        const dist = Math.sqrt((mouseX - sX) ** 2 + (mouseY - sY) ** 2);
        if (dist < minDistance) {
          minDistance = dist;
          clickedNode = node;
        }
      }
    });

    if (clickedNode) {
      const node = clickedNode as TreeNode3D;
      setSelectedHyp(node);
      nexusSynth.playSelectSweep();

      // Spawn a ripple shockwave
      clickRipplesRef.current.push({
        x: mouseX,
        y: mouseY,
        r: 1,
        maxR: 90,
        opacity: 1.0,
        color: node.color
      });

      // Typewriter effect trigger for scientific reasoning terminal logs
      typewriteReasoning(node);
    } else {
      // Background click -> general drag trigger
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      // Rotate cluster in 3D
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;

      rotationRef.current.y += deltaX * 0.007;
      rotationRef.current.x += deltaY * 0.007;

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: deltaY * 0.0012, y: deltaX * 0.0012 };
    } else {
      // Find hovered node
      let foundHover: TreeNode3D | null = null;
      let minDistance = 18;

      NODES_3D.forEach(node => {
        const sX = (node as any).screenX;
        const sY = (node as any).screenY;

        if (sX !== undefined && sY !== undefined) {
          const dist = Math.sqrt((mouseX - sX) ** 2 + (mouseY - sY) ** 2);
          if (dist < minDistance) {
            minDistance = dist;
            foundHover = node;
          }
        }
      });

      if (foundHover !== hoveredNode) {
        setHoveredNode(foundHover);
        if (foundHover) {
          setHoveredPos({ x: mouseX, y: mouseY });
          // Play a dynamic synth note depending on how far left/right (X coordinate)
          const freq = 200 + ((foundHover as TreeNode3D).originalPos.x + 220) * 1.5;
          nexusSynth.playNodeHover(freq);
        }
      } else if (foundHover) {
        setHoveredPos({ x: mouseX, y: mouseY });
      }
    }
  };

  const handleCanvasMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Generate real-time scientific reasoning typewriter text inside a custom telemetry drawer
  const typewriteReasoning = (node: TreeNode3D) => {
    if (!node) return;
    
    // Clear any existing typing interval to avoid concurrent append race conditions/leaks
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setIsTyping(true);
    setTerminalLogs([]);
    setShowTerminal(true);

    const logs = [
      `[INIT] Querying Nexus AI Scientific Reasoning engine for Hypothesis ${node.hash || 'N/A'}...`,
      `[TRANS] Transforming topological field geometry metrics...`,
      `[SCORE] Calculated Localized Confidence Index: ${node.confidence ?? 0}%`,
      `[MHD] Running magnetohydrodynamic Navier-Stokes simulations...`,
      `[INTEG] Simulating physics preservation score: ${(node.physicsScore ?? 0).toFixed(3)}`,
      `[DECOY] Synthesizing active honeypot mutation signals: ${(node.simplicityScore ?? 0) > 0.85 ? 'STABLE' : 'WARN_TURBULENCE'}`,
      `[CONVERGE] Target state reached in ${node.leadTime || 'Instant'}.`,
      `[EXPLANATION] "${node.description || ''} - Verified under strict boundary metrics."`
    ];

    let currentLogIndex = 0;
    typingIntervalRef.current = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
      }
    }, 180);
  };

  // Initial typewriter trigger on mount and interval cleanup on unmount
  useEffect(() => {
    const initialNode = NODES_3D.find(n => n.id === 'HYP-01');
    if (initialNode) {
      typewriteReasoning(initialNode);
    }
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#020308] rounded-3xl border border-white/5 shadow-2xl flex flex-col p-6 overflow-hidden relative" id="nexus-discovery-container">
      
      {/* Interactive Floating Dust Stars in HTML */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-data rounded-full animate-ping duration-1000" />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-amber-neon rounded-full animate-ping duration-1500" />
      </div>

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-neon animate-pulse shadow-[0_0_10px_#ffb300]" />
            <h2 className="text-xl font-black tracking-wider uppercase text-white">NEXUS DISCOVERY</h2>
          </div>
          <p className="text-[9px] text-[#8a91a5]/50 uppercase tracking-[0.25em] font-mono mt-1">
            AI SCIENTIFIC REASONING • HYPERACTIVE HYPOTHESIS CONVERGENCE
          </p>
        </div>

        {/* Audio / Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={cn(
              "p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 text-[10px] uppercase font-bold",
              soundOn 
                ? "bg-amber-neon/10 border-amber-neon/30 text-amber-neon shadow-[0_0_15px_rgba(255,176,0,0.15)]" 
                : "bg-white/5 border-white/10 text-white/40"
            )}
            title="Toggle Synthesizer Feedback"
          >
            {soundOn ? <Volume2 size={12} className="animate-bounce" /> : <VolumeX size={12} />}
            SYNTH {soundOn ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => {
              nexusSynth.playDiscovery();
              // Spawn multiple random ripples
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  if (!canvasRef.current) return;
                  const rect = canvasRef.current.getBoundingClientRect();
                  clickRipplesRef.current.push({
                    x: Math.random() * rect.width,
                    y: Math.random() * rect.height,
                    r: 1,
                    maxR: 150 + Math.random() * 100,
                    opacity: 1.0,
                    color: Math.random() > 0.5 ? '#00f0ff' : '#ffb300'
                  });
                }, i * 150);
              }
            }}
            className="p-2.5 rounded-xl border border-cyan-data/30 bg-cyan-data/10 text-cyan-data hover:bg-cyan-data hover:text-black transition-all duration-300 text-[10px] uppercase font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
            title="Trigger Convergence Burst"
          >
            <Sparkles size={11} className="animate-spin" /> Trigger Burst
          </button>
        </div>
      </div>

      {/* MULTI-METRIC TOP RUNWAY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-white/5 bg-white/[0.01] px-4 -mx-6 shrink-0 font-mono text-[10px] uppercase tracking-wider">
        <div className="flex flex-col gap-1 border-r border-white/5">
          <span className="text-[8px] text-[#8a91a5]/40 font-bold">Hypotheses Generated</span>
          <span className="text-base font-black text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            {hypGenerated.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1 border-r border-white/5">
          <span className="text-[8px] text-[#8a91a5]/40 font-bold">Hypotheses Evaluated</span>
          <span className="text-base font-black text-[#a855f7]">
            {hypEvaluated.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1 border-r border-white/5">
          <span className="text-[8px] text-[#8a91a5]/40 font-bold">Hypotheses Survived</span>
          <span className="text-base font-black text-emerald-400 font-bold text-shadow-emerald">
            {hypSurvived}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] text-[#8a91a5]/40 font-bold">Discovery Rate</span>
          <span className="text-base font-black text-amber-neon">
            {discoveryRate.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* CORE INTERACTIVE WORKSPACE */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 py-4 relative">
        
        {/* LEFT COMPARTMENT: The Surreal 3D Hypothesis Tree */}
        <div className="lg:col-span-8 bg-black/60 rounded-2xl border border-white/5 relative flex flex-col overflow-hidden h-full">
          
          {/* Header Tag */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#060813]/90 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-mono">
            <GitBranch size={10} className="text-[#a855f7]" />
            <span className="text-white font-bold">HYPOTHESIS EVOLUTION TREE</span>
            <span className="text-[#8a91a5]/50">|</span>
            <span className="text-cyan-data font-bold">3D SPATIAL MAP</span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 text-[8px] font-mono text-[#8a91a5]/30">
            [ LEFT-CLICK + DRAG TO ROTATE HYPOTHESIS MANIFOLD • SCROLL OR CLICK NODES ]
          </div>

          {/* Interactive 3D Canvas */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUpOrLeave}
              onMouseLeave={handleCanvasMouseUpOrLeave}
              className="absolute inset-0 w-full h-full"
            />

            {/* Custom 3D Projected Tooltip */}
            {hoveredNode && (
              <div 
                className="absolute z-40 bg-[#060814]/95 border border-white/15 px-3 py-2.5 rounded-xl pointer-events-none shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-[180px] text-left"
                style={{ 
                  left: `${hoveredPos.x + 15}px`, 
                  top: `${hoveredPos.y - 15}px` 
                }}
              >
                <div className="text-[10px] font-black text-white flex items-center justify-between mb-1">
                  <span>{hoveredNode.name}</span>
                  <span className="text-[7.5px] font-mono px-1 bg-white/10 rounded">{hoveredNode.hash}</span>
                </div>
                <p className="text-[8px] text-[#8a91a5]/70 leading-relaxed mb-1.5">{hoveredNode.description}</p>
                <div className="grid grid-cols-2 gap-1 text-[7px] font-mono uppercase">
                  <div>
                    <span className="text-[#8a91a5]/40 block">Confidence</span>
                    <span className="text-cyan-data font-bold">{hoveredNode.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-[#8a91a5]/40 block">Physics</span>
                    <span className="text-amber-neon font-bold">{hoveredNode.physicsScore}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPARTMENT: Hypothesis Intel & Reasoning Dossier */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
          
          {/* Active Hypothesis Scoreboard Card */}
          <div className="bg-[#05060d] rounded-2xl border border-white/5 p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-[7.5px] font-mono font-black uppercase tracking-[0.2em] text-amber-neon bg-amber-neon/10 px-2 py-0.5 rounded">
                Selected Hypothesis
              </span>
              <span className="text-[9px] font-mono font-bold text-white/50">
                ID: {selectedHyp.id}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white tracking-wide uppercase">
                {selectedHyp.name}
              </h3>
              <p className="text-[8.5px] text-[#8a91a5]/60 mt-1 uppercase font-mono tracking-wider">
                Hash: {selectedHyp.hash} • Lead: {selectedHyp.leadTime}
              </p>
            </div>

            <div className="h-[1px] bg-white/5 my-1" />

            <div className="flex flex-col gap-2 font-mono text-[9px]">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#8a91a5]/50 uppercase font-bold">AI Confidence Match</span>
                  <span className="text-cyan-data font-bold">{selectedHyp.confidence}%</span>
                </div>
                {/* Visual glow neon progress bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: `${selectedHyp.confidence}%` }}
                    transition={{ duration: 0.6 }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-data rounded-full shadow-[0_0_8px_#00f0ff]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <div className="bg-white/[0.01] p-2 rounded-xl border border-white/5">
                  <span className="text-[#8a91a5]/40 text-[7.5px] uppercase block">Physics Score</span>
                  <span className="text-emerald-400 text-xs font-black mt-0.5 block">{selectedHyp.physicsScore}</span>
                </div>
                <div className="bg-white/[0.01] p-2 rounded-xl border border-white/5">
                  <span className="text-[#8a91a5]/40 text-[7.5px] uppercase block">Simplicity Index</span>
                  <span className="text-purple-400 text-xs font-black mt-0.5 block">{selectedHyp.simplicityScore}</span>
                </div>
              </div>
            </div>

            <div className="text-[9.5px] text-[#8a91a5]/80 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono">
              <span className="text-[7.5px] font-bold text-amber-neon block mb-1">PHYSICAL INTERPRETATION</span>
              {selectedHyp.description}
            </div>

            <button
              onClick={() => typewriteReasoning(selectedHyp)}
              className="w-full py-2 bg-gradient-to-r from-[#0d0f1c] to-[#12162e] hover:from-[#13162b] hover:to-[#1a2046] border border-white/10 rounded-xl text-[9px] uppercase font-black tracking-wider text-white transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg active:scale-98"
            >
              <Cpu size={10} className="text-purple-400" />
              Re-evaluate Hypothesis Telemetry
            </button>
          </div>

          {/* DYNAMIC TELEMETRY REASONING TERMINAL (Typewriter console) */}
          <div className="flex-1 bg-black/75 rounded-2xl border border-white/5 p-4 flex flex-col font-mono text-[9px] relative min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
              <span className="text-[8px] font-bold text-purple-400 flex items-center gap-1">
                <Brain size={10} className="animate-pulse" />
                AI SCIENTIFIC REASONING ENGINE
              </span>
              <span className="text-[7px] text-[#8a91a5]/30">SYS_CONSOLE_LOGS</span>
            </div>

            {/* Scrollable logs */}
            <div className="flex-1 overflow-y-auto space-y-1.5 text-left pr-1 scrollbar-thin">
              {terminalLogs.filter(Boolean).map((log, idx) => (
                <div key={idx} className={cn(
                  "leading-relaxed",
                  log?.includes('[INIT]') && "text-amber-neon/70",
                  log?.includes('[SCORE]') && "text-cyan-data",
                  log?.includes('[EXPLANATION]') && "text-white bg-white/5 p-1.5 rounded border border-white/5 mt-1",
                  !log?.includes('[INIT]') && !log?.includes('[SCORE]') && !log?.includes('[EXPLANATION]') && "text-[#8a91a5]/80"
                )}>
                  {log}
                </div>
              ))}
              {isTyping && (
                <div className="text-[#8a91a5] animate-pulse flex items-center gap-1 text-[7px] italic mt-1">
                  <span className="w-1.5 h-1.5 bg-[#8a91a5] rounded-full animate-bounce" />
                  Nexus model reasoning in progress...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PIPELINE STATUS BAR: DISCOVERY PIPELINE */}
      <div className="mt-auto pt-4 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Database size={11} className="text-cyan-data" />
          <span className="text-[8px] font-black text-white uppercase tracking-wider font-mono">
            DISCOVERY PROCESSING PIPELINE
          </span>
          <span className="w-full h-[1px] bg-white/5 flex-1" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono text-[8px] uppercase tracking-wider relative">
          
          {[
            { step: '01', title: 'Observations', desc: 'Data Ingest', status: 'ACTIVE', color: 'text-cyan-400' },
            { step: '02', title: 'Feature Space', desc: 'Transformation', status: 'ACTIVE', color: 'text-purple-400' },
            { step: '03', title: 'Hypothesis Gen', desc: 'Scientific Search', status: 'ACTIVE', color: 'text-blue-400' },
            { step: '04', title: 'Hypothesis Eval', desc: 'Physical Validation', status: 'ACTIVE', color: 'text-orange-400' },
            { step: '05', title: 'Best Hypothesis', desc: 'Selected', status: 'STABLE', color: 'text-emerald-400' },
            { step: '06', title: 'Forecast', desc: 'Generated', status: 'LOCKED', color: 'text-amber-500' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center relative group hover:border-white/10 transition-all duration-300">
              
              {/* Connector line overlay */}
              {idx < 5 && (
                <div className="hidden md:block absolute top-1/2 -right-1.5 w-3 h-[1px] bg-white/10 z-10" />
              )}

              <span className={cn("text-[9px] font-black mb-0.5", item.color)}>
                {item.step}
              </span>
              <span className="text-white font-bold block leading-tight">
                {item.title}
              </span>
              <span className="text-[#8a91a5]/40 text-[7px] mt-0.5 block">
                {item.desc}
              </span>

              {/* Glowing active indicator dot */}
              <div className="mt-1 flex items-center gap-1 text-[6.5px] tracking-widest font-black text-emerald-400">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
