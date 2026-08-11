import { rssResponseSchema, type FeedItem } from '@picc/shared'
import type { FeedProvider } from './contracts'

type HnOptions = { feed: 'top' | 'new' | 'best'; limit: number }
export const hackerNewsProvider: FeedProvider<HnOptions> = {
  id: 'hacker-news',
  async getItems({ feed, limit }) {
    const idsResponse = await fetch(`https://hacker-news.firebaseio.com/v0/${feed}stories.json`)
    if (!idsResponse.ok) throw new Error('Hacker News is unavailable.')
    const ids = ((await idsResponse.json()) as number[]).slice(0, limit)
    const stories = await Promise.all(
      ids.map(async (id) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        if (!response.ok) return null
        return response.json() as Promise<{
          id: number
          title: string
          url?: string
          by?: string
          time?: number
          score?: number
        }>
      }),
    )
    return stories
      .filter((story): story is NonNullable<typeof story> => Boolean(story))
      .map((story) => ({
        id: String(story.id),
        title: story.title,
        url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
        ...(story.by ? { author: story.by } : {}),
        ...(story.time ? { publishedAt: new Date(story.time * 1000).toISOString() } : {}),
        ...(story.score !== undefined ? { score: story.score } : {}),
      }))
  },
}

export const rssProvider: FeedProvider<{ url: string; limit: number }> = {
  id: 'rss',
  async getItems({ url, limit }) {
    const response = await fetch(`/api/rss?url=${encodeURIComponent(url)}`)
    if (!response.ok) {
      if (response.status === 404 || response.status >= 500)
        throw new Error('RSS requires Server Mode. Start the optional API to enable it.')
      const body = (await response.json().catch(() => null)) as { error?: string } | null
      throw new Error(body?.error ?? 'This feed could not be loaded.')
    }
    return rssResponseSchema.parse(await response.json()).items.slice(0, limit)
  },
}

export const demoFeed: FeedItem[] = [
  {
    id: '1',
    title: 'A practical guide to building resilient local-first software',
    url: 'https://example.com/local-first',
    author: 'demo-user',
    score: 428,
    publishedAt: '2026-08-11T08:20:00.000Z',
  },
  {
    id: '2',
    title: 'The quiet craft of useful open-source tools',
    url: 'https://example.com/open-source',
    author: 'platform-builder',
    score: 312,
    publishedAt: '2026-08-11T07:00:00.000Z',
  },
  {
    id: '3',
    title: 'Designing dashboards that stay readable under pressure',
    url: 'https://example.com/dashboards',
    author: 'signal-noise',
    score: 196,
    publishedAt: '2026-08-11T05:40:00.000Z',
  },
]
