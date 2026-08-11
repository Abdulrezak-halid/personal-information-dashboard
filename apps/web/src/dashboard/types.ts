import type { ComponentType } from 'react'
import type { z } from 'zod'

export type WidgetCategory = 'time' | 'weather' | 'finance' | 'news' | 'productivity' | 'developer'
export type IconName =
  'clock' | 'cloud-sun' | 'bitcoin' | 'newspaper' | 'rss' | 'list-checks' | 'chart'
export type WidgetMode = 'view' | 'edit'
export type WidgetSize = { width: number; height: number }

export type SettingsField =
  | { key: string; type: 'text' | 'url'; label: string; placeholder?: string; help?: string }
  | {
      key: string
      type: 'number'
      label: string
      min?: number
      max?: number
      step?: number
      help?: string
    }
  | { key: string; type: 'boolean'; label: string; help?: string }
  | {
      key: string
      type: 'select'
      label: string
      options: Array<{ value: string; label: string }>
      help?: string
    }
  | {
      key: string
      type: 'multiselect'
      label: string
      options: Array<{ value: string; label: string }>
      help?: string
    }

export interface WidgetComponentProps<TSettings extends Record<string, unknown>> {
  instanceId: string
  settings: TSettings
  mode: WidgetMode
  demo: boolean
  updateSettings: (settings: Partial<TSettings>) => void
}

export interface WidgetDefinition<
  TSettings extends Record<string, unknown> = Record<string, unknown>,
> {
  type: string
  version: number
  name: string
  description: string
  category: WidgetCategory
  icon: IconName
  component: ComponentType<WidgetComponentProps<TSettings>>
  defaultSize: WidgetSize
  minSize: WidgetSize
  maxSize?: WidgetSize
  defaultSettings: TSettings
  settingsFields: SettingsField[]
  settingsSchema: z.ZodType<TSettings>
  customSettingsComponent?: ComponentType<{
    value: TSettings
    onChange: (value: TSettings) => void
  }>
}

export interface IntegrationDefinition {
  id: string
  name: string
  description: string
  provider: string
  capabilities: string[]
  requiresServer: boolean
  requiresKey: boolean
  availability: 'available' | 'planned'
  attributionUrl?: string
}
