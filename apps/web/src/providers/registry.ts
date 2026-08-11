import { coinbaseProvider } from './coinbase'
import { hackerNewsProvider, rssProvider } from './feeds'
import { openMeteoProvider } from './open-meteo'

export const providerRegistry = {
  weather: { 'open-meteo': openMeteoProvider },
  market: { coinbase: coinbaseProvider },
  feed: { 'hacker-news': hackerNewsProvider, rss: rssProvider },
} as const
