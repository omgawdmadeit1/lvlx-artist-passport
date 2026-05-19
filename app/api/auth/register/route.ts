import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userId = body.userId;
    const displayName = body.displayName || 'Anonymous User';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const options = await generateRegistrationOptions({
      rpName: 'LVLX Artist Passport',
      rpID: 'lvlx-artist-passport.vercel.app',

      userID: new TextEncoder().encode(userId),
      userName: displayName,
      userDisplayName: displayName,

      timeout: 60000,
      attestationType: 'none',

      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}