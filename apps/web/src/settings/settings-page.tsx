import { ArrowLeft, CheckCircle2, Clock3, Download, ExternalLink, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label, Select } from '@/components/ui'
import { integrations } from '@/dashboard/integrations'
import { createDashboardExport, useDashboardStore } from '@/state/dashboard-store'
import { downloadJson } from '@/lib/utils'

export function SettingsPage() {
  const navigate = useNavigate()
  const store = useDashboardStore()
  const dashboard = store.dashboards.find((item) => item.id === store.activeDashboardId)!
  const inputRef = useRef<HTMLInputElement>(null)
  const [rssOnline, setRssOnline] = useState<boolean | null>(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    void fetch('/api/health')
      .then((response) => setRssOnline(response.ok))
      .catch(() => setRssOnline(false))
  }, [])
  const importFile = async (file?: File) => {
    if (!file) return
    try {
      store.importDashboard(JSON.parse(await file.text()))
      setNotice('Dashboard imported as a new dashboard.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Import failed.')
    }
  }
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[var(--border)] bg-[var(--background)]/90 px-4 backdrop-blur">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          Dashboard
        </Button>
        <div className="ml-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Settings</div>
          <h1 className="text-sm font-semibold">Platform configuration</h1>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 p-4 md:grid-cols-[220px_1fr] md:p-8">
        <aside className="space-y-1">
          <a
            href="#integrations"
            className="block rounded-lg bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200"
          >
            Integrations
          </a>
          <a
            href="#dashboard"
            className="block rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5"
          >
            Dashboard
          </a>
          <a
            href="#data"
            className="block rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5"
          >
            Import and export
          </a>
        </aside>
        <div className="min-w-0 space-y-10">
          <section id="integrations">
            <h2 className="text-2xl font-light">Integrations</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Providers are connected through replaceable adapters. V1 never stores a secret.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {integrations.map((integration) => {
                const status =
                  integration.availability === 'planned'
                    ? 'Coming soon'
                    : integration.id === 'rss'
                      ? rssOnline === null
                        ? 'Checking'
                        : rssOnline
                          ? 'Connected'
                          : 'Server unavailable'
                      : 'Connected'
                return (
                  <article
                    key={integration.id}
                    className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 ${integration.availability === 'planned' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <div className="mt-0.5 text-xs text-[var(--muted)]">
                          Provider: {integration.provider}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${status === 'Connected' ? 'bg-emerald-400/10 text-emerald-300' : status === 'Coming soon' ? 'bg-white/7 text-[var(--muted)]' : 'bg-amber-400/10 text-amber-300'}`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                      {integration.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      <span>{integration.requiresKey ? 'API key required' : 'No API key'}</span>
                      <span>·</span>
                      <span>{integration.requiresServer ? 'Server-side' : 'Browser-safe'}</span>
                    </div>
                    {integration.attributionUrl && (
                      <a
                        href={integration.attributionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-300"
                      >
                        Provider information <ExternalLink size={11} />
                      </a>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
          <section id="dashboard" className="border-t border-[var(--border)] pt-8">
            <h2 className="text-2xl font-light">Dashboard layout</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Grid columns</Label>
                <Input
                  type="number"
                  min={4}
                  max={24}
                  value={dashboard.settings.columns}
                  onChange={(event) =>
                    store.updateDashboardSettings({ columns: Number(event.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Row height</Label>
                <Input
                  type="number"
                  min={24}
                  max={120}
                  value={dashboard.settings.rowHeight}
                  onChange={(event) =>
                    store.updateDashboardSettings({ rowHeight: Number(event.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Widget gap</Label>
                <Input
                  type="number"
                  min={0}
                  max={32}
                  value={dashboard.settings.gap}
                  onChange={(event) =>
                    store.updateDashboardSettings({ gap: Number(event.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Background</Label>
                <Select
                  value={dashboard.settings.background}
                  onValueChange={(background) =>
                    store.updateDashboardSettings({
                      background: background as 'plain' | 'grid' | 'glow',
                    })
                  }
                  options={[
                    { value: 'plain', label: 'Plain' },
                    { value: 'grid', label: 'Subtle grid' },
                    { value: 'glow', label: 'Ambient glow' },
                  ]}
                />
              </div>
            </div>
          </section>
          <section id="data" className="border-t border-[var(--border)] pt-8">
            <h2 className="text-2xl font-light">Import and export</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Exports are versioned, sanitized, and never contain server credentials.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  downloadJson(
                    `${dashboard.name.toLowerCase().replaceAll(' ', '-')}.json`,
                    createDashboardExport(dashboard, 'dashboard'),
                  )
                }
              >
                <Download size={15} />
                Export dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  downloadJson(
                    `${dashboard.name.toLowerCase().replaceAll(' ', '-')}-template.json`,
                    createDashboardExport(dashboard, 'template'),
                  )
                }
              >
                <Download size={15} />
                Export template
              </Button>
              <Button variant="secondary" onClick={() => inputRef.current?.click()}>
                <Upload size={15} />
                Import JSON
              </Button>
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="application/json,.json"
                onChange={(event) => void importFile(event.target.files?.[0])}
              />
            </div>
            {notice && <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm">{notice}</p>}
            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="font-semibold">First-run experience</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Reopen onboarding without deleting your current dashboards. Completing it starts a
                fresh local workspace.
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  store.resetOnboarding()
                  navigate('/')
                }}
              >
                <Clock3 size={15} />
                Run onboarding again
              </Button>
            </div>
          </section>
          <section className="border-t border-[var(--border)] pt-8">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-400/5 p-4 text-sm text-emerald-200">
              <CheckCircle2 size={18} />
              Configuration is stored locally in this browser.
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
