import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types/academy';
import { playSound } from '../utils/soundEffects';
import skyMosqueImg from '../assets/images/theme_bright_sky_mosque_1794521633239.jpg';
import kaabaImg from '../assets/images/theme_kaaba_sanctuary_1794521633707.jpg';
import madinahImg from '../assets/images/theme_madinah_courtyard_1794521633886.jpg';
import quranArtImg from '../assets/images/quranic_manuscript_art_1794510740673.jpg';

const THEME_WALLPAPERS: Partial<Record<ThemeMode, { src: string; overlay: string }>> = {
  'sky-cloud': {
    src: skyMosqueImg,
    overlay: 'linear-gradient(180deg, rgba(226, 243, 255, 0.48) 0%, rgba(240, 248, 255, 0.72) 100%)',
  },
  kaaba: {
    src: kaabaImg,
    overlay: 'linear-gradient(180deg, rgba(9, 9, 11, 0.56) 0%, rgba(9, 9, 11, 0.78) 100%)',
  },
  madinah: {
    src: madinahImg,
    overlay: 'linear-gradient(180deg, rgba(6, 27, 25, 0.54) 0%, rgba(6, 27, 25, 0.76) 100%)',
  },
  emerald: {
    src: quranArtImg,
    overlay: 'linear-gradient(180deg, rgba(11, 34, 21, 0.64) 0%, rgba(6, 20, 12, 0.84) 100%)',
  },
  parchment: {
    src: quranArtImg,
    overlay: 'linear-gradient(180deg, rgba(250, 243, 230, 0.68) 0%, rgba(244, 232, 212, 0.84) 100%)',
  },
};

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
    dnaPrimary: 'rgba(79, 70, 229, 0.2)',
    dnaSecondary: 'rgba(14, 165, 233, 0.24)',
    dnaRung: 'rgba(99, 102, 241, 0.12)',
    bubbleStroke: 'rgba(255, 255, 255, 0.88)',
    bubbleFill: 'rgba(186, 230, 253, 0.22)',
    cloudColor: 'rgba(255, 255, 255, 0.58)',
    sparkleColor: 'rgba(245, 158, 11, 0.5)',
    rippleColor: 'rgba(79, 70, 229, 0.34)',
    isBrightSky: true,
  },
  emerald: {
    dnaPrimary: 'rgba(229, 193, 88, 0.28)',
    dnaSecondary: 'rgba(74, 222, 128, 0.24)',
    dnaRung: 'rgba(212, 175, 55, 0.15)',
    bubbleStroke: 'rgba(167, 243, 208, 0.42)',
    bubbleFill: 'rgba(16, 185, 129, 0.1)',
    cloudColor: 'rgba(16, 185, 129, 0.09)',
    sparkleColor: 'rgba(229, 193, 88, 0.68)',
    rippleColor: 'rgba(229, 193, 88, 0.4)',
    isBrightSky: false,
  },
  midnight: {
    dnaPrimary: 'rgba(56, 189, 248, 0.32)',
    dnaSecondary: 'rgba(226, 183, 75, 0.28)',
    dnaRung: 'rgba(125, 211, 252, 0.18)',
    bubbleStroke: 'rgba(186, 230, 253, 0.42)',
    bubbleFill: 'rgba(56, 189, 248, 0.12)',
    cloudColor: 'rgba(59, 130, 246, 0.12)',
    sparkleColor: 'rgba(253, 224, 71, 0.72)',
    rippleColor: 'rgba(56, 189, 248, 0.4)',
    isBrightSky: false,
  },
  light: {
    dnaPrimary: 'rgba(67, 56, 202, 0.18)',
    dnaSecondary: 'rgba(14, 165, 233, 0.18)',
    dnaRung: 'rgba(99, 102, 241, 0.1)',
    bubbleStroke: 'rgba(255, 255, 255, 0.85)',
    bubbleFill: 'rgba(224, 231, 255, 0.26)',
    cloudColor: 'rgba(255, 255, 255, 0.55)',
    sparkleColor: 'rgba(79, 70, 229, 0.34)',
    rippleColor: 'rgba(67, 56, 202, 0.26)',
    isBrightSky: true,
  },
  madinah: {
    dnaPrimary: 'rgba(45, 212, 191, 0.26)',
    dnaSecondary: 'rgba(230, 185, 121, 0.28)',
    dnaRung: 'rgba(45, 212, 191, 0.15)',
    bubbleStroke: 'rgba(153, 246, 228, 0.4)',
    bubbleFill: 'rgba(20, 184, 166, 0.1)',
    cloudColor: 'rgba(45, 212, 191, 0.08)',
    sparkleColor: 'rgba(241, 202, 144, 0.7)',
    rippleColor: 'rgba(230, 185, 121, 0.4)',
    isBrightSky: false,
  },
  kaaba: {
    dnaPrimary: 'rgba(240, 196, 77, 0.28)',
    dnaSecondary: 'rgba(251, 191, 36, 0.22)',
    dnaRung: 'rgba(240, 196, 77, 0.16)',
    bubbleStroke: 'rgba(253, 230, 138, 0.4)',
    bubbleFill: 'rgba(245, 158, 11, 0.09)',
    cloudColor: 'rgba(240, 196, 77, 0.07)',
    sparkleColor: 'rgba(248, 212, 109, 0.76)',
    rippleColor: 'rgba(240, 196, 77, 0.42)',
    isBrightSky: false,
  },
  parchment: {
    dnaPrimary: 'rgba(154, 91, 19, 0.22)',
    dnaSecondary: 'rgba(15, 118, 110, 0.2)',
    dnaRung: 'rgba(180, 134, 28, 0.12)',
    bubbleStroke: 'rgba(255, 250, 240, 0.78)',
    bubbleFill: 'rgba(253, 230, 138, 0.2)',
    cloudColor: 'rgba(255, 252, 245, 0.5)',
    sparkleColor: 'rgba(180, 110, 20, 0.45)',
    rippleColor: 'rgba(154, 91, 19, 0.3)',
    isBrightSky: true,
  },
  andalus: {
    dnaPrimary: 'rgba(56, 189, 248, 0.32)',
    dnaSecondary: 'rgba(168, 85, 247, 0.24)',
    dnaRung: 'rgba(125, 211, 252, 0.18)',
    bubbleStroke: 'rgba(186, 230, 253, 0.45)',
    bubbleFill: 'rgba(56, 189, 248, 0.12)',
    cloudColor: 'rgba(56, 189, 248, 0.1)',
    sparkleColor: 'rgba(196, 181, 253, 0.74)',
    rippleColor: 'rgba(56, 189, 248, 0.42)',
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
    const bubbleCount = Math.round((width < 640 ? 18 : 28) * intensityScale);
    const cloudCount = Math.round((width < 640 ? 4 : 6) * intensityScale);
    const sparkleCount = Math.round((width < 640 ? 22 : 36) * intensityScale);

    const bubbles: Bubble[] = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 6 + Math.random() * 15,
      vy: -(0.35 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.3,
      wobblePhase: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.4,
    }));

    const clouds: CloudPuff[] = Array.from({ length: cloudCount }, (_, idx) => ({
      x: (idx / Math.max(1, cloudCount)) * (width + 260) - 130,
      y: 55 + Math.random() * (height * 0.4),
      scale: 0.75 + Math.random() * 0.9,
      speed: 0.14 + Math.random() * 0.22,
      alpha: 0.45 + Math.random() * 0.35,
    }));

    const sparkles: Sparkle[] = Array.from({ length: sparkleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.2 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.035,
    }));

    const ripples: TouchRipple[] = [];
    const pointer = { x: width * 0.5, y: height * 0.45, active: false, energy: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.energy = Math.min(1.5, pointer.energy + 0.16);
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.energy = 1.7;

      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 140,
        alpha: 0.7,
      });

      for (let i = 0; i < 4; i += 1) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.6;
        if (bubbles.length < 48) {
          bubbles.push({
            x: e.clientX + Math.cos(angle) * 14,
            y: e.clientY + Math.sin(angle) * 14,
            r: 5 + Math.random() * 10,
            vy: -(0.8 + Math.random() * 1.0),
            vx: Math.cos(angle) * 1.4,
            wobblePhase: Math.random() * Math.PI * 2,
            alpha: 0.8,
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

      for (const c of clouds) {
        drawCloud(c, pal.cloudColor);
        if (!prefersReduced) {
          c.x += c.speed * mult;
          if (c.x - 120 > width) {
            c.x = -140;
            c.y = 50 + Math.random() * (height * 0.4);
          }
        }
      }

      // DNA Double-Helix Wave Ribbons
      const waveCenterY = height * 0.58;
      const baseAmp = (width < 640 ? 24 : 36) * mult;
      const step = width < 640 ? 18 : 22;

      const strandA: { x: number; y: number }[] = [];
      const strandB: { x: number; y: number }[] = [];

      for (let x = -20; x <= width + 20; x += step) {
        const distToPointer = pointer.active
          ? Math.hypot(x - pointer.x, waveCenterY - pointer.y)
          : 9999;
        const influence = Math.max(0, 1 - distToPointer / 240) * (0.65 + pointer.energy * 0.5);
        const phase = x * 0.011 + time * 1.3;
        const amp = baseAmp * (1 + influence * 0.85);
        const yOffset = pointer.active ? (pointer.y - waveCenterY) * influence * 0.2 : 0;

        strandA.push({ x, y: waveCenterY + yOffset + Math.sin(phase) * amp });
        strandB.push({ x, y: waveCenterY + yOffset + Math.sin(phase + Math.PI) * amp });
      }

      ctx.lineWidth = 1.2;
      ctx.strokeStyle = pal.dnaRung;
      for (let i = 0; i < strandA.length; i += 2) {
        ctx.beginPath();
        ctx.moveTo(strandA[i].x, strandA[i].y);
        ctx.lineTo(strandB[i].x, strandB[i].y);
        ctx.stroke();
      }

      ctx.lineWidth = 2.2;
      ctx.strokeStyle = pal.dnaPrimary;
      ctx.beginPath();
      strandA.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();

      ctx.strokeStyle = pal.dnaSecondary;
      ctx.beginPath();
      strandB.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();

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

      for (let i = bubbles.length - 1; i >= 0; i -= 1) {
        const b = bubbles[i];
        if (!prefersReduced) {
          b.wobblePhase += 0.03;
          b.x += b.vx + Math.sin(b.wobblePhase) * 0.3;
          b.y += b.vy * mult;
          b.vx *= 0.97;

          if (pointer.active) {
            const dx = b.x - pointer.x;
            const dy = b.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 1 && dist < 120) {
              const push = ((120 - dist) / 120) * 1.0;
              b.vx += (dx / dist) * push * 0.42;
              b.y += (dy / dist) * push * 0.22;
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
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, Math.max(1.5, b.r * 0.22), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

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
        ctx.lineWidth = 2;
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

  const wallpaper = THEME_WALLPAPERS[theme];

  return (
    <>
      {wallpaper && (
        <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none no-print overflow-hidden">
          <img
            src={wallpaper.src}
            alt=""
            className="w-full h-full object-cover scale-105 transition-opacity duration-700"
          />
          <div className="absolute inset-0" style={{ background: wallpaper.overlay }} />
        </div>
      )}
      {backdropIntensity !== 'off' && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none no-print"
        />
      )}
    </>
  );
};
