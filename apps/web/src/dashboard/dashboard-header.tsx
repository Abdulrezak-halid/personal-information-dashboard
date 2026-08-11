import {
  Copy,
  Expand,
  LayoutDashboard,
  Moon,
  Plus,
  RefreshCw,
  Settings,
  Sun,
  Trash2,
  View,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Dialog, IconButton, Input, Label, Select } from '@/components/ui'
import { useDashboardStore } from '@/state/dashboard-store'

export function DashboardHeader({ onAddWidget }: { onAddWidget: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [managerOpen, setManagerOpen] = useState(false)
  const store = useDashboardStore()
  const dashboard = store.dashboards.find((item) => item.id === store.activeDashboardId)!
  const effectiveTheme = store.preferences.theme
  const toggleTheme = () =>
    useDashboardStore.setState((state) => ({
      preferences: {
        ...state.preferences,
        theme: state.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }))
  return (
    <>
      <header className="dashboard-header sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-(--border) bg-(--background)/90 px-3 backdrop-blur-xl sm:px-5">
        <button
          className="mr-2 hidden items-center gap-2 sm:flex"
          onClick={() => setManagerOpen(true)}
        >
          <span className="grid size-9 place-items-center rounded-lg bg-cyan-400 text-slate-950">
            <LayoutDashboard size={18} />
          </span>
          <span className="text-left">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-(--muted)">
              Control center
            </span>
            <span className="block max-w-48 truncate text-sm font-semibold">{dashboard.name}</span>
          </span>
        </button>
        <div className="sm:hidden">
          <IconButton label="Manage dashboards" onClick={() => setManagerOpen(true)}>
            <LayoutDashboard size={18} />
          </IconButton>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button className="hidden sm:inline-flex" onClick={onAddWidget}>
            <Plus size={16} />
            Add Widget
          </Button>
          <IconButton className="sm:hidden" label="Add widget" onClick={onAddWidget}>
            <Plus size={18} />
          </IconButton>
          <Button
            variant={store.mode === 'edit' ? 'default' : 'secondary'}
            onClick={() => store.setMode(store.mode === 'edit' ? 'view' : 'edit')}
          >
            {store.mode === 'edit' ? <View size={16} /> : <Wrench size={16} />}
            <span className="hidden md:inline">{store.mode === 'edit' ? 'View' : 'Edit'}</span>
          </Button>
          <IconButton
            label="Refresh dashboard"
            onClick={() => void queryClient.invalidateQueries()}
          >
            <RefreshCw size={17} />
          </IconButton>
          <IconButton label="Toggle theme" onClick={toggleTheme}>
            {effectiveTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </IconButton>
          <IconButton
            label="Fullscreen"
            onClick={() =>
              document.fullscreenElement
                ? void document.exitFullscreen()
                : void document.documentElement.requestFullscreen()
            }
          >
            <Expand size={17} />
          </IconButton>
          <IconButton label="Settings" onClick={() => navigate('/settings/integrations')}>
            <Settings size={17} />
          </IconButton>
        </div>
      </header>
      <DashboardManager open={managerOpen} onOpenChange={setManagerOpen} />
    </>
  )
}

function DashboardManager({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const store = useDashboardStore()
  const current = store.dashboards.find((item) => item.id === store.activeDashboardId)!
  const [name, setName] = useState(current.name)
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setName(current.name)
        onOpenChange(value)
      }}
      title="Dashboards"
      description="Each dashboard keeps its own widgets, layout, and display settings."
    >
      <div className="space-y-4">
        <div>
          <Label>Active dashboard</Label>
          <Select
            value={store.activeDashboardId}
            onValueChange={store.setActiveDashboard}
            options={store.dashboards.map((dashboard) => ({
              value: dashboard.id,
              label: dashboard.name,
            }))}
          />
        </div>
        <div>
          <Label>Dashboard name</Label>
          <div className="flex gap-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
            <Button
              variant="secondary"
              onClick={() => store.renameDashboard(store.activeDashboardId, name)}
            >
              Rename
            </Button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="secondary" onClick={() => store.createDashboard()}>
            <Plus size={15} />
            Create
          </Button>
          <Button
            variant="secondary"
            onClick={() => store.duplicateDashboard(store.activeDashboardId)}
          >
            <Copy size={15} />
            Duplicate
          </Button>
          <Button
            variant="danger"
            disabled={store.dashboards.length === 1}
            onClick={() => store.deleteDashboard(store.activeDashboardId)}
          >
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
        <p className="text-xs text-(--muted)">
          The final dashboard cannot be deleted. Imported dashboards are always added as new
          dashboards.
        </p>
      </div>
    </Dialog>
  )
}
