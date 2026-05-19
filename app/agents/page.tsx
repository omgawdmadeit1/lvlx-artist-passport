'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Agent = {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []));
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-3">AI Agent Marketplace</h1>
      <p className="text-white/60 mb-8">
        Pick an agent, subscribe, and run it from your dashboard.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-emerald-400">{agent.category}</div>
            <h2 className="text-2xl font-bold mt-2">{agent.name}</h2>
            <p className="text-white/60 mt-3">{agent.description}</p>
            <div className="mt-4 font-semibold">{agent.price}</div>

            <Link
              href={`/dashboard/agents?agent=${agent.id}`}
              className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-black font-semibold"
            >
              Use Agent
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}