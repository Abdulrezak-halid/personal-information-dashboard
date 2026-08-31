import { z } from 'zod'

export const APP_SCHEMA_VERSION = 1 as const
export const EXPORT_SCHEMA_VERSION = 1 as const

export const themeSchema = z.enum(['light', 'dark', 'system'])
export type Theme = z.infer<typeof themeSchema>

export const widgetLayoutSchema = z.object({
  i: z.string().min(1),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
  minW: z.number().int().positive().optional(),
  minH: z.number().int().positive().optional(),
  maxW: z.number().int().positive().optional(),
  maxH: z.number().int().positive().optional(),
})
export type WidgetLayout = z.infer<typeof widgetLayoutSchema>

export const widgetInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  version: z.number().int().positive(),
  title: z.string().min(1).max(120).optional(),
  settings: z.record(z.string(), z.unknown()),
})
export type WidgetInstance = z.infer<typeof widgetInstanceSchema>

export const dashboardSettingsSchema = z.object({
  columns: z.number().int().min(4).max(24).default(12),
  rowHeight: z.number().int().min(24).max(120).default(56),
  gap: z.number().int().min(0).max(32).default(12),
  compact: z.boolean().default(true),
  theme: themeSchema.optional(),
  background: z.enum(['plain', 'grid', 'glow']).default('grid'),
})
export type DashboardSettings = z.infer<typeof dashboardSettingsSchema>

export const dashboardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  dataMode: z.enum(['live', 'demo']).default('live'),
  widgets: z.array(widgetInstanceSchema),
  layout: z.array(widgetLayoutSchema),
  settings: dashboardSettingsSchema,
})
export type Dashboard = z.infer<typeof dashboardSchema>

export const integrationConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  lastSuccessfulRequest: z.string().datetime().optional(),
})

export const appStateSchema = z.object({
  schemaVersion: z.literal(APP_SCHEMA_VERSION),
  onboardingCompleted: z.boolean(),
  activeDashboardId: z.string(),
  preferences: z.object({
    theme: themeSchema,
    timezone: z.string(),
    location: z.string(),
    locale: z.string(),
  }),
  integrations: z.record(z.string(), integrationConfigSchema),
  dashboards: z.array(dashboardSchema).min(1),
})
export type AppState = z.infer<typeof appStateSchema>

export const dashboardExportSchema = z.object({
  kind: z.enum(['dashboard', 'template']),
  schemaVersion: z.literal(EXPORT_SCHEMA_VERSION),
  exportedAt: z.string().datetime(),
  dashboard: dashboardSchema,
})
export type DashboardExport = z.infer<typeof dashboardExportSchema>

export interface WeatherLocation {
  id: string
  name: string
  country?: string
  latitude: number
  longitude: number
  timezone: string
}

export interface WeatherSnapshot {
  location: WeatherLocation
  temperature: number
  apparentTemperature: number
  weatherCode: number
  windSpeed: number
  unit: 'celsius' | 'fahrenheit'
  forecast: Array<{ date: string; min: number; max: number; weatherCode: number }>
  updatedAt: string
  demo?: boolean
}

export interface MarketQuote {
  symbol: string
  quoteCurrency: string
  price: number
  previousClose?: number
  updatedAt: string
  demo?: boolean
}

export interface ExchangeRateData {
  baseCurrency: string
  quoteCurrency: string
  rate: number
  updatedAt: string
  demo?: boolean
}

export interface StockQuote {
  symbol: string
  name?: string
  price: number
  change?: number
  changePercent?: number
  updatedAt: string
  delayed?: boolean
  demo?: boolean
}

export interface FeedItem {
  id: string
  title: string
  url: string
  author?: string
  publishedAt?: string
  summary?: string
  score?: number
}

export const rssResponseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  fetchedAt: z.string().datetime(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().url(),
      author: z.string().optional(),
      publishedAt: z.string().optional(),
      summary: z.string().optional(),
    }),
  ),
})
export type RssResponse = z.infer<typeof rssResponseSchema>

const secretKeyPattern = /(secret|token|password|authorization|api[-_]?key|credential)/i

export function stripCredentialLikeFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripCredentialLikeFields)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !secretKeyPattern.test(key))
        .map(([key, child]) => [key, stripCredentialLikeFields(child)]),
    )
  }
  return value
}
