import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getConnInfo } from '@hono/node-server/conninfo'
import { fetchFeed } from './rss.js'

const rateLimit = Number(process.env.RSS_RATE_LIMIT_PER_MINUTE ?? 30)
const buckets = new Map<string, { window: number; count: number }>()
export const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      const allowed = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((item) => item.trim())
      return allowed.includes(origin) ? origin : allowed[0]!
    },
  }),
)

app.get('/api/health', (context) => context.json({ status: 'ok', service: 'picc-api', version: 1 }))
app.get('/api/rss', async (context) => {
  const ip = getConnInfo(context).remote.address ?? 'local'
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || bucket.window < now - 60_000) buckets.set(ip, { window: now, count: 1 })
  else if (++bucket.count > rateLimit)
    return context.json({ error: 'RSS request limit exceeded. Try again shortly.' }, 429)
  const url = context.req.query('url')
  if (!url) return context.json({ error: 'The url query parameter is required.' }, 400)
  try {
    return context.json(await fetchFeed(url))
  } catch (error) {
    return context.json(
      { error: error instanceof Error ? error.message : 'The feed could not be loaded.' },
      400,
    )
  }
})
