'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LivenessDetector } from '@/components/LivenessDetector';
import { startRegistration } from '@simplewebauthn/browser';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'liveness' | 'passkey' | 'face-enroll' | 'success'>('intro');
  const [displayName, setDisplayName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLivenessComplete = async (success: boolean) => {
    if (!success) {
      toast.error("Liveness check failed. Please try again.");
      return;
    }

    setStep('passkey');
    setIsLoading(true);

    try {
      // Generate a temporary userId
      const tempUserId = crypto.randomUUID();
      setUserId(tempUserId);

      // Get registration options from server
      const optionsRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: tempUserId, 
          displayName: displayName || 'Anonymous User' 
        }),
      });

      const options = await optionsRes.json();

      // Create passkey
console.log('REG OPTIONS:', options);

const credential = await startRegistration({
  optionsJSON: options.publicKey ? options.publicKey : options,
});

      // Verify on server
      const verifyRes = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: tempUserId,
          credential,
          displayName: displayName || 'Anonymous User'
        }),
      });

      if (verifyRes.ok) {
        setUserId(tempUserId);
        setStep('face-enroll'); // New step
      } else {
        throw new Error('Registration verification failed');
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Something went wrong during passkey creation", {
        description: error.message || "Please try again",
      });
      setStep('intro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top Nav */}
      <div className="border-b border-white/10 px-6 h-20 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          {step === 'intro' && (
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8">
                <div className="text-5xl">🛡️</div>
              </div>

              <h1 className="text-5xl font-semibold tracking-tighter mb-4">Create your VitaPass</h1>
              <p className="text-xl text-white/60 mb-10">This will be the last time you ever create a password.</p>

              <div className="space-y-4 text-left mb-10">
                <div className="flex gap-4">
                  <div className="mt-1 text-emerald-400">✓</div>
                  <div>
                    <div className="font-medium">15-second liveness check</div>
                    <div className="text-sm text-white/50">Proves you're a real, live human</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 text-emerald-400">✓</div>
                  <div>
                    <div className="font-medium">Secure passkey creation</div>
                    <div className="text-sm text-white/50">Protected by your device's biometrics</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 text-emerald-400">✓</div>
                  <div>
                    <div className="font-medium">Instant login forever</div>
                    <div className="text-sm text-white/50">One tap on any of your devices</div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm text-white/60 mb-2 text-left">Display name (optional)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-lg placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <button
                onClick={() => setStep('liveness')}
                className="w-full py-4 rounded-3xl bg-white text-black font-semibold text-xl hover:bg-white/90 active:scale-[0.985] transition-all"
              >
                Begin 15-second verification
              </button>

              <p className="mt-6 text-xs text-white/40">Your camera will be used only for this one-time check. All processing happens on your device.</p>
            </div>
          )}

          {step === 'liveness' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-emerald-400 text-sm tracking-[2px]">STEP 1 OF 2</div>
                <h2 className="text-3xl font-semibold tracking-tight mt-2">Prove you're a real human</h2>
                <p className="text-white/60 mt-2">Complete the quick challenges below</p>
              </div>

              <LivenessDetector 
                onComplete={handleLivenessComplete} 
                onError={(msg) => toast.error(msg)} 
              />
            </div>
          )}

          {step === 'passkey' && (
            <div className="text-center py-12">
              <div className="animate-pulse mx-auto w-20 h-20 rounded-full border-4 border-white/20 border-t-white mb-8" />
              <h2 className="text-3xl font-semibold tracking-tight">Creating your secure passkey...</h2>
              <p className="text-white/60 mt-3">This is powered by your device’s biometric sensor.<br />Look for the prompt from your OS.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
                <CheckCircle className="w-14 h-14 text-emerald-400" />
              </div>
              <h2 className="text-4xl font-semibold tracking-tight">Welcome to VitaPass</h2>
              <p className="text-xl text-white/60 mt-4">Your account has been created successfully.</p>
              <div className="mt-8 text-sm text-white/40">Redirecting to your dashboard...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
