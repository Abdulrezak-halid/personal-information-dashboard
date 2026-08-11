import { useEffect, useState } from 'react'
import { Button, Dialog, Input, Label, Select } from '@/components/ui'
import type { WidgetDefinition } from './types'

export function WidgetSettingsDialog({
  definition,
  settings,
  open,
  onOpenChange,
  onSave,
}: {
  definition: WidgetDefinition<any>
  settings: Record<string, unknown>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: Record<string, unknown>) => void
}) {
  const [draft, setDraft] = useState(settings)
  const [error, setError] = useState('')
  useEffect(() => {
    if (open) {
      setDraft(structuredClone(settings))
      setError('')
    }
  }, [open, settings])
  const update = (key: string, value: unknown) =>
    setDraft((current) => ({ ...current, [key]: value }))
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${definition.name} settings`}
      description="These settings apply only to this widget instance."
    >
      <div className="space-y-4">
        {definition.settingsFields.map((field) => (
          <div key={field.key}>
            {field.type !== 'boolean' && <Label>{field.label}</Label>}
            {(field.type === 'text' || field.type === 'url') && (
              <Input
                type={field.type}
                value={String(draft[field.key] ?? '')}
                placeholder={field.placeholder}
                onChange={(event) => update(field.key, event.target.value)}
              />
            )}
            {field.type === 'number' && (
              <Input
                type="number"
                value={Number(draft[field.key] ?? 0)}
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(event) => update(field.key, Number(event.target.value))}
              />
            )}
            {field.type === 'select' && (
              <Select
                value={String(draft[field.key] ?? '')}
                onValueChange={(value) => update(field.key, value)}
                options={field.options}
              />
            )}
            {field.type === 'boolean' && (
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-(--border) bg-(--surface-2) p-3 text-sm">
                <span>{field.label}</span>
                <input
                  type="checkbox"
                  className="size-4 accent-cyan-400"
                  checked={Boolean(draft[field.key])}
                  onChange={(event) => update(field.key, event.target.checked)}
                />
              </label>
            )}
            {field.type === 'multiselect' && (
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => {
                  const selected =
                    Array.isArray(draft[field.key]) &&
                    (draft[field.key] as unknown[]).includes(option.value)
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        const current = Array.isArray(draft[field.key])
                          ? (draft[field.key] as string[])
                          : []
                        update(
                          field.key,
                          selected
                            ? current.filter((item) => item !== option.value)
                            : [...current, option.value],
                        )
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm ${selected ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-(--border) text-(--muted)'}`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}
            {field.help && <p className="mt-1.5 text-xs text-(--muted)">{field.help}</p>}
          </div>
        ))}
        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const result = definition.settingsSchema.safeParse(draft)
              if (!result.success) {
                setError(result.error.issues[0]?.message ?? 'Check these settings.')
                return
              }
              onSave(result.data)
              onOpenChange(false)
            }}
          >
            Save settings
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
