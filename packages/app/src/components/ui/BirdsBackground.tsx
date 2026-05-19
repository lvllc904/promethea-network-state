'use client';

import React, { useEffect, useRef } from 'react';

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  depth: number; // 0 to 1 for depth simulation
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

    // Initialize Boids
    const BOID_COUNT = 120;
    const boids: Boid[] = [];
    
    // Harmonious cyber-palette colors
    const colors = [
      'rgba(0, 0, 0, ',
      'rgba(0, 0, 0, ',
      'rgba(0, 0, 0, ',
      'rgba(0, 0, 0, '
    ];

    for (let i = 0; i < BOID_COUNT; i++) {
      const depth = Math.random(); // 0 (far) to 1 (near)
      boids.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 2 + depth * 3.5, // Far boids are smaller
        color: colors[Math.floor(Math.random() * colors.length)],
        depth
      });
    }

    // Boids simulation rules
    const minDistance = 25;      // Separation
    const avoidMouseDistance = 120; // Mouse repulsion
    const maxSpeed = 2.5;

    let animationFrameId: number;

    const update = () => {
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.22)' : 'rgba(244, 244, 245, 0.22)'; // Semi-transparent for gorgeous light trails
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

        // Boid-to-Boid interactions
        for (let j = 0; j < boids.length; j++) {
          if (i === j) continue;
          const b2 = boids[j];

          const dx = b1.x - b2.x;
          const dy = b1.y - b2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            // Alignment
            avgVx += b2.vx;
            avgVy += b2.vy;

            // Cohesion
            avgX += b2.x;
            avgY += b2.y;

            neighborsCount++;

            // Separation
            if (dist < minDistance) {
              closeDx += dx;
              closeDy += dy;
            }
          }
        }

        // Apply rules
        if (neighborsCount > 0) {
          avgVx /= neighborsCount;
          avgVy /= neighborsCount;
          avgX /= neighborsCount;
          avgY /= neighborsCount;

          // Gentle pull to alignment and cohesion
          b1.vx += (avgVx - b1.vx) * 0.02;
          b1.vy += (avgVy - b1.vy) * 0.02;
          
          b1.vx += (avgX - b1.x) * 0.0005;
          b1.vy += (avgY - b1.y) * 0.0005;
        }

        // Apply separation
        b1.vx += closeDx * 0.015;
        b1.vy += closeDy * 0.015;

        // Mouse influence
        if (mouse.active) {
          const mDx = b1.x - mouse.x;
          const mDy = b1.y - mouse.y;
          const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

          if (mDist < avoidMouseDistance) {
            // Scatter from mouse
            const force = (avoidMouseDistance - mDist) / avoidMouseDistance;
            b1.vx += (mDx / mDist) * force * 0.18 * (b1.depth * 0.8 + 0.2);
            b1.vy += (mDy / mDist) * force * 0.18 * (b1.depth * 0.8 + 0.2);
          } else if (mDist < 400) {
            // Gentle attraction to mouse presence
            b1.vx -= (mDx / mDist) * 0.003;
            b1.vy -= (mDy / mDist) * 0.003;
          }
        }

        // Wander slightly
        b1.vx += (Math.random() - 0.5) * 0.1;
        b1.vy += (Math.random() - 0.5) * 0.1;

        // Limit speed based on depth
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

        // Draw Boid (Sleek glowing triangles pointing in velocity direction)
        const angle = Math.atan2(b1.vy, b1.vx);
        ctx.save();
        ctx.translate(b1.x, b1.y);
        ctx.rotate(angle);

        // Alpha based on depth
        const alpha = (b1.depth * 0.55 + 0.25).toFixed(2);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        
        // Add thin vector outline so black boids are visible in dark mode
        if (isDark) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(b1.depth * 0.4 + 0.25).toFixed(2)})`;
          ctx.lineWidth = 1;
          
          if (b1.depth > 0.6) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.strokeStyle = `rgba(0, 0, 0, ${(b1.depth * 0.15).toFixed(2)})`;
          ctx.lineWidth = 0.5;
          ctx.shadowBlur = 0;
        }

        // Render sleek delta wing arrow
        ctx.beginPath();
        ctx.moveTo(b1.size * 2, 0); // Nose
        ctx.lineTo(-b1.size, -b1.size * 0.8); // Left wing
        ctx.lineTo(-b1.size * 0.4, 0); // Center tail
        ctx.lineTo(-b1.size, b1.size * 0.8); // Right wing
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
      className="fixed inset-0 z-0 bg-background blur-[3.5px] scale-[1.01] pointer-events-none transition-colors duration-300"
      style={{ display: 'block' }}
    />
  );
}
