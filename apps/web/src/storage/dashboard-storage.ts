import { APP_SCHEMA_VERSION, appStateSchema, type AppState } from '@picc/shared'

export interface DashboardStorageAdapter {
  load(): AppState | null
  save(state: AppState): void
  clear(): void
}

const STORAGE_KEY = 'picc:app-state'

export class LocalStorageAdapter implements DashboardStorageAdapter {
  load(): AppState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { schemaVersion?: number }
      const migrated = migrateState(parsed)
      return appStateSchema.parse(migrated)
    } catch (error) {
      console.warn('Dashboard configuration could not be loaded.', error)
      return null
    }
  }

  save(state: AppState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function migrateState(value: unknown): unknown {
  const version =
    value && typeof value === 'object' && 'schemaVersion' in value ? value.schemaVersion : 0
  if (version === APP_SCHEMA_VERSION) return value
  throw new Error(`Unsupported dashboard schema version: ${String(version)}`)
}

export const dashboardStorage = new LocalStorageAdapter()
