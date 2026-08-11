import {
  appStateSchema,
  dashboardExportSchema,
  stripCredentialLikeFields,
  type AppState,
  type Dashboard,
  type DashboardExport,
  type WidgetLayout,
} from '@picc/shared'
import { create } from 'zustand'
import { createId } from '@/lib/utils'
import { dashboardStorage } from '@/storage/dashboard-storage'
import { createDashboardFromTemplate, type TemplateId } from '@/dashboard/templates'
import { getWidgetDefinition } from '@/widgets/registry'

type DashboardStore = AppState & {
  mode: 'view' | 'edit'
  setMode(mode: 'view' | 'edit'): void
  completeOnboarding(
    template: TemplateId,
    widgetTypes: string[],
    preferences: AppState['preferences'],
  ): void
  setActiveDashboard(id: string): void
  createDashboard(name?: string): void
  renameDashboard(id: string, name: string): void
  duplicateDashboard(id: string): void
  deleteDashboard(id: string): void
  updateDashboardSettings(patch: Partial<Dashboard['settings']>): void
  updateLayout(layout: WidgetLayout[]): void
  addWidget(type: string): void
  removeWidget(id: string): void
  duplicateWidget(id: string): void
  updateWidgetSettings(id: string, settings: Record<string, unknown>): void
  importDashboard(value: unknown): Dashboard
  resetOnboarding(): void
}

const blank = createDashboardFromTemplate('blank')
const fallbackState: AppState = {
  schemaVersion: 1,
  onboardingCompleted: false,
  activeDashboardId: blank.id,
  preferences: {
    theme: 'dark',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    location: 'Berlin',
    locale: 'en',
  },
  integrations: Object.fromEntries(
    ['open-meteo', 'coinbase', 'hacker-news', 'rss'].map((id) => [id, { id, enabled: true }]),
  ),
  dashboards: [blank],
}
const initial = dashboardStorage.load() ?? fallbackState
let saveTimer: number | undefined

function cloneDashboard(source: Dashboard, name: string): Dashboard {
  const idMap = new Map(source.widgets.map((widget) => [widget.id, createId(widget.type)]))
  const now = new Date().toISOString()
  return {
    ...structuredClone(source),
    id: createId('dashboard'),
    name,
    createdAt: now,
    updatedAt: now,
    widgets: source.widgets.map((widget) => ({
      ...structuredClone(widget),
      id: idMap.get(widget.id)!,
    })),
    layout: source.layout.map((item) => ({ ...item, i: idMap.get(item.i)! })),
  }
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initial,
  mode: 'view',
  setMode: (mode) => set({ mode }),
  completeOnboarding: (template, widgetTypes, preferences) => {
    const dashboard = createDashboardFromTemplate(template, widgetTypes, preferences)
    set({
      onboardingCompleted: true,
      preferences,
      dashboards: [dashboard],
      activeDashboardId: dashboard.id,
      mode: widgetTypes.length ? 'view' : 'edit',
    })
  },
  setActiveDashboard: (id) => set({ activeDashboardId: id }),
  createDashboard: (name = 'Untitled Dashboard') => {
    const dashboard = { ...createDashboardFromTemplate('blank'), name }
    set((state) => ({
      dashboards: [...state.dashboards, dashboard],
      activeDashboardId: dashboard.id,
      mode: 'edit',
    }))
  },
  renameDashboard: (id, name) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === id
          ? { ...d, name: name.trim() || d.name, updatedAt: new Date().toISOString() }
          : d,
      ),
    })),
  duplicateDashboard: (id) => {
    const source = get().dashboards.find((d) => d.id === id)
    if (!source) return
    const copy = cloneDashboard(source, `${source.name} Copy`)
    set((state) => ({ dashboards: [...state.dashboards, copy], activeDashboardId: copy.id }))
  },
  deleteDashboard: (id) =>
    set((state) => {
      if (state.dashboards.length === 1) return state
      const dashboards = state.dashboards.filter((d) => d.id !== id)
      return {
        dashboards,
        activeDashboardId:
          state.activeDashboardId === id ? dashboards[0]!.id : state.activeDashboardId,
      }
    }),
  updateDashboardSettings: (patch) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) => {
        if (d.id !== state.activeDashboardId) return d
        const nextColumns = patch.columns ?? d.settings.columns
        const ratio = nextColumns / d.settings.columns
        const layout =
          nextColumns === d.settings.columns
            ? d.layout
            : d.layout
                .map((item) => ({
                  ...item,
                  x: Math.max(0, Math.min(nextColumns - 1, Math.round(item.x * ratio))),
                  w: Math.max(item.minW ?? 1, Math.min(nextColumns, Math.round(item.w * ratio))),
                }))
                .map((item) => ({
                  ...item,
                  x: Math.min(item.x, Math.max(0, nextColumns - item.w)),
                }))
        return {
          ...d,
          layout,
          settings: { ...d.settings, ...patch },
          updatedAt: new Date().toISOString(),
        }
      }),
    })),
  updateLayout: (layout) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === state.activeDashboardId
          ? { ...d, layout, updatedAt: new Date().toISOString() }
          : d,
      ),
    })),
  addWidget: (type) => {
    const definition = getWidgetDefinition(type)
    if (!definition) return
    set((state) => ({
      dashboards: state.dashboards.map((dashboard) => {
        if (dashboard.id !== state.activeDashboardId) return dashboard
        const id = createId(type)
        const y = dashboard.layout.reduce((max, item) => Math.max(max, item.y + item.h), 0)
        return {
          ...dashboard,
          widgets: [
            ...dashboard.widgets,
            {
              id,
              type,
              version: definition.version,
              settings: structuredClone(definition.defaultSettings),
            },
          ],
          layout: [
            ...dashboard.layout,
            {
              i: id,
              x: 0,
              y,
              w: definition.defaultSize.width,
              h: definition.defaultSize.height,
              minW: definition.minSize.width,
              minH: definition.minSize.height,
              ...(definition.maxSize
                ? { maxW: definition.maxSize.width, maxH: definition.maxSize.height }
                : {}),
            },
          ],
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
  },
  removeWidget: (id) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === state.activeDashboardId
          ? {
              ...d,
              widgets: d.widgets.filter((w) => w.id !== id),
              layout: d.layout.filter((item) => item.i !== id),
            }
          : d,
      ),
    })),
  duplicateWidget: (id) => {
    const dashboard = get().dashboards.find((d) => d.id === get().activeDashboardId)
    const widget = dashboard?.widgets.find((w) => w.id === id)
    const item = dashboard?.layout.find((l) => l.i === id)
    if (!widget || !item) return
    const copyId = createId(widget.type)
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === state.activeDashboardId
          ? {
              ...d,
              widgets: [...d.widgets, { ...structuredClone(widget), id: copyId }],
              layout: [
                ...d.layout,
                {
                  ...item,
                  i: copyId,
                  x: Math.min(item.x + 1, Math.max(0, d.settings.columns - item.w)),
                  y: item.y + 1,
                },
              ],
            }
          : d,
      ),
    }))
  },
  updateWidgetSettings: (id, settings) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === state.activeDashboardId
          ? { ...d, widgets: d.widgets.map((w) => (w.id === id ? { ...w, settings } : w)) }
          : d,
      ),
    })),
  importDashboard: (value) => {
    const safe = stripCredentialLikeFields(value)
    const parsed = dashboardExportSchema.parse(safe)
    const dashboard = cloneDashboard(parsed.dashboard, parsed.dashboard.name)
    set((state) => ({
      dashboards: [...state.dashboards, dashboard],
      activeDashboardId: dashboard.id,
    }))
    return dashboard
  },
  resetOnboarding: () => set({ onboardingCompleted: false }),
}))

useDashboardStore.subscribe((state) => {
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    const { mode: _mode, ...persisted } = state
    dashboardStorage.save(appStateSchema.parse(persisted))
  }, 250)
})

export function createDashboardExport(
  dashboard: Dashboard,
  kind: DashboardExport['kind'],
): DashboardExport {
  return dashboardExportSchema.parse(
    stripCredentialLikeFields({
      kind,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      dashboard,
    }),
  )
}
