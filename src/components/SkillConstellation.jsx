import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * SkillConstellation: Interactive Neural Skill Network
 * Adapts dynamically between:
 * - Golden & Obsidian Black (Dark Theme)
 * - Flame Orange & Crisp White (Light Theme)
 */
export default function SkillConstellation({ skills = [], height = 300, onSkillClick }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const { isDark } = useTheme();

  const normalizedInputSkills = (skills || []).map(s => {
    if (typeof s === 'string') return { name: s, level: 'Intermediate' };
    return { name: s?.name || 'Skill', level: s?.level || 'Intermediate' };
  });

  const displaySkills = normalizedInputSkills.length > 0 ? normalizedInputSkills : [
    { name: 'Python', level: 'Advanced' },
    { name: 'React', level: 'Advanced' },
    { name: 'Machine Learning', level: 'Intermediate' },
    { name: 'SQL', level: 'Intermediate' },
    { name: 'Cloud Computing', level: 'Beginner' },
    { name: 'Data Structures', level: 'Advanced' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.parentElement.clientWidth || 500;
    let heightPx = height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      canvas.width = width * dpr;
      canvas.height = heightPx * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${heightPx}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const total = displaySkills.length;
    const centerX = width / 2;
    const centerY = heightPx / 2;
    const radius = Math.min(width, heightPx) * 0.36;

    const primaryColor = isDark ? '#eab308' : '#ea580c';
    const intermediateColor = isDark ? '#f59e0b' : '#f97316';
    const advancedColor = isDark ? '#10b981' : '#15803d';
    const beginnerColor = isDark ? '#facc15' : '#d97706';

    const nodes = displaySkills.map((s, index) => {
      const angle = (index / total) * (Math.PI * 2) - Math.PI / 2;
      const jitter = (index % 2 === 0 ? 1 : 0.82) * radius;
      const x = centerX + Math.cos(angle) * jitter;
      const y = centerY + Math.sin(angle) * jitter;

      const levelColor = s.level === 'Advanced' ? advancedColor : s.level === 'Intermediate' ? intermediateColor : beginnerColor;

      return {
        ...s,
        id: index,
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: s.level === 'Advanced' ? 14 : s.level === 'Intermediate' ? 12 : 10,
        color: levelColor,
      };
    });

    let mouseX = -1000;
    let mouseY = -1000;

    const checkHover = (x, y) => {
      let found = null;
      nodes.forEach(n => {
        const dist = Math.hypot(n.x - x, n.y - y);
        if (dist <= n.radius + 14) {
          found = n;
        }
      });
      setHoveredNode(found);
      if (found && onSkillClick) {
        onSkillClick(found);
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      checkHover(mouseX, mouseY);
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      setHoveredNode(null);
    };

    const handleTouch = (e) => {
      if (e.touches && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        checkHover(touchX, touchY);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchstart', handleTouch, { passive: true });
    canvas.addEventListener('touchmove', handleTouch, { passive: true });

    let tick = 0;

    const render = () => {
      tick += 0.02;
      ctx.clearRect(0, 0, width, heightPx);

      nodes.forEach((n, idx) => {
        n.x = n.baseX + Math.sin(tick + idx) * 3;
        n.y = n.baseY + Math.cos(tick + idx * 0.8) * 3;
      });

      // Draw Connection Filaments Between Related Nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

          if (dist < 230) {
            const opacity = Math.max(0.08, 0.4 - dist / 350);
            ctx.beginPath();
            ctx.strokeStyle = isDark ? `rgba(234, 179, 8, ${opacity})` : `rgba(234, 88, 12, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();

            const progress = (tick * 0.4 + (i + j) * 0.2) % 1;
            const px = n1.x + (n2.x - n1.x) * progress;
            const py = n1.y + (n2.y - n1.y) * progress;

            ctx.beginPath();
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(234, 88, 12, 0.9)';
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Center Neural Core
      ctx.beginPath();
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
      coreGradient.addColorStop(0, isDark ? 'rgba(234, 179, 8, 0.25)' : 'rgba(234, 88, 12, 0.25)');
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGradient;
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = primaryColor;
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Render Nodes
      nodes.forEach((n) => {
        const isHover = hoveredNode && hoveredNode.id === n.id;

        ctx.beginPath();
        ctx.fillStyle = isHover
          ? (isDark ? 'rgba(234, 179, 8, 0.35)' : 'rgba(234, 88, 12, 0.35)')
          : (isDark ? 'rgba(234, 179, 8, 0.1)' : 'rgba(234, 88, 12, 0.1)');
        ctx.arc(n.x, n.y, n.radius + (isHover ? 8 : 4), 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = isDark ? '#060709' : '#ffffff';
        ctx.strokeStyle = n.color;
        ctx.lineWidth = isHover ? 2.5 : 1.8;
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = n.color;
        ctx.arc(n.x, n.y, isHover ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Skill Name
        ctx.fillStyle = isHover ? primaryColor : (isDark ? '#f8fafc' : '#1c1917');
        ctx.font = `${isHover ? 'bold 11px' : '600 10.5px'} var(--font-heading, sans-serif)`;
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y + n.radius + 13);

        // Level subtext
        ctx.fillStyle = isDark ? 'rgba(161, 161, 170, 0.85)' : 'rgba(120, 113, 108, 0.9)';
        ctx.font = '8.5px sans-serif';
        ctx.fillText(n.level, n.x, n.y + n.radius + 23);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, [displaySkills, height, isDark, onSkillClick]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      height: `${height}px`,
      backgroundColor: 'var(--bg-glass)',
      borderRadius: 'var(--border-radius)',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '12px',
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        maxWidth: '75%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></span>
        Skill Network ({displaySkills.length} Nodes)
      </div>

      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '12px',
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        backgroundColor: 'var(--bg-glass)',
        padding: '3px 8px',
        borderRadius: '9999px',
        border: '1px solid var(--border-color)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isDark ? '#10b981' : '#15803d' }}></span> Advanced
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isDark ? '#f59e0b' : '#f97316' }}></span> Intermediate
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isDark ? '#facc15' : '#d97706' }}></span> Beginner
        </span>
      </div>
    </div>
  );
}
