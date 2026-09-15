import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * BackgroundEffects: Ambient Spatial Particle Mesh
 * Adapts dynamically between:
 * - Golden & Obsidian Stardust (Dark Theme)
 * - Flame Orange & Warm Radiance (Light Theme)
 */
export default function BackgroundEffects() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Dynamic theme colors
    const primaryColor = isDark ? '#eab308' : '#ea580c';
    const secondaryColor = isDark ? '#f59e0b' : '#f97316';

    // Particle pool
    const particleCount = Math.min(38, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.5 + (isDark ? 0.25 : 0.18),
      color: Math.random() > 0.4 ? primaryColor : secondaryColor,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Move and render particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with subtle filament lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = primaryColor;
            ctx.globalAlpha = (1 - dist / 120) * (isDark ? 0.14 : 0.09);
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: isDark ? 0.8 : 0.6,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}
