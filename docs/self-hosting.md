# Self-hosting

## Static frontend

Run `npm run build -w @picc/shared && npm run build -w @picc/web`, then publish `apps/web/dist` to a static host. Configure SPA fallback to `index.html`. RSS is unavailable in this mode; all other MVP features remain useful.

## Docker and Compose

Run `docker compose up -d --build`, then open port 3001. The multi-stage image builds every workspace and runs the Hono server, which serves both `/api/*` and the SPA. Check health with `GET /api/health`.

## VPS/reverse proxy

Place TLS at a reverse proxy and forward one origin to container port 3001. Set `ALLOWED_ORIGINS` to the public HTTPS origin. The application rate limiter uses the direct connection address; add a second per-client limit at the trusted reverse proxy when serving multiple users. Keep the service updated because it fetches untrusted remote XML.

User dashboard data remains in each browser's local storage. Back it up with Export Dashboard; replacing the container does not remove browser data.
