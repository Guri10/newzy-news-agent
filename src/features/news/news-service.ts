import { db } from '@/lib/db';
import type { Settings } from '@/features/settings/settings-schema';
import type {
  FetchTopStoriesOptions,
  NewsProvider,
  NormalizedArticle,
} from './news-provider';

export function buildCategoryRequests(
  settings: Settings,
): FetchTopStoriesOptions[] {
  const requests: FetchTopStoriesOptions[] = [];

  if (settings.geopoliticsEnabled) {
    requests.push({
      category: 'GEOPOLITICS',
      apiCategory: 'politics',
      search: 'diplomacy | sanctions | conflict | NATO | election',
      limit: 5,
      language: 'en',
    });
  }

  if (settings.sportsEnabled) {
    requests.push({
      category: 'SPORTS',
      apiCategory: 'sports',
      limit: 5,
      language: 'en',
    });
  }

  return requests;
}

export function dedupeArticlesByUrl(
  articles: NormalizedArticle[],
): NormalizedArticle[] {
  const seenUrls = new Set<string>();

  return articles.filter((article) => {
    if (seenUrls.has(article.url)) {
      return false;
    }

    seenUrls.add(article.url);
    return true;
  });
}

export async function fetchAndStoreNews({
  provider,
  settings,
}: {
  provider: NewsProvider;
  settings: Settings;
}): Promise<NormalizedArticle[]> {
  const fetchRun = await db.fetchRun.create({
    data: { status: 'RUNNING' },
  });

  try {
    const batches = await Promise.all(
      buildCategoryRequests(settings).map((request) =>
        provider.fetchTopStories(request),
      ),
    );
    const articles = dedupeArticlesByUrl(batches.flat());

    await Promise.all(
      articles.map((article) =>
        db.article.upsert({
          where: { url: article.url },
          create: article,
          update: {
            externalId: article.externalId,
            title: article.title,
            description: article.description,
            imageUrl: article.imageUrl,
            source: article.source,
            publishedAt: article.publishedAt,
            category: article.category,
          },
        }),
      ),
    );

    await db.fetchRun.update({
      where: { id: fetchRun.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        message: `Fetched ${articles.length} articles.`,
      },
    });

    return articles;
  } catch (error) {
    await db.fetchRun.update({
      where: { id: fetchRun.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        message: error instanceof Error ? error.message : 'Unknown fetch error',
      },
    });

    throw error;
  }
}
