import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const digest = await db.digest.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ digest });
}
