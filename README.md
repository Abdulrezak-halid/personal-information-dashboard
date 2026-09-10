# Personal Dashboard

A clean, self-hosted single-page dashboard for the information you want to see every day—without widgets to configure, multiple dashboard tabs, or an editing mode.

![Personal Dashboard preview](docs/assets/dashboard-preview.png)

## Included cards

- Live time with Gregorian and Arabic Hijri dates
- Mersin, Türkiye weather: current conditions, hourly temperature movement, and eight-day forecast
- Live USD/TRY currency index with a trend chart
- Markets and global-statistics shortcuts
- Current AI and programming headlines
- A lightweight, browser-local task list

The layout shows eight large cards by default. Use **Compact view** if you prefer a denser arrangement. External resources open in the same tab.

## Quick start

Requirements: Node.js 20.19+ and npm 10+.

```bash
git clone <repository-url>
cd personal-information-dashboard
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

`npm run dev` starts both the React frontend and its small API server. The API keeps provider keys on the server, never in the browser.

## Configuration

Copy `.env.example` to `.env`, then supply the provider keys you use:

```env
# CurrencyAPI: live USD/TRY value and historical chart data
CURRENCY_API_KEY=

# Meteosource: current, hourly, and daily weather for Mersin
METEOSOURCE_API_KEY=
```

`WEATHER_API_KEY` is also accepted as a backwards-compatible alias for `METEOSOURCE_API_KEY`.

Do not use `VITE_` for provider credentials—Vite exposes those variables to browser code. Without a Meteosource key, weather falls back to Open-Meteo; without a CurrencyAPI key, the currency card falls back to Frankfurter data.

## Commands

```bash
npm run dev        # Run the web app and API locally
npm run typecheck  # Check TypeScript
npm run build      # Create production builds
npm start          # Serve the built application
```

## Docker

```bash
docker compose up --build
```

Open `http://localhost:3001`.

## Vercel

This repository is ready to deploy as one Vercel project. Import the GitHub repository and use these settings:

| Vercel field | Value |
| --- | --- |
| Framework Preset | `Vite` |
| Root Directory | Leave as the repository root (`./`) |
| Build Command | `npm run build` |
| Output Directory | `apps/web/dist` |

In **Environment Variables**, add these values for **Production**, **Preview**, and **Development** as appropriate:

```text
CURRENCY_API_KEY=...
METEOSOURCE_API_KEY=...
```

Do not paste the contents of `.env` as a public value or use `VITE_` prefixes for these keys. Vercel deploys the root `/api/weather` and `/api/currency` serverless functions alongside the Vite site, so the live cards continue to use the same `/api/*` paths after deployment.

## Project structure

```text
apps/web  React single-page dashboard
apps/api  Small Hono API for protected weather and currency requests
```

## Privacy

- Tasks and the view-density preference stay in the current browser’s local storage.
- API credentials remain server-side in `.env`.
- The project does not include accounts, analytics, dashboard syncing, or arbitrary widget code.

## License

[Apache License 2.0](LICENSE)
