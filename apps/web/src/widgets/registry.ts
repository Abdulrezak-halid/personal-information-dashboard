import {
  Bitcoin,
  Clock,
  CloudSun,
  Globe,
  ListChecks,
  Newspaper,
  Rss,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { IconName, WidgetDefinition } from '@/dashboard/types'
import { clockWidget } from './clock'
import { cryptoWidget } from './crypto'
import { currencyWidget } from './currency'
import { aiNewsWidget } from './ai-news'
import { hackerNewsWidget } from './hacker-news'
import { marketWidget } from './market'
import { rssWidget } from './rss'
import { tasksWidget } from './tasks'
import { weatherWidget } from './weather'

export const widgetDefinitions: WidgetDefinition<any>[] = [
  clockWidget,
  weatherWidget,
  cryptoWidget,
  currencyWidget,
  marketWidget,
  aiNewsWidget,
  hackerNewsWidget,
  rssWidget,
  tasksWidget,
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
  globe: Globe,
  'trending-up': TrendingUp,
  zap: Zap,
}
