import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { AppState } from '../types';
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

export const VisionControl: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setAppState, setVisionState } = useAppStore();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<number | null>(null);
  
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const runningMode = "VIDEO";

  // Initialize MediaPipe
  useEffect(() => {
    let isMounted = true;
    const initVision = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );

        if (!isMounted) return;

        gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU" // Will fallback to CPU if GPU is unavailable, logging the XNNPACK message
          },
          runningMode: runningMode,
          numHands: 1
        });
        
        if (isMounted) setModelLoaded(true);
      } catch (err: any) {
        console.error("Vision Init Error:", err);
        if (isMounted) setError("Gesture control unavailable. Use Mouse.");
      }
    };

    initVision();
    return () => { isMounted = false; };
  }, []);

  // Start Camera
  useEffect(() => {
    if (!modelLoaded || !videoRef.current) return;

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error(err);
            setError("Camera access denied.");
        }
    };

    startWebcam();
  }, [modelLoaded]);

  // Prediction Logic
  const predict = () => {
    if (!gestureRecognizerRef.current || !videoRef.current) return;

    if (videoRef.current.readyState >= 2) {
        try {
            const results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, Date.now());

            if (results.gestures.length > 0) {
                const categoryName = results.gestures[0][0].categoryName;
                const landmarks = results.landmarks[0]; 

                const palmX = 1.0 - landmarks[0].x; 
                const palmY = landmarks[0].y;

                let newState = AppState.FORMED;
                if (categoryName === "Open_Palm" || categoryName === "Victory") {
                    newState = AppState.CHAOS;
                } else {
                    newState = AppState.FORMED;
                }

                setAppState(newState);
                setVisionState({
                    gesture: categoryName,
                    handPosition: { x: palmX, y: palmY },
                    isTracking: true
                });
            } else {
                setVisionState({
                    gesture: 'None',
                    isTracking: false
                });
                setAppState(AppState.FORMED);
            }
        } catch (e) {
            // Ignore transient errors
        }
    }
    
    requestRef.current = requestAnimationFrame(predict);
  };

  useEffect(() => {
      if (modelLoaded && videoRef.current) {
          // Cancel any existing loop to prevent duplicates
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          // Start loop
          requestRef.current = requestAnimationFrame(predict);
      }
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, [modelLoaded]);

  return (
    <div className="absolute top-4 right-4 w-48 h-36 z-50 border-2 border-[#D4AF37] rounded-lg overflow-hidden bg-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100 opacity-80"
        />
        <div className="absolute bottom-0 w-full bg-black/60 text-[#D4AF37] text-[10px] text-center p-1 font-serif">
            {error ? error : modelLoaded ? "CAMERA ACTIVE" : "LOADING AI..."}
        </div>
    </div>
  );
};