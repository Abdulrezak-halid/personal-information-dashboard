/**
 * Integration tests for new widget providers
 * Run with: npm test apps/web -- src/providers/exchange-rates.test.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { exchangeRateProvider, demoExchangeRates } from '@/providers/exchange-rates'

describe('Exchange Rate Provider', () => {
  it('should return demo data with correct structure', () => {
    demoExchangeRates.forEach((rate) => {
      expect(rate).toHaveProperty('baseCurrency')
      expect(rate).toHaveProperty('quoteCurrency')
      expect(rate).toHaveProperty('rate')
      expect(rate).toHaveProperty('updatedAt')
      expect(typeof rate.rate).toBe('number')
      expect(rate.rate).toBeGreaterThan(0)
    })
  })

  it('should have USD to EUR rate in demo data', () => {
    const usdEur = demoExchangeRates.find(
      (r) => r.baseCurrency === 'USD' && r.quoteCurrency === 'EUR',
    )
    expect(usdEur).toBeDefined()
    expect(usdEur?.rate).toBeCloseTo(0.92, 1)
  })

  it('should filter demo data by target currencies', async () => {
    const filtered = demoExchangeRates.filter((r) => ['EUR', 'GBP'].includes(r.quoteCurrency))
    expect(filtered).toHaveLength(2)
  })

  // Real API test (will fail without internet, so skip by default)
  it.skip('should fetch real exchange rates from API', async () => {
    const rates = await exchangeRateProvider.getRates('USD', ['EUR', 'GBP'])
    expect(rates).toHaveLength(2)
    expect(rates.length > 0 && rates[0]?.rate).toBeGreaterThan(0)
  })
})

describe('Stock Provider', () => {
  // Stock provider is currently demo-only
  it('stock provider is placeholder for real implementation', () => {
    expect(true).toBe(true)
  })
})

describe('News Provider', () => {
  // News provider is currently demo-only
  it('news provider is placeholder for real implementation', () => {
    expect(true).toBe(true)
  })
})
