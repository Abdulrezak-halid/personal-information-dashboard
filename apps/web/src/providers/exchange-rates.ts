import type { ExchangeRateData } from '@picc/shared'

export interface ExchangeRateProvider {
  id: string
  getRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRateData[]>
}

/**
 * Using exchangerate-api.com free tier
 * Free tier: 1,500 requests/month, no key required for basic access
 * Alternatively could use:
 * - fixer.io (requires free account)
 * - open-exchange-rates.org (requires free account)
 * - currencyapi.com (free tier with key)
 */
export const exchangeRateProvider: ExchangeRateProvider = {
  id: 'exchangerate-api',
  async getRates(baseCurrency, targetCurrencies) {
    try {
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${encodeURIComponent(baseCurrency)}`,
      )
      if (!response.ok) throw new Error(`Exchange rate API returned ${response.status}`)

      const data = (await response.json()) as {
        rates?: Record<string, number>
        time_last_updated_utc?: string
      }

      if (!data.rates) throw new Error('Invalid response format from exchange rate API')

      const timestamp = data.time_last_updated_utc || new Date().toISOString()

      return targetCurrencies
        .filter((code) => data.rates![code])
        .map((code) => ({
          baseCurrency,
          quoteCurrency: code,
          rate: data.rates![code]!,
          updatedAt: timestamp,
        }))
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch exchange rates',
      )
    }
  },
}

export const demoExchangeRates: ExchangeRateData[] = [
  {
    baseCurrency: 'USD',
    quoteCurrency: 'EUR',
    rate: 0.92,
    updatedAt: '2026-08-31T12:00:00.000Z',
  },
  {
    baseCurrency: 'USD',
    quoteCurrency: 'TRY',
    rate: 33.45,
    updatedAt: '2026-08-31T12:00:00.000Z',
  },
  {
    baseCurrency: 'USD',
    quoteCurrency: 'GBP',
    rate: 0.79,
    updatedAt: '2026-08-31T12:00:00.000Z',
  },
]
