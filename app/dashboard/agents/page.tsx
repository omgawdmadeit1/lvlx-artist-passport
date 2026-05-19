'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function DashboardAgentsContent() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agent') || 'meeting-summarizer';

  const { isConnected, address } = useAccount();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro' }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  async function runAgent() {
    setLoading(true);

    const res = await fetch('/api/agents/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, input }),
    });

    const data = await res.json();
    setResult(data.output);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">Run Agent</h1>
      <p className="text-white/60 mb-6">Selected agent: {agentId}</p>

      <div className="mb-6">
        <ConnectButton />
      </div>

      {!isConnected && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6">
          Connect wallet to run premium agents.
        </div>
      )}

      {isConnected && (
        <div className="text-sm text-white/50 mb-6">
          Wallet connected: {address}
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tell the agent what to do..."
        className="w-full min-h-48 rounded-2xl bg-white/10 border border-white/10 p-4 mb-4"
      />

      <div className="flex gap-3">
        <button
          onClick={subscribe}
          className="rounded-2xl bg-emerald-400 text-black px-6 py-3 font-semibold"
        >
          Subscribe Pro
        </button>

        <button
          onClick={runAgent}
          disabled={!isConnected || !input || loading}
          className="rounded-2xl bg-white text-black px-6 py-3 font-semibold disabled:opacity-40"
        >
          {loading ? 'Running...' : 'Run Agent'}
        </button>
      </div>

      {result && (
        <pre className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}

export default function DashboardAgentsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-zinc-950 text-white p-8">Loading agent...</main>}>
      <DashboardAgentsContent />
    </Suspense>
  );
}