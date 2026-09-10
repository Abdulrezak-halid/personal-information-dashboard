export async function GET() {
  const key = process.env.CURRENCY_API_KEY
  if (!key) return Response.json({ error: 'Currency API is not configured.' }, { status: 503 })

  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 13)
  const request = async (path: string) => {
    const response = await fetch(`https://api.currencyapi.com/v3/${path}`, {
      headers: { apikey: key },
    })
    if (!response.ok) throw new Error(`Currency API returned ${response.status}`)
    return response.json()
  }

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
    return Response.json({
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
    return Response.json(
      { error: error instanceof Error ? error.message : 'Currency data could not be loaded.' },
      { status: 502 },
    )
  }
}
