import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getChaosPosition, getTreePosition } from './ChristmasTree';
import { useAppStore } from '../store';

interface OrnamentsProps {
  count: number;
  height: number;
  radius: number;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ count, height, radius }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progress = useAppStore(state => state.progress);

  // Generate Data
  const { data } = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Tree Pos (Surface only)
      const h = height;
      const y = Math.random() * h;
      const rAtY = radius * (1 - y / h);
      const theta = Math.random() * Math.PI * 2;
      // Push out to surface
      const x = rAtY * Math.cos(theta);
      const z = rAtY * Math.sin(theta);
      const targetPos = new THREE.Vector3(x, y + 1, z); // +1 offset

      // Chaos Pos
      const chaosPos = getChaosPosition(30);

      // Random scale
      const scale = Math.random() * 0.4 + 0.2;
      
      // Random rotation
      const rotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      // Color
      const color = new THREE.Color();
      const type = Math.random();
      if (type > 0.6) color.setHex(0xD4AF37); // Gold
      else if (type > 0.3) color.setHex(0xAA0000); // Red
      else color.setHex(0xC0C0C0); // Silver

      temp.push({ targetPos, chaosPos, scale, rotation, color });
    }
    return { data: temp };
  }, [count, height, radius]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    // Set colors once
    for (let i = 0; i < count; i++) {
      meshRef.current.setColorAt(i, data[i].color);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data, count]);

  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // We can simulate different weights by slightly tweaking the lerp alpha per instance
    // But for performance, uniform lerp is safer for 60fps.
    // Let's add a small offset to the progress based on index to create a "wave" effect
    
    for (let i = 0; i < count; i++) {
      const { targetPos, chaosPos, scale, rotation } = data[i];
      
      // Create a staggered progress
      const stagger = i * 0.0005; 
      // Clamp progress
      let p = THREE.MathUtils.clamp(progress + (progress > 0.5 ? stagger : -stagger), 0, 1);
      
      // Ease
      p = 1 - Math.pow(1 - p, 3); // Cubic out

      dummy.position.lerpVectors(chaosPos, targetPos, p);
      
      // Rotate while flying
      dummy.rotation.set(
        rotation.x + state.clock.elapsedTime * (1-p), 
        rotation.y + state.clock.elapsedTime * (1-p), 
        rotation.z
      );
      
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        roughness={0.1} 
        metalness={0.9} 
        envMapIntensity={2} 
      />
    </instancedMesh>
  );
};