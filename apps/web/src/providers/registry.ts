import { coinbaseProvider } from './coinbase'
import { exchangeRateProvider } from './exchange-rates'
import { hackerNewsProvider, rssProvider } from './feeds'
import { openMeteoProvider } from './open-meteo'

export const providerRegistry = {
  weather: { 'open-meteo': openMeteoProvider },
  market: { coinbase: coinbaseProvider },
  exchange: { 'exchange-rates': exchangeRateProvider },
  feed: { 'hacker-news': hackerNewsProvider, rss: rssProvider },
} as const
