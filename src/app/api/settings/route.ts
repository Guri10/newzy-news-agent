import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSettings, updateSettings } from '@/features/settings/settings-repository';

export async function GET() {
  const settings = await getSettings();

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    const settings = await updateSettings(await request.json());

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings payload', issues: error.issues },
        { status: 400 },
      );
    }

    throw error;
  }
}
