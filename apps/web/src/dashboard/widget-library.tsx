import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Dialog, Input } from '@/components/ui'
import { widgetDefinitions, widgetIcons } from '@/widgets/registry'
import type { WidgetDefinition } from './types'

const categoryLabels: Record<string, string> = {
  time: 'Time',
  weather: 'Weather',
  finance: 'Finance',
  news: 'News',
  productivity: 'Productivity',
  developer: 'Developer',
}

export function WidgetLibrary({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (type: string) => void
}) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(
    () =>
      widgetDefinitions.filter((item) =>
        `${item.name} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  )
  const groups = Object.entries(
    filtered.reduce<Record<string, WidgetDefinition<any>[]>>((result, item) => {
      ;(result[item.category] ??= []).push(item)
      return result
    }, {}),
  )
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add widget"
      description="Choose a building block. Every widget can be configured after adding it."
      className="w-[min(94vw,780px)]"
    >
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-3 text-(--muted)" />
        <Input
          className="pl-9"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search widgets…"
          autoFocus
        />
      </div>
      <div className="space-y-6">
        {groups.map(([category, items]) => (
          <section key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
              {categoryLabels[category] ?? category}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => {
                const Icon = widgetIcons[item.icon]!
                return (
                  <button
                    key={item.type}
                    className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--surface-2) p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/4"
                    onClick={() => {
                      onAdd(item.type)
                      onOpenChange(false)
                    }}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
                      <Icon size={19} />
                    </span>
                    <span>
                      <span className="font-medium">{item.name}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-(--muted)">
                        {item.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-(--muted)">
          No widgets match that search.
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </div>
    </Dialog>
  )
}
