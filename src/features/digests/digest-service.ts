import { db } from '@/lib/db';
import type { Settings } from '@/features/settings/settings-schema';
import type { NewsCategory, NormalizedArticle } from '@/features/news/news-provider';

export type DigestArticle = {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
};

export type DigestSection = {
  category: NewsCategory;
  title: string;
  articles: DigestArticle[];
};

const SECTION_TITLES: Record<NewsCategory, string> = {
  GEOPOLITICS: 'Geopolitics',
  SPORTS: 'Sports',
};

function enabledCategories(settings: Settings): NewsCategory[] {
  const categories: NewsCategory[] = [];

  if (settings.geopoliticsEnabled) {
    categories.push('GEOPOLITICS');
  }

  if (settings.sportsEnabled) {
    categories.push('SPORTS');
  }

  return categories;
}

export function buildDigestSections({
  articles,
  settings,
}: {
  articles: NormalizedArticle[];
  settings: Settings;
}): DigestSection[] {
  return enabledCategories(settings)
    .map((category) => ({
      category,
      title: SECTION_TITLES[category],
      articles: articles
        .filter((article) => article.category === category)
        .map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source,
          publishedAt: article.publishedAt.toISOString(),
        })),
    }))
    .filter((section) => section.articles.length > 0);
}

export async function createAndStoreDigest({
  articles,
  settings,
  date = new Date(),
}: {
  articles: NormalizedArticle[];
  settings: Settings;
  date?: Date;
}) {
  const isoDate = date.toISOString().slice(0, 10);
  const sections = buildDigestSections({ articles, settings });

  return db.digest.upsert({
    where: { date: isoDate },
    create: {
      date: isoDate,
      sections,
    },
    update: {
      sections,
    },
  });
}
