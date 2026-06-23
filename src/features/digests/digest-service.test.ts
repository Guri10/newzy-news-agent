import { describe, expect, it } from 'vitest';
import type { Settings } from '@/features/settings/settings-schema';
import type { NormalizedArticle } from '@/features/news/news-provider';
import { buildDigestSections } from './digest-service';

const settings: Settings = {
  id: 'default',
  geopoliticsEnabled: true,
  sportsEnabled: false,
  scheduleEnabled: false,
  scheduleTime: '08:00',
  timezone: 'America/Los_Angeles',
};

const articles: NormalizedArticle[] = [
  {
    externalId: 'geo-1',
    title: 'Diplomacy talks resume',
    description: 'Talks resumed today.',
    url: 'https://example.com/geo',
    imageUrl: null,
    source: 'example.com',
    publishedAt: new Date('2026-06-22T10:00:00Z'),
    category: 'GEOPOLITICS',
  },
  {
    externalId: 'sports-1',
    title: 'Final reaches extra time',
    description: 'A tense final continues.',
    url: 'https://example.com/sports',
    imageUrl: null,
    source: 'sports.example.com',
    publishedAt: new Date('2026-06-22T11:00:00Z'),
    category: 'SPORTS',
  },
];

describe('digest service', () => {
  it('builds sections for enabled categories only', () => {
    expect(buildDigestSections({ articles, settings })).toEqual([
      {
        category: 'GEOPOLITICS',
        title: 'Geopolitics',
        articles: [
          {
            title: 'Diplomacy talks resume',
            description: 'Talks resumed today.',
            url: 'https://example.com/geo',
            source: 'example.com',
            publishedAt: '2026-06-22T10:00:00.000Z',
          },
        ],
      },
    ]);
  });
});
