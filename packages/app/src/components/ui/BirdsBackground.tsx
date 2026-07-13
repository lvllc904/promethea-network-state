'use client';

import React, { useEffect, useRef } from 'react';

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  depth: number; // 0 to 1 for depth simulation
  flockId: number; // Split boids into distinct coordinating flocks
}

export default function BirdsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    // Advanced Flock Configuration: 400 micro-boids across 4 flocks
    const BOID_COUNT = 400;
    const FLOCK_COUNT = 4;
    const boids: Boid[] = [];
    
    for (let i = 0; i < BOID_COUNT; i++) {
      const depth = Math.random(); // 0 (far) to 1 (near)
      const flockId = Math.floor(Math.random() * FLOCK_COUNT);
      boids.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        size: (0.8 + depth * 1.2) * 0.32, // 3-4x smaller base size for premium elegant vectors
        depth,
        flockId
      });
    }

    // Flocking rules
    const minDistance = 9;         // Close separation within flock
    const avoidMouseDistance = 110; // Mouse repulsion range
    const maxSpeed = 2.8;
    const startTime = Date.now();

    let animationFrameId: number;

    const update = () => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      const elapsed = Date.now() - startTime;

      // Clearance trails: parchment cream in LaTeX mode, pitch black in dark mode
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.22)' : 'rgba(253, 252, 247, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      for (let i = 0; i < boids.length; i++) {
        const b1 = boids[i];
        
        let avgVx = 0;
        let avgVy = 0;
        let avgX = 0;
        let avgY = 0;
        let neighborsCount = 0;

        let closeDx = 0;
        let closeDy = 0;

        // Boid-to-Boid interactions (Multi-Flock split mechanics)
        for (let j = 0; j < boids.length; j++) {
          if (i === j) continue;
          const b2 = boids[j];

          const dx = b1.x - b2.x;
          const dy = b1.y - b2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            // Cohesion & Alignment apply STRICTLY within same flock
            if (b1.flockId === b2.flockId) {
              avgVx += b2.vx;
              avgVy += b2.vy;

              avgX += b2.x;
              avgY += b2.y;

              neighborsCount++;
            }

            // Separation: standard within flock, wider and stronger between different flocks
            const sepDistance = b1.flockId === b2.flockId ? minDistance : minDistance * 1.8;
            if (dist < sepDistance) {
              const weight = b1.flockId === b2.flockId ? 1.0 : 1.6; // Push away harder from alien flocks
              closeDx += dx * weight;
              closeDy += dy * weight;
            }
          }
        }

        // Apply rules
        if (neighborsCount > 0) {
          avgVx /= neighborsCount;
          avgVy /= neighborsCount;
          avgX /= neighborsCount;
          avgY /= neighborsCount;

          // Gentle pull to alignment and cohesion within flock
          b1.vx += (avgVx - b1.vx) * 0.025;
          b1.vy += (avgVy - b1.vy) * 0.025;
          
          b1.vx += (avgX - b1.x) * 0.0006;
          b1.vy += (avgY - b1.y) * 0.0006;
        }

        // Apply separation
        b1.vx += closeDx * 0.018;
        b1.vy += closeDy * 0.018;

        // Mouse influence
        if (mouse.active) {
          const mDx = b1.x - mouse.x;
          const mDy = b1.y - mouse.y;
          const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

          if (mDist < avoidMouseDistance) {
            // Scatter from mouse presence
            const force = (avoidMouseDistance - mDist) / avoidMouseDistance;
            b1.vx += (mDx / mDist) * force * 0.22 * (b1.depth * 0.8 + 0.2);
            b1.vy += (mDy / mDist) * force * 0.22 * (b1.depth * 0.8 + 0.2);
          } else if (mDist < 350) {
            // Gentle attraction back to mouse sector
            b1.vx -= (mDx / mDist) * 0.004;
            b1.vy -= (mDy / mDist) * 0.004;
          }
        }

        // Dynamic flock-wide cosmic currents (wind/drift oscillators)
        const windAngle = (elapsed * 0.0002) + (b1.flockId * Math.PI * 0.5);
        const windStrength = 0.07 * (Math.sin(elapsed * 0.0006 + b1.flockId) + 1.2);
        b1.vx += Math.cos(windAngle) * windStrength * 0.015;
        b1.vy += Math.sin(windAngle) * windStrength * 0.015;

        // Localized micro-turbulence/wander noise
        b1.vx += (Math.random() - 0.5) * 0.12;
        b1.vy += (Math.random() - 0.5) * 0.12;

        // Speed limiting
        const currentSpeed = Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy);
        const depthMaxSpeed = maxSpeed * (b1.depth * 0.6 + 0.4);
        if (currentSpeed > depthMaxSpeed) {
          b1.vx = (b1.vx / currentSpeed) * depthMaxSpeed;
          b1.vy = (b1.vy / currentSpeed) * depthMaxSpeed;
        }

        // Move
        b1.x += b1.vx;
        b1.y += b1.vy;

        // Screen boundaries wrapped smoothly
        if (b1.x < -20) b1.x = canvas.width + 20;
        if (b1.x > canvas.width + 20) b1.x = -20;
        if (b1.y < -20) b1.y = canvas.height + 20;
        if (b1.y > canvas.height + 20) b1.y = -20;

        // Draw Boid
        const angle = Math.atan2(b1.vy, b1.vx);
        ctx.save();
        ctx.translate(b1.x, b1.y);
        ctx.rotate(angle);

        // Alpha scaling for atmospheric depth
        const alpha = (b1.depth * 0.55 + 0.25).toFixed(2);
        let boidColor = '';
        
        if (isDark) {
          // Dynamic colors in dark mode matching active system colors
          if (b1.flockId === 0) boidColor = `rgba(245, 158, 11, ${alpha})`; // Cyan (Atlas)
          else if (b1.flockId === 1) boidColor = `rgba(245, 158, 11, ${alpha})`; // Amber (Economics)
          else if (b1.flockId === 2) boidColor = `rgba(245, 158, 11, ${alpha})`; // Emerald (Governance)
          else boidColor = `rgba(217, 70, 239, ${alpha})`; // Fuchsia (Narrative)
        } else {
          // Scholastic ink shades in LaTeX mode
          if (b1.flockId === 0) boidColor = `rgba(140, 29, 29, ${alpha})`; // Academic Crimson
          else boidColor = `rgba(26, 25, 22, ${alpha})`; // Warm Charcoal Ink
        }

        ctx.fillStyle = boidColor;
        
        // Outlines and shadow glows
        if (isDark) {
          let shadowColor = '';
          if (b1.flockId === 0) shadowColor = 'rgba(245, 158, 11, 0.4)';
          else if (b1.flockId === 1) shadowColor = 'rgba(245, 158, 11, 0.4)';
          else if (b1.flockId === 2) shadowColor = 'rgba(245, 158, 11, 0.4)';
          else shadowColor = 'rgba(217, 70, 239, 0.4)';

          ctx.strokeStyle = `rgba(255, 255, 255, ${(b1.depth * 0.2 + 0.1).toFixed(2)})`;
          ctx.lineWidth = 0.5;
          
          if (b1.depth > 0.6) {
            ctx.shadowBlur = 3;
            ctx.shadowColor = shadowColor;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.strokeStyle = `rgba(26, 25, 22, ${(b1.depth * 0.08).toFixed(2)})`;
          ctx.lineWidth = 0.3;
          ctx.shadowBlur = 0;
        }

        // Render delicate high-class vector delta-wing
        ctx.beginPath();
        ctx.moveTo(b1.size * 2, 0); // Nose
        ctx.lineTo(-b1.size, -b1.size * 0.85); // Left wing
        ctx.lineTo(-b1.size * 0.4, 0); // Center tail
        ctx.lineTo(-b1.size, b1.size * 0.85); // Right wing
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-background blur-[0.8px] scale-[1.01] pointer-events-none transition-colors duration-300"
      style={{ display: 'block' }}
    />
  );
}
