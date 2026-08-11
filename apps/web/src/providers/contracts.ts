import type { FeedItem, MarketQuote, WeatherLocation, WeatherSnapshot } from '@picc/shared'

export interface WeatherProvider {
  id: string
  searchLocations(query: string): Promise<WeatherLocation[]>
  getWeather(
    location: string,
    unit: 'celsius' | 'fahrenheit',
    days: number,
  ): Promise<WeatherSnapshot>
}
export interface MarketDataProvider {
  id: string
  getQuotes(symbols: string[], quoteCurrency: string): Promise<MarketQuote[]>
}
export interface FeedProvider<TOptions = unknown> {
  id: string
  getItems(options: TOptions): Promise<FeedItem[]>
}
