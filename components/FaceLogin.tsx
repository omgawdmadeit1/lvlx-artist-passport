'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { CheckCircle, Camera, AlertCircle } from 'lucide-react';

interface FaceLoginProps {
  onSuccess: (userId: string) => void;
  onError: (message: string) => void;
}

export function FaceLogin({ onSuccess, onError }: FaceLoginProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'scanning' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('Position your face in the frame');

  useEffect(() => {
    const loadModels = async () => {
      setStatus('loading');
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setStatus('idle');
        setFeedback('Models loaded. Click "Start Face Scan"');
      } catch (error) {
        console.error('Failed to load face-api models:', error);
        onError('Failed to load face recognition models. Please try again later.');
      }
    };

    loadModels();
  }, [onError]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('scanning');
      setFeedback('Looking for your face...');
      scanFace();
    } catch (error) {
      onError('Camera access denied. Please allow camera permissions.');
    }
  };

  const scanFace = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let attempts = 0;
    const maxAttempts = 25; // ~5 seconds at 5fps

    const interval = setInterval(async () => {
      attempts++;
      setProgress(Math.min((attempts / maxAttempts) * 100, 95));

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          clearInterval(interval);
          setFeedback('Face detected! Verifying...');
          setProgress(100);

          // Send descriptor to server for verification
          const descriptor = Array.from(detection.descriptor);
          
          const res = await fetch('/api/face/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptor }),
          });

          const result = await res.json();

          if (result.success && result.userId) {
            setStatus('success');
            setFeedback('Face verified! Logging you in...');
            
            // Stop camera
            if (video.srcObject) {
              (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }

            setTimeout(() => {
              onSuccess(result.userId);
            }, 800);
          } else {
            setStatus('failed');
            setFeedback(result.message || 'Face not recognized. Please try again.');
            onError(result.message || 'Face verification failed');
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatus('failed');
          setFeedback('No clear face detected. Please try again with better lighting.');
          onError('Face detection timeout');
        }
      } catch (error) {
        console.error('Face scan error:', error);
      }
    }, 200);
  };

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setFeedback('Position your face in the frame');
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <div className="relative aspect-[4/3] bg-zinc-950">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            playsInline
            muted
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

          {/* Status */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-xs font-mono flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'scanning' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
            FACE AI
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-2xl bg-black/80 text-sm text-white flex items-center gap-2 max-w-[280px] text-center">
              {status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {status === 'failed' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              {feedback}
            </div>
          )}

          {/* Progress */}
          {status === 'scanning' && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-1 bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-zinc-950 border-t border-white/10">
          {status === 'idle' && (
            <button
              onClick={startCamera}
              className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all"
            >
              <Camera className="w-5 h-5" />
              Start Face Scan
            </button>
          )}

          {status === 'loading' && (
            <div className="text-center py-4 text-white/70">Loading face recognition models...</div>
          )}

          {(status === 'scanning' || status === 'success') && (
            <div className="text-center text-sm text-white/50 py-2">Scanning your face...</div>
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
        SECURE • ENCRYPTED • ONE-TIME SCAN
      </p>
    </div>
  );
}
```

**Note**: For production, download the face-api.js models to `/public/models` folder (tiny_face_detector, face_landmark_68, face_recognition). I can provide the download script if needed.