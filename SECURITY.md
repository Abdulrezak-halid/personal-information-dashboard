# Security policy

## Reporting

Do not publish suspected vulnerabilities in a public issue. Until a dedicated security contact is configured, use GitHub's private vulnerability reporting feature for this repository. Include affected versions, reproduction steps, impact, and any suggested mitigation. Maintainers should acknowledge a complete report within seven days.

## Supported versions

Security fixes are provided for the latest release on the default branch during the MVP phase.

## Security boundaries

- Never commit `.env` files, API keys, passwords, tokens, or personal dashboard exports.
- Never store server secrets in `VITE_*` variables or send them to browser code.
- Never log credentials or include them in dashboard/template exports.
- Treat imported JSON, remote provider responses, URLs, RSS/Atom XML, and rendered feed text as untrusted.
- Do not weaken the RSS SSRF, redirect, DNS, response-size, timeout, or rate-limit controls without security review and tests.

The project does not currently provide authentication or multi-user isolation. Browser profiles and the self-hosting environment define the local trust boundary.
