import type {
  FetchTopStoriesOptions,
  NewsProvider,
  NormalizedArticle,
} from './news-provider';

type FetchImpl = typeof fetch;

type TheNewsApiArticle = {
  uuid?: string | null;
  title: string;
  description?: string | null;
  url: string;
  image_url?: string | null;
  published_at: string;
  source: string;
};

type TheNewsApiTopStoriesResponse = {
  data?: TheNewsApiArticle[];
};

type TheNewsApiProviderOptions = {
  apiKey: string;
  fetchImpl?: FetchImpl;
  baseUrl?: string;
};

export class TheNewsApiProvider implements NewsProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchImpl;

  constructor({
    apiKey,
    fetchImpl = fetch,
    baseUrl = 'https://api.thenewsapi.com/v1/news/top',
  }: TheNewsApiProviderOptions) {
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl;
  }

  async fetchTopStories(
    options: FetchTopStoriesOptions,
  ): Promise<NormalizedArticle[]> {
    const response = await this.fetchImpl(this.buildUrl(options));

    if (!response.ok) {
      throw new Error(
        `TheNewsAPI request failed with status ${response.status}`,
      );
    }

    const body = (await response.json()) as TheNewsApiTopStoriesResponse;
    const articles = Array.isArray(body.data) ? body.data : [];

    return articles.map((article) => ({
      externalId: article.uuid ?? null,
      title: article.title,
      description: article.description ?? null,
      url: article.url,
      imageUrl: article.image_url ?? null,
      source: article.source,
      publishedAt: new Date(article.published_at),
      category: options.category,
    }));
  }

  private buildUrl(options: FetchTopStoriesOptions): string {
    const url = new URL(this.baseUrl);

    url.searchParams.set('api_token', this.apiKey);
    url.searchParams.set('categories', options.apiCategory);
    url.searchParams.set('language', options.language ?? 'en');

    if (options.search) {
      url.searchParams.set('search', options.search);
    }

    if (options.limit) {
      url.searchParams.set('limit', String(options.limit));
    }

    if (options.locale) {
      url.searchParams.set('locale', options.locale);
    }

    return url.toString();
  }
}
