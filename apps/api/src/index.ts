import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { app } from './app.js'

const webRoot = resolve(process.cwd(), process.env.WEB_DIST_PATH ?? '../web/dist')
if (existsSync(webRoot)) {
  app.use('/*', serveStatic({ root: webRoot }))
  app.get('*', serveStatic({ path: `${webRoot}/index.html` }))
}
const port = Number(process.env.PORT ?? 3001)
const hostname = process.env.HOST ?? '0.0.0.0'
serve({ fetch: app.fetch, port, hostname }, (info) =>
  console.log(`Personal Information Control Center listening on http://${hostname}:${info.port}`),
)
