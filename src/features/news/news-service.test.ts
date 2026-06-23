import { describe, expect, it } from 'vitest';
import type { Settings } from '@/features/settings/settings-schema';
import type { NormalizedArticle } from './news-provider';
import { buildCategoryRequests, dedupeArticlesByUrl } from './news-service';

const baseSettings: Settings = {
  id: 'default',
  geopoliticsEnabled: true,
  sportsEnabled: true,
  scheduleEnabled: false,
  scheduleTime: '08:00',
  timezone: 'America/Los_Angeles',
};

describe('news service', () => {
  it('builds category requests from enabled settings', () => {
    expect(buildCategoryRequests(baseSettings)).toEqual([
      {
        category: 'GEOPOLITICS',
        apiCategory: 'politics',
        search: 'diplomacy | sanctions | conflict | NATO | election',
        limit: 5,
        language: 'en',
      },
      {
        category: 'SPORTS',
        apiCategory: 'sports',
        limit: 5,
        language: 'en',
      },
    ]);

    expect(
      buildCategoryRequests({
        ...baseSettings,
        sportsEnabled: false,
      }),
    ).toHaveLength(1);
  });

  it('deduplicates articles by URL while keeping first occurrence', () => {
    const articles: NormalizedArticle[] = [
      {
        externalId: 'first',
        title: 'First',
        description: null,
        url: 'https://example.com/a',
        imageUrl: null,
        source: 'example.com',
        publishedAt: new Date('2026-06-22T10:00:00Z'),
        category: 'GEOPOLITICS',
      },
      {
        externalId: 'duplicate',
        title: 'Duplicate',
        description: null,
        url: 'https://example.com/a',
        imageUrl: null,
        source: 'example.com',
        publishedAt: new Date('2026-06-22T11:00:00Z'),
        category: 'SPORTS',
      },
    ];

    expect(dedupeArticlesByUrl(articles)).toEqual([articles[0]]);
  });
});
