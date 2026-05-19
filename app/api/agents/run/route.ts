import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { agentId, input } = await request.json();

  if (!agentId || !input) {
    return NextResponse.json({ error: 'Missing agentId or input' }, { status: 400 });
  }

  const output = {
    agentId,
    result: `Agent ${agentId} processed: ${input}`,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, output });
}