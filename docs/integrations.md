# Integrations

## Modes

Frontend/Local Mode supports the dashboard engine and browser-safe providers. Server Mode adds `/api/rss` and is the future home of secret-backed providers. Widgets communicate through provider contracts in both modes.

| Integration          | Key | Server | Notes                                                            |
| -------------------- | --- | ------ | ---------------------------------------------------------------- |
| Open-Meteo           | No  | No     | Attribution required; hosted free service has usage restrictions |
| Coinbase spot prices | No  | No     | Public spot-price endpoint                                       |
| Hacker News          | No  | No     | Official public Firebase API                                     |
| RSS/Atom             | No  | Yes    | Secure normalization avoids browser CORS limitations             |

Settings → Integrations reports actual availability and checks API health for RSS. GitHub and key-backed markets/news are displayed only as planned capabilities.

Future secret integrations must keep credentials in server environment variables or a server-side secret store, return only normalized data, redact logs, and expose a test-connection operation that never returns the saved credential. No secret may use a `VITE_*` environment variable.
