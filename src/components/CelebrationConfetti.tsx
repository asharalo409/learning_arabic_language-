import React, { useEffect, useRef } from 'react';

interface CelebrationConfettiProps {
  active: boolean;
  onComplete?: () => void;
  durationMs?: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star';
  opacity: number;
}

const COLORS = [
  '#10b981', // Emerald
  '#f59e0b', // Amber/Gold
  '#0ea5e9', // Sky Blue
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#eab308', // Yellow
  '#14b8a6', // Teal
];

export const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({
  active,
  onComplete,
  durationMs = 4000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = Math.min(160, Math.max(90, Math.floor(w / 7)));

    const particles: ConfettiParticle[] = Array.from({ length: count }, (_, i) => {
      const burstFromCenter = i < count * 0.45;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 6 + Math.random() * 10;
      return {
        x: burstFromCenter ? w * (0.3 + Math.random() * 0.4) : Math.random() * w,
        y: burstFromCenter ? h * 0.45 : -20 - Math.random() * h * 0.35,
        vx: burstFromCenter ? Math.cos(angle) * speed : (Math.random() - 0.5) * 3.5,
        vy: burstFromCenter ? Math.sin(angle) * speed - 2 : 2.5 + Math.random() * 4,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        shape: i % 5 === 0 ? 'star' : i % 3 === 0 ? 'circle' : 'rect',
        opacity: 1,
      };
    });

    const startTime = performance.now();
    let rafId = 0;

    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerA = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerA = outerA + Math.PI / 5;
        ctx.lineTo(x + Math.cos(outerA) * r, y + Math.sin(outerA) * r);
        ctx.lineTo(x + Math.cos(innerA) * (r * 0.45), y + Math.sin(innerA) * (r * 0.45));
      }
      ctx.closePath();
      ctx.fill();
    };

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const fadeProgress = Math.max(0, (elapsed - durationMs * 0.68) / (durationMs * 0.32));

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let alive = 0;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // Gravity
        p.vx *= 0.99; // Air drag
        p.vx += Math.sin(elapsed * 0.005 + p.rotation) * 0.06; // Gentle flutter
        p.rotation += p.vRot;
        p.opacity = Math.max(0, 1 - fadeProgress);

        if (p.y < window.innerHeight + 40 && p.opacity > 0.01) {
          alive++;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'star') {
            drawStar(0, 0, p.size * 0.6);
          } else {
            ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
          }
          ctx.restore();
        }
      }

      if (elapsed < durationMs && alive > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        onComplete?.();
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [active, durationMs, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
};
