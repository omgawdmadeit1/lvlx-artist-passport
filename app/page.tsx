import Link from 'next/link';
import { Shield, Zap, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <span className="text-black text-xl font-bold tracking-tighter">V</span>
            </div>
            <div>
              <div className="font-semibold text-xl tracking-tight">VitaPass</div>
              <div className="text-[10px] text-white/40 -mt-1">REAL HUMANS ONLY</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2 text-sm font-medium hover:text-white/70 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2.5 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-20 pb-24 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 text-xs tracking-[3px] mb-6">
          2026 EDITION • FIDO2 + AI LIVENESS
        </div>

        <h1 className="text-7xl font-semibold tracking-tighter leading-none mb-6">
          Login with<br />your face.<br />Only real people.
        </h1>

        <p className="max-w-md mx-auto text-xl text-white/60 mb-10">
          The most secure, private, and delightful authentication experience ever built.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register" 
            className="group px-10 py-4 rounded-3xl bg-white text-black font-semibold text-lg flex items-center justify-center gap-3 hover:bg-white/90 active:scale-[0.985] transition-all"
          >
            Create your VitaPass
            <ArrowRight className="group-hover:-rotate-45 transition-transform" />
          </Link>
          
          <Link 
            href="/login" 
            className="px-10 py-4 rounded-3xl border border-white/20 font-semibold text-lg hover:bg-white/5 transition-all"
          >
            Already have an account
          </Link>
        </div>

        <div className="mt-16 flex justify-center gap-8 text-xs text-white/40">
          <div>NO PASSWORDS</div>
          <div>NO EMAILS</div>
          <div>NO PHISHING</div>
          <div>NO BOTS</div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-y border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-semibold tracking-tighter">99.97%</div>
            <div className="text-sm text-white/50 mt-1">Liveness accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-semibold tracking-tighter">&lt;800ms</div>
            <div className="text-sm text-white/50 mt-1">Average login time</div>
          </div>
          <div>
            <div className="text-4xl font-semibold tracking-tighter">0</div>
            <div className="text-sm text-white/50 mt-1">Passwords stored</div>
          </div>
          <div>
            <div className="text-4xl font-semibold tracking-tighter">FIDO2</div>
            <div className="text-sm text-white/50 mt-1">Certified standard</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-emerald-400 text-sm tracking-[3px] mb-3">THREE SIMPLE STEPS</div>
          <h2 className="text-5xl font-semibold tracking-tight">How VitaPass works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="w-8 h-8" />,
              title: "1. Prove you're real",
              desc: "Complete a quick 15-second AI liveness check. Blink, turn your head, smile. All processed on your device."
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "2. Create your passkey",
              desc: "Your device generates a cryptographic key protected by biometrics. Nothing leaves your phone or laptop."
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "3. Login instantly",
              desc: "One tap. Your Face ID or fingerprint unlocks the platform. No typing. No codes. Ever again."
            }
          ].map((step, index) => (
            <div key={index} className="glass p-8 rounded-3xl group">
              <div className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform inline-block">
                {step.icon}
              </div>
              <h3 className="text-2xl font-semibold tracking-tight mb-4">{step.title}</h3>
              <p className="text-white/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-white text-black py-20">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tighter mb-6">Ready to experience the future?</h2>
          <p className="text-xl text-black/60 mb-10">Join thousands of real humans who have already ditched passwords forever.</p>
          
          <Link 
            href="/register" 
            className="inline-flex items-center gap-3 px-12 py-4 rounded-3xl bg-black text-white font-semibold text-lg hover:bg-zinc-900 active:scale-[0.985] transition-all"
          >
            Create free account <ArrowRight />
          </Link>
          
          <p className="mt-6 text-xs text-black/40">Takes less than 30 seconds. No credit card required.</p>
        </div>
      </div>

      <footer className="border-t border-white/10 py-12 text-center text-xs text-white/40">
        Built with ❤️ and cutting-edge AI • VitaPass 2026 • All rights reserved
      </footer>
    </div>
  );
}
