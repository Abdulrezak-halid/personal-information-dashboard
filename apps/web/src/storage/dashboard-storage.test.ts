import { describe, expect, it } from 'vitest'
import { migrateState } from './dashboard-storage'

describe('dashboard storage migrations', () => {
  it('passes through the current schema', () => {
    const state = { schemaVersion: 1 }
    expect(migrateState(state)).toBe(state)
  })

  it('rejects unknown versions instead of corrupting state', () => {
    expect(() => migrateState({ schemaVersion: 99 })).toThrow(
      'Unsupported dashboard schema version',
    )
  })
})
