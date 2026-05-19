import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptEmbedding } from '@/lib/face';

export async function POST(request: NextRequest) {
  try {
    const { userId, descriptor } = await request.json();

    if (!userId || !descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const embedding = new Float32Array(descriptor);

    const { encrypted, iv } = encryptEmbedding(embedding, userId);

    const encryptedBytes = Uint8Array.from(encrypted);
    const ivBytes = Uint8Array.from(iv);

    await prisma.faceEmbedding.upsert({
      where: { userId },
      create: {
        userId,
        embedding: encryptedBytes,
        iv: ivBytes,
      },
      update: {
        embedding: encryptedBytes,
        iv: ivBytes,
        lastUsed: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Face enroll error:', error);
    return NextResponse.json({ error: 'Failed to enroll face' }, { status: 500 });
  }
}