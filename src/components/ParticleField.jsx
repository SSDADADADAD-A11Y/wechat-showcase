import { useEffect, useRef } from 'react';
import './ParticleField.css';

export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(max-width: 768px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.3 : 1.75);

    let width = 0;
    let height = 0;
    let particles = [];
    let streaks = [];
    let rafId = 0;
    let lastTime = performance.now();
    let running = true;

    const PALETTE = [
      [247, 224, 160],
      [216, 180, 106],
      [255, 240, 205],
      [217, 59, 48],
      [87, 183, 150],
    ];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = coarse ? 9800 : 6200;
      const count = Math.min(coarse ? 76 : 178, Math.round((width * height) / density));
      const streakCount = coarse ? 4 : 9;
      particles = new Array(count).fill(0).map(() => spawnParticle(true));
      streaks = new Array(streakCount).fill(0).map(() => spawnStreak(true));
    }

    function pickTone() {
      const roll = Math.random();
      if (roll > 0.94) return PALETTE[3];
      if (roll > 0.88) return PALETTE[4];
      return PALETTE[(Math.random() * 3) | 0];
    }

    function spawnParticle(initial) {
      const depth = 0.45 + Math.random() * 1.55;
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 28,
        z: depth,
        r: (0.45 + Math.random() * (coarse ? 1.7 : 2.7)) * depth,
        vy: (8 + Math.random() * 24) * depth,
        vx: (-4 + Math.random() * 8) * depth,
        sway: 0.4 + Math.random() * 1.4,
        swaySpeed: 0.35 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: (0.12 + Math.random() * 0.46) * Math.min(1, depth),
        twinkle: 0.45 + Math.random() * 1.9,
        tone: pickTone(),
        glow: Math.random() < 0.32,
        diamond: Math.random() < 0.16,
      };
    }

    function spawnStreak(initial) {
      return {
        x: initial ? Math.random() * width : -160 - Math.random() * 240,
        y: Math.random() * height * 0.84,
        length: 80 + Math.random() * (coarse ? 90 : 190),
        speed: 18 + Math.random() * 45,
        alpha: 0.05 + Math.random() * 0.12,
        tone: pickTone(),
      };
    }

    function drawParticle(p, x, y, alpha) {
      const [cr, cg, cb] = p.tone;
      if (p.glow) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.r * 7);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.42})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, p.r * 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, alpha)})`;
      ctx.beginPath();
      if (p.diamond) {
        ctx.moveTo(x, y - p.r * 1.8);
        ctx.lineTo(x + p.r * 1.2, y);
        ctx.lineTo(x, y + p.r * 1.8);
        ctx.lineTo(x - p.r * 1.2, y);
        ctx.closePath();
      } else {
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    function draw(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const s of streaks) {
        s.x += s.speed * dt;
        if (s.x - s.length > width + 120) Object.assign(s, spawnStreak(false));
        const [cr, cg, cb] = s.tone;
        const gradient = ctx.createLinearGradient(s.x, s.y, s.x + s.length, s.y - s.length * 0.28);
        gradient.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        gradient.addColorStop(0.5, `rgba(${cr},${cg},${cb},${s.alpha})`);
        gradient.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = coarse ? 0.6 : 0.9;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y - s.length * 0.28);
        ctx.stroke();
      }

      for (const p of particles) {
        p.y -= p.vy * dt;
        p.x += p.vx * dt;
        p.phase += p.swaySpeed * dt;
        const x = p.x + Math.sin(p.phase) * p.sway * 16;
        const alpha = p.baseAlpha * (0.58 + 0.42 * Math.sin(now * 0.001 * p.twinkle + p.phase));

        if (p.y < -32 || p.x < -60 || p.x > width + 60) Object.assign(p, spawnParticle(false), { x: Math.random() * width });
        drawParticle(p, x, p.y, alpha);
      }

      ctx.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(draw);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((p) => drawParticle(p, p.x, p.y, p.baseAlpha));
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
