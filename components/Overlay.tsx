import React from 'react';
import { useAppStore } from '../store';
import { AppState } from '../types';

export const Overlay: React.FC = () => {
  const { appState, visionState } = useAppStore();
  const isChaos = appState === AppState.CHAOS;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF] to-[#D4AF37] drop-shadow-[0_4px_10px_rgba(212,175,55,0.5)] font-serif tracking-widest">
          GRAND LUXURY
        </h1>
        <h2 className="text-xl md:text-2xl text-[#00ff88] mt-2 tracking-[0.5em] uppercase font-light border-b border-[#00ff88]/30 inline-block pb-2">
          Interactive Holiday Experience
        </h2>
      </header>

      {/* Dynamic Status */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`transition-all duration-700 transform ${isChaos ? 'scale-110' : 'scale-100'}`}>
             <p className={`text-4xl font-serif italic ${isChaos ? 'text-red-500 drop-shadow-[0_0_15px_red]' : 'text-[#D4AF37] drop-shadow-[0_0_15px_gold]'}`}>
                {isChaos ? "UNLEASHED" : "MAGNIFICENCE"}
             </p>
        </div>
        
        {/* Instruction Block */}
        <div className="bg-black/40 backdrop-blur-md border border-[#D4AF37]/50 p-6 rounded-none max-w-md text-center">
            <p className="text-[#D4AF37] text-sm uppercase tracking-widest mb-2 border-b border-[#D4AF37]/30 pb-2">
                Controls
            </p>
            <div className="text-white/80 space-y-2 font-serif">
                <p>
                    <span className="text-[#D4AF37] font-bold">Open Hand:</span> Unleash Chaos
                </p>
                <p>
                    <span className="text-[#D4AF37] font-bold">Closed Hand:</span> Restore Form
                </p>
                <p>
                    <span className="text-[#D4AF37] font-bold">Move Hand:</span> Adjust Perspective
                </p>
            </div>
            
            {visionState.isTracking && (
                <div className="mt-4 text-xs text-green-400 animate-pulse">
                    AI TRACKING: {visionState.gesture} detected
                </div>
            )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[#D4AF37]/60 text-xs tracking-widest uppercase">
         The Grand Christmas Collection • {new Date().getFullYear()}
      </footer>
    </div>
  );
};