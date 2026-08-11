import { lookup } from 'node:dns/promises'
import { Agent, request } from 'undici'
import ipaddr from 'ipaddr.js'
import { XMLParser } from 'fast-xml-parser'
import type { RssResponse } from '@picc/shared'

const timeoutMs = Number(process.env.RSS_TIMEOUT_MS ?? 8000)
const maxBytes = Number(process.env.RSS_MAX_BYTES ?? 2_097_152)
const cache = new Map<string, { expires: number; value: RssResponse }>()
const allowedRanges = new Set(['unicast'])

export function assertPublicAddress(address: string) {
  let parsed: ipaddr.IPv4 | ipaddr.IPv6
  try {
    parsed = ipaddr.parse(address)
  } catch {
    throw new Error('The feed host did not resolve to a valid IP address.')
  }
  if (!allowedRanges.has(parsed.range()))
    throw new Error('Private, local, reserved, and multicast feed addresses are not allowed.')
}

async function resolvePublicAddress(hostname: string) {
  if (ipaddr.isValid(hostname)) {
    assertPublicAddress(hostname)
    const parsed = ipaddr.parse(hostname)
    return { address: hostname, family: parsed.kind() === 'ipv6' ? 6 : 4 } as const
  }
  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (!addresses.length) throw new Error('The feed hostname could not be resolved.')
  addresses.forEach((entry) => assertPublicAddress(entry.address))
  return addresses[0]!
}

function validateUrl(input: string) {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new Error('Enter a valid RSS or Atom URL.')
  }
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('Only HTTP and HTTPS feed URLs are supported.')
  if (url.username || url.password)
    throw new Error('Feed URLs cannot contain embedded credentials.')
  if (url.port && !['80', '443'].includes(url.port))
    throw new Error('Only standard HTTP and HTTPS ports are allowed.')
  return url
}

async function download(
  urlInput: string,
  redirects = 0,
): Promise<{ body: string; finalUrl: string }> {
  if (redirects > 4) throw new Error('The feed redirected too many times.')
  const url = validateUrl(urlInput)
  const pinned = await resolvePublicAddress(url.hostname)
  const dispatcher = new Agent({
    connect: {
      lookup: (_hostname, _options, callback) => callback(null, pinned.address, pinned.family),
    },
  })
  try {
    const response = await request(url, {
      dispatcher,
      headersTimeout: timeoutMs,
      bodyTimeout: timeoutMs,
      headers: {
        accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9',
        'user-agent': 'Personal-Information-Control-Center/0.1 (+self-hosted RSS reader)',
      },
    })
    if (response.statusCode >= 300 && response.statusCode < 400) {
      const locationValue = response.headers.location
      const location = Array.isArray(locationValue) ? locationValue[0] : locationValue
      await response.body.dump()
      if (!location) throw new Error('The feed returned an invalid redirect.')
      return download(new URL(location, url).toString(), redirects + 1)
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      await response.body.dump()
      throw new Error(`The feed returned HTTP ${response.statusCode}.`)
    }
    const contentType = String(response.headers['content-type'] ?? '').toLowerCase()
    if (contentType && !/(xml|rss|atom|text\/plain)/.test(contentType)) {
      await response.body.dump()
      throw new Error('The remote resource is not an RSS or Atom document.')
    }
    const declaredLength = Number(response.headers['content-length'] ?? 0)
    if (declaredLength > maxBytes) {
      await response.body.dump()
      throw new Error('The feed exceeds the configured size limit.')
    }
    const chunks: Buffer[] = []
    let total = 0
    for await (const chunk of response.body) {
      const buffer = Buffer.from(chunk)
      total += buffer.length
      if (total > maxBytes) {
        response.body.destroy()
        throw new Error('The feed exceeds the configured size limit.')
      }
      chunks.push(buffer)
    }
    return { body: Buffer.concat(chunks).toString('utf8'), finalUrl: url.toString() }
  } finally {
    await dispatcher.close()
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: false,
  trimValues: true,
})
const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]
const text = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record['#text'] ?? record['__cdata'] ?? '')
  }
  return ''
}
const clean = (value: unknown) =>
  text(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const linkValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  for (const item of asArray(value as any))
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>
      if (record['@_rel'] === 'alternate' || !record['@_rel'])
        return text(record['@_href'] ?? record['#text'])
    }
  return ''
}

export function parseFeed(xml: string, finalUrl: string): RssResponse {
  let document: any
  try {
    document = parser.parse(xml)
  } catch {
    throw new Error('The response is not valid XML.')
  }
  const channel = document?.rss?.channel
  const atom = document?.feed
  if (!channel && !atom) throw new Error('The document is not a recognized RSS or Atom feed.')
  const rawItems = channel ? asArray(channel.item) : asArray(atom.entry)
  const items = rawItems.slice(0, 100).map((item: any, index) => {
    const url = linkValue(item.link) || text(item.guid) || finalUrl
    let normalizedUrl: string
    try {
      normalizedUrl = new URL(url, finalUrl).toString()
    } catch {
      normalizedUrl = finalUrl
    }
    const title = clean(item.title) || 'Untitled entry'
    const published = text(item.pubDate ?? item.published ?? item.updated)
    const date =
      published && !Number.isNaN(Date.parse(published))
        ? new Date(published).toISOString()
        : undefined
    return {
      id: text(item.guid ?? item.id) || `${normalizedUrl}#${index}`,
      title,
      url: normalizedUrl,
      ...(clean(item.author?.name ?? item.author ?? item['dc:creator'])
        ? { author: clean(item.author?.name ?? item.author ?? item['dc:creator']) }
        : {}),
      ...(date ? { publishedAt: date } : {}),
      ...(clean(item.description ?? item.summary ?? item.content)
        ? { summary: clean(item.description ?? item.summary ?? item.content).slice(0, 500) }
        : {}),
    }
  })
  return {
    title: clean(channel?.title ?? atom?.title) || new URL(finalUrl).hostname,
    ...(clean(channel?.description ?? atom?.subtitle)
      ? { description: clean(channel?.description ?? atom?.subtitle) }
      : {}),
    url: finalUrl,
    fetchedAt: new Date().toISOString(),
    items,
  }
}

export async function fetchFeed(url: string): Promise<RssResponse> {
  const cached = cache.get(url)
  if (cached && cached.expires > Date.now()) return cached.value
  const downloaded = await download(url)
  const feed = parseFeed(downloaded.body, downloaded.finalUrl)
  cache.set(url, { expires: Date.now() + 5 * 60_000, value: feed })
  return feed
}
