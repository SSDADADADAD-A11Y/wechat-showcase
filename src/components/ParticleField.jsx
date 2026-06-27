import { useEffect, useRef } from 'react';
import './ParticleField.css';

/**
 * 墨夜流金 — drifting gold motes rendered on a single fixed canvas.
 * Performance-minded: capped particle count, DPR-clamped, pauses when the tab
 * is hidden, and renders a single static frame when reduced motion is preferred.
 */
export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(max-width: 768px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    let width = 0;
    let height = 0;
    let particles = [];
    let rafId = 0;
    let lastTime = performance.now();
    let running = true;

    const GOLD = [
      [247, 224, 160],
      [216, 180, 106],
      [255, 240, 205],
    ];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = coarse ? 19000 : 13000;
      const count = Math.min(coarse ? 34 : 78, Math.round((width * height) / density));
      particles = new Array(count).fill(0).map(() => spawn(true));
    }

    function spawn(initial) {
      const tone = GOLD[(Math.random() * GOLD.length) | 0];
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 20,
        r: 0.6 + Math.random() * (coarse ? 1.8 : 2.4),
        vy: 6 + Math.random() * 18, // px per second, upward
        sway: 0.3 + Math.random() * 0.9,
        swaySpeed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 0.18 + Math.random() * 0.5,
        twinkle: 0.5 + Math.random() * 1.6,
        tone,
        glow: Math.random() < 0.22,
      };
    }

    function draw(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        p.y -= p.vy * dt;
        p.phase += p.swaySpeed * dt;
        const x = p.x + Math.sin(p.phase) * p.sway * 14;
        const alpha = p.baseAlpha * (0.65 + 0.35 * Math.sin(now * 0.001 * p.twinkle + p.phase));

        if (p.y < -20) Object.assign(p, spawn(false), { x: Math.random() * width });

        const [cr, cg, cb] = p.tone;
        if (p.glow) {
          const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r * 6);
          g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.5})`);
          g.addColorStop(1, 'rgba(216,180,106,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, p.y, p.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, alpha)})`;
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(draw);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        const [cr, cg, cb] = p.tone;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${p.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function handleVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!reduceMotion) {
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    }

    let resizeTimer = 0;
    function handleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduceMotion) drawStatic();
      }, 180);
    }

    resize();
    if (reduceMotion) {
      drawStatic();
    } else {
      rafId = requestAnimationFrame(draw);
    }
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
