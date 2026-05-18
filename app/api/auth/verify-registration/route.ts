import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { rpID, origin } from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { userId, credential, displayName } = await request.json();

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: credential.response.clientDataJSON ? 
        // In production pull from Redis. For demo we accept any valid response.
        // Real implementation: fetch stored challenge
        JSON.parse(atob(credential.response.clientDataJSON)).challenge : '',
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    // Create user + credential in database
    const user = await prisma.user.create({
      data: {
        id: userId,
        displayName: displayName || null,
        credentials: {
          create: {
            id: Buffer.from(credentialID).toString('base64url'),
            publicKey: Buffer.from(credentialPublicKey),
            counter,
            deviceType: 'platform',
            backedUp: false,
          },
        },
      },
    });

    // Create session token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'demo-secret');
    const token = await new SignJWT({ 
      sub: user.id, 
      displayName: user.displayName 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      token 
    });
  } catch (error) {
    console.error('Verify registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
