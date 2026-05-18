'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Clock, User } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, verify session server-side via middleware
    const checkSession = async () => {
      // Demo: just check if cookie exists
      const hasSession = document.cookie.includes('session=');
      
      if (!hasSession) {
        router.push('/login');
        return;
      }

      // Mock user data (in real app fetch from /api/me)
      setUser({
        displayName: "Alex Rivera",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        loginCount: 47,
        lastLogin: new Date(),
      });
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading secure session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-white/10 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
            <span className="text-black font-bold">V</span>
          </div>
          <div className="font-semibold text-xl">VitaPass</div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <div className="flex items-end gap-4 mb-12">
          <div>
            <div className="text-emerald-400 text-sm tracking-[2px]">SECURE DASHBOARD</div>
            <h1 className="text-6xl font-semibold tracking-tighter">Good to see you, {user?.displayName?.split(' ')[0] || 'Human'}.</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Card */}
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="font-semibold text-2xl">{user?.displayName || 'Verified User'}</div>
                <div className="text-emerald-400 text-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> VERIFIED REAL HUMAN
                </div>
              </div>
            </div>

            <div className="space-y-6 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-white/60">Account created</span>
                <span>{user?.createdAt?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-white/60">Successful logins</span>
                <span className="font-mono">{user?.loginCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Last login</span>
                <span>{user?.lastLogin?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="glass rounded-3xl p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-2xl">Security Status</div>
                <div className="text-emerald-400">Excellent • FIDO2 Certified</div>
              </div>
            </div>

            <div className="flex-1 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-emerald-400">●</div>
                <div>Passkey protected with hardware-backed biometrics</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-emerald-400">●</div>
                <div>Zero-knowledge architecture — we never see your biometrics</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-emerald-400">●</div>
                <div>Phishing-resistant by design (WebAuthn)</div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-white/40">
              Your account can only be accessed with a registered passkey from your trusted devices.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/register" 
            className="text-xs text-white/40 hover:text-white/70 underline-offset-4 hover:underline"
          >
            Want to add another device? Register a new passkey →
          </Link>
        </div>
      </div>
    </div>
  );
}
