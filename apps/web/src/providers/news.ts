import type { FeedItem } from '@picc/shared'

export interface NewsProvider {
  id: string
  getNews(options?: Record<string, unknown>): Promise<FeedItem[]>
}

/**
 * AI News aggregator using public sources:
 * - OpenAI blog RSS
 * - Anthropic research posts
 * - Google DeepMind blog
 * - Meta AI blog
 * - NVIDIA AI research
 *
 * Could also use NewsAPI (requires free key) or similar
 * For now using RSS feeds from company blogs
 */

export const aiNewsProvider: NewsProvider = {
  id: 'ai-news',
  async getNews() {
    // This would typically aggregate from multiple RSS feeds or APIs
    // For now, returning placeholder
    // Implementation would need to fetch from real sources
    return []
  },
}

export const demoAiNews: FeedItem[] = [
  {
    id: 'ai-1',
    title: 'GPT-5 Released: New Breakthrough in Reasoning and Planning',
    url: 'https://example.com/ai-news-1',
    author: 'OpenAI',
    publishedAt: '2026-08-31T14:30:00.000Z',
    summary: 'OpenAI announces a significant breakthrough in reasoning capabilities.',
  },
  {
    id: 'ai-2',
    title: 'DeepMind Announces New Frontier in Protein Structure Prediction',
    url: 'https://example.com/ai-news-2',
    author: 'Google DeepMind',
    publishedAt: '2026-08-31T12:15:00.000Z',
    summary: 'Scientists achieve new accuracy records in predicting protein structures.',
  },
  {
    id: 'ai-3',
    title: 'Anthropic Releases Claude 4 with Enhanced Safety Features',
    url: 'https://example.com/ai-news-3',
    author: 'Anthropic',
    publishedAt: '2026-08-31T10:00:00.000Z',
    summary: 'New AI model demonstrates improved safety and alignment capabilities.',
  },
]

export const techNewsProvider: NewsProvider = {
  id: 'tech-news',
  async getNews() {
    // This would aggregate tech news from sources like:
    // - GitHub Trending
    // - HackerNews (already have this)
    // - Product Hunt
    // - Dev.to
    // - TechCrunch RSS
    return []
  },
}

export const demoDeveloperNews: FeedItem[] = [
  {
    id: 'tech-1',
    title: 'React 19 Stable Released with Major Performance Improvements',
    url: 'https://example.com/tech-1',
    author: 'React Team',
    publishedAt: '2026-08-30T16:45:00.000Z',
  },
  {
    id: 'tech-2',
    title: 'Rust 1.75 Focuses on Async/Await Ergonomics',
    url: 'https://example.com/tech-2',
    author: 'Rust Foundation',
    publishedAt: '2026-08-29T14:20:00.000Z',
  },
  {
    id: 'tech-3',
    title: 'New TypeScript 5.2 Features Improve Type Inference',
    url: 'https://example.com/tech-3',
    author: 'Microsoft',
    publishedAt: '2026-08-28T11:00:00.000Z',
  },
]
