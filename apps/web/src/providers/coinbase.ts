import type { MarketQuote } from '@picc/shared'
import type { MarketDataProvider } from './contracts'

export const coinbaseProvider: MarketDataProvider = {
  id: 'coinbase',
  async getQuotes(symbols, quoteCurrency) {
    return Promise.all(
      symbols.map(async (symbol): Promise<MarketQuote> => {
        const response = await fetch(
          `https://api.coinbase.com/v2/prices/${encodeURIComponent(symbol)}-${encodeURIComponent(quoteCurrency)}/spot`,
        )
        if (!response.ok) throw new Error(`No quote available for ${symbol}.`)
        const payload = (await response.json()) as { data: { amount: string } }
        return {
          symbol,
          quoteCurrency,
          price: Number(payload.data.amount),
          updatedAt: new Date().toISOString(),
        }
      }),
    )
  },
}

export const demoQuotes: MarketQuote[] = [
  {
    symbol: 'BTC',
    quoteCurrency: 'USD',
    price: 117420.18,
    previousClose: 115800,
    updatedAt: '2026-08-11T09:30:00.000Z',
    demo: true,
  },
  {
    symbol: 'ETH',
    quoteCurrency: 'USD',
    price: 4288.42,
    previousClose: 4195,
    updatedAt: '2026-08-11T09:30:00.000Z',
    demo: true,
  },
]
