import { describe, expect, it } from 'vitest'
import { stripCredentialLikeFields } from './index.js'

describe('stripCredentialLikeFields', () => {
  it('removes credential-shaped keys recursively', () => {
    expect(
      stripCredentialLikeFields({
        url: 'https://example.com',
        headers: { Authorization: 'x' },
        apiKey: 'y',
      }),
    ).toEqual({ url: 'https://example.com', headers: {} })
  })
})
