import { useEffect, useMemo, useState } from 'react'
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout/legacy'
import type { Dashboard } from '@picc/shared'
import { useDashboardStore } from '@/state/dashboard-store'
import { WidgetFrame } from './widget-frame'

const ResponsiveGrid = WidthProvider(Responsive)

export function DashboardGrid({ dashboard }: { dashboard: Dashboard }) {
  const mode = useDashboardStore((state) => state.mode)
  const updateLayout = useDashboardStore((state) => state.updateLayout)
  const removeWidget = useDashboardStore((state) => state.removeWidget)
  const duplicateWidget = useDashboardStore((state) => state.duplicateWidget)
  const updateWidgetSettings = useDashboardStore((state) => state.updateWidgetSettings)
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const listener = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [])
  const mobileLayout = useMemo(() => {
    let y = 0
    return [...dashboard.layout]
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((item) => {
        const stacked = { ...item, x: 0, y, w: 1, minW: 1, maxW: 1 }
        y += item.h
        return stacked
      })
  }, [dashboard.layout])
  if (!dashboard.widgets.length)
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 text-2xl">
            +
          </div>
          <h2 className="text-lg font-medium">Your canvas is ready</h2>
          <p className="mt-1 text-sm text-(--muted)">
            Use Add Widget to build your control center.
          </p>
        </div>
      </div>
    )
  return (
    <div className="dashboard-grid">
      <ResponsiveGrid
        className="layout"
        layouts={{ lg: dashboard.layout as Layout, mobile: mobileLayout as Layout }}
        breakpoints={{ lg: 768, mobile: 0 }}
        cols={{ lg: dashboard.settings.columns, mobile: 1 }}
        rowHeight={mobile ? 72 : dashboard.settings.rowHeight}
        margin={mobile ? [0, 12] : [dashboard.settings.gap, dashboard.settings.gap]}
        isDraggable={!mobile && mode === 'edit'}
        isResizable={!mobile && mode === 'edit'}
        draggableHandle=".widget-drag-handle"
        compactType={dashboard.settings.compact ? 'vertical' : null}
        onLayoutChange={(layout) => {
          if (!mobile && mode === 'edit')
            updateLayout(
              layout.map(({ i, x, y, w, h, minW, minH, maxW, maxH }) => ({
                i,
                x,
                y,
                w,
                h,
                ...(minW ? { minW } : {}),
                ...(minH ? { minH } : {}),
                ...(maxW ? { maxW } : {}),
                ...(maxH ? { maxH } : {}),
              })),
            )
        }}
      >
        {dashboard.widgets.map((widget) => (
          <div key={widget.id}>
            <WidgetFrame
              widget={widget}
              mode={mode}
              demo={dashboard.dataMode === 'demo'}
              onRemove={() => removeWidget(widget.id)}
              onDuplicate={() => duplicateWidget(widget.id)}
              onSettings={(settings) => updateWidgetSettings(widget.id, settings)}
            />
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  )
}
