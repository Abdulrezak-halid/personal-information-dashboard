const MERSIN = { lat: '36.8121', lon: '34.6415' }

export async function GET() {
  const key = process.env.METEOSOURCE_API_KEY ?? process.env.WEATHER_API_KEY
  if (!key) return Response.json({ error: 'Meteosource is not configured.' }, { status: 503 })

  try {
    const params = new URLSearchParams({
      ...MERSIN,
      sections: 'current,hourly,daily',
      timezone: 'Europe/Istanbul',
      language: 'en',
      units: 'metric',
      key,
    })
    const response = await fetch(`https://www.meteosource.com/api/v1/free/point?${params}`)
    if (!response.ok) throw new Error(`Meteosource returned ${response.status}`)

    const data = await response.json()
    const current = data.current ?? {}
    const hourly = data.hourly?.data ?? data.hourly ?? []
    const daily = data.daily?.data ?? data.daily ?? []
    return Response.json({
      temperature: current.temperature,
      apparentTemperature: current.feels_like ?? current.temperature,
      condition: current.summary,
      humidity: current.humidity,
      precipitation: current.precipitation?.total ?? current.precipitation?.probability ?? 0,
      wind: current.wind?.speed,
      hourly: hourly.map((hour: { date?: string; temperature?: number; summary?: string }) => ({
        time: hour.date,
        temperature: hour.temperature,
        condition: hour.summary,
      })),
      daily: daily.map(
        (day: {
          day?: string
          date?: string
          temperature?: number
          temperature_max?: number
          temperature_min?: number
          summary?: string
        }) => ({
          date: day.day ?? day.date,
          max: day.temperature_max ?? day.temperature,
          min: day.temperature_min ?? day.temperature,
          condition: day.summary,
        }),
      ),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Weather data could not be loaded.' },
      { status: 502 },
    )
  }
}
