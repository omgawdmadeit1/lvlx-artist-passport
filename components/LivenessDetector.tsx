'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { CheckCircle, XCircle, Camera } from 'lucide-react';

interface LivenessDetectorProps {
  onComplete: (success: boolean, metrics?: any) => void;
  onError?: (error: string) => void;
}

const CHALLENGES = [
  { 
    id: 'blink', 
    label: 'Blink twice naturally', 
    instruction: 'Blink your eyes twice',
    duration: 4000 
  },
  { 
    id: 'left', 
    label: 'Turn head slowly LEFT', 
    instruction: 'Turn your head to the left',
    duration: 5000 
  },
  { 
    id: 'right', 
    label: 'Turn head slowly RIGHT', 
    instruction: 'Turn your head to the right',
    duration: 5000 
  },
  { 
    id: 'smile', 
    label: 'Smile for the camera', 
    instruction: 'Give a big smile',
    duration: 4000 
  },
];

export function LivenessDetector({ onComplete, onError }: LivenessDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'detecting' | 'success' | 'failed'>('idle');
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentChallenge = CHALLENGES[currentChallengeIndex];
  const isLastChallenge = currentChallengeIndex === CHALLENGES.length - 1;

  // Initialize MediaPipe
  useEffect(() => {
    const initializeMediaPipe = async () => {
      setStatus('loading');
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.6,
          minFacePresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
          outputFaceBlendshapes: true,
        });

        setFaceLandmarker(landmarker);
        setStatus('idle');
        setFeedback('Camera ready. Click "Start Liveness Check"');
      } catch (error) {
        console.error('MediaPipe initialization failed:', error);
        onError?.('Failed to load AI vision model. Please refresh.');
        setStatus('failed');
      }
    };

    initializeMediaPipe();

    return () => {
      if (faceLandmarker) {
        faceLandmarker.close();
      }
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('detecting');
      setFeedback('Position your face in the frame');
    } catch (error) {
      onError?.('Camera access denied. Please allow camera permissions.');
    }
  };

  // Detect blink using Eye Aspect Ratio (EAR)
  const detectBlink = (landmarks: any[]): boolean => {
    if (!landmarks || landmarks.length < 468) return false;

    // Left eye landmarks (approximate indices for MediaPipe)
    const leftEye = [362, 385, 387, 263, 373, 380];
    // Right eye landmarks
    const rightEye = [33, 160, 158, 133, 153, 144];

    const calculateEAR = (eyePoints: number[]) => {
      const p1 = landmarks[eyePoints[1]];
      const p2 = landmarks[eyePoints[5]];
      const p3 = landmarks[eyePoints[2]];
      const p4 = landmarks[eyePoints[4]];
      const p5 = landmarks[eyePoints[0]];
      const p6 = landmarks[eyePoints[3]];

      const A = Math.hypot(p2.x - p6.x, p2.y - p6.y);
      const B = Math.hypot(p3.x - p5.x, p3.y - p5.y);
      const C = Math.hypot(p1.x - p4.x, p1.y - p4.y);

      return (A + B) / (2.0 * C);
    };

    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;

    return avgEAR < 0.21; // Threshold for closed eye
  };

  // Detect head turn
  const detectHeadTurn = (landmarks: any[], direction: 'left' | 'right'): boolean => {
    if (!landmarks || landmarks.length < 468) return false;

    const noseTip = landmarks[1];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];

    const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
    const noseOffset = noseTip.x - faceCenterX;

    if (direction === 'left') {
      return noseOffset < -0.08; // Nose moved significantly left
    } else {
      return noseOffset > 0.08;  // Nose moved significantly right
    }
  };

  // Detect smile using mouth landmarks
  const detectSmile = (landmarks: any[]): boolean => {
    if (!landmarks || landmarks.length < 468) return false;

    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];
    const mouthTop = landmarks[13];
    const mouthBottom = landmarks[14];

    const mouthWidth = Math.hypot(mouthRight.x - mouthLeft.x, mouthRight.y - mouthLeft.y);
    const mouthHeight = Math.hypot(mouthTop.x - mouthBottom.x, mouthTop.y - mouthBottom.y);

    const smileRatio = mouthWidth / (mouthHeight + 0.001);

    return smileRatio > 2.8; // Wide smile threshold
  };

  // Main detection loop
  const runDetection = useCallback(async () => {
    if (!faceLandmarker || !videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.paused || video.ended) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const results = await faceLandmarker.detectForVideo(video, Date.now());

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        // Draw face mesh (subtle)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const drawingUtils = new DrawingUtils(ctx);
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_CONNECTIONS, { color: '#22c55e', lineWidth: 0.5 });

        const challenge = CHALLENGES[currentChallengeIndex];
        let challengePassed = false;

        switch (challenge.id) {
          case 'blink':
            if (detectBlink(landmarks)) {
              challengePassed = true;
              setFeedback('Great! Blink detected ✓');
            }
            break;
          case 'left':
            if (detectHeadTurn(landmarks, 'left')) {
              challengePassed = true;
              setFeedback('Perfect head turn left ✓');
            }
            break;
          case 'right':
            if (detectHeadTurn(landmarks, 'right')) {
              challengePassed = true;
              setFeedback('Excellent head turn right ✓');
            }
            break;
          case 'smile':
            if (detectSmile(landmarks)) {
              challengePassed = true;
              setFeedback('Beautiful smile detected ✓');
            }
            break;
        }

        if (challengePassed && !isProcessing) {
          setIsProcessing(true);
          
          // Mark challenge complete
          const newCompleted = [...completedChallenges, currentChallengeIndex];
          setCompletedChallenges(newCompleted);
          setProgress(((newCompleted.length) / CHALLENGES.length) * 100);

          if (isLastChallenge) {
            setStatus('success');
            setFeedback('All challenges passed! Creating your secure passkey...');
            setTimeout(() => {
              onComplete(true, { 
                challengesCompleted: newCompleted.length,
                timestamp: Date.now()
              });
            }, 800);
          } else {
            setTimeout(() => {
              setCurrentChallengeIndex(prev => prev + 1);
              setFeedback(CHALLENGES[currentChallengeIndex + 1].instruction);
              setIsProcessing(false);
            }, 1200);
          }
        }
      } else {
        setFeedback('Face not detected clearly. Please center your face.');
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    requestAnimationFrame(runDetection);
  }, [faceLandmarker, currentChallengeIndex, completedChallenges, isLastChallenge, isProcessing]);

  // Start detection when status changes to detecting
  useEffect(() => {
    if (status === 'detecting' && faceLandmarker) {
      const timer = setTimeout(() => {
        runDetection();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [status, faceLandmarker, runDetection]);

  const startLivenessCheck = async () => {
    await startCamera();
    setCurrentChallengeIndex(0);
    setCompletedChallenges([]);
    setProgress(0);
    setFeedback(CHALLENGES[0].instruction);
  };

  const reset = () => {
    setStatus('idle');
    setCurrentChallengeIndex(0);
    setCompletedChallenges([]);
    setProgress(0);
    setFeedback('');
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Video Feed */}
        <div className="relative aspect-[4/3] bg-zinc-950">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
          />

          {/* Overlay UI */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-xs font-mono flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'detecting' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
            LIVE AI
          </div>

          {/* Challenge Progress */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            {CHALLENGES.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  completedChallenges.includes(idx) 
                    ? 'bg-emerald-400' 
                    : idx === currentChallengeIndex 
                      ? 'bg-white animate-pulse' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Center Instruction */}
          {status === 'detecting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-xl font-semibold tracking-tight">
                  {currentChallenge?.instruction}
                </p>
                <p className="text-white/60 text-sm mt-1">Step {currentChallengeIndex + 1} of {CHALLENGES.length}</p>
              </div>
            </div>
          )}

          {/* Feedback Toast */}
          {feedback && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl bg-black/80 text-sm text-white flex items-center gap-2">
              {status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : status === 'failed' ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : null}
              {feedback}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-5 bg-zinc-950 border-t border-white/10">
          {status === 'idle' && (
            <button
              onClick={startLivenessCheck}
              className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.985]"
            >
              <Camera className="w-5 h-5" />
              Start Liveness Check
            </button>
          )}

          {status === 'loading' && (
            <div className="flex items-center justify-center py-4 text-white/70">
              Loading AI vision model...
            </div>
          )}

          {(status === 'detecting' || status === 'success') && (
            <div className="space-y-3">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-center text-xs text-white/50 font-mono">
                {Math.round(progress)}% COMPLETE
              </p>
            </div>
          )}

          {status === 'failed' && (
            <button
              onClick={reset}
              className="w-full py-4 rounded-2xl border border-white/20 text-white font-medium hover:bg-white/5"
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] text-white/40 mt-3 font-mono tracking-[2px]">
        POWERED BY MEDIAPIPE • ON-DEVICE AI • ZERO DATA LEAVING YOUR DEVICE
      </p>
    </div>
  );
}
