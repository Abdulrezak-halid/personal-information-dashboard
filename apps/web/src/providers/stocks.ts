import type { StockQuote } from '@picc/shared'

export interface StockProvider {
  id: string
  getQuotes(symbols: string[]): Promise<StockQuote[]>
}

/**
 * Using finnhub.io free tier (requires free API key from finnhub.io)
 * Alternatives with free tiers:
 * - Alpha Vantage API (requires API key, 5 requests/minute free)
 * - IEX Cloud (free tier available with key)
 * - Polygon.io (free tier with key)
 * - Yahoo Finance (no official API, but can scrape)
 *
 * For now, using demo data to avoid needing API keys
 * Production implementation would need a backend proxy with API key
 */

export const demoStockQuotes: StockQuote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 228.43,
    change: 2.15,
    changePercent: 0.95,
    updatedAt: '2026-08-31T16:00:00.000Z',
    delayed: false,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 416.72,
    change: -1.28,
    changePercent: -0.31,
    updatedAt: '2026-08-31T16:00:00.000Z',
    delayed: false,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 132.54,
    change: 3.42,
    changePercent: 2.65,
    updatedAt: '2026-08-31T16:00:00.000Z',
    delayed: false,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 191.28,
    change: 0.88,
    changePercent: 0.46,
    updatedAt: '2026-08-31T16:00:00.000Z',
    delayed: false,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 168.91,
    change: -2.14,
    changePercent: -1.25,
    updatedAt: '2026-08-31T16:00:00.000Z',
    delayed: false,
  },
]

// Placeholder implementation - would be populated when API key is available
export const stockProvider: StockProvider = {
  id: 'demo-stocks',
  async getQuotes(symbols) {
    // TODO: Implement real stock provider when API key is available
    // For now, return demo data filtered by requested symbols
    return demoStockQuotes.filter((q) => symbols.includes(q.symbol))
  },
}
