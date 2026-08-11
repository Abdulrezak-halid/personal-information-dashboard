import { useSyncExternalStore } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetComponentProps } from '@/dashboard/types'

const schema = z.object({
  timezone: z.string(),
  hour12: z.boolean(),
  showSeconds: z.boolean(),
  showDate: z.boolean(),
})
type Settings = z.infer<typeof schema>
let now = Date.now()
let timer: number | undefined
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  if (!timer)
    timer = window.setInterval(() => {
      now = Date.now()
      listeners.forEach((item) => item())
    }, 1000)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      window.clearInterval(timer)
      timer = undefined
    }
  }
}
const getSnapshot = () => now

function ClockWidget({ settings }: WidgetComponentProps<Settings>) {
  const timestamp = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const date = new Date(timestamp)
  let time = ''
  let dateText = ''
  try {
    time = new Intl.DateTimeFormat('en', {
      timeZone: settings.timezone,
      hour: '2-digit',
      minute: '2-digit',
      ...(settings.showSeconds ? { second: '2-digit' } : {}),
      hour12: settings.hour12,
    }).format(date)
    dateText = new Intl.DateTimeFormat('en', {
      timeZone: settings.timezone,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    time = date.toLocaleTimeString()
    dateText = date.toLocaleDateString()
  }
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="font-mono text-[clamp(2rem,5vw,4rem)] font-light leading-none tracking-tight text-cyan-100">
        {time}
      </div>
      {settings.showDate && <div className="mt-3 text-sm text-(--muted)">{dateText}</div>}
      <div className="mt-1 text-xs text-cyan-400/70">{settings.timezone}</div>
    </div>
  )
}

export const clockWidget: WidgetDefinition<Settings> = {
  type: 'clock',
  version: 1,
  name: 'Clock',
  description: 'Local or world time with flexible formatting.',
  category: 'time',
  icon: 'clock',
  component: ClockWidget,
  defaultSize: { width: 4, height: 3 },
  minSize: { width: 3, height: 2 },
  defaultSettings: { timezone: 'UTC', hour12: false, showSeconds: true, showDate: true },
  settingsFields: [
    { key: 'timezone', type: 'text', label: 'Timezone', placeholder: 'Europe/Berlin' },
    { key: 'hour12', type: 'boolean', label: 'Use 12-hour time' },
    { key: 'showSeconds', type: 'boolean', label: 'Show seconds' },
    { key: 'showDate', type: 'boolean', label: 'Show date' },
  ],
  settingsSchema: schema,
}
