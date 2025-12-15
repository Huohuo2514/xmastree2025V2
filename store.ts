import { create } from 'zustand';
import { AppState, VisionState } from './types';

interface AppStore {
  appState: AppState;
  setAppState: (state: AppState) => void;
  
  visionState: VisionState;
  setVisionState: (state: Partial<VisionState>) => void;
  
  // Progress of the transformation (0 = Chaos, 1 = Formed)
  progress: number;
  setProgress: (val: number) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  appState: AppState.FORMED,
  setAppState: (appState) => set({ appState }),
  
  visionState: {
    gesture: 'None',
    handPosition: { x: 0.5, y: 0.5 },
    isTracking: false,
  },
  setVisionState: (newState) => set((state) => ({ 
    visionState: { ...state.visionState, ...newState } 
  })),

  progress: 1,
  setProgress: (progress) => set({ progress }),
}));