import React, { useRef } from 'react';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ChristmasTree } from './ChristmasTree';
import { useAppStore } from '../store';
import { AppState } from '../types';

export const Experience: React.FC = () => {
  const { appState, progress, setProgress, visionState } = useAppStore();
  const orbitRef = useRef<any>(null);

  // Smooth State Transition Logic
  useFrame((state, delta) => {
    const targetProgress = appState === AppState.FORMED ? 1 : 0;
    // Smooth lerp for progress
    const newProgress = THREE.MathUtils.lerp(progress, targetProgress, delta * 2.5);
    setProgress(newProgress);

    // Hand movement camera influence (Parallax)
    // Map hand X/Y (0-1) to slight camera rotations if OrbitControls allows
    if (visionState.isTracking && orbitRef.current) {
        const targetAzimuth = (visionState.handPosition.x - 0.5) * 2; // -1 to 1
        const targetPolar = (visionState.handPosition.y - 0.5) * 1 + Math.PI / 2; // Slight tilt
        
        // We gently nudge the camera look
        const cam = state.camera;
        cam.position.x = THREE.MathUtils.lerp(cam.position.x, targetAzimuth * 10, delta);
        cam.position.y = THREE.MathUtils.lerp(cam.position.y, 4 - (visionState.handPosition.y - 0.5) * 5, delta);
        cam.lookAt(0, 4, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 24]} />
      
      {/* Lighting: Grand Luxury */}
      {/* Using direct URL to avoid 'Failed to fetch' errors with default presets */}
      <Environment 
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/st_fagans_interior_1k.hdr" 
        background={false} 
      />
      <ambientLight intensity={0.2} color="#004020" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#ffeebb" 
        castShadow 
      />
      <pointLight position={[-10, 10, -10]} intensity={1} color="#00ff88" />

      {/* Controls - Disabled when hand tracking is active to avoid conflict, or use hand to orbit */}
      <OrbitControls 
        ref={orbitRef}
        enableZoom={true} 
        enablePan={false}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
        enabled={!visionState.isTracking} // Disable mouse orbit if using hand
      />

      <group position={[0, -5, 0]}>
        <ChristmasTree />
      </group>

      {/* Cinematic Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};