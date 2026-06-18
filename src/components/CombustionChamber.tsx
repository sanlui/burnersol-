import React, { useEffect, useRef, useState } from "react";

interface CombustionChamberProps {
  isBurning: boolean;
  intensity: number; // 0 to 1
  onBurnComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function CombustionChamber({
  isBurning,
  intensity,
  onBurnComplete,
}: CombustionChamberProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let resizeObserver: ResizeObserver;

    // Resize handler
    const updateSize = (width: number, height: number) => {
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    if (containerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          updateSize(width || 320, height || 240);
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    // Set initial size
    const rect = containerRef.current?.getBoundingClientRect();
    updateSize(rect?.width || 320, rect?.height || 240);

    // Color generator
    const getFlameColor = (lifeRatio: number) => {
      // ratio: 0 (newborn) to 1 (dead)
      if (lifeRatio < 0.2) {
        // Core: white-hot
        return `rgba(255, 255, 240, ${1 - lifeRatio})`;
      } else if (lifeRatio < 0.45) {
        // Mid: bright gold
        return `rgba(255, 190, 31, ${1 - lifeRatio})`;
      } else if (lifeRatio < 0.75) {
        // Outer: lava orange
        return `rgba(255, 90, 31, ${1 - lifeRatio * 1.1})`;
      } else {
        // Smoke soot / dark coral ash
        return `rgba(255, 42, 95, ${(1 - lifeRatio) * 0.4})`;
      }
    };

    // Spawn regular fire particles
    const spawnParticle = (w: number, h: number, forceExplosion = false) => {
      const isSuper = isBurning || forceExplosion;
      const x = isSuper
        ? w / 2 + (Math.random() - 0.5) * (w * 0.6)
        : w / 2 + (Math.random() - 0.5) * (w * 0.4);
      
      const y = h - 15 - Math.random() * 10;
      const baseVy = isSuper ? -4 - Math.random() * 6 : -1.5 - Math.random() * 2;
      const baseVx = (Math.random() - 0.5) * (isSuper ? 3 : 0.8);
      
      const maxLife = isSuper ? 30 + Math.random() * 40 : 40 + Math.random() * 50;

      return {
        x,
        y,
        vx: baseVx,
        vy: baseVy * (intensity * 0.8 + 0.6),
        size: isSuper ? 3 + Math.random() * 7 : 2 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife,
        color: "",
      };
    };

    let burnProgressCount = 0;

    // Animation Loop
    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      // Trigger high-intensity explosions when burning
      const spawnRate = isBurning ? 12 : Math.floor(4 + intensity * 6);
      for (let i = 0; i < spawnRate; i++) {
        if (Math.random() < 0.7) {
          particlesRef.current.push(spawnParticle(w, h));
        }
      }

      // Handle custom client-side attraction triggers
      const mouse = mouseRef.current;

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life += 1;
        const ratio = p.life / p.maxLife;

        // Apply upwards movement + horizontal drift (turbulence)
        p.vy += -0.015; // float acceleration
        p.vx += (Math.random() - 0.5) * 0.15; // wind wobble

        // Attract particles weakly to mouse if hover is active
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            p.vx += (dx / dist) * 0.12;
            p.vy += (dy / dist) * 0.08;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.color = getFlameColor(ratio);

        if (ratio >= 1) return false;

        // Draw particle
        ctx.beginPath();
        const size = p.size * (1 - ratio * 0.4);
        
        // Render glowing circles with blur
        ctx.arc(p.x, p.y, size > 0 ? size : 0.1, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw tiny high-fidelity sparks
        if (Math.random() < 0.08 && ratio < 0.6) {
          ctx.fillStyle = `rgba(255, 230, 150, ${0.8 - ratio})`;
          ctx.fillRect(
            p.x + (Math.random() - 0.5) * 8, 
            p.y + (Math.random() - 0.5) * 8, 
            1.5, 
            1.5
          );
        }

        return true;
      });

      // Draw active background furnace grid / thermal field
      ctx.save();
      const gradient = ctx.createLinearGradient(0, h, 0, h - 80);
      gradient.addColorStop(0, `rgba(255, 90, 31, ${0.12 + (isBurning ? 0.25 : 0)})`);
      gradient.addColorStop(0.5, `rgba(255, 42, 95, ${0.04 + (isBurning ? 0.1 : 0)})`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, h - 80, w, 80);
      ctx.restore();

      // Trigger automatic completion timer in parent logic
      if (isBurning) {
        burnProgressCount++;
        if (burnProgressCount > 90) {
          burnProgressCount = 0;
          if (onBurnComplete) onBurnComplete();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isBurning, intensity, onBurnComplete]);

  // Track cursor position, allowing fire to drift towards user touch/movement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden rounded-2xl transition-all duration-500 bg-linear-to-b from-dark-obsidian via-dark-charcoal to-dark-obsidian/30 ${
        isBurning ? "scale-[0.98] border border-flame-orange/40 pulse-glow" : "border border-white/5"
      }`}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block w-full h-full cursor-pointer absolute inset-0 mix-blend-screen"
      />
      
      {/* Combustion Overlay details */}
      <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none select-none z-10 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-obsidian/80 border border-white/5 backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${isBurning ? "bg-flame-coral animate-ping-slow" : "bg-flame-orange"}`} />
          <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
            {isBurning ? "FURNACE COMBUSTION ACTIVE" : "THERMAL GRID: IDLE"}
          </span>
        </div>
      </div>
      
      {/* Decorative heatwave grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-40" />
    </div>
  );
}
