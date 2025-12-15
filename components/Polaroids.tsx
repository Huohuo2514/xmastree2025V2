import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getChaosPosition } from './ChristmasTree';
import { useAppStore } from '../store';

interface PolaroidsProps {
  count: number;
  height: number;
  radius: number;
}

export const Polaroids: React.FC<PolaroidsProps> = ({ count, height, radius }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progress = useAppStore(state => state.progress);
  
  // Create a texture atlas or just use a generic white frame with a colored center?
  // Since we cannot load multiple textures easily into an InstancedMesh without a texture atlas,
  // we will use a geometry trick: The geometry will have UVs mapped to a single texture, 
  // or we just simulate the "Look" of a polaroid with vertex colors or a simple material.
  // Better: Use a custom shader material on the InstancedMesh to mix a photo texture.
  // For simplicity and robustness here: We will make them "Gold Cards" representing luxury photos.
  
  const { data } = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
       // Target: Spiraling down the tree
       const t = i / count;
       const y = height * (1 - t) + 1;
       const rCurrent = radius * (1 - y/height) + 1.5; // Slightly outside foliage
       const angle = t * Math.PI * 10; // 5 spirals
       
       const targetPos = new THREE.Vector3(
         Math.cos(angle) * rCurrent,
         y,
         Math.sin(angle) * rCurrent
       );
       
       const chaosPos = getChaosPosition(35);
       
       // Orient towards outside
       const lookAt = new THREE.Vector3(targetPos.x * 2, targetPos.y, targetPos.z * 2);
       
       temp.push({ targetPos, chaosPos, lookAt });
    }
    return { data: temp };
  }, [count, height, radius]);

  const dummy = new THREE.Object3D();

  useFrame(() => {
    if (!meshRef.current) return;
    
    for (let i = 0; i < count; i++) {
        const { targetPos, chaosPos, lookAt } = data[i];
        
        // Staggered logic similar to ornaments
        const stagger = i * 0.002;
        let p = THREE.MathUtils.clamp(progress + (progress > 0.5 ? stagger : -stagger), 0, 1);
        p = 1 - Math.pow(1 - p, 4); // Quartic out for snappiness
        
        dummy.position.lerpVectors(chaosPos, targetPos, p);
        dummy.lookAt(lookAt);
        // Add some random spin when in chaos
        if (p < 0.9) {
            dummy.rotateZ((1-p) * 2);
            dummy.rotateX((1-p));
        }
        
        dummy.scale.setScalar(1.5); // Size of polaroid
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.8, 1.0, 0.05]} />
      <meshStandardMaterial color="#fff" roughness={0.5} metalness={0.1}>
          {/* We simulate the image part using a second material index or map, 
              but for single file limits, we'll keep it simple: White glossy card with gold rim */}
      </meshStandardMaterial>
    </instancedMesh>
  );
};