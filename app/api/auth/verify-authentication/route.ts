import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { rpID, origin } from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { assertion } = await request.json();

    // In production: look up the credential from DB using assertion.id
    // For demo simplicity we accept any valid assertion (you can expand this)

    const verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge: '', // In production: fetch from Redis
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: assertion.id,
        publicKey: Buffer.from('demo-public-key'), // Replace with real lookup
        counter: 0,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Create fresh session
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'demo-secret');
    const token = await new SignJWT({ 
      sub: 'demo-user-id', 
      displayName: 'Verified User' 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({ 
      success: true, 
      token 
    });
  } catch (error) {
    console.error('Verify auth error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 401 });
  }
}
