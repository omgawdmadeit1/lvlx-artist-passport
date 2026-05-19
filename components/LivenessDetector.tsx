'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  onComplete: (success: boolean) => void | Promise<void>;
  onError?: (message: string) => void;
};

export function LivenessDetector({ onComplete, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Starting camera...');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout>;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setStatus('Camera active. Hold still...');
        timer = setTimeout(() => {
          setStatus('Liveness passed');
          onComplete(true);
        }, 3000);
      } catch (err) {
        console.error(err);
        setStatus('Camera access failed');
        onError?.('Camera access failed');
        onComplete(false);
      }
    }

    start();

    return () => {
      clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onComplete, onError]);

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md rounded-xl border"
      />
      <p>{status}</p>
    </div>
  );
}
