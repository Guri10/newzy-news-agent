export type NewsCategory = 'GEOPOLITICS' | 'SPORTS';
export type TheNewsApiCategory = 'politics' | 'sports';

export type NormalizedArticle = {
  externalId: string | null;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: Date;
  category: NewsCategory;
};

export type FetchTopStoriesOptions = {
  category: NewsCategory;
  apiCategory: TheNewsApiCategory;
  search?: string;
  limit?: number;
  locale?: string;
  language?: string;
};

export interface NewsProvider {
  fetchTopStories(options: FetchTopStoriesOptions): Promise<NormalizedArticle[]>;
}
