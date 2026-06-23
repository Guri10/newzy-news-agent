import { NextResponse } from 'next/server';
import { createAndStoreDigest } from '@/features/digests/digest-service';
import { getSettings } from '@/features/settings/settings-repository';
import { fetchAndStoreNews } from '@/features/news/news-service';
import { TheNewsApiProvider } from '@/features/news/thenewsapi-provider';

export async function POST() {
  const apiKey = process.env.THENEWSAPI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THENEWSAPI_API_KEY is not configured.' },
      { status: 500 },
    );
  }

  const settings = await getSettings();
  const provider = new TheNewsApiProvider({ apiKey });
  const articles = await fetchAndStoreNews({ provider, settings });
  const digest = await createAndStoreDigest({ articles, settings });

  return NextResponse.json({
    articlesFetched: articles.length,
    digest,
  });
}
