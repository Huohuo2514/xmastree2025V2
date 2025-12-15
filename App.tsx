import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { VisionControl } from './components/VisionControl';
import { useAppStore } from './store';

export default function App() {
  const isTracking = useAppStore(state => state.visionState.isTracking);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#020f08] to-[#001a10]">
      {/* 3D Scene */}
      <Canvas
        shadows
        camera={{ position: [0, 4, 20], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <Experience />
      </Canvas>

      {/* Logic & UI Layers */}
      <VisionControl />
      <Overlay />
      
      {/* Decorative Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] opacity-80" />
    </div>
  );
}