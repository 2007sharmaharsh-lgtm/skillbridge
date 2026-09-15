import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * HeroEcosystem3D: High-performance 3D Canvas Spatial Ecosystem
 * Dynamically styled for:
 * - Golden & Obsidian Black (Dark Theme)
 * - Flame Orange & Radiant White (Light Theme)
 */
export default function HeroEcosystem3D({ height = 460 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.parentElement?.clientWidth || 600;
    let heightPx = width < 500 ? Math.min(height, 300) : (width < 768 ? Math.min(height, 360) : height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      heightPx = width < 500 ? Math.min(height, 300) : (width < 768 ? Math.min(height, 360) : height);
      canvas.width = width * dpr;
      canvas.height = heightPx * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${heightPx}px`;
      if (containerRef.current) {
        containerRef.current.style.height = `${heightPx}px`;
      }
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Theme color palette
    const primaryHubColor = isDark ? '#eab308' : '#ea580c'; // Gold in dark, Orange in light
    const primaryHubGlow = isDark ? 'rgba(234, 179, 8, 0.7)' : 'rgba(234, 88, 12, 0.7)';
    const industryHubColor = isDark ? '#f59e0b' : '#d97706';
    const industryHubGlow = isDark ? 'rgba(245, 158, 11, 0.6)' : 'rgba(217, 119, 6, 0.6)';
    const oppsHubColor = isDark ? '#facc15' : '#f97316';
    const oppsHubGlow = isDark ? 'rgba(250, 204, 21, 0.6)' : 'rgba(249, 115, 22, 0.6)';
    const academiaHubColor = isDark ? '#10b981' : '#15803d';
    const academiaHubGlow = isDark ? 'rgba(16, 185, 129, 0.6)' : 'rgba(21, 128, 61, 0.6)';

    // 4 Main Pillars in 3D Space
    const majorNodes = [
      {
        id: 'academia',
        name: 'ACADEMIA',
        subtitle: 'Curriculum & Talent',
        color: academiaHubColor,
        glow: academiaHubGlow,
        x: -160,
        y: -70,
        z: 0,
        radius: 18,
        icon: '🎓',
      },
      {
        id: 'skills',
        name: 'AI SKILL MATRIX',
        subtitle: 'Verified Competency',
        color: primaryHubColor,
        glow: primaryHubGlow,
        x: 0,
        y: 80,
        z: 60,
        radius: 22,
        icon: '⚡',
      },
      {
        id: 'industry',
        name: 'INDUSTRY',
        subtitle: 'Enterprise Demand',
        color: industryHubColor,
        glow: industryHubGlow,
        x: 160,
        y: -70,
        z: 0,
        radius: 18,
        icon: '🏢',
      },
      {
        id: 'opportunities',
        name: 'CAREER GROWTH',
        subtitle: 'Internships & Hiring',
        color: oppsHubColor,
        glow: oppsHubGlow,
        x: 0,
        y: -130,
        z: -50,
        radius: 18,
        icon: '🚀',
      },
    ];

    // Satellite Skill Nodes orbiting the core
    const skillLabels = [
      'Python', 'Machine Learning', 'React.js', 'Cloud AWS',
      'Cybersecurity', 'Data Science', 'Deep Learning', 'System Design',
      'Docker / K8s', 'SQL Analytics', 'DevOps', 'TypeScript',
      'API Engineering', 'NLP / LLMs', 'Robotics'
    ];

    const satelliteNodes = skillLabels.map((label, index) => {
      const phi = Math.acos(-1 + (2 * index) / skillLabels.length);
      const theta = Math.sqrt(skillLabels.length * Math.PI) * phi;
      const sphereRadius = 140 + (index % 3) * 20;

      return {
        id: `sat-${index}`,
        label,
        baseX: sphereRadius * Math.cos(theta) * Math.sin(phi),
        baseY: sphereRadius * Math.sin(theta) * Math.sin(phi),
        baseZ: sphereRadius * Math.cos(phi),
        x: 0,
        y: 0,
        z: 0,
        color: index % 2 === 0 ? primaryHubColor : (isDark ? '#fbbf24' : '#f97316'),
        size: 3.5,
      };
    });

    // Dynamic Pulsing Energy Packets traveling along lines
    const packets = [
      { from: 0, to: 1, progress: 0.1, speed: 0.007, color: academiaHubColor },
      { from: 1, to: 2, progress: 0.4, speed: 0.008, color: primaryHubColor },
      { from: 2, to: 3, progress: 0.7, speed: 0.006, color: industryHubColor },
      { from: 3, to: 0, progress: 0.2, speed: 0.007, color: oppsHubColor },
      { from: 0, to: 2, progress: 0.5, speed: 0.005, color: primaryHubColor },
      { from: 1, to: 3, progress: 0.8, speed: 0.009, color: '#10b981' },
    ];

    // Rotation & Interaction state
    let angleX = 0.15;
    let angleY = 0;
    let targetAngleX = 0.15;
    let targetAngleY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (isDragging) {
        const deltaX = clientX - lastMouseX;
        const deltaY = clientY - lastMouseY;
        targetAngleY += deltaX * 0.008;
        targetAngleX += deltaY * 0.008;
        lastMouseX = clientX;
        lastMouseY = clientY;
      } else {
        const normX = (clientX - width / 2) / (width / 2);
        const normY = (clientY - heightPx / 2) / (heightPx / 2);
        targetAngleY += normX * 0.0015;
        targetAngleX += normY * 0.001;
      }
    };

    const handleMouseDown = (e) => {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      lastMouseX = e.clientX - rect.left;
      lastMouseY = e.clientY - rect.top;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Mobile Touch Drag Event Handlers
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        lastMouseX = e.touches[0].clientX - rect.left;
        lastMouseY = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches[0].clientX - rect.left;
      const clientY = e.touches[0].clientY - rect.top;
      const deltaX = clientX - lastMouseX;
      const deltaY = clientY - lastMouseY;
      targetAngleY += deltaX * 0.01;
      targetAngleX += deltaY * 0.01;
      lastMouseX = clientX;
      lastMouseY = clientY;
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // 3D Projection Math Helper
    const project = (x, y, z, rotX, rotY) => {
      let cosY = Math.cos(rotY);
      let sinY = Math.sin(rotY);
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;

      let cosX = Math.cos(rotX);
      let sinX = Math.sin(rotX);
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      const fov = 380;
      const cameraDistance = 420;
      const scale = fov / (cameraDistance + z2);

      return {
        screenX: width / 2 + x1 * scale,
        screenY: heightPx / 2 + y2 * scale,
        scale,
        depth: z2,
      };
    };

    const render = () => {
      if (!isDragging) {
        targetAngleY += 0.0035;
      }

      angleX += (targetAngleX - angleX) * 0.08;
      angleY += (targetAngleY - angleY) * 0.08;

      ctx.clearRect(0, 0, width, heightPx);

      // Responsive coordinate scale factor
      const scaleFactor = Math.min(1, Math.max(0.6, width / 620));

      // Draw Center Ambient Glow
      const centerGlow = ctx.createRadialGradient(
        width / 2, heightPx / 2, 10,
        width / 2, heightPx / 2, Math.min(180, width * 0.35)
      );
      centerGlow.addColorStop(0, isDark ? 'rgba(234, 179, 8, 0.16)' : 'rgba(234, 88, 12, 0.14)');
      centerGlow.addColorStop(0.5, isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(249, 115, 22, 0.06)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(width / 2, heightPx / 2, Math.min(180, width * 0.35), 0, Math.PI * 2);
      ctx.fill();

      // Project Major Nodes (scaled for viewport)
      const projectedMajors = majorNodes.map((node) => {
        const p = project(node.x * scaleFactor, node.y * scaleFactor, node.z * scaleFactor, angleX, angleY);
        return { ...node, ...p, radius: Math.round(node.radius * Math.max(0.8, scaleFactor)) };
      });

      // Project Satellite Nodes (scaled for viewport)
      const projectedSatellites = satelliteNodes.map((sat) => {
        const p = project(sat.baseX * scaleFactor, sat.baseY * scaleFactor, sat.baseZ * scaleFactor, angleX, angleY);
        return { ...sat, ...p };
      });

      // Draw Constellation Lines between Major Nodes
      for (let i = 0; i < projectedMajors.length; i++) {
        for (let j = i + 1; j < projectedMajors.length; j++) {
          const n1 = projectedMajors[i];
          const n2 = projectedMajors[j];

          const lineGradient = ctx.createLinearGradient(n1.screenX, n1.screenY, n2.screenX, n2.screenY);
          lineGradient.addColorStop(0, n1.color + '88');
          lineGradient.addColorStop(1, n2.color + '88');

          ctx.beginPath();
          ctx.strokeStyle = lineGradient;
          ctx.lineWidth = 1.6 * Math.min(n1.scale, n2.scale);
          ctx.setLineDash([4, 4]);
          ctx.moveTo(n1.screenX, n1.screenY);
          ctx.lineTo(n2.screenX, n2.screenY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw Lines to Closest Satellite Nodes
      projectedSatellites.forEach((sat, i) => {
        const parentMajor = projectedMajors[i % projectedMajors.length];
        const dist = Math.hypot(sat.screenX - parentMajor.screenX, sat.screenY - parentMajor.screenY);

        if (dist < 180 * scaleFactor) {
          ctx.beginPath();
          ctx.strokeStyle = isDark
            ? `rgba(234, 179, 8, ${Math.max(0.06, 0.28 - dist / 800)})`
            : `rgba(234, 88, 12, ${Math.max(0.06, 0.28 - dist / 800)})`;
          ctx.lineWidth = 0.8 * sat.scale;
          ctx.moveTo(sat.screenX, sat.screenY);
          ctx.lineTo(parentMajor.screenX, parentMajor.screenY);
          ctx.stroke();
        }
      });

      // Update & Draw Flowing Energy Packets
      packets.forEach((pkt) => {
        pkt.progress = (pkt.progress + pkt.speed) % 1;
        const start = projectedMajors[pkt.from];
        const end = projectedMajors[pkt.to];

        const px = start.screenX + (end.screenX - start.screenX) * pkt.progress;
        const py = start.screenY + (end.screenY - start.screenY) * pkt.progress;
        const pScale = start.scale + (end.scale - start.scale) * pkt.progress;

        ctx.beginPath();
        ctx.fillStyle = isDark ? '#ffffff' : '#ea580c';
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 12;
        ctx.arc(px, py, 3.5 * pScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Combine All Nodes for Depth-Sorting
      const allRenderables = [
        ...projectedSatellites.map(s => ({ ...s, type: 'sat' })),
        ...projectedMajors.map(m => ({ ...m, type: 'major' })),
      ];

      allRenderables.sort((a, b) => b.depth - a.depth);

      // Render nodes sorted by depth
      allRenderables.forEach((item) => {
        if (item.type === 'sat') {
          const alpha = Math.max(0.25, Math.min(1, (item.depth + 180) / 360));
          ctx.beginPath();
          ctx.fillStyle = item.color;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 6;
          ctx.arc(item.screenX, item.screenY, item.size * item.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          if (item.scale > 0.85 && width > 420) {
            ctx.fillStyle = isDark ? `rgba(212, 212, 216, ${alpha * 0.85})` : `rgba(68, 64, 60, ${alpha * 0.9})`;
            ctx.font = `${Math.round(9 * item.scale)}px var(--font-family, sans-serif)`;
            ctx.textAlign = 'center';
            ctx.fillText(item.label, item.screenX, item.screenY - 8 * item.scale);
          }
        } else if (item.type === 'major') {
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 18;

          ctx.beginPath();
          ctx.fillStyle = item.glow;
          ctx.arc(item.screenX, item.screenY, (item.radius + 6) * item.scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = isDark ? '#060709' : '#ffffff';
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2.5 * item.scale;
          ctx.arc(item.screenX, item.screenY, item.radius * item.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0;

          // Node Icon
          ctx.fillStyle = isDark ? '#ffffff' : '#0c0a09';
          ctx.font = `${Math.round(14 * item.scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.icon, item.screenX, item.screenY);

          // Node Titles
          ctx.textBaseline = 'alphabetic';
          ctx.fillStyle = isDark ? '#ffffff' : '#1c1917';
          ctx.font = `bold ${Math.round((width < 480 ? 9.5 : 11) * item.scale)}px Outfit, sans-serif`;
          ctx.fillText(item.name, item.screenX, item.screenY + (item.radius + 14) * item.scale);

          ctx.fillStyle = isDark ? 'rgba(161, 161, 170, 0.95)' : 'rgba(87, 83, 78, 0.95)';
          ctx.font = `${Math.round((width < 480 ? 7.5 : 8.5) * item.scale)}px sans-serif`;
          ctx.fillText(item.subtitle, item.screenX, item.screenY + (item.radius + 25) * item.scale);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [height, isDark]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: `${height}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        touchAction: 'none',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          filter: isDark
            ? 'drop-shadow(0 0 35px rgba(234, 179, 8, 0.2))'
            : 'drop-shadow(0 0 35px rgba(234, 88, 12, 0.2))',
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: '8px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'var(--bg-glass)',
        padding: '4px 12px',
        borderRadius: '9999px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        maxWidth: '92%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        <span style={{ color: 'var(--primary)' }}>●</span> 3D Interactive Ecosystem • Drag / Touch to Rotate
      </div>
    </div>
  );
}
