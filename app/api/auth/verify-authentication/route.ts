import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { assertion } = await request.json();

    if (!assertion?.id) {
      return NextResponse.json({ error: 'Missing assertion' }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'demo-secret');

    const token = await new SignJWT({
      sub: assertion.id,
      displayName: 'Verified User',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Verify auth error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 401 });
  }
}