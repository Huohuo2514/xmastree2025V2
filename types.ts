import { Vector3 } from 'three';

export enum AppState {
  FORMED = 'FORMED',
  CHAOS = 'CHAOS',
}

export type OrnamentType = 'box' | 'ball' | 'light';

export interface ParticleData {
  chaosPos: Vector3;
  targetPos: Vector3;
  color: string;
  size: number;
}

export interface VisionState {
  gesture: string;
  handPosition: { x: number; y: number };
  isTracking: boolean;
}