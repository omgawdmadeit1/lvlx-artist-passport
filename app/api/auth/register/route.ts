import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rpID, rpName } from '@/lib/webauthn';

export async function POST(request: NextRequest) {
  try {
    const { userId, displayName } = await request.json();

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
      userName: displayName || userId,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
    });

    // In production: store options.challenge in Redis/session with short TTL
    // For demo we rely on the fact that the client will return it

    return NextResponse.json(options);
  } catch (error) {
    console.error('Registration options error:', error);
    return NextResponse.json({ error: 'Failed to generate registration options' }, { status: 500 });
  }
}
