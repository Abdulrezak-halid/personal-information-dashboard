import type { Dashboard, WidgetInstance, WidgetLayout } from '@picc/shared'
import { createId } from '@/lib/utils'
import { getWidgetDefinition } from '@/widgets/registry'

export type TemplateId = 'demo' | 'daily' | 'developer' | 'market' | 'blank'
export const templateCatalog: Array<{
  id: TemplateId
  name: string
  description: string
  icon: string
  widgetTypes: string[]
}> = [
  {
    id: 'demo',
    name: 'Demo Dashboard',
    description: 'A polished, deterministic showcase with sample data.',
    icon: '✨',
    widgetTypes: ['clock', 'weather', 'crypto', 'hacker-news', 'tasks', 'mock-metrics'],
  },
  {
    id: 'daily',
    name: 'Daily Dashboard',
    description: 'Time, weather, headlines, and your local tasks.',
    icon: '📊',
    widgetTypes: ['clock', 'weather', 'hacker-news', 'tasks'],
  },
  {
    id: 'developer',
    name: 'Developer Dashboard',
    description: 'News, feeds, tasks, and a mock operational chart.',
    icon: '👨‍💻',
    widgetTypes: ['clock', 'hacker-news', 'rss', 'tasks', 'mock-metrics'],
  },
  {
    id: 'market',
    name: 'Market Dashboard',
    description: 'Crypto prices beside a compact market-style chart.',
    icon: '💰',
    widgetTypes: ['clock', 'crypto', 'mock-metrics', 'hacker-news'],
  },
  {
    id: 'blank',
    name: 'Blank Dashboard',
    description: 'Start with an empty canvas and make it yours.',
    icon: '+',
    widgetTypes: [],
  },
]

export function createDashboardFromTemplate(
  templateId: TemplateId,
  selectedTypes?: string[],
  preferences?: { timezone?: string; location?: string },
): Dashboard {
  const template = templateCatalog.find((item) => item.id === templateId) ?? templateCatalog[4]!
  const widgetTypes = selectedTypes ?? template.widgetTypes
  const widgets: WidgetInstance[] = []
  const layout: WidgetLayout[] = []
  let cursorX = 0
  let cursorY = 0
  let rowHeight = 0
  for (const type of widgetTypes) {
    const definition = getWidgetDefinition(type)
    if (!definition) continue
    const id = createId(type)
    const settings = { ...definition.defaultSettings }
    if (type === 'clock' && preferences?.timezone) settings.timezone = preferences.timezone
    if (type === 'weather' && preferences?.location) settings.location = preferences.location
    widgets.push({ id, type, version: definition.version, settings })
    const w = definition.defaultSize.width
    const h = definition.defaultSize.height
    if (cursorX + w > 12) {
      cursorX = 0
      cursorY += rowHeight
      rowHeight = 0
    }
    layout.push({
      i: id,
      x: cursorX,
      y: cursorY,
      w,
      h,
      minW: definition.minSize.width,
      minH: definition.minSize.height,
      ...(definition.maxSize
        ? { maxW: definition.maxSize.width, maxH: definition.maxSize.height }
        : {}),
    })
    cursorX += w
    rowHeight = Math.max(rowHeight, h)
  }
  const now = new Date().toISOString()
  return {
    id: createId('dashboard'),
    name: template.name.replace(' Dashboard', '') || 'Dashboard',
    createdAt: now,
    updatedAt: now,
    dataMode: templateId === 'demo' ? 'demo' : 'live',
    widgets,
    layout,
    settings: { columns: 12, rowHeight: 56, gap: 12, compact: true, background: 'grid' },
  }
}
