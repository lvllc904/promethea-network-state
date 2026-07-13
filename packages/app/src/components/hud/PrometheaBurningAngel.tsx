'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface PrometheaBurningAngelProps {
  isBurning: boolean;
  onComplete?: () => void;
  theme?: 'dark' | 'theme-latex';
}

export const PrometheaBurningAngel: React.FC<PrometheaBurningAngelProps> = ({
  isBurning,
  onComplete,
  theme = 'dark'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Keep track of the burning progress timeline
  const burnProgressRef = useRef<number>(0);
  const hasTriggeredComplete = useRef<boolean>(false);
  
  // Mouse state for interactive physics
  const mouseRef = useRef<{ x: number; y: number; prevX: number; prevY: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false;

    const isLatex = theme === 'theme-latex';

    // 2. Custom GLSL Shader for the Burning Paper Plane
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uProgress;
      uniform float uEdgeWidth;
      uniform vec3 uPaperColor;
      uniform vec3 uLineColor;
      uniform float uTime;
      varying vec2 vUv;

      // Classic 2D Simplex Noise
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx) ;
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0 ;
        vec3 h = abs(x) - 0.5 ;
        vec3 a0 = x - floor(x + 0.5);
        vec3 g = a0 * vec3(x0.x, x12.x, x12.z) + h * vec3(x0.y, x12.y, x12.w);
        vec3 t = 12.0 * m * g;
        return 0.5 + 0.5 * dot(t, vec3(70.0));
      }

      void main() {
        // Calculate centered distance for radial burn out
        float dist = distance(vUv, vec2(0.5, 0.5));
        
        // Feed in noise and time coordinates
        float n = snoise(vUv * 3.8 + vec2(sin(uTime * 0.1), cos(uTime * 0.15)) * 0.1);
        
        // Combine noise and distance to start the burn in the center
        float burnVal = n * 0.28 + dist * 0.88;
        
        // Define burning target scaling
        float targetProgress = uProgress * 1.35;

        if (burnVal < targetProgress) {
          discard; // Fully burned away
        }

        // Draw the hot, active glowing ash line
        if (burnVal < targetProgress + uEdgeWidth) {
          float edgeFactor = 1.0 - (burnVal - targetProgress) / uEdgeWidth;
          
          // Animate fire color from hot golden yellow to burning red
          vec3 fireColor = mix(vec3(1.0, 0.72, 0.1), vec3(0.92, 0.22, 0.05), 1.0 - edgeFactor);
          
          // Boost brightness intensely for HDR/bloom feeling
          fireColor *= 4.5;
          
          gl_FragColor = vec4(fireColor, 1.0);
          return;
        }

        // Base Paper rendering
        vec3 col = uPaperColor;
        
        // Subtle grid patterns representing the page context
        float gridX = step(0.985, fract(vUv.x * 32.0));
        float gridY = step(0.985, fract(vUv.y * 32.0));
        float grid = max(gridX, gridY);
        
        col = mix(col, uLineColor, grid * 0.08);

        // Add vintage vignette / depth shadows
        float vignette = 1.0 - smoothstep(0.4, 0.75, dist);
        col *= mix(0.72, 1.0, vignette);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // 3. Setup Paper Material & Plane Geometry
    const paperColor = isLatex 
      ? new THREE.Color('#fdfcf7') // Warm cream
      : new THREE.Color('#0a0908'); // Charcoal / Citadel dark sienna
      
    const lineColor = isLatex 
      ? new THREE.Color('#8c1d1d') // Academic crimson grid lines
      : new THREE.Color('#f59e0b'); // Amber grid lines

    const planeMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uEdgeWidth: { value: 0.06 },
        uPaperColor: { value: paperColor },
        uLineColor: { value: lineColor },
        uTime: { value: 0.0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    const planeGeo = new THREE.PlaneGeometry(8, 6, 1, 1);
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(planeMesh);

    // 4. Procedural 3D Angel Lines Geometry (The Skeleton of Promethea)
    const angelGroup = new THREE.Group();
    scene.add(angelGroup);

    // Dynamic color matching
    const angelColor = isLatex ? 0x1c1917 : 0xf59e0b; // Charcoal vs Glowing Amber
    const lineMat = new THREE.LineBasicMaterial({
      color: angelColor,
      transparent: true,
      opacity: 0.0,
      linewidth: 1.5
    });

    interface WingPathInfo {
      points: THREE.Vector3[];
      originalPoints: THREE.Vector3[];
      lineObj: THREE.Line;
    }

    const angelLines: WingPathInfo[] = [];

    // Helper to generate bezier curves representing feathers, robes, and halo
    const addPath = (curvePoints: THREE.Vector3[]) => {
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMat);
      angelGroup.add(line);
      angelLines.push({
        points,
        originalPoints: points.map(p => p.clone()),
        lineObj: line
      });
    };

    // Construct the Head/Halo
    const haloPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 36; i++) {
      const theta = (i / 18) * Math.PI;
      haloPoints.push(new THREE.Vector3(Math.cos(theta) * 0.4, 1.25 + Math.sin(theta) * 0.4, 0));
    }
    addPath(haloPoints);

    // Construct Wings Left (Multiple Feathers)
    for (let j = 0; j < 8; j++) {
      const spread = j * 0.18;
      const wingLeft = [
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(-1.2 - spread, 1.6 + spread * 0.5, -0.2),
        new THREE.Vector3(-2.8 - spread * 0.8, 0.4 - spread * 0.8, -0.4),
        new THREE.Vector3(-1.0, -0.4, 0)
      ];
      addPath(wingLeft);
    }

    // Construct Wings Right (Multiple Feathers)
    for (let j = 0; j < 8; j++) {
      const spread = j * 0.18;
      const wingRight = [
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(1.2 + spread, 1.6 + spread * 0.5, -0.2),
        new THREE.Vector3(2.8 + spread * 0.8, 0.4 - spread * 0.8, -0.4),
        new THREE.Vector3(1.0, -0.4, 0)
      ];
      addPath(wingRight);
    }

    // Flowing Robes curves
    for (let k = 0; k < 6; k++) {
      const offset = (k - 2.5) * 0.12;
      const robePoints = [
        new THREE.Vector3(0, 0.4, 0),
        new THREE.Vector3(offset * 0.8, -0.6, -0.1),
        new THREE.Vector3(offset * 2.2 + Math.sin(k) * 0.2, -1.8, -0.3),
        new THREE.Vector3(offset * 3.5, -2.8, -0.1)
      ];
      addPath(robePoints);
    }

    // 5. 3D Curl-Noise Smoke Particle Engine Setup
    const smokeCount = 1200;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeColors = new Float32Array(smokeCount * 3);
    const smokeSizes = new Float32Array(smokeCount);

    // Initialize all particles off-screen / inactive
    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = 999;
      smokePositions[i * 3 + 1] = 999;
      smokePositions[i * 3 + 2] = 0;

      smokeColors[i * 3] = 1.0;
      smokeColors[i * 3 + 1] = 0.5;
      smokeColors[i * 3 + 2] = 0.1;

      smokeSizes[i] = 0.0;
    }

    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeGeo.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));
    smokeGeo.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));

    // Custom shader material for embers to avoid importing raw images, keeping WebGL fast and clean
    const particleVertexShader = `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const particleFragmentShader = `
      varying vec3 vColor;
      void main() {
        // Draw a smooth, feathered round circle dot
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, dist);
        gl_FragColor = vec4(vColor, alpha * 0.85);
      }
    `;

    const particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: isLatex ? THREE.NormalBlending : THREE.AdditiveBlending
    });

    const smokeParticles = new THREE.Points(smokeGeo, particleMat);
    scene.add(smokeParticles);

    // Particle pool trackers
    interface SmokeParticleTracker {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      age: number;
      maxLife: number;
      size: number;
      alpha: number;
      active: boolean;
    }

    const smokeArray: SmokeParticleTracker[] = Array.from({ length: smokeCount }, () => ({
      x: 999,
      y: 999,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      age: 0,
      maxLife: 0,
      size: 0,
      alpha: 0,
      active: false
    }));

    let nextParticleIndex = 0;

    const emitSmokeParticle = (x: number, y: number) => {
      const p = smokeArray[nextParticleIndex];
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 0.15;
      p.y = y + (Math.random() - 0.5) * 0.15;
      p.z = (Math.random() - 0.5) * 0.2;
      
      // Upward velocity and minimal random horizontal velocity
      p.vx = (Math.random() - 0.5) * 0.12;
      p.vy = 0.5 + Math.random() * 0.6;
      p.vz = (Math.random() - 0.5) * 0.05;

      p.age = 0;
      p.maxLife = 1.5 + Math.random() * 1.5;
      p.size = 0.12 + Math.random() * 0.18;
      p.alpha = 1.0;

      nextParticleIndex = (nextParticleIndex + 1) % smokeCount;
    };

    // 6. Handle Mouse Drag / Mouse Move interactions
    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const rawX = ((event.clientX - rect.left) / width) * 2 - 1;
      const rawY = -((event.clientY - rect.top) / height) * 2 + 1;

      // Project mouse into approximate WebGL scene plane coordinates
      const targetX = rawX * 4.5;
      const targetY = rawY * 3.3;

      const mouse = mouseRef.current;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = targetX;
      mouse.y = targetY;

      // Calculate instantaneous speed
      mouse.vx = mouse.x - mouse.prevX;
      mouse.vy = mouse.y - mouse.prevY;
    };

    // Click trigger acts as lighting a match!
    const handleClick = (event: MouseEvent) => {
      if (!isBurning) return;
      const rect = containerRef.current!.getBoundingClientRect();
      const rawX = ((event.clientX - rect.left) / width) * 2 - 1;
      const rawY = -((event.clientY - rect.top) / height) * 2 + 1;

      const pX = rawX * 4;
      const pY = rawY * 3;

      // Emit localized spark blast on click
      for (let i = 0; i < 35; i++) {
        emitSmokeParticle(pX, pY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    // 7. Core Animation Frame Loop
    const tick = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow down transition speed to give a beautiful volumetric burn
      if (isBurning) {
        burnProgressRef.current = Math.min(1.0, burnProgressRef.current + delta * 0.42);
        planeMat.uniforms.uProgress.value = burnProgressRef.current;
        
        if (burnProgressRef.current >= 0.99 && !hasTriggeredComplete.current) {
          hasTriggeredComplete.current = true;
          if (onComplete) onComplete();
        }
      }

      planeMat.uniforms.uTime.value = elapsed;

      // Calculate the burning edge line in 3D to emit smoke particles
      if (isBurning && burnProgressRef.current < 0.95) {
        // Emit smoke particles at the expanding elliptical boundary of destruction
        const edgeRadiusX = burnProgressRef.current * 4.2;
        const edgeRadiusY = burnProgressRef.current * 3.1;
        
        // Spawn 2 particles per frame along the charred border
        for (let s = 0; s < 2; s++) {
          const theta = Math.random() * Math.PI * 2;
          const borderX = Math.cos(theta) * edgeRadiusX;
          const borderY = Math.sin(theta) * edgeRadiusY;
          emitSmokeParticle(borderX, borderY);
        }
      }

      // Update Smoke Particles Positions & Physics (Fluid Curl Noise mimic)
      const positionsAttr = smokeGeo.getAttribute('position') as THREE.BufferAttribute;
      const colorsAttr = smokeGeo.getAttribute('color') as THREE.BufferAttribute;
      const sizesAttr = smokeGeo.getAttribute('size') as THREE.BufferAttribute;

      const pMouse = mouseRef.current;

      for (let i = 0; i < smokeCount; i++) {
        const p = smokeArray[i];
        if (!p.active) continue;

        p.age += delta;
        if (p.age >= p.maxLife) {
          p.active = false;
          positionsAttr.setXYZ(i, 999, 999, 0);
          sizesAttr.setX(i, 0);
          continue;
        }

        // Apply upward drift & Curl Noise-like swirls using trig oscillators
        const swirlyX = Math.sin(p.y * 1.5 + elapsed * 2.0) * 0.35 * delta;
        const swirlyZ = Math.cos(p.x * 1.2 - elapsed * 1.8) * 0.15 * delta;

        p.x += p.vx * delta + swirlyX;
        p.y += p.vy * delta;
        p.z += p.vz * delta + swirlyZ;

        // Apply wind physics under cursor (Mouse Interaction Easter Egg)
        const dx = p.x - pMouse.x;
        const dy = p.y - pMouse.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 1.6) {
          // Push particles away along cursor movement vector
          const pushForce = (1.6 - distToMouse) * 0.42;
          p.x += pMouse.vx * pushForce;
          p.y += pMouse.vy * pushForce;
        }

        // Fade size and color from fire-orange to ash-smoke to transparent
        const lifeRatio = p.age / p.maxLife;
        const currentSize = p.size * (1.0 - lifeRatio);
        p.alpha = 1.0 - lifeRatio;

        positionsAttr.setXYZ(i, p.x, p.y, p.z);
        sizesAttr.setX(i, currentSize);

        // Map particle colors
        if (isLatex) {
          // Scholarly LaTeX soot particles fade to light vintage paper-grey
          colorsAttr.setXYZ(i, 0.11 + lifeRatio * 0.6, 0.10 + lifeRatio * 0.6, 0.09 + lifeRatio * 0.6);
        } else {
          // Dark theme flames fade from gold-orange to charcoal
          if (lifeRatio < 0.4) {
            colorsAttr.setXYZ(i, 1.0, 0.62 - lifeRatio * 1.2, 0.05); // Hot orange
          } else {
            colorsAttr.setXYZ(i, 0.15 * (1.0 - lifeRatio), 0.12 * (1.0 - lifeRatio), 0.1 * (1.0 - lifeRatio)); // Dark ash
          }
        }
      }

      positionsAttr.needsUpdate = true;
      colorsAttr.needsUpdate = true;
      sizesAttr.needsUpdate = true;

      // 8. Update 3D Angel Skeleton Vertex Morphing (Emergence)
      const emergenceProgress = burnProgressRef.current;
      
      // Animate lines opacity in response to burn progress
      if (lineMat.opacity !== undefined) {
        lineMat.opacity = Math.min(1.0, emergenceProgress * 1.5);
      }

      // Displacement decreases as the page burns away, locking the lines into place
      const vertexDisplacement = Math.max(0.0, (1.0 - emergenceProgress) * 1.2);

      angelLines.forEach(item => {
        const positions = item.lineObj.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let j = 0; j < item.points.length; j++) {
          const original = item.originalPoints[j];
          
          // Noise-based displacement mimics gaseous smoke waving before solidifying
          const noiseX = Math.sin(original.y * 3.0 + elapsed * 2.5 + j * 0.1) * vertexDisplacement * 0.6;
          const noiseY = Math.cos(original.x * 2.5 - elapsed * 2.0 + j * 0.12) * vertexDisplacement * 0.4;
          const noiseZ = Math.sin(original.z * 1.8 + elapsed * 3.0 + j * 0.15) * vertexDisplacement * 0.5;

          positions.setXYZ(
            j, 
            original.x + noiseX, 
            original.y + noiseY, 
            original.z + noiseZ
          );
        }
        positions.needsUpdate = true;
      });

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    tick();

    // 9. Component Unmount / Cleanup Hook
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Dispose materials & geometries safely to avoid memory leaks
      planeGeo.dispose();
      planeMat.dispose();
      smokeGeo.dispose();
      particleMat.dispose();
      lineMat.dispose();
      
      angelLines.forEach(item => {
        item.lineObj.geometry.dispose();
      });

      renderer.dispose();
    };
  }, [theme, isBurning, onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center overflow-hidden z-10"
      style={{ pointerEvents: isBurning ? 'auto' : 'none' }}
    >
      <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />
    </div>
  );
};
