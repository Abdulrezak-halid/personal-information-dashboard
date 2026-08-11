import { describe, expect, it } from 'vitest'
import { assertPublicAddress, parseFeed } from './rss.js'

describe('RSS security', () => {
  it.each(['127.0.0.1', '10.0.0.1', '169.254.169.254', '::1', 'fc00::1'])(
    'rejects non-public address %s',
    (address) => expect(() => assertPublicAddress(address)).toThrow(),
  )
  it('allows a public address', () => expect(() => assertPublicAddress('1.1.1.1')).not.toThrow())
})

describe('RSS parsing', () => {
  it('normalizes an RSS feed', () => {
    const result = parseFeed(
      '<?xml version="1.0"?><rss><channel><title>Example</title><item><guid>1</guid><title>Hello</title><link>https://example.com/hello</link><description><![CDATA[<b>Summary</b>]]></description></item></channel></rss>',
      'https://example.com/feed.xml',
    )
    expect(result.title).toBe('Example')
    expect(result.items[0]).toMatchObject({ id: '1', title: 'Hello', summary: 'Summary' })
  })
  it('rejects arbitrary XML', () =>
    expect(() => parseFeed('<document />', 'https://example.com')).toThrow())
})
