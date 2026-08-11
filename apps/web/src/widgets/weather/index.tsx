import { useQuery } from '@tanstack/react-query'
import { CloudSun, Droplets, Wind } from 'lucide-react'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { demoWeather } from '@/providers/open-meteo'
import { providerRegistry } from '@/providers/registry'
import { UpdatedAt, WidgetStatus } from '@/widgets/shared/widget-state'

const schema = z.object({
  location: z.string().min(2),
  unit: z.enum(['celsius', 'fahrenheit']),
  forecastDays: z.number().int().min(1).max(7),
  refreshMinutes: z.number().int().min(10).max(180),
})
type Settings = z.infer<typeof schema>
const weatherLabel = (code: number) =>
  code === 0
    ? 'Clear'
    : code < 4
      ? 'Partly cloudy'
      : code < 60
        ? 'Cloudy'
        : code < 80
          ? 'Rain'
          : 'Showers'

function WeatherWidget({ settings, demo }: WidgetComponentProps<Settings>) {
  const query = useQuery({
    queryKey: [
      'weather',
      'open-meteo',
      settings.location,
      settings.unit,
      settings.forecastDays,
      demo,
    ],
    queryFn: () =>
      demo
        ? Promise.resolve(demoWeather)
        : providerRegistry.weather['open-meteo'].getWeather(
            settings.location,
            settings.unit,
            settings.forecastDays,
          ),
    staleTime: settings.refreshMinutes * 60_000,
    refetchInterval: demo ? false : settings.refreshMinutes * 60_000,
    refetchIntervalInBackground: false,
    retry: 1,
  })
  const weather = query.data
  return (
    <WidgetStatus
      loading={query.isPending}
      error={query.error}
      empty={!weather}
      onRefresh={() => void query.refetch()}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-[var(--muted)]">
              {weather?.location.name}
              {weather?.location.country ? `, ${weather.location.country}` : ''}
            </div>
            <div className="mt-2 text-4xl font-light">{Math.round(weather?.temperature ?? 0)}°</div>
            <div className="text-sm text-cyan-300">{weatherLabel(weather?.weatherCode ?? 0)}</div>
          </div>
          <CloudSun size={48} strokeWidth={1.25} className="text-cyan-300" />
        </div>
        <div className="mt-4 flex gap-4 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <Droplets size={13} /> Feels {Math.round(weather?.apparentTemperature ?? 0)}°
          </span>
          <span className="flex items-center gap-1">
            <Wind size={13} /> {Math.round(weather?.windSpeed ?? 0)} km/h
          </span>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
          {weather?.forecast.slice(0, 3).map((day) => (
            <div key={day.date} className="rounded-lg bg-white/4 p-2 text-center text-xs">
              <div className="text-[var(--muted)]">
                {new Date(`${day.date}T12:00:00`).toLocaleDateString('en', { weekday: 'short' })}
              </div>
              <div className="mt-1">
                {Math.round(day.max)}°{' '}
                <span className="text-[var(--muted)]">{Math.round(day.min)}°</span>
              </div>
            </div>
          ))}
        </div>
        <UpdatedAt value={query.dataUpdatedAt || weather?.updatedAt} demo={demo} />
      </div>
    </WidgetStatus>
  )
}

export const weatherWidget: WidgetDefinition<Settings> = {
  type: 'weather',
  version: 1,
  name: 'Weather',
  description: 'Current conditions and a compact forecast.',
  category: 'weather',
  icon: 'cloud-sun',
  component: WeatherWidget,
  defaultSize: { width: 4, height: 4 },
  minSize: { width: 3, height: 3 },
  defaultSettings: { location: 'Berlin', unit: 'celsius', forecastDays: 3, refreshMinutes: 15 },
  settingsFields: [
    { key: 'location', type: 'text', label: 'Location', placeholder: 'Berlin' },
    {
      key: 'unit',
      type: 'select',
      label: 'Units',
      options: [
        { value: 'celsius', label: 'Celsius' },
        { value: 'fahrenheit', label: 'Fahrenheit' },
      ],
    },
    { key: 'forecastDays', type: 'number', label: 'Forecast days', min: 1, max: 7 },
    {
      key: 'refreshMinutes',
      type: 'number',
      label: 'Refresh interval (minutes)',
      min: 10,
      max: 180,
    },
  ],
  settingsSchema: schema,
}
