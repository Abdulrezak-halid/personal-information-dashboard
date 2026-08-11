import { Copy, GripHorizontal, MoreHorizontal, Settings, Trash2 } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode, useState } from 'react'
import { IconButton } from '@/components/ui'
import type { WidgetInstance } from '@picc/shared'
import { getWidgetDefinition, widgetIcons } from '@/widgets/registry'
import { WidgetSettingsDialog } from './widget-settings'

class WidgetErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Widget rendering failed', error, info)
  }
  render() {
    return this.state.error ? (
      <div className="grid h-full place-items-center p-4 text-center text-sm text-red-300">
        This widget could not render.
        <button
          className="mt-2 block text-xs underline"
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </button>
      </div>
    ) : (
      this.props.children
    )
  }
}

export function WidgetFrame({
  widget,
  mode,
  demo,
  onRemove,
  onDuplicate,
  onSettings,
}: {
  widget: WidgetInstance
  mode: 'view' | 'edit'
  demo: boolean
  onRemove: () => void
  onDuplicate: () => void
  onSettings: (settings: Record<string, unknown>) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const definition = getWidgetDefinition(widget.type)
  if (!definition)
    return (
      <div className="widget-frame grid place-items-center text-sm text-red-300">
        Unknown widget: {widget.type}
      </div>
    )
  const parsed = definition.settingsSchema.safeParse(widget.settings)
  if (!parsed.success)
    return (
      <div className="widget-frame grid place-items-center p-4 text-center text-sm text-red-300">
        Invalid {definition.name} settings.
      </div>
    )
  const Icon = widgetIcons[definition.icon]!
  const Widget = definition.component
  return (
    <>
      <article
        className={`widget-frame group flex h-full flex-col ${mode === 'edit' ? 'widget-editing' : ''}`}
      >
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-(--border) px-3">
          <span className="text-cyan-300">
            <Icon size={15} />
          </span>
          <h2 className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-[0.14em] text-(--muted)">
            {widget.title ?? definition.name}
          </h2>
          {mode === 'edit' && (
            <>
              <span className="widget-drag-handle cursor-grab text-(--muted) active:cursor-grabbing">
                <GripHorizontal size={17} />
              </span>
              <IconButton
                label="Widget settings"
                className="size-7"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings size={14} />
              </IconButton>
              <IconButton label="Duplicate widget" className="size-7" onClick={onDuplicate}>
                <Copy size={14} />
              </IconButton>
              <IconButton
                label="Remove widget"
                className="size-7 hover:text-red-300"
                onClick={onRemove}
              >
                <Trash2 size={14} />
              </IconButton>
            </>
          )}{' '}
          {mode === 'view' && <MoreHorizontal size={15} className="opacity-25" />}
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-4">
          <WidgetErrorBoundary>
            <Widget
              instanceId={widget.id}
              settings={parsed.data}
              mode={mode}
              demo={demo}
              updateSettings={(patch: Record<string, unknown>) =>
                onSettings({ ...parsed.data, ...patch })
              }
            />
          </WidgetErrorBoundary>
        </div>
      </article>
      <WidgetSettingsDialog
        definition={definition}
        settings={parsed.data}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={onSettings}
      />
    </>
  )
}
