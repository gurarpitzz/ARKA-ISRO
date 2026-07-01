import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Radio, Shield, Battery, Thermometer, Gauge, 
  Activity, Cpu, Wifi, RotateCw, AlertTriangle, Play, Pause, 
  Zap, Info, RefreshCw, ChevronDown, ChevronUp, Terminal, Globe, Sun, RefreshCw as SpinIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

// Interfaces for our custom interactive subsystems
interface PayloadStatus {
  id: string;
  name: string;
  fullName: string;
  desc: string;
  health: number;
  status: 'ACTIVE' | 'STANDBY' | 'CALIBRATING' | 'OFFLINE';
  scientificOutput: number; // in Gbps
}

interface GroundStation {
  name: string;
  location: string;
  latencyMs: number;
  snrDb: number;
  frequencyGhz: number;
}

export const ArkaGenomeActivity: React.FC = () => {
  // --- Simulation Configuration and State ---
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'PAYLOADS' | 'TERMINAL' | 'DSN'>('TELEMETRY');
  
  // Drag and position states for Aditya-L1
  // 0% is Sun, 100% is Earth, L1 is mathematically and visually positioned at 75%
  const [spacecraftPos, setSpacecraftPos] = useState<number>(75);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Time tracking for UTC clock
  const [utcTime, setUtcTime] = useState<string>('18:19:07');

  // Thruster correcting state
  const [thrustersFiring, setThrustersFiring] = useState<boolean>(false);
  const [thrusterCooling, setThrusterCooling] = useState<boolean>(false);

  // Solar shield active state
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [shieldProgress, setShieldProgress] = useState<number>(0);

  // Expanding telemetry items for detailed diagnostic cards
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Selected Ground Station Lock
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(0);

  // Solar array tilt angle
  const [solarPanelAngle, setSolarPanelAngle] = useState<number>(45);

  // Solar flare / CME event system
  const [cmeWarning, setCmeWarning] = useState<boolean>(false);
  const [cmeCountdown, setCmeCountdown] = useState<number>(5);
  const [cmeActive, setCmeActive] = useState<boolean>(false);
  const [isStorming, setIsStorming] = useState<boolean>(false);
  const [stormSucceeded, setStormSucceeded] = useState<boolean | null>(null);

  // Raw hexadecimal data streaming
  const [hexLogs, setHexLogs] = useState<string[]>([]);

  // Interactive scientific payloads
  const [payloads, setPayloads] = useState<PayloadStatus[]>([
    { id: 'velc', name: 'VELC', fullName: 'Visible Emission Line Coronagraph', desc: 'Studies diagnostic parameters of solar corona and coronal mass ejections.', health: 98, status: 'ACTIVE', scientificOutput: 1.2 },
    { id: 'suit', name: 'SUIT', fullName: 'Solar Ultraviolet Imaging Telescope', desc: 'Images the spatially resolved Solar Photosphere and Chromosphere in near UV.', health: 100, status: 'ACTIVE', scientificOutput: 0.8 },
    { id: 'aspex', name: 'ASPEX', fullName: 'Aditya Solar wind Particle Experiment', desc: 'Studies the solar wind particles, spectral characteristics, and protons.', health: 97, status: 'ACTIVE', scientificOutput: 1.5 },
    { id: 'papa', name: 'PAPA', fullName: 'Plasma Analyser Package for Aditya', desc: 'Measures composition of solar wind and energy distribution of particles.', health: 98, status: 'ACTIVE', scientificOutput: 1.1 },
    { id: 'solexs', name: 'SoLEXS', fullName: 'Solar Low Energy X-ray Spectrometer', desc: 'Monitors X-ray flares from the Sun to study heating of the corona.', health: 99, status: 'ACTIVE', scientificOutput: 0.4 },
    { id: 'hel1os', name: 'HEL1OS', fullName: 'High Energy L1 Orbiting X-ray Spectrometer', desc: 'Observes high-energy X-ray flares during impulsive phases.', health: 96, status: 'STANDBY', scientificOutput: 0.0 },
    { id: 'mag', name: 'MAG', fullName: 'Magnetometer', desc: 'Measures the magnitude and direction of the interplanetary magnetic field.', health: 100, status: 'ACTIVE', scientificOutput: 0.5 }
  ]);

  // Terminal telemetry logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ADITYA-L1: Initialization script loaded securely (core_v4.8).',
    'DSN_LOCK: Ground station link established with IDSN Byalalu (32m antenna).',
    'ORBIT_DYNAMICS: Halocenter Lissajous orbit parameters stabilized around Lagrange L1.',
    'VELC_INSTRUMENT: Completed high-aperture lens calibration.',
    'ASPEX_INSTRUMENT: Active proton flux monitoring stream initiated.'
  ]);

  // Live fluctuating noise states
  const [telemetryNoise, setTelemetryNoise] = useState({
    solarWind: 427,
    xrayFlux: 'M5.8',
    protonFlux: 2.1,
    kpIndex: 4.3,
    bzField: -3.6,
    telemetryHealth: 100,
    downlinkSnr: 48.2,
    powerGeneration: 842,
    thermalOffset: 0
  });

  const GROUND_STATIONS: GroundStation[] = [
    { name: 'IDSN Byalalu', location: 'Bangalore, India', latencyMs: 5012, snrDb: 48.5, frequencyGhz: 8.41 },
    { name: 'ESA Kourou', location: 'French Guiana', latencyMs: 4980, snrDb: 46.2, frequencyGhz: 8.42 },
    { name: 'NASA Goldstone', location: 'California, USA', latencyMs: 5122, snrDb: 45.1, frequencyGhz: 8.40 },
    { name: 'ESA New Norcia', location: 'Australia', latencyMs: 5035, snrDb: 47.8, frequencyGhz: 8.41 }
  ];

  // --- Real-time Fluctuation loop ---
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      }));
    }, 1000);

    const telemetryInterval = setInterval(() => {
      if (!isPlaying) return;

      // Fluctuations
      setTelemetryNoise(prev => {
        // Under a solar storm (CME), values go absolutely wild!
        if (isStorming) {
          return {
            solarWind: Math.round(920 + Math.random() * 80),
            xrayFlux: 'X9.2',
            protonFlux: +(42.5 + Math.random() * 8).toFixed(1),
            kpIndex: +(8.4 + Math.random() * 0.4).toFixed(1),
            bzField: +(-14.8 + Math.random() * 3).toFixed(1),
            telemetryHealth: +(94.5 + Math.random() * 2).toFixed(1),
            downlinkSnr: +(28.2 + Math.random() * 4).toFixed(1),
            powerGeneration: Math.round(1180 + Math.random() * 60),
            thermalOffset: Math.min(25, prev.thermalOffset + 1.5)
          };
        }

        const isAtL1 = Math.abs(spacecraftPos - 75) < 1.5;
        const driftCoeff = isAtL1 ? 1 : Math.max(0.2, (100 - spacecraftPos) / 25);

        return {
          solarWind: Math.round(prev.solarWind + (Math.random() - 0.5) * 6),
          xrayFlux: Math.random() > 0.95 ? 'M6.1' : Math.random() > 0.98 ? 'X1.1' : 'M5.8',
          protonFlux: Math.max(0.1, +(prev.protonFlux + (Math.random() - 0.5) * 0.15).toFixed(1)),
          kpIndex: Math.max(0.5, +(prev.kpIndex + (Math.random() - 0.5) * 0.1).toFixed(1)),
          bzField: +(prev.bzField + (Math.random() - 0.5) * 0.3).toFixed(1),
          telemetryHealth: Math.min(100, +(99.8 + Math.random() * 0.2).toFixed(1)),
          downlinkSnr: Math.max(10, +(48.2 + (Math.random() - 0.5) * 0.8).toFixed(1)),
          powerGeneration: Math.round(840 + Math.sin(solarPanelAngle * Math.PI / 180) * 120 + (Math.random() - 0.5) * 10),
          thermalOffset: Math.max(-10, Math.min(50, prev.thermalOffset + (Math.random() - 0.5) * 0.2))
        };
      });

      // Slowly drift spacecraft slightly over time if autoloop is active
      setSpacecraftPos(prev => {
        if (isDragging) return prev;
        // Natural Lissajous orbital drift simulation
        const drift = Math.sin(Date.now() / 12000) * 0.08;
        return Math.max(1, Math.min(99, prev + drift));
      });

      // Hex code log feeding
      setHexLogs(prev => {
        const hexChars = '0123456789ABCDEF';
        const newLog = Array.from({ length: 8 }, () => {
          const byte = hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
          return `0x${byte}`;
        }).join(' ');
        const sliced = prev.length >= 6 ? prev.slice(1) : prev;
        return [...sliced, `[TELEMETRY] ${newLog}`];
      });

    }, 800);

    return () => {
      clearInterval(clockInterval);
      clearInterval(telemetryInterval);
    };
  }, [isPlaying, isDragging, isStorming, spacecraftPos, solarPanelAngle]);

  // Terminal log additions
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const logs = [
        'SUIT: Capture sequence success - solar ultraviolet filter wheel rotating.',
        'VELC: Active occulting disk tracking corona emissions at 530.3nm.',
        'DSN: Uplink ping acknowledged. SNR is solid.',
        'MAG: Interplanetary Magnetic Field vectors streaming on high cadence.',
        'ASPEX: SWIS ion spectrometer detects high-density solar wind plasma wave.',
        'THERMAL_SHIELD: Heat-dissipating louvers automatically adjusted by 2.4°.'
      ];

      setTerminalLogs(prev => {
        const selectedLog = logs[Math.floor(Math.random() * logs.length)];
        const timeStamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = `[${timeStamp}] ${selectedLog}`;
        const sliced = prev.length >= 8 ? prev.slice(1) : prev;
        return [...sliced, entry];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // --- Calculations based on Drag Position ---
  // Aditya-L1 is perfectly positioned at Lagrange point L1 (75%)
  const distanceFromL1 = Math.abs(spacecraftPos - 75);
  const isOptimalL1 = distanceFromL1 < 1.5;

  // Real Distance from Earth (L1 is exactly 1.5 million km, Earth is at 100%)
  const calculatedDistanceKm = Math.max(0, Math.round((100 - spacecraftPos) * 60000));
  
  // Spacecraft Temperature calculation
  // Closer to Sun (0%) means higher heat, closer to Earth (100%) is cooler
  const calculatedTemp = (() => {
    const base = 24.5 + telemetryNoise.thermalOffset;
    if (spacecraftPos < 75) {
      // Radiant sun heat increases exponentially
      const sunCloseness = (75 - spacecraftPos) / 75;
      return +(base + sunCloseness * sunCloseness * 120).toFixed(1);
    } else {
      // Earth cooling / partial shadow
      const earthCloseness = (spacecraftPos - 75) / 25;
      return +(base - earthCloseness * 12).toFixed(1);
    }
  })();

  const isThermalCritical = calculatedTemp > 52;

  // Spacecraft Power generation
  const calculatedPower = (() => {
    const angleEfficiency = Math.sin(solarPanelAngle * Math.PI / 180);
    if (spacecraftPos > 94) {
      // Earth penumbra / shadow occlusion
      const shadowFactor = (100 - spacecraftPos) / 6; // drops from 1.0 to 0.0
      return Math.round(800 * shadowFactor * angleEfficiency);
    }
    const distanceFactor = 1 + ((75 - spacecraftPos) / 75) * 0.4; // up to 1.4x closer to sun
    return Math.round(842 * distanceFactor * angleEfficiency);
  })();

  // Spacecraft Payload health and science output
  const calculatedPayloadHealth = (() => {
    let baseHealth = 98.4;
    if (isThermalCritical) {
      const damageFactor = (calculatedTemp - 52) * 0.8;
      baseHealth = Math.max(45, baseHealth - damageFactor);
    }
    if (spacecraftPos > 96) {
      // Near Earth - geomagnetic noise disrupts instruments
      baseHealth = Math.max(70, baseHealth - 12);
    }
    if (isStorming && !shieldActive) {
      baseHealth = Math.max(30, baseHealth - 25);
    }
    return +baseHealth.toFixed(1);
  })();

  // Scientific data rate stream rate (Gbps)
  const totalScienceOutput = (() => {
    if (calculatedPayloadHealth < 60) return 0.2;
    const baseOutput = payloads.reduce((sum, p) => sum + (p.status === 'ACTIVE' ? p.scientificOutput : 0), 0);
    const optimizationFactor = isOptimalL1 ? 1.2 : (1 - (distanceFromL1 / 75));
    return +(baseOutput * Math.max(0.1, optimizationFactor)).toFixed(2);
  })();

  // --- Dynamic Handlers ---

  // Custom Mouse/Touch drag mechanics for the orbital track
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePositionFromEvent(e);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    updatePositionFromEvent(e);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Attach global mouse listeners to handle dragging smoothly outside container bounds
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const updatePositionFromEvent = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
      } else {
        return;
      }
    } else {
      clientX = e.clientX;
    }

    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSpacecraftPos(+percentage.toFixed(2));
  };

  // Thruster fire - adjusts position back to exactly 75% (Lagrange L1)
  const handleFireThrusters = () => {
    if (thrusterCooling || thrustersFiring) return;
    setThrustersFiring(true);
    
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] MANEUVER: RCS Thrusters engaged. Correcting drift vector...`,
      ...prev.slice(0, 7)
    ]);

    // Animate returning to 75%
    let currentPos = spacecraftPos;
    const step = (75 - currentPos) / 15;
    let count = 0;
    const fireInterval = setInterval(() => {
      currentPos += step;
      setSpacecraftPos(+currentPos.toFixed(2));
      count++;
      if (count >= 15) {
        clearInterval(fireInterval);
        setSpacecraftPos(75);
        setThrustersFiring(false);
        setThrusterCooling(true);
        setTerminalLogs(prev => [
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] MANEUVER: Orbital position lock acquired at L1. Thrusters idle.`,
          ...prev.slice(0, 7)
        ]);
        setTimeout(() => setThrusterCooling(false), 3000); // 3s cool down
      }
    }, 60);
  };

  // Calibrate single payload
  const handleCalibratePayload = (id: string) => {
    setPayloads(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'CALIBRATING', health: 100 };
      }
      return p;
    }));

    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] CALIBRATION: Initiating micro-focus routine on instrument [${id.toUpperCase()}].`,
      ...prev.slice(0, 7)
    ]);

    setTimeout(() => {
      setPayloads(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, status: 'ACTIVE', health: 100 };
        }
        return p;
      }));
      setTerminalLogs(prev => [
        `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] CALIBRATION: Instrument [${id.toUpperCase()}] is fully calibrated and nominal.`,
        ...prev.slice(0, 7)
      ]);
    }, 2000);
  };

  // Toggle defensive solar shield
  const handleToggleShield = () => {
    if (shieldActive) {
      setShieldActive(false);
      setShieldProgress(0);
      setTerminalLogs(prev => [
        `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] PROTECTION: Deactivating magnetic solar shield. Payloads unshielded.`,
        ...prev.slice(0, 7)
      ]);
    } else {
      setShieldActive(true);
      setTerminalLogs(prev => [
        `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] PROTECTION: Deploying high-flux electromagnetic shield. Deflecting solar winds...`,
        ...prev.slice(0, 7)
      ]);

      // Animate shield deployment progress
      let p = 0;
      const progressInterval = setInterval(() => {
        p += 10;
        setShieldProgress(p);
        if (p >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);
    }
  };

  // Simulate Coronal Mass Ejection (CME) solar flare warning and impact!
  const triggerCmeSimulation = () => {
    if (cmeWarning || cmeActive || isStorming) return;
    setCmeWarning(true);
    setCmeCountdown(5);

    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ALERT: Sudden high-intensity coronal magnetic anomaly observed on Solar Disk.`,
      `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ALERT: Class X9.2 Solar Flare erupting! CME heading towards L1 coordinate.`,
      ...prev.slice(0, 6)
    ]);

    // Countdown logic
    const timer = setInterval(() => {
      setCmeCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCmeWarning(false);
          triggerCmeImpact();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerCmeImpact = () => {
    setCmeActive(true);
    setIsStorming(true);
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] IMPACT: Coronal Mass Ejection wave hitting Lagrange Coordinate L1!`,
      ...prev.slice(0, 7)
    ]);

    // Duration of storm is 8 seconds
    setTimeout(() => {
      setIsStorming(false);
      setCmeActive(false);
      
      // Determine if they deployed defensive shield in time to protect payloads
      if (shieldActive && shieldProgress >= 100) {
        setStormSucceeded(true);
        setTerminalLogs(prev => [
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] RESTORE: Solar storm passed. Magnetic defense shield deflected 99.8% ionizing radiation!`,
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] RESTORE: Core instruments kept completely safe. Excellent operations.`,
          ...prev.slice(0, 6)
        ]);
      } else {
        setStormSucceeded(false);
        // Damage instruments
        setPayloads(prev => prev.map(p => ({
          ...p,
          health: Math.max(35, Math.round(p.health - 25 - Math.random() * 20)),
          status: Math.random() > 0.5 ? 'STANDBY' : 'ACTIVE'
        })));
        setTerminalLogs(prev => [
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] DAMAGE: No active magnetic shielding was deployed. Core sensors heavily degraded!`,
          `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] DAMAGE: Payloads damaged by solar proton saturation. Manual calibration required.`,
          ...prev.slice(0, 6)
        ]);
      }

      // Reset storm outcome notification after 5 seconds
      setTimeout(() => {
        setStormSucceeded(null);
      }, 6000);

    }, 8000);
  };

  // Ground station lock latency update
  const currentGroundStation = GROUND_STATIONS[selectedStationIndex];

  return (
    <div className="w-full flex-1 min-h-[300px] rounded-3xl bg-[#08080a] border border-[#222227] overflow-hidden flex flex-col p-4 relative font-mono select-none shadow-[0_8px_32px_rgba(0,0,0,0.95)] transition-all duration-700">
      
      {/* Immersive space canvas grids and neon gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-neon/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(0,240,255,0.03),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Extreme Interactive Alert Flasher for Solar Flare Warning / Storm */}
      <AnimatePresence>
        {(cmeWarning || isStorming) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-0 z-40 pointer-events-none border-2 border-dashed flex flex-col items-center justify-center p-4 backdrop-blur-xs",
              isStorming ? "border-red-threat/80 animate-pulse bg-red-threat/[0.05]" : "border-amber-neon/50 bg-amber-neon/[0.02]"
            )}
          >
            {/* Pulsating emergency message */}
            <div className="bg-black/90 border border-red-threat rounded-2xl p-4 flex flex-col items-center gap-2 max-w-[280px] text-center pointer-events-auto shadow-[0_0_30px_rgba(255,31,31,0.2)]">
              <AlertTriangle className={cn("h-8 w-8 animate-bounce", isStorming ? "text-red-threat" : "text-amber-neon")} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {isStorming ? "CME STORM IN PROGRESS" : "SOLAR FLARE DETECTED"}
              </h4>
              <p className="text-[10px] text-[#A0A0A5]">
                {isStorming 
                  ? "Lagrange point L1 is being bombarded by extreme ionizing solar proton streams." 
                  : `Class X9.2 Coronal Mass Ejection impacting coordinate L1 in ${cmeCountdown} seconds!`
                }
              </p>
              {!shieldActive ? (
                <button 
                  onClick={handleToggleShield}
                  className="mt-2 text-[9px] font-black bg-red-threat hover:bg-red-threat/80 text-white px-3 py-1.5 rounded-lg border border-white/20 uppercase tracking-widest animate-pulse"
                >
                  DEPLOY MAGNETIC SHIELD NOW
                </button>
              ) : (
                <div className="mt-2 text-[9px] font-black text-[#33E1C9] bg-[#33E1C9]/10 border border-[#33E1C9]/30 px-3 py-1 rounded-lg uppercase tracking-wider">
                  SHIELD ACTIVE ({shieldProgress}%)
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Storm Result Notifications */}
        {stormSucceeded !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="absolute bottom-4 left-4 right-4 z-40 p-3 bg-black/95 border rounded-2xl shadow-xl flex items-center gap-3"
            style={{ borderColor: stormSucceeded ? '#33E1C9' : '#FF1F1F' }}
          >
            <div className={cn("p-1.5 rounded-full", stormSucceeded ? "bg-[#33E1C9]/10" : "bg-[#FF1F1F]/10")}>
              {stormSucceeded ? <Shield className="h-4 w-4 text-[#33E1C9]" /> : <AlertTriangle className="h-4 w-4 text-[#FF1F1F]" />}
            </div>
            <div className="flex-1 text-left">
              <h5 className="text-[10px] font-black uppercase text-white tracking-wider">
                {stormSucceeded ? "SOLAR STORM DEFLECTED!" : "SPACECRAFT DAMAGED"}
              </h5>
              <p className="text-[9px] text-[#8A8A90] leading-tight">
                {stormSucceeded 
                  ? "Dynamic magnetic deflector shielded the solar particle stream completely. Scientific telemetry remained intact." 
                  : "Extreme solar wind protons saturated and degraded 5 science instruments. Calibrate them immediately."
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Dashboard Header --- */}
      <div className="flex justify-between items-start mb-3.5 shrink-0 pb-2 border-b border-[#222227] z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-neon/10 border border-amber-neon/25 shadow-[0_0_15px_rgba(255,176,0,0.15)]">
            <Compass className="h-5 w-5 text-amber-neon animate-spin-slow" />
          </div>
          <div className="text-left">
            <span className="text-[8.5px] font-bold text-amber-neon uppercase tracking-[0.25em] flex items-center gap-1.5 text-glow-amber">
              ADITYA-L1 • MISSION CONTROL
            </span>
            <h2 className="text-[13px] font-extrabold text-white uppercase tracking-wider mt-0.5">
              REAL-TIME ORBITAL TELEMETRY
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2 bg-glass border border-white/5 px-2.5 py-1 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9.5px] font-black text-emerald-400 tracking-[0.1em] uppercase">
              LIVE
            </span>
            <span className="text-[9.5px] font-bold text-[#A0A0A5] border-l border-white/10 pl-2">
              UTC {utcTime}
            </span>
          </div>

          <div className="text-[7.5px] text-[#6A6A70] uppercase tracking-wider flex items-center gap-1 mt-0.5">
            <Wifi size={8} className="text-cyan-data animate-pulse" />
            DOWNLINK: {currentGroundStation.name}
          </div>
        </div>
      </div>

      {/* --- INTERACTIVE ORBIT & LAGRANGE L1 SIMULATOR PANEL --- */}
      <div className="w-full bg-[#0c0c10] border border-[#222229] rounded-2xl p-3 mb-2.5 relative z-10 overflow-hidden flex flex-col gap-2">
        {/* Stellar Background Space Scene with dust */}
        <div className="absolute inset-0 bg-radial-gradient(circle_at_left,_rgba(255,176,0,0.06),_transparent_35%) pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient(circle_at_right,_rgba(0,240,255,0.04),_transparent_35%) pointer-events-none" />

        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] uppercase tracking-wider text-amber-neon font-black bg-amber-neon/10 px-1.5 py-0.5 rounded">
              LISSANOUS ORBIT SIMULATOR
            </span>
            <span className="text-[8px] text-[#A0A0A5] italic">
              Drag Aditya-L1 satellite to modify telemetry
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setSpacecraftPos(75)}
              className="text-[8px] font-bold bg-white/[0.03] hover:bg-white/[0.08] text-[#F5F5F5] px-2 py-0.5 border border-white/[0.05] rounded-md transition-all uppercase"
            >
              SNAP TO L1
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-[8px] font-bold bg-white/[0.03] hover:bg-white/[0.08] text-[#F5F5F5] px-2 py-0.5 border border-white/[0.05] rounded-md transition-all flex items-center gap-1 uppercase"
            >
              {isPlaying ? <Pause size={7} /> : <Play size={7} />}
              {isPlaying ? 'PAUSE DRIFT' : 'RESUME DRIFT'}
            </button>
          </div>
        </div>

        {/* THE VISUAL SPACE MAP LANE */}
        <div className="relative w-full h-16 rounded-xl border border-white/[0.02] bg-[#050507] flex items-center px-6">
          
          {/* Connecting Trajectory Dotted Path */}
          <div className="absolute left-6 right-6 h-[1.5px] bg-gradient-to-r from-amber-neon via-[#33e1c9] to-[#00f0ff] opacity-20 pointer-events-none" />
          <div className="absolute left-6 right-6 h-[1.5px] border-b border-dashed border-white/20 pointer-events-none" />

          {/* Lagrange L1 marker zone */}
          <div className="absolute left-[75%] -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
            <div className="h-7 w-7 rounded-full border border-dashed border-amber-neon/40 flex items-center justify-center bg-amber-neon/[0.02] animate-pulse">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-neon shadow-[0_0_8px_rgba(255,176,0,0.8)]" />
            </div>
            <span className="absolute -top-4 font-black text-[8px] text-amber-neon tracking-widest text-glow-amber">L1</span>
            <span className="absolute -bottom-4 font-black text-[7px] text-[#8a8a90] uppercase tracking-wider">LAGRANGE POINT</span>
          </div>

          {/* Left Limit: SUN */}
          <div className="absolute left-0 -translate-x-1/4 flex flex-col items-center pointer-events-none z-10">
            <motion.div 
              animate={{ scale: isStorming ? [1, 1.05, 1] : [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: isStorming ? 1.5 : 4, ease: "easeInOut" }}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500",
                isStorming 
                  ? "bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 shadow-[0_0_25px_#FF1F1F]" 
                  : "bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(255,176,0,0.4)]"
              )}
            />
            <span className="absolute -bottom-3 font-bold text-[7px] text-orange-400 uppercase tracking-widest">SUN</span>
          </div>

          {/* Right Limit: EARTH */}
          <div className="absolute right-0 translate-x-1/4 flex flex-col items-center pointer-events-none z-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-500 shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_50%)]" />
            </div>
            <span className="absolute -bottom-3 font-bold text-[7px] text-cyan-400 uppercase tracking-widest">EARTH</span>
          </div>

          {/* Interactive Trajectory Drag Area */}
          <div 
            ref={trackRef}
            onMouseDown={handleStartDrag}
            onTouchStart={handleStartDrag}
            className="absolute left-8 right-8 top-0 bottom-0 cursor-pointer z-20"
          >
            {/* Draggable Aditya-L1 Spacecraft Icon */}
            <motion.div 
              style={{ left: `${spacecraftPos}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30"
              animate={{ y: isDragging ? -10 : [-2, 2, -2] }}
              transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
            >
              <div className={cn(
                "p-1.5 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center",
                isOptimalL1 
                  ? "bg-emerald-950/90 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                  : isThermalCritical
                    ? "bg-red-950/95 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse"
                    : "bg-[#161622] border-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
              )}>
                {/* Visual Satellite Wings */}
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-[6px] h-2 bg-cyan-400/40 border border-cyan-400/60 rounded-xs" />
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-[6px] h-2 bg-cyan-400/40 border border-cyan-400/60 rounded-xs" />
                
                {/* Thruster exhaust flare */}
                {thrustersFiring && (
                  <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-2.5 h-1.5 bg-orange-500 rounded-full blur-xs animate-ping" />
                )}

                {/* Satellite Core Body */}
                <Compass className={cn("h-4 w-4", isOptimalL1 ? "text-emerald-400" : isThermalCritical ? "text-red-400" : "text-cyan-400")} />
              </div>
              <span className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[6.5px] font-black tracking-widest text-[#F5F5FA] bg-black/80 px-1 py-0.5 rounded border border-white/10 uppercase">
                ADITYA-L1
              </span>
            </motion.div>
          </div>
        </div>

        {/* Orbit slider dynamic readout bar */}
        <div className="grid grid-cols-4 gap-3 bg-[#060608] p-2.5 rounded-xl border border-white/[0.02]">
          <div className="text-left">
            <span className="text-[6.5px] text-[#8C8C92] uppercase tracking-wider block">TRAJECTORY OFFSET</span>
            <span className={cn(
              "text-[9.5px] font-black",
              isOptimalL1 ? "text-emerald-400" : distanceFromL1 > 12 ? "text-red-threat" : "text-amber-neon"
            )}>
              {isOptimalL1 ? '0.00% NOMINAL' : `${distanceFromL1.toFixed(1)}% ${spacecraftPos < 75 ? 'SUNWARD' : 'EARTHWARD'}`}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[6.5px] text-[#8C8C92] uppercase tracking-wider block">SOLAR RADIANCE</span>
            <span className="text-[9.5px] font-black text-amber-neon">
              {spacecraftPos < 10 ? 'MAXIMUM (980 W/m²)' : spacecraftPos > 90 ? 'ECLIPSED (140 W/m²)' : `${Math.round(1400 - spacecraftPos * 12)} W/m²`}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[6.5px] text-[#8C8C92] uppercase tracking-wider block">DSN SIGNAL RANGE</span>
            <span className="text-[9.5px] font-black text-cyan-data">
              {calculatedDistanceKm.toLocaleString()} KM
            </span>
          </div>

          <div className="text-left flex flex-col items-start">
            <span className="text-[6.5px] text-[#8C8C92] uppercase tracking-wider block">ORBIT CONTROL</span>
            <button 
              onClick={handleFireThrusters}
              disabled={thrusterCooling || thrustersFiring || isOptimalL1}
              className={cn(
                "text-[7px] font-black px-2 py-0.5 rounded border uppercase transition-all tracking-wider leading-none mt-1",
                isOptimalL1 
                  ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-500/40 cursor-not-allowed" 
                  : thrustersFiring 
                    ? "bg-orange-500/20 border-orange-500/50 text-orange-500 animate-pulse"
                    : thrusterCooling
                      ? "bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed"
                      : "bg-amber-neon/10 hover:bg-amber-neon/20 border-amber-neon/30 text-amber-neon text-glow-amber"
              )}
            >
              {thrustersFiring ? "FIRING RCS..." : thrusterCooling ? "COOLING..." : "FIRE THRUSTERS"}
            </button>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD VIEW SELECTION TABS --- */}
      <div className="flex gap-1.5 mb-2.5 z-10 shrink-0 border-b border-white/[0.04] pb-1.5">
        {(['TELEMETRY', 'PAYLOADS', 'TERMINAL', 'DSN'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[8.5px] font-black tracking-widest uppercase transition-all border",
              activeTab === tab 
                ? "bg-amber-neon/10 border-amber-neon/30 text-amber-neon shadow-[0_0_10px_rgba(255,176,0,0.08)] text-glow-amber"
                : "bg-white/[0.01] hover:bg-white/[0.04] border-transparent text-[#8A8A90] hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- SUB-VIEW ROUTER CONTENT --- */}
      <div className="flex-1 overflow-y-auto scrollbar-none pr-1.5 z-10 min-h-0 relative flex flex-col gap-2.5">
        
        {/* VIEW 1: MAIN TELEMETRY STATUS LIST */}
        {activeTab === 'TELEMETRY' && (
          <div className="flex flex-col gap-2.5">
            {/* ROW 1: DISTANCE FROM EARTH */}
            <div 
              onClick={() => setExpandedRow(expandedRow === 'dist' ? null : 'dist')}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2 bg-glass border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-data shadow-[0_0_8px_#00F0FF]" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-cyan-data/10">
                    <Globe className="h-3.5 w-3.5 text-cyan-data" />
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] text-[#A0A0A5] tracking-widest font-bold uppercase block">DISTANCE FROM EARTH</span>
                    <span className="text-[8px] text-[#55555A] font-medium uppercase mt-0.5">CURRENT SPACE RANGE</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-extrabold text-cyan-data text-glow-cyan">
                    {(calculatedDistanceKm / 1000000).toFixed(3)} MILLION km
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {expandedRow === 'dist' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-2 mt-1 text-left space-y-2 text-[9px]"
                  >
                    <p className="text-[#8A8A90] leading-relaxed">
                      Aditya-L1 resides in a halo orbit about 1.5 million km from Earth, keeping it constantly in continuous visibility with the Sun without eclipses or occultations.
                    </p>
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[#6C6C72] block text-[7px] uppercase">Miles Equivalent</span>
                        <span className="text-white font-bold">{Math.round(calculatedDistanceKm * 0.621371).toLocaleString()} mi</span>
                      </div>
                      <div>
                        <span className="text-[#6C6C72] block text-[7px] uppercase">Radio Transit Delay</span>
                        <span className="text-white font-bold">{(calculatedDistanceKm / 300000).toFixed(3)} seconds</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROW 2: L1 POSITION */}
            <div 
              onClick={() => setExpandedRow(expandedRow === 'pos' ? null : 'pos')}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2 bg-glass border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300",
                isOptimalL1 ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-neon shadow-[0_0_8px_#FFB000]"
              )} />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1 rounded-lg", isOptimalL1 ? "bg-emerald-500/10" : "bg-amber-neon/10")}>
                    <Activity className={cn("h-3.5 w-3.5", isOptimalL1 ? "text-emerald-400" : "text-amber-neon")} />
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] text-[#A0A0A5] tracking-widest font-bold uppercase block">L1 POSITION</span>
                    <span className="text-[8px] text-[#55555A] font-medium uppercase mt-0.5">ORBITAL LISSANOUS STATUS</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5",
                    isOptimalL1 ? "text-emerald-400" : "text-amber-neon"
                  )}>
                    {isOptimalL1 ? "NOMINAL" : "STABLE DRIFT"}
                    <span className={cn("h-1.5 w-1.5 rounded-full inline-block", isOptimalL1 ? "bg-emerald-400" : "bg-amber-neon animate-pulse")} />
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {expandedRow === 'pos' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-2 mt-1 text-left space-y-2 text-[9px]"
                  >
                    <p className="text-[#8A8A90] leading-relaxed">
                      Due to complex solar and planetary gravitational pull, Lissajous orbits are inherently unstable. Telemetry checks require orbital thruster correction periodically.
                    </p>
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex justify-between items-center">
                      <div>
                        <span className="text-[#6C6C72] block text-[7px] uppercase">Deviation Vector Offset</span>
                        <span className="text-white font-bold text-glow-amber">X: {((spacecraftPos - 75) * 420).toFixed(1)}m, Y: {(Math.sin(spacecraftPos) * 125).toFixed(1)}m</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleFireThrusters(); }}
                        disabled={isOptimalL1 || thrustersFiring}
                        className="text-[8px] font-black uppercase tracking-widest bg-amber-neon text-black px-2 py-1 rounded-lg hover:bg-amber-neon/80 disabled:opacity-35"
                      >
                        Correct Position
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROW 3: TELEMETRY HEALTH */}
            <div 
              onClick={() => setExpandedRow(expandedRow === 'health' ? null : 'health')}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2 bg-glass border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-500/10">
                    <Cpu className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] text-[#A0A0A5] tracking-widest font-bold uppercase block">TELEMETRY HEALTH</span>
                    <span className="text-[8px] text-[#55555A] font-medium uppercase mt-0.5">DATAFLOW ENCRYPTION LAYER</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-extrabold text-emerald-400">
                    {telemetryNoise.telemetryHealth}% NOMINAL
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {expandedRow === 'health' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-2 mt-1 text-left space-y-2 text-[9px]"
                  >
                    <p className="text-[#8A8A90] leading-relaxed">
                      Core on-board computers are active in a redundant triple-modular configuration. Encryption lock is maintained over S-Band secure carrier.
                    </p>
                    <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[#6C6C72] block text-[7px] uppercase">Live S-Band Raw Packet Hex Data Stream</span>
                      <div className="font-mono text-[8px] text-emerald-400/80 leading-relaxed bg-[#050505] p-1.5 rounded border border-white/5">
                        {hexLogs.length > 0 ? hexLogs.map((l, idx) => (
                          <div key={idx}>{l}</div>
                        )) : "Receiving raw satellite packages..."}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROW 4: PAYLOAD HEALTH */}
            <div 
              onClick={() => setExpandedRow(expandedRow === 'payload' ? null : 'payload')}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2 bg-glass border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300",
                calculatedPayloadHealth > 80 ? "bg-emerald-400" : calculatedPayloadHealth > 60 ? "bg-amber-neon animate-pulse" : "bg-red-threat animate-bounce"
              )} />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-500/10">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] text-[#A0A0A5] tracking-widest font-bold uppercase block">PAYLOAD HEALTH</span>
                    <span className="text-[8px] text-[#55555A] font-medium uppercase mt-0.5">7 SCIENCE INSTRUMENTS STATUS</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[12px] font-extrabold",
                    calculatedPayloadHealth > 80 ? "text-emerald-400" : calculatedPayloadHealth > 60 ? "text-amber-neon text-glow-amber" : "text-red-threat"
                  )}>
                    {calculatedPayloadHealth}%
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {expandedRow === 'payload' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-2 mt-1 text-left space-y-2 text-[9px]"
                  >
                    <p className="text-[#8A8A90] leading-relaxed">
                      Aditya-L1 is armed with 7 advanced payloads to monitor solar dynamics. Clicking a payload allows you to run high-energy calibrations.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {payloads.map(p => (
                        <div key={p.id} className="bg-black/30 p-2 rounded-xl border border-white/5 flex justify-between items-center">
                          <div className="text-left">
                            <span className="text-[8.5px] font-bold text-white">{p.name}</span>
                            <span className="block text-[7px] text-[#6C6C72] truncate max-w-[120px]">{p.fullName}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCalibratePayload(p.id); }}
                            className="text-[7px] font-black uppercase bg-white/5 hover:bg-white/10 px-2 py-0.5 border border-white/10 rounded-md transition-all text-[#A0A0A5] hover:text-white"
                          >
                            Calibrate
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROW 5: DOWNLINK STATUS */}
            <div 
              onClick={() => setExpandedRow(expandedRow === 'downlink' ? null : 'downlink')}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2 bg-glass border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-data shadow-[0_0_8px_#00F0FF]" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-cyan-data/10">
                    <Radio className="h-3.5 w-3.5 text-cyan-data animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] text-[#A0A0A5] tracking-widest font-bold uppercase block">DOWNLINK STATUS</span>
                    <span className="text-[8px] text-[#55555A] font-medium uppercase mt-0.5">S-BAND telemetry LINK</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-extrabold text-cyan-data">
                    STABLE ({currentGroundStation.frequencyGhz} GHz)
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {expandedRow === 'downlink' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-2 mt-1 text-left space-y-2 text-[9px]"
                  >
                    <p className="text-[#8A8A90] leading-relaxed">
                      Continuous downlink telemetry carrier handles scientific packet uploads in real time. We can redirect connection across available ground station nodes.
                    </p>
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[#6C6C72] block text-[7px] uppercase font-bold">Select Active Ground Station Node</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {GROUND_STATIONS.map((st, idx) => (
                          <div 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setSelectedStationIndex(idx); }}
                            className={cn(
                              "p-1.5 rounded-lg border text-left cursor-pointer transition-all",
                              selectedStationIndex === idx 
                                ? "bg-cyan-data/10 border-cyan-data/40 text-cyan-data" 
                                : "bg-white/[0.02] border-white/5 text-[#8A8A90] hover:text-white hover:bg-white/[0.04]"
                            )}
                          >
                            <span className="block font-bold text-[8px]">{st.name}</span>
                            <span className="text-[7px] opacity-75">{st.location} • {st.latencyMs}ms delay</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROW 6: POWER SYSTEM */}
            <div 
              onClick={() => setExpandedRow(expandedRow === 'power' ? null : 'power')}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2 bg-glass border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-neon shadow-[0_0_8px_#FFB000]" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-neon/10">
                    <Battery className="h-3.5 w-3.5 text-amber-neon animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] text-[#A0A0A5] tracking-widest font-bold uppercase block">POWER SYSTEM</span>
                    <span className="text-[8px] text-[#55555A] font-medium uppercase mt-0.5">SOLAR ARRAY GENERATION</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-extrabold text-amber-neon">
                    {calculatedPower} W NOMINAL
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {expandedRow === 'power' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-2 mt-1 text-left space-y-2 text-[9px]"
                  >
                    <p className="text-[#8A8A90] leading-relaxed">
                      Aditya-L1 is powered by two solar arrays. Align panel tilt angles relative to current solar disk path to maximize electrical energy generation.
                    </p>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex justify-between text-[7px] uppercase text-[#6C6C72]">
                        <span>Solar Panel Tilt Angle</span>
                        <span className="text-white font-bold">{solarPanelAngle}° Angle</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="90" 
                        value={solarPanelAngle}
                        onChange={(e) => { e.stopPropagation(); setSolarPanelAngle(parseInt(e.target.value)); }}
                        className="w-full accent-amber-neon"
                      />
                      <div className="text-[7px] text-[#8C8C92] flex justify-between">
                        <span>0° Minimal</span>
                        <span className="text-[#33E1C9]">45° Optimal Efficiency</span>
                        <span>90° Parallel</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROW 7: THERMAL STATUS */}
            <div 
              onClick={() => setExpandedRow(expandedRow === 'thermal' ? null : 'thermal')}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col gap-2 bg-glass border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300",
                isThermalCritical ? "bg-red-threat shadow-[0_0_8px_#FF1F1F]" : "bg-cyan-data shadow-[0_0_8px_#00F0FF]"
              )} />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-cyan-data/10">
                    <Thermometer className={cn("h-3.5 w-3.5", isThermalCritical ? "text-red-threat animate-bounce" : "text-cyan-data")} />
                  </div>
                  <div className="text-left">
                    <span className="text-[7px] text-[#A0A0A5] tracking-widest font-bold uppercase block">THERMAL STATUS</span>
                    <span className="text-[8px] text-[#55555A] font-medium uppercase mt-0.5">SPACECRAFT TEMP MONITOR</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[12px] font-extrabold",
                    isThermalCritical ? "text-red-threat animate-pulse" : "text-cyan-data"
                  )}>
                    {calculatedTemp} °C {isThermalCritical ? "CRITICAL HEAT" : "NOMINAL"}
                  </span>
                </div>
              </div>
              <AnimatePresence>
                {expandedRow === 'thermal' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-2 mt-1 text-left space-y-2 text-[9px]"
                  >
                    <p className="text-[#8A8A90] leading-relaxed">
                      Aditya-L1 is protected by a multi-layer insulation and heat pipes. If you drag the spacecraft too close to the Sun, solar thermal radiation increases quickly.
                    </p>
                    {isThermalCritical && (
                      <div className="bg-red-950/20 border border-red-500/30 p-2.5 rounded-xl flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-threat animate-bounce shrink-0" />
                        <span className="text-[8px] text-red-200">
                          Critical Overheating! Move Aditya-L1 back towards the L1 Lagrange coordinate to stabilize heat exchangers.
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* VIEW 2: DETAILED PAYLOAD INSTRUMENTS STATUS */}
        {activeTab === 'PAYLOADS' && (
          <div className="space-y-3.5">
            <div className="bg-glass border border-white/5 p-3 rounded-2xl text-left flex justify-between items-center">
              <div>
                <span className="text-[7px] text-[#8C8C92] uppercase block font-bold">Aggregate Science Data Stream</span>
                <span className="text-[12px] font-black text-[#33e1c9] mt-0.5 text-glow-cyan">
                  {totalScienceOutput} Gbps Real-Time Downlink Rate
                </span>
              </div>
              <div className="h-2 w-16 bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-cyan-data rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (totalScienceOutput / 6.5) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {payloads.map(p => (
                <div 
                  key={p.id}
                  className="bg-glass border border-white/5 rounded-xl p-3 text-left relative overflow-hidden hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="text-[10px] font-black text-white block">{p.name}</span>
                      <span className="text-[7.5px] text-[#8C8C92] block">{p.fullName}</span>
                    </div>
                    <span className={cn(
                      "text-[6.5px] font-black px-1.5 py-0.5 rounded border leading-none uppercase",
                      p.status === 'ACTIVE' 
                        ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" 
                        : p.status === 'STANDBY'
                          ? "bg-amber-neon/5 border-amber-neon/15 text-amber-neon"
                          : "bg-cyan-data/10 border-cyan-data/20 text-cyan-data animate-pulse"
                    )}>
                      {p.status}
                    </span>
                  </div>

                  <p className="text-[8px] text-[#8C8C90] leading-normal mb-3">
                    {p.desc}
                  </p>

                  <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2 text-[7.5px]">
                    <div className="flex items-center gap-1">
                      <span className="text-[#6C6C72]">Health:</span>
                      <span className={cn("font-bold", p.health > 80 ? "text-emerald-400" : "text-red-threat")}>
                        {p.health}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#6C6C72]">Outflow:</span>
                      <span className="text-cyan-data font-bold">{p.status === 'ACTIVE' ? `${p.scientificOutput} Gbps` : '0 Gbps'}</span>
                    </div>
                    <button 
                      onClick={() => handleCalibratePayload(p.id)}
                      disabled={p.status === 'CALIBRATING'}
                      className="text-[6.5px] font-black uppercase bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-md transition-all text-white disabled:opacity-50"
                    >
                      {p.status === 'CALIBRATING' ? 'CALIBRATING...' : 'Calibrate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: LIVE TERMINAL PROCESSOR LOGS */}
        {activeTab === 'TERMINAL' && (
          <div className="flex flex-col gap-2 bg-black/80 rounded-2xl border border-white/5 p-4 text-left font-mono h-[260px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2 shrink-0">
              <span className="text-[8px] font-bold text-amber-neon uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="h-3 w-3" />
                ISRO TELEMETRY DISPATCH CONSOLE
              </span>
              <span className="text-[7.5px] text-[#6A6A70]">BUFFER: STACK NOMINAL</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 text-[8.5px] text-[#8C8C95] leading-relaxed custom-scrollbar">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="hover:bg-white/[0.02] p-1 rounded-sm transition-colors flex items-start gap-1.5">
                  <span className="text-[#4C4C52] shrink-0">{idx + 1}.</span>
                  <span className={cn(
                    log.includes('ALERT') ? "text-red-threat font-bold" : log.includes('MANEUVER') ? "text-amber-neon" : "text-white/90"
                  )}>{log}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/5 pt-2 mt-2 shrink-0 flex justify-between items-center text-[7.5px] text-[#6C6C72]">
              <span>CORE_NODE: ISSAJ_SECURE_L1</span>
              <span>PARSING CONTINUOUS UPLINK...</span>
            </div>
          </div>
        )}

        {/* VIEW 4: DEEP SPACE NETWORK LINK DATA */}
        {activeTab === 'DSN' && (
          <div className="space-y-3">
            <div className="bg-glass border border-white/5 p-4 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-data animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">ANTENNA CARRIER FREQUENCY DIAGNOSTICS</span>
              </div>
              <p className="text-[8.5px] text-[#8C8C90] leading-relaxed">
                Aditya-L1 communicates using an ultra-precise high-gain S-band antenna array tracking ground receivers via Indian Deep Space Network (IDSN) coupled with ESA/NASA global tracking networks.
              </p>
              
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[6.5px] text-[#6C6C72] block uppercase">UPLINK CARRIER</span>
                  <span className="text-[9px] font-bold text-white">2.01 GHz (X-Band)</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[6.5px] text-[#6C6C72] block uppercase">DOWNLINK BAND</span>
                  <span className="text-[9px] font-bold text-white">8.41 GHz (S-Band)</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[6.5px] text-[#6C6C72] block uppercase">SIGNAL LATENCY</span>
                  <span className="text-[9px] font-bold text-cyan-data">{currentGroundStation.latencyMs} ms RTT</span>
                </div>
              </div>
            </div>

            <div className="bg-glass border border-white/5 p-4 rounded-2xl text-left space-y-2">
              <span className="text-[8.5px] font-black text-white uppercase tracking-wider block">ANTENNA LOCK STATION DETECTED</span>
              <div className="space-y-1.5">
                {GROUND_STATIONS.map((st, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-2 rounded-xl border flex justify-between items-center",
                      selectedStationIndex === idx ? "bg-cyan-data/5 border-cyan-data/30 text-cyan-data" : "bg-black/20 border-white/5"
                    )}
                  >
                    <div>
                      <span className="text-[8.5px] font-bold block">{st.name}</span>
                      <span className="text-[7px] text-[#8C8C90]">{st.location}</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[8px] font-bold block">{st.latencyMs}ms latency</span>
                        <span className="text-[7px] text-emerald-400 block">{st.snrDb} dB SNR (Nominal)</span>
                      </div>
                      <span className={cn("h-1.5 w-1.5 rounded-full", selectedStationIndex === idx ? "bg-cyan-data animate-pulse" : "bg-white/20")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- LIVE SOLAR DATA SNAPSHOT BOX --- */}
      <div className="bg-[#0b0b0f] border border-[#222227] rounded-2xl p-3 mt-2.5 shrink-0 relative z-10 text-left">
        
        {/* Dynamic solar radiation waves background decoration */}
        <div className="absolute right-2 bottom-2 opacity-5 pointer-events-none">
          <SpinIcon className="h-16 w-16 text-amber-neon animate-spin-slow" />
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-[8.5px] font-black text-amber-neon uppercase tracking-wider text-glow-amber">
            LIVE SOLAR DATA SNAPSHOT
          </span>
          <button 
            onClick={triggerCmeSimulation}
            disabled={cmeWarning || isStorming}
            className="text-[7.5px] font-black uppercase tracking-widest bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-lg transition-all disabled:opacity-40"
          >
            Trigger solar flare
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {/* Box 1: SOLAR WIND */}
          <div className="bg-black/50 border border-white/5 hover:border-white/10 p-2 rounded-xl text-center flex flex-col justify-between transition-all">
            <span className="text-[6.5px] text-[#8A8A90] font-bold block uppercase tracking-wider">SOLAR WIND</span>
            <span className="text-[10px] font-black text-white mt-1">
              {telemetryNoise.solarWind} km/s
            </span>
            <span className={cn("text-[6px] font-extrabold uppercase mt-1 leading-none py-0.5 rounded-sm block", isStorming ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400")}>
              {isStorming ? "SEVERE" : "NORMAL"}
            </span>
          </div>

          {/* Box 2: X-RAY FLUX */}
          <div className="bg-black/50 border border-white/5 hover:border-white/10 p-2 rounded-xl text-center flex flex-col justify-between transition-all">
            <span className="text-[6.5px] text-[#8A8A90] font-bold block uppercase tracking-wider">X-RAY FLUX</span>
            <span className={cn("text-[10px] font-black mt-1", isStorming ? "text-red-threat" : "text-amber-neon")}>
              {telemetryNoise.xrayFlux}
            </span>
            <span className={cn("text-[6px] font-extrabold uppercase mt-1 leading-none py-0.5 rounded-sm block", isStorming ? "bg-red-500/10 text-red-400" : "bg-amber-neon/10 text-amber-neon")}>
              {isStorming ? "EXTREME" : "MODERATE"}
            </span>
          </div>

          {/* Box 3: PROTON FLUX */}
          <div className="bg-black/50 border border-white/5 hover:border-white/10 p-2 rounded-xl text-center flex flex-col justify-between transition-all">
            <span className="text-[6.5px] text-[#8A8A90] font-bold block uppercase tracking-wider">PROTON FLUX</span>
            <span className="text-[10px] font-black text-white mt-1">
              {telemetryNoise.protonFlux} pfu
            </span>
            <span className={cn("text-[6px] font-extrabold uppercase mt-1 leading-none py-0.5 rounded-sm block", isStorming ? "bg-red-500/10 text-red-400" : "bg-[#33E1C9]/10 text-[#33E1C9]")}>
              {isStorming ? "CRITICAL" : "LOW"}
            </span>
          </div>

          {/* Box 4: Kp INDEX */}
          <div className="bg-black/50 border border-white/5 hover:border-white/10 p-2 rounded-xl text-center flex flex-col justify-between transition-all">
            <span className="text-[6.5px] text-[#8A8A90] font-bold block uppercase tracking-wider">Kp INDEX</span>
            <span className="text-[10px] font-black text-white mt-1">
              {telemetryNoise.kpIndex}
            </span>
            <span className={cn("text-[6px] font-extrabold uppercase mt-1 leading-none py-0.5 rounded-sm block", telemetryNoise.kpIndex > 6 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400")}>
              {telemetryNoise.kpIndex > 6 ? "STORM" : "ACTIVE"}
            </span>
          </div>

          {/* Box 5: Bz FIELD */}
          <div className="bg-black/50 border border-white/5 hover:border-white/10 p-2 rounded-xl text-center flex flex-col justify-between transition-all">
            <span className="text-[6.5px] text-[#8A8A90] font-bold block uppercase tracking-wider">Bz FIELD</span>
            <span className={cn("text-[10px] font-black mt-1", telemetryNoise.bzField < -6 ? "text-red-threat" : "text-[#33E1C9]")}>
              {telemetryNoise.bzField} nT
            </span>
            <span className={cn("text-[6px] font-extrabold uppercase mt-1 leading-none py-0.5 rounded-sm block", telemetryNoise.bzField < -6 ? "bg-red-500/10 text-red-400" : "bg-[#33E1C9]/10 text-[#33E1C9]")}>
              {telemetryNoise.bzField < 0 ? "SOUTH" : "NORTH"}
            </span>
          </div>
        </div>
      </div>

      {/* --- SUB-FOOTER BRANDING BAR --- */}
      <div className="flex justify-between items-center mt-2.5 shrink-0 text-[7px] text-[#6A6A70] uppercase tracking-[0.1em] border-t border-white/[0.04] pt-2 z-10">
        <div className="flex items-center gap-1.5 text-left font-black">
          <span className="text-white">ADITYA-L1 • ISRO</span>
          <span className="text-white/20">|</span>
          <span>OBSERVING THE SUN. PROTECTING EARTH.</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold">
          <span>TELEMETRY CORE v4.8</span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-neon animate-pulse" />
        </div>
      </div>

    </div>
  );
};
