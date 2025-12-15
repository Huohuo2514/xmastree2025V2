import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getChaosPosition, getTreePosition } from './ChristmasTree';
import { useAppStore } from '../store';

// Custom Shader for Emerald/Gold particles
const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  attribute vec3 chaosPos;
  attribute vec3 targetPos;
  attribute float aSize;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  
  // Cubic Ease Out
  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }

  void main() {
    vColor = aColor;
    
    // Add some noise/swirl to the movement
    float noise = sin(chaosPos.y * 0.5 + uTime) * (1.0 - uProgress);
    
    vec3 currentPos = mix(chaosPos, targetPos, easeOutCubic(uProgress));
    
    // Add breathing animation when formed
    if (uProgress > 0.95) {
       currentPos.x += sin(uTime * 2.0 + currentPos.y) * 0.05;
       currentPos.z += cos(uTime * 1.5 + currentPos.y) * 0.05;
    }

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft glow center
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, 1.0) * glow;
  }
`;

interface FoliageProps {
  count: number;
  height: number;
  radius: number;
}

export const Foliage: React.FC<FoliageProps> = ({ count, height, radius }) => {
  const meshRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const progress = useAppStore(state => state.progress);

  const { positions, chaosPositions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const chaosPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const emerald = new THREE.Color("#05472A");
    const gold = new THREE.Color("#D4AF37");
    const lightGold = new THREE.Color("#FFF8C0");

    for (let i = 0; i < count; i++) {
      // Target Tree Position
      const target = getTreePosition(Math.random(), radius, height, 1);
      positions[i * 3] = target.x;
      positions[i * 3 + 1] = target.y;
      positions[i * 3 + 2] = target.z;

      // Chaos Position
      const chaos = getChaosPosition(25);
      chaosPositions[i * 3] = chaos.x;
      chaosPositions[i * 3 + 1] = chaos.y;
      chaosPositions[i * 3 + 2] = chaos.z;

      // Colors: Mostly Emerald, some Gold accents
      const isGold = Math.random() > 0.8;
      const col = isGold ? (Math.random() > 0.5 ? gold : lightGold) : emerald;
      
      // Variation
      if (!isGold) {
         col.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1); 
      }
      
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 0.5 + 0.2;
    }

    return { positions, chaosPositions, colors, sizes };
  }, [count, height, radius]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      shaderRef.current.uniforms.uProgress.value = progress;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-targetPos"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-position" 
          count={count}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
           attach="attributes-chaosPos"
           count={count}
           array={chaosPositions}
           itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 1 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};