import React, { useRef, useState, useEffect } from 'react';

/**
 * TiltCard: High-performance 3D mouse tilt component
 * Provides realistic physical tilt, perspective depth, and specular glow.
 */
export default function TiltCard({
  children,
  maxTilt = 12,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  className = '',
  style = {},
  onClick,
}) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Disable tilt for touch / reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchQuery = window.matchMedia('(pointer: coarse)');
    setPrefersReducedMotion(motionQuery.matches);
    setIsTouchDevice(touchQuery.matches);

    const motionHandler = (e) => setPrefersReducedMotion(e.matches);
    const touchHandler = (e) => setIsTouchDevice(e.matches);

    motionQuery.addEventListener('change', motionHandler);
    touchQuery.addEventListener('change', touchHandler);
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      touchQuery.removeEventListener('change', touchHandler);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const centerX = width / 2;
    const centerY = height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(`perspective(${perspective}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`);
    if (glare) {
      setGlarePosition({
        x: (x / width) * 100,
        y: (y / height) * 100,
        opacity: 0.15,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    if (glare) {
      setGlarePosition(prev => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      style={{
        transform: prefersReducedMotion ? 'none' : transformStyle,
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
      {glare && !prefersReducedMotion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.25) 0%, rgba(56, 189, 248, 0.1) 40%, transparent 80%)`,
            opacity: glarePosition.opacity,
            transition: isHovered ? 'opacity 0.2s ease' : 'opacity 0.5s ease',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
