'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Random points on a sphere for a cinematic galaxy feel
function ParticleCloud() {
    const ref = useRef<THREE.Points>(null);
    const sphere = new Float32Array(5000 * 3);
    
    // Generate simple sphere points manually without external random-math libraries
    for (let i = 0; i < 5000; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 1.5;
        sphere[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        sphere[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        sphere[i * 3 + 2] = r * Math.cos(phi);
    }

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial transparent color="#fbbf24" size={0.005} sizeAttenuation={true} depthWrite={false} />
            </Points>
        </group>
    );
}

export function ThreeCanvas() {
    return (
        <div className="absolute inset-0 z-0 bg-[#0b0c10] overflow-hidden">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <ParticleCloud />
            </Canvas>
        </div>
    );
}
