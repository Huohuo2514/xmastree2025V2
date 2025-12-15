import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';

// Constants for Tree Shape
const TREE_HEIGHT = 18;
const TREE_RADIUS = 7;
const PARTICLE_COUNT = 6000;
const ORNAMENT_COUNT = 300;
const POLAROID_COUNT = 40;

// Helper to generate a point inside a cone
export const getTreePosition = (ratio: number, radiusBase: number, height: number, yOffset: number): THREE.Vector3 => {
  const h = height;
  const y = Math.random() * h;
  const rAtY = radiusBase * (1 - y / h);
  const theta = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * rAtY; // Uniform distribution in circle slice
  
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  
  return new THREE.Vector3(x, y + yOffset, z);
};

// Helper to generate random point in sphere (Chaos)
export const getChaosPosition = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  // Safety Clamp: 2*v - 1 can occasionally be slightly outside [-1, 1] due to float precision
  // causing acos to return NaN.
  const phiVal = THREE.MathUtils.clamp(2 * v - 1, -1, 1);
  const phi = Math.acos(phiVal);
  const r = radius * Math.cbrt(Math.random());
  
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const ChristmasTree: React.FC = () => {
  return (
    <group>
        {/* Glittering Gold Base Stand */}
        <mesh position={[0, 0, 0]} receiveShadow>
            <cylinderGeometry args={[2, 2.5, 1, 32]} />
            <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
        </mesh>
        
        {/* Components */}
        <Foliage 
            count={PARTICLE_COUNT} 
            height={TREE_HEIGHT} 
            radius={TREE_RADIUS} 
        />
        <Ornaments 
            count={ORNAMENT_COUNT} 
            height={TREE_HEIGHT} 
            radius={TREE_RADIUS} 
        />
        <Polaroids 
            count={POLAROID_COUNT} 
            height={TREE_HEIGHT} 
            radius={TREE_RADIUS} 
        />
    </group>
  );
};