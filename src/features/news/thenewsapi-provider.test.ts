import { describe, expect, it, vi } from 'vitest';
import { theNewsApiTopStoriesResponse } from '@/test/fixtures/news';
import { TheNewsApiProvider } from './thenewsapi-provider';

describe('TheNewsApiProvider', () => {
  it('requests top stories with the configured category filters', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      return Response.json(theNewsApiTopStoriesResponse);
    });
    const provider = new TheNewsApiProvider({
      apiKey: 'test-token',
      fetchImpl,
    });

    await provider.fetchTopStories({
      category: 'GEOPOLITICS',
      apiCategory: 'politics',
      search: 'diplomacy | sanctions | conflict',
      limit: 3,
      locale: 'us',
      language: 'en',
    });

    const firstCall = fetchImpl.mock.calls.at(0);

    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error('Expected fetch to be called.');
    }

    const requestedUrl = new URL(String(firstCall[0]));

    expect(requestedUrl.origin + requestedUrl.pathname).toBe(
      'https://api.thenewsapi.com/v1/news/top',
    );
    expect(requestedUrl.searchParams.get('api_token')).toBe('test-token');
    expect(requestedUrl.searchParams.get('categories')).toBe('politics');
    expect(requestedUrl.searchParams.get('search')).toBe(
      'diplomacy | sanctions | conflict',
    );
    expect(requestedUrl.searchParams.get('limit')).toBe('3');
    expect(requestedUrl.searchParams.get('locale')).toBe('us');
    expect(requestedUrl.searchParams.get('language')).toBe('en');
  });

  it('normalizes API articles into local article records', async () => {
    const provider = new TheNewsApiProvider({
      apiKey: 'test-token',
      fetchImpl: async () => Response.json(theNewsApiTopStoriesResponse),
    });

    const articles = await provider.fetchTopStories({
      category: 'SPORTS',
      apiCategory: 'sports',
    });

    expect(articles).toEqual([
      {
        externalId: 'article-1',
        title: 'Talks resume after border tensions',
        description: 'Diplomats restarted talks after a week of border tensions.',
        url: 'https://example.com/geopolitics-1',
        imageUrl: 'https://example.com/geopolitics-1.jpg',
        source: 'example.com',
        publishedAt: new Date('2026-06-22T12:00:00.000000Z'),
        category: 'SPORTS',
      },
      {
        externalId: 'article-2',
        title: 'Tournament final heads into extra time',
        description: null,
        url: 'https://example.com/sports-1',
        imageUrl: null,
        source: 'sports.example.com',
        publishedAt: new Date('2026-06-22T13:30:00.000000Z'),
        category: 'SPORTS',
      },
    ]);
  });

  it('throws a useful error for non-OK API responses', async () => {
    const provider = new TheNewsApiProvider({
      apiKey: 'test-token',
      fetchImpl: async () =>
        new Response(JSON.stringify({ error: 'bad token' }), { status: 401 }),
    });

    await expect(
      provider.fetchTopStories({
        category: 'SPORTS',
        apiCategory: 'sports',
      }),
    ).rejects.toThrow('TheNewsAPI request failed with status 401');
  });
});
