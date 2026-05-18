'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import { ArrowLeft, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      // Get authentication options
      const optionsRes = await fetch('/api/auth/login', {
        method: 'POST',
      });

      if (!optionsRes.ok) {
        throw new Error('Failed to get login options');
      }

      const options = await optionsRes.json();

      // Trigger browser biometric prompt
      const assertion = await startAuthentication(options);

      // Verify with server
      const verifyRes = await fetch('/api/auth/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assertion }),
      });

      if (verifyRes.ok) {
        const { token } = await verifyRes.json();
        
        // Store session token (in real app use httpOnly cookie)
        document.cookie = `session=${token}; path=/; max-age=86400; secure; samesite=strict`;
        
        toast.success("Login successful", {
          description: "Welcome back!",
        });
        
        router.push('/dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Login failed", {
        description: error.message || "Please try again or create a new account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="border-b border-white/10 px-6 h-20 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl font-semibold tracking-tighter mb-4">Welcome back</h1>
          <p className="text-xl text-white/60 mb-12">Sign in with your biometrics</p>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-5 rounded-3xl bg-white text-black font-semibold text-xl flex items-center justify-center gap-3 hover:bg-white/90 disabled:opacity-70 active:scale-[0.985] transition-all"
          >
            {isLoading ? (
              <>Verifying biometrics...</>
            ) : (
              <>
                <Fingerprint className="w-6 h-6" />
                Sign in with Face ID / Fingerprint
              </>
            )}
          </button>

          <div className="mt-8 text-sm text-white/40">
            Your passkey is stored securely on this device.<br />
            Works on all your synced devices.
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-xs text-white/40">Don't have an account?</p>
            <Link href="/register" className="text-sm text-white hover:underline mt-1 inline-block">
              Create your VitaPass →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
