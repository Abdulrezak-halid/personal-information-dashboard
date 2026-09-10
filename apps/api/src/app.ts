import { Hono } from 'hono'
import { cors } from 'hono/cors'
export const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      const allowed = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((item) => item.trim())
      return allowed.includes(origin) ? origin : allowed[0]!
    },
  }),
)

app.get('/api/health', (context) => context.json({ status: 'ok', service: 'picc-api', version: 1 }))
app.get('/api/currency', async (context) => {
  const key = process.env.CURRENCY_API_KEY
  if (!key) return context.json({ error: 'Currency API is not configured.' }, 503)
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 13)
  const request = (path: string) =>
    fetch(`https://api.currencyapi.com/v3/${path}`, { headers: { apikey: key } }).then(
      async (response) => {
        if (!response.ok) throw new Error(`Currency API returned ${response.status}`)
        return response.json()
      },
    )
  try {
    const range = new URLSearchParams({
      base_currency: 'USD',
      currencies: 'TRY',
      datetime_start: start.toISOString(),
      datetime_end: now.toISOString(),
      accuracy: 'day',
    })
    const latest = await request('latest?base_currency=USD&currencies=TRY')
    const historical = await request(`range?${range}`).catch(() => ({ data: [] }))
    return context.json({
      latest: latest.data?.TRY?.value,
      updatedAt: latest.meta?.last_updated_at,
      points: (historical.data ?? [])
        .map((item: { datetime: string; currencies?: { TRY?: { value?: number } } }) => ({
          date: item.datetime,
          rate: item.currencies?.TRY?.value,
        }))
        .filter((item: { rate?: number }) => typeof item.rate === 'number'),
    })
  } catch (error) {
    return context.json(
      { error: error instanceof Error ? error.message : 'Currency data could not be loaded.' },
      502,
    )
  }
})
app.get('/api/weather', async (context) => {
  const key = process.env.METEOSOURCE_API_KEY ?? process.env.WEATHER_API_KEY
  if (!key) return context.json({ error: 'Meteosource is not configured.' }, 503)
  try {
    const params = new URLSearchParams({
      lat: '36.8121',
      lon: '34.6415',
      sections: 'current,hourly,daily',
      timezone: 'Europe/Istanbul',
      language: 'en',
      units: 'metric',
      key,
    })
    const response = await fetch(
      `https://www.meteosource.com/api/v1/free/point?${params}`,
    )
    if (!response.ok) throw new Error(`Meteosource returned ${response.status}`)
    const data = await response.json()
    const current = data.current ?? {}
    const hourly = data.hourly?.data ?? data.hourly ?? []
    const daily = data.daily?.data ?? data.daily ?? []
    return context.json({
      temperature: current.temperature,
      apparentTemperature: current.feels_like ?? current.temperature,
      condition: current.summary,
      humidity: current.humidity,
      precipitation: current.precipitation?.total ?? current.precipitation?.probability ?? 0,
      wind: current.wind?.speed,
      hourly: hourly.map((hour: { date?: string; temperature?: number; summary?: string }) => ({ time: hour.date, temperature: hour.temperature, condition: hour.summary })),
      daily: daily.map((day: { day?: string; date?: string; temperature?: number; temperature_max?: number; temperature_min?: number; summary?: string }) => ({ date: day.day ?? day.date, max: day.temperature_max ?? day.temperature, min: day.temperature_min ?? day.temperature, condition: day.summary })),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return context.json(
      { error: error instanceof Error ? error.message : 'Weather data could not be loaded.' },
      502,
    )
  }
})
