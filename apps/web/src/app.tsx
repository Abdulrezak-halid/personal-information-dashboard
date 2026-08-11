import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardGrid } from '@/dashboard/dashboard-grid'
import { DashboardHeader } from '@/dashboard/dashboard-header'
import { WidgetLibrary } from '@/dashboard/widget-library'
import { Onboarding } from '@/onboarding/onboarding'
import { SettingsPage } from '@/settings/settings-page'
import { useDashboardStore } from '@/state/dashboard-store'

function ThemeSync() {
  const theme = useDashboardStore((state) => state.preferences.theme)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
  return null
}

function DashboardPage() {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const activeId = useDashboardStore((state) => state.activeDashboardId)
  const dashboard = useDashboardStore((state) =>
    state.dashboards.find((item) => item.id === activeId),
  )
  const addWidget = useDashboardStore((state) => state.addWidget)
  if (!dashboard) return null
  return (
    <div className={`app-shell min-h-screen background-${dashboard.settings.background}`}>
      <DashboardHeader onAddWidget={() => setLibraryOpen(true)} />
      <DashboardGrid dashboard={dashboard} />
      <WidgetLibrary open={libraryOpen} onOpenChange={setLibraryOpen} onAdd={addWidget} />
    </div>
  )
}

export function App() {
  const onboarded = useDashboardStore((state) => state.onboardingCompleted)
  return (
    <>
      <ThemeSync />
      {!onboarded ? (
        <Onboarding />
      ) : (
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}
