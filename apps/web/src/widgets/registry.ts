import {
  Bitcoin,
  ChartNoAxesCombined,
  Clock,
  CloudSun,
  ListChecks,
  Newspaper,
  Rss,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { IconName, WidgetDefinition } from '@/dashboard/types'
import { clockWidget } from './clock'
import { cryptoWidget } from './crypto'
import { hackerNewsWidget } from './hacker-news'
import { mockMetricsWidget } from './mock-metrics'
import { rssWidget } from './rss'
import { tasksWidget } from './tasks'
import { weatherWidget } from './weather'

export const widgetDefinitions: WidgetDefinition<any>[] = [
  clockWidget,
  weatherWidget,
  cryptoWidget,
  hackerNewsWidget,
  rssWidget,
  tasksWidget,
  mockMetricsWidget,
]
const registry = new Map(widgetDefinitions.map((definition) => [definition.type, definition]))
export const getWidgetDefinition = (type: string) => registry.get(type)
export const widgetIcons: Record<IconName, ComponentType<{ size?: number; className?: string }>> = {
  clock: Clock,
  'cloud-sun': CloudSun,
  bitcoin: Bitcoin,
  newspaper: Newspaper,
  rss: Rss,
  'list-checks': ListChecks,
  chart: ChartNoAxesCombined,
}
