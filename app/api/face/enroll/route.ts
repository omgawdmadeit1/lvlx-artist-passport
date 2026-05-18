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

    // Encrypt the embedding
    const { encrypted, iv } = encryptEmbedding(embedding, userId);

    // Upsert face embedding
    await prisma.faceEmbedding.upsert({
      where: { userId },
      create: {
        userId,
        embedding: encrypted,
        iv,
      },
      update: {
        embedding: encrypted,
        iv,
        lastUsed: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Face enroll error:', error);
    return NextResponse.json({ error: 'Failed to enroll face' }, { status: 500 });
  }
}
