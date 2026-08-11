import { describe, expect, it } from 'vitest'
import { getWidgetDefinition, widgetDefinitions } from './registry'

describe('widget registry', () => {
  it('contains seven unique, self-validating manifests', () => {
    expect(widgetDefinitions).toHaveLength(7)
    expect(new Set(widgetDefinitions.map((item) => item.type)).size).toBe(7)
    for (const definition of widgetDefinitions) {
      expect(getWidgetDefinition(definition.type)).toBe(definition)
      expect(definition.settingsSchema.safeParse(definition.defaultSettings).success).toBe(true)
      expect(definition.defaultSize.width).toBeGreaterThanOrEqual(definition.minSize.width)
      expect(definition.defaultSize.height).toBeGreaterThanOrEqual(definition.minSize.height)
    }
  })
})
