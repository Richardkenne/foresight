'use client';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#34d399', '#60a5fa', '#a78bfa'];

export function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const TOTAL = 38;
  const DURATION = 2200; // ms
  const startTime = performance.now();

  const particles: Particle[] = Array.from({ length: TOTAL }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 60,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 5 + Math.random() * 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    opacity: 1,
  }));

  function frame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / DURATION, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      // Apply gravity
      p.vy += 0.12;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // Fade out in the last third
      if (progress > 0.65) {
        p.opacity = Math.max(0, 1 - (progress - 0.65) / 0.35);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}
