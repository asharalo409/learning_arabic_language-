import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types/academy';
import { playSound } from '../utils/soundEffects';

interface ThemePalette {
  dnaPrimary: string;
  dnaSecondary: string;
  dnaRung: string;
  bubbleStroke: string;
  bubbleFill: string;
  cloudColor: string;
  sparkleColor: string;
  rippleColor: string;
  isBrightSky: boolean;
}

const PALETTES: Record<ThemeMode, ThemePalette> = {
  'sky-cloud': {
    dnaPrimary: 'rgba(2, 132, 199, 0.36)',
    dnaSecondary: 'rgba(245, 158, 11, 0.36)',
    dnaRung: 'rgba(14, 165, 233, 0.22)',
    bubbleStroke: 'rgba(255, 255, 255, 0.85)',
    bubbleFill: 'rgba(186, 230, 253, 0.28)',
    cloudColor: 'rgba(255, 255, 255, 0.72)',
    sparkleColor: 'rgba(245, 158, 11, 0.65)',
    rippleColor: 'rgba(2, 132, 199, 0.38)',
    isBrightSky: true,
  },
  emerald: {
    dnaPrimary: 'rgba(229, 193, 88, 0.34)',
    dnaSecondary: 'rgba(52, 211, 153, 0.3)',
    dnaRung: 'rgba(212, 175, 55, 0.18)',
    bubbleStroke: 'rgba(167, 243, 208, 0.45)',
    bubbleFill: 'rgba(16, 185, 129, 0.12)',
    cloudColor: 'rgba(16, 185, 129, 0.11)',
    sparkleColor: 'rgba(229, 193, 88, 0.72)',
    rippleColor: 'rgba(229, 193, 88, 0.42)',
    isBrightSky: false,
  },
  midnight: {
    dnaPrimary: 'rgba(56, 189, 248, 0.34)',
    dnaSecondary: 'rgba(226, 183, 75, 0.32)',
    dnaRung: 'rgba(125, 211, 252, 0.2)',
    bubbleStroke: 'rgba(186, 230, 253, 0.45)',
    bubbleFill: 'rgba(56, 189, 248, 0.12)',
    cloudColor: 'rgba(59, 130, 246, 0.12)',
    sparkleColor: 'rgba(253, 224, 71, 0.75)',
    rippleColor: 'rgba(56, 189, 248, 0.42)',
    isBrightSky: false,
  },
  light: {
    dnaPrimary: 'rgba(15, 107, 78, 0.28)',
    dnaSecondary: 'rgba(217, 119, 6, 0.28)',
    dnaRung: 'rgba(16, 185, 129, 0.18)',
    bubbleStroke: 'rgba(255, 255, 255, 0.85)',
    bubbleFill: 'rgba(167, 243, 208, 0.26)',
    cloudColor: 'rgba(255, 255, 255, 0.65)',
    sparkleColor: 'rgba(217, 119, 6, 0.52)',
    rippleColor: 'rgba(15, 107, 78, 0.34)',
    isBrightSky: true,
  },
  madinah: {
    dnaPrimary: 'rgba(45, 212, 191, 0.32)',
    dnaSecondary: 'rgba(230, 185, 121, 0.34)',
    dnaRung: 'rgba(45, 212, 191, 0.18)',
    bubbleStroke: 'rgba(153, 246, 228, 0.45)',
    bubbleFill: 'rgba(20, 184, 166, 0.14)',
    cloudColor: 'rgba(45, 212, 191, 0.1)',
    sparkleColor: 'rgba(241, 202, 144, 0.75)',
    rippleColor: 'rgba(230, 185, 121, 0.42)',
    isBrightSky: false,
  },
  kaaba: {
    dnaPrimary: 'rgba(240, 196, 77, 0.36)',
    dnaSecondary: 'rgba(251, 191, 36, 0.26)',
    dnaRung: 'rgba(240, 196, 77, 0.2)',
    bubbleStroke: 'rgba(253, 230, 138, 0.45)',
    bubbleFill: 'rgba(245, 158, 11, 0.1)',
    cloudColor: 'rgba(240, 196, 77, 0.08)',
    sparkleColor: 'rgba(248, 212, 109, 0.8)',
    rippleColor: 'rgba(240, 196, 77, 0.45)',
    isBrightSky: false,
  },
  parchment: {
    dnaPrimary: 'rgba(154, 91, 19, 0.26)',
    dnaSecondary: 'rgba(15, 118, 110, 0.24)',
    dnaRung: 'rgba(180, 134, 28, 0.16)',
    bubbleStroke: 'rgba(255, 250, 240, 0.8)',
    bubbleFill: 'rgba(253, 230, 138, 0.24)',
    cloudColor: 'rgba(255, 252, 245, 0.62)',
    sparkleColor: 'rgba(180, 110, 20, 0.5)',
    rippleColor: 'rgba(154, 91, 19, 0.32)',
    isBrightSky: true,
  },
  andalus: {
    dnaPrimary: 'rgba(56, 189, 248, 0.38)',
    dnaSecondary: 'rgba(168, 85, 247, 0.28)',
    dnaRung: 'rgba(125, 211, 252, 0.22)',
    bubbleStroke: 'rgba(186, 230, 253, 0.5)',
    bubbleFill: 'rgba(56, 189, 248, 0.14)',
    cloudColor: 'rgba(56, 189, 248, 0.12)',
    sparkleColor: 'rgba(196, 181, 253, 0.78)',
    rippleColor: 'rgba(56, 189, 248, 0.45)',
    isBrightSky: false,
  },
};

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  wobblePhase: number;
  alpha: number;
}

interface CloudPuff {
  x: number;
  y: number;
  scale: number;
  speed: number;
  alpha: number;
}

interface Sparkle {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface TouchRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const ThemeBackdrop: React.FC<{ soundOnBubbleTap?: boolean }> = ({
  soundOnBubbleTap = false,
}) => {
  const { theme, backdropIntensity, soundEnabled } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<ThemeMode>(theme);
  const intensityRef = useRef(backdropIntensity);
  const soundFlagRef = useRef(soundOnBubbleTap && soundEnabled);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    intensityRef.current = backdropIntensity;
  }, [backdropIntensity]);

  useEffect(() => {
    soundFlagRef.current = soundOnBubbleTap && soundEnabled;
  }, [soundOnBubbleTap, soundEnabled]);

  useEffect(() => {
    if (backdropIntensity === 'off') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const intensityScale = backdropIntensity === 'vivid' ? 1 : 0.55;
    const bubbleCount = Math.round((width < 640 ? 22 : 34) * intensityScale);
    const cloudCount = Math.round((width < 640 ? 5 : 8) * intensityScale);
    const sparkleCount = Math.round((width < 640 ? 24 : 42) * intensityScale);

    const bubbles: Bubble[] = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 7 + Math.random() * 18,
      vy: -(0.35 + Math.random() * 0.75),
      vx: (Math.random() - 0.5) * 0.35,
      wobblePhase: Math.random() * Math.PI * 2,
      alpha: 0.45 + Math.random() * 0.45,
    }));

    const clouds: CloudPuff[] = Array.from({ length: cloudCount }, (_, idx) => ({
      x: (idx / Math.max(1, cloudCount)) * (width + 260) - 130,
      y: 55 + Math.random() * (height * 0.45),
      scale: 0.75 + Math.random() * 0.95,
      speed: 0.16 + Math.random() * 0.24,
      alpha: 0.55 + Math.random() * 0.4,
    }));

    const sparkles: Sparkle[] = Array.from({ length: sparkleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.2 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.04,
    }));

    const ripples: TouchRipple[] = [];
    const pointer = { x: width * 0.5, y: height * 0.45, active: false, energy: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.energy = Math.min(1.6, pointer.energy + 0.18);
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.energy = 1.8;

      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 150,
        alpha: 0.75,
      });

      // Spawn joyful burst of floating bubbles around touch point
      for (let i = 0; i < 4; i += 1) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.6;
        if (bubbles.length < 56) {
          bubbles.push({
            x: e.clientX + Math.cos(angle) * 14,
            y: e.clientY + Math.sin(angle) * 14,
            r: 5 + Math.random() * 11,
            vy: -(0.8 + Math.random() * 1.1),
            vx: Math.cos(angle) * 1.6,
            wobblePhase: Math.random() * Math.PI * 2,
            alpha: 0.85,
          });
        }
      }

      if (soundFlagRef.current) {
        playSound('bubble');
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    let time = 0;
    let rafId = 0;

    const drawCloud = (c: CloudPuff, color: string) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.arc(42, -10, 36, 0, Math.PI * 2);
      ctx.arc(82, 2, 32, 0, Math.PI * 2);
      ctx.arc(-40, 6, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);
      const pal = PALETTES[themeRef.current] || PALETTES['sky-cloud'];
      const mult = intensityRef.current === 'vivid' ? 1 : 0.6;

      pointer.energy *= 0.96;

      // 1. Radiant Sunburst / Aurora Glow
      const glowX = pal.isBrightSky ? width * 0.82 : width * 0.25;
      const glowY = pal.isBrightSky ? height * 0.14 : height * 0.2;
      const grad = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, Math.max(width, height) * 0.55);
      grad.addColorStop(0, pal.isBrightSky ? 'rgba(255, 244, 194, 0.52)' : pal.cloudColor);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Drifting Fluffy Clouds
      for (const c of clouds) {
        drawCloud(c, pal.cloudColor);
        if (!prefersReduced) {
          c.x += c.speed * mult;
          if (c.x - 120 > width) {
            c.x = -140;
            c.y = 50 + Math.random() * (height * 0.45);
          }
        }
      }

      // 3. DNA Double-Helix Sine Wave Ribbons (interactive with touch/pointer)
      const waveCenterY = height * 0.56;
      const baseAmp = (width < 640 ? 28 : 42) * mult;
      const step = width < 640 ? 18 : 22;

      const strandA: { x: number; y: number }[] = [];
      const strandB: { x: number; y: number }[] = [];

      for (let x = -20; x <= width + 20; x += step) {
        const distToPointer = pointer.active
          ? Math.hypot(x - pointer.x, waveCenterY - pointer.y)
          : 9999;
        const influence = Math.max(0, 1 - distToPointer / 260) * (0.65 + pointer.energy * 0.55);
        const phase = x * 0.011 + time * 1.35;
        const amp = baseAmp * (1 + influence * 0.9);
        const yOffset = pointer.active ? (pointer.y - waveCenterY) * influence * 0.22 : 0;

        const y1 = waveCenterY + yOffset + Math.sin(phase) * amp;
        const y2 = waveCenterY + yOffset + Math.sin(phase + Math.PI) * amp;

        strandA.push({ x, y: y1 });
        strandB.push({ x, y: y2 });
      }

      // Connecting DNA Rungs
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = pal.dnaRung;
      for (let i = 0; i < strandA.length; i += 2) {
        ctx.beginPath();
        ctx.moveTo(strandA[i].x, strandA[i].y);
        ctx.lineTo(strandB[i].x, strandB[i].y);
        ctx.stroke();
      }

      // Ribbon A
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = pal.dnaPrimary;
      ctx.beginPath();
      strandA.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Ribbon B
      ctx.strokeStyle = pal.dnaSecondary;
      ctx.beginPath();
      strandB.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // 4. Twinkling Sparkles
      for (const s of sparkles) {
        s.phase += s.speed;
        const twinkle = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.save();
        ctx.globalAlpha = twinkle * mult;
        ctx.fillStyle = pal.sparkleColor;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Interactive Floating Bubbles
      for (let i = bubbles.length - 1; i >= 0; i -= 1) {
        const b = bubbles[i];
        if (!prefersReduced) {
          b.wobblePhase += 0.03;
          b.x += b.vx + Math.sin(b.wobblePhase) * 0.32;
          b.y += b.vy * mult;
          b.vx *= 0.97;

          if (pointer.active) {
            const dx = b.x - pointer.x;
            const dy = b.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 1 && dist < 130) {
              const push = ((130 - dist) / 130) * 1.1;
              b.vx += (dx / dist) * push * 0.45;
              b.y += (dy / dist) * push * 0.25;
            }
          }

          if (b.y < -b.r * 2) {
            if (bubbles.length > bubbleCount) {
              bubbles.splice(i, 1);
              continue;
            }
            b.y = height + b.r + Math.random() * 40;
            b.x = Math.random() * width;
          }
          if (b.x < -30) b.x = width + 25;
          if (b.x > width + 30) b.x = -25;
        }

        ctx.save();
        ctx.globalAlpha = b.alpha * mult;
        ctx.fillStyle = pal.bubbleFill;
        ctx.strokeStyle = pal.bubbleStroke;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Specular highlight crescent
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, Math.max(1.5, b.r * 0.22), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Touch Ripples
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const rp = ripples[i];
        rp.radius += 4.5;
        rp.alpha *= 0.93;
        if (rp.alpha <= 0.03 || rp.radius >= rp.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = rp.alpha;
        ctx.strokeStyle = pal.rippleColor;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (!prefersReduced) {
        time += 0.018 * mult;
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [backdropIntensity]);

  if (backdropIntensity === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none no-print"
    />
  );
};
