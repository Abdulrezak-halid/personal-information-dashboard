import { ArrowLeft, ArrowRight, Check, LayoutDashboard } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Input, Label, Select } from '@/components/ui'
import { integrations } from '@/dashboard/integrations'
import { templateCatalog, type TemplateId } from '@/dashboard/templates'
import { widgetDefinitions, widgetIcons } from '@/widgets/registry'
import { useDashboardStore } from '@/state/dashboard-store'
import type { AppState } from '@picc/shared'

export function Onboarding() {
  const complete = useDashboardStore((state) => state.completeOnboarding)
  const initialPreferences = useDashboardStore((state) => state.preferences)
  const [step, setStep] = useState(0)
  const [template, setTemplate] = useState<TemplateId>('demo')
  const templateDefinition = useMemo(
    () => templateCatalog.find((item) => item.id === template)!,
    [template],
  )
  const [selected, setSelected] = useState<string[]>(templateDefinition.widgetTypes)
  const [preferences, setPreferences] = useState<AppState['preferences']>(initialPreferences)
  const chooseTemplate = (id: TemplateId) => {
    const item = templateCatalog.find((entry) => entry.id === id)!
    setTemplate(id)
    setSelected(item.widgetTypes)
  }
  return (
    <main className="onboarding-bg min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-cyan-400 text-slate-950">
            <LayoutDashboard />
          </span>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">
              Personal Information
            </div>
            <div className="font-semibold">Control Center</div>
          </div>
        </header>
        <div className="mb-8 flex gap-2">
          {['Start', 'Widgets', 'Preferences', 'Integrations'].map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${index <= step ? 'bg-cyan-400 text-slate-950' : 'bg-white/7 text-[var(--muted)]'}`}
              >
                {index < step ? <Check size={14} /> : index + 1}
              </span>
              <span className="hidden text-xs text-[var(--muted)] sm:block">{label}</span>
              <span className="h-px flex-1 bg-[var(--border)] last:hidden" />
            </div>
          ))}
        </div>
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 p-5 shadow-2xl sm:p-8">
          {step === 0 && (
            <>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Welcome 👋</p>
              <h1 className="mt-2 text-3xl font-light sm:text-4xl">How do you want to start?</h1>
              <p className="mt-2 text-[var(--muted)]">
                Choose a starting point. Nothing here is permanent.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {templateCatalog.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => chooseTemplate(item.id)}
                    className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${template === item.id ? 'border-cyan-400/60 bg-cyan-400/[0.07]' : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-cyan-400/30'}`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>
                      <span className="font-semibold">{item.name}</span>
                      <span className="mt-1 block text-sm text-[var(--muted)]">
                        {item.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                Your building blocks
              </p>
              <h1 className="mt-2 text-3xl font-light">Choose initial widgets</h1>
              <p className="mt-2 text-[var(--muted)]">
                You can add, remove, or duplicate widgets later.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {widgetDefinitions.map((item) => {
                  const Icon = widgetIcons[item.icon]
                  const enabled = selected.includes(item.type)
                  return (
                    <button
                      key={item.type}
                      onClick={() =>
                        setSelected((current) =>
                          enabled
                            ? current.filter((type) => type !== item.type)
                            : [...current, item.type],
                        )
                      }
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left ${enabled ? 'border-cyan-400/50 bg-cyan-400/[0.06]' : 'border-[var(--border)]'}`}
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-white/5 text-cyan-300">
                        <Icon size={17} />
                      </span>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      <span
                        className={`grid size-5 place-items-center rounded border ${enabled ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-[var(--border)]'}`}
                      >
                        {enabled && <Check size={13} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Basic preferences</p>
              <h1 className="mt-2 text-3xl font-light">Make it feel local</h1>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>Timezone</Label>
                  <Input
                    value={preferences.timezone}
                    onChange={(event) =>
                      setPreferences({ ...preferences, timezone: event.target.value })
                    }
                    placeholder="Europe/Berlin"
                  />
                </div>
                <div>
                  <Label>Weather location</Label>
                  <Input
                    value={preferences.location}
                    onChange={(event) =>
                      setPreferences({ ...preferences, location: event.target.value })
                    }
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(theme) =>
                      setPreferences({
                        ...preferences,
                        theme: theme as AppState['preferences']['theme'],
                      })
                    }
                    options={[
                      { value: 'dark', label: 'Dark' },
                      { value: 'light', label: 'Light' },
                      { value: 'system', label: 'System' },
                    ]}
                  />
                </div>
                <div>
                  <Label>Language</Label>
                  <Select
                    value="en"
                    onValueChange={() => undefined}
                    options={[{ value: 'en', label: 'English' }]}
                  />
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    More translations can be added without changing widget contracts.
                  </p>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                Optional connections
              </p>
              <h1 className="mt-2 text-3xl font-light">Ready without API keys</h1>
              <p className="mt-2 text-[var(--muted)]">
                Skip integrations now and configure them later from Settings.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {integrations
                  .filter((item) => item.availability === 'available')
                  .map((integration) => (
                    <div
                      key={integration.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{integration.name}</span>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${integration.requiresServer ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'}`}
                        >
                          {integration.requiresServer ? 'Server mode' : 'No key'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted)]">{integration.description}</p>
                    </div>
                  ))}
              </div>
            </>
          )}
          <footer className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((current) => current + 1)}>
                Continue
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={() => complete(template, selected, preferences)}>
                Open dashboard
                <ArrowRight size={16} />
              </Button>
            )}
          </footer>
        </section>
      </div>
    </main>
  )
}
