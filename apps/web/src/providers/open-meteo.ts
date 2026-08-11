import type { WeatherSnapshot } from '@picc/shared'
import type { WeatherProvider } from './contracts'

type GeocodingResponse = {
  results?: Array<{
    id: number
    name: string
    country?: string
    latitude: number
    longitude: number
    timezone: string
  }>
}

export const openMeteoProvider: WeatherProvider = {
  id: 'open-meteo',
  async searchLocations(query) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
    )
    if (!response.ok) throw new Error('Location search is unavailable.')
    const data = (await response.json()) as GeocodingResponse
    return (data.results ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      ...(item.country ? { country: item.country } : {}),
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    }))
  },
  async getWeather(location, unit, days) {
    const matches = await this.searchLocations(location)
    const match = matches[0]
    if (!match) throw new Error(`No location found for “${location}”.`)
    const params = new URLSearchParams({
      latitude: String(match.latitude),
      longitude: String(match.longitude),
      current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: String(days),
      temperature_unit: unit,
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!response.ok) throw new Error('Weather provider returned an error.')
    const data = (await response.json()) as any
    return {
      location: match,
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      unit,
      forecast: data.daily.time.map((date: string, index: number) => ({
        date,
        min: data.daily.temperature_2m_min[index],
        max: data.daily.temperature_2m_max[index],
        weatherCode: data.daily.weather_code[index],
      })),
      updatedAt: new Date().toISOString(),
    }
  },
}

export const demoWeather: WeatherSnapshot = {
  location: {
    id: 'demo',
    name: 'Berlin',
    country: 'Germany',
    latitude: 52.52,
    longitude: 13.41,
    timezone: 'Europe/Berlin',
  },
  temperature: 21,
  apparentTemperature: 20,
  weatherCode: 2,
  windSpeed: 11,
  unit: 'celsius',
  forecast: [
    { date: '2026-08-11', min: 16, max: 23, weatherCode: 2 },
    { date: '2026-08-12', min: 15, max: 25, weatherCode: 1 },
    { date: '2026-08-13', min: 17, max: 24, weatherCode: 61 },
  ],
  updatedAt: '2026-08-11T09:30:00.000Z',
  demo: true,
}
