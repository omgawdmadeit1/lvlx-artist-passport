import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptEmbedding, cosineSimilarity, FACE_MATCH_THRESHOLD } from '@/lib/face';

export async function POST(request: NextRequest) {
  try {
    const { descriptor } = await request.json();

    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json({ success: false, message: 'Invalid descriptor' }, { status: 400 });
    }

    const inputEmbedding = new Float32Array(descriptor);

    // Find all face embeddings (in production: use vector DB or efficient search)
    const allEmbeddings = await prisma.faceEmbedding.findMany({
      include: { user: true },
    });

    let bestMatch: { userId: string; similarity: number } | null = null;

    for (const record of allEmbeddings) {
      try {
       const storedEmbedding = decryptEmbedding(
  Buffer.from(record.embedding),
  Buffer.from(record.iv),
  record.userId
);;
        const similarity = cosineSimilarity(inputEmbedding, storedEmbedding);

        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { userId: record.userId, similarity };
        }
      } catch (decryptError) {
        console.error('Decryption failed for user', record.userId);
      }
    }

    if (bestMatch && bestMatch.similarity >= FACE_MATCH_THRESHOLD) {
      // Update last used
      await prisma.faceEmbedding.update({
        where: { userId: bestMatch.userId },
        data: { lastUsed: new Date() },
      });

      return NextResponse.json({
        success: true,
        userId: bestMatch.userId,
        similarity: Math.round(bestMatch.similarity * 100) / 100,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Face not recognized. Please try again or use your passkey.',
    });
  } catch (error) {
    console.error('Face verify error:', error);
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
  }
}
