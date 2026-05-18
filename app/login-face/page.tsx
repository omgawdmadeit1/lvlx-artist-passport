'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaceLogin } from '@/components/FaceLogin';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function FaceLoginPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSuccess = (userId: string) => {
    // Create session (in real app this would come from server)
    document.cookie = `session=face-login-${userId}; path=/; max-age=86400; secure; samesite=strict`;
    
    toast.success("Face verified successfully!", {
      description: "Welcome back to VitaPass",
    });
    
    router.push('/dashboard');
  };

  const handleError = (message: string) => {
    toast.error("Face verification failed", {
      description: message,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="border-b border-white/10 px-6 h-20 flex items-center">
        <Link href="/login" className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to biometric login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <span className="text-4xl">👤</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Face Login</h1>
            <p className="text-white/60 mt-3">Secure fallback authentication using your registered face</p>
          </div>

          <FaceLogin 
            onSuccess={handleSuccess} 
            onError={handleError} 
          />

          <div className="mt-8 text-center text-xs text-white/40 max-w-xs mx-auto">
            Your face embedding is encrypted and stored securely. 
            We never see or store raw images.
          </div>
        </div>
      </div>
    </div>
  );
}
