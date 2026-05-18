import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rpID } from '@/lib/webauthn';

export async function POST(request: NextRequest) {
  try {
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'required',
      allowCredentials: [], // Empty = allow any discoverable passkey (resident key)
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Login options error:', error);
    return NextResponse.json({ error: 'Failed to generate login options' }, { status: 500 });
  }
}
