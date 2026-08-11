# Contributing

Thanks for helping build Personal Information Control Center.

1. Use Node.js 20.19+ and npm 10+.
2. Run `npm install` and `npm run dev`.
3. Keep changes focused and add tests for behavior.
4. Before opening a pull request, run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

Use clear TypeScript names, small modules, normalized provider boundaries, and schema validation at persistence/network edges. Do not scatter local-storage access, couple widgets to vendor response shapes, introduce personal defaults, or add secrets to fixtures and documentation.

Widget contributions must follow [docs/creating-widgets.md](docs/creating-widgets.md). New external providers should include attribution/terms documentation, realistic refresh limits, normalized response tests, and independent error behavior.

Create a short-lived branch, use descriptive commits, and explain the motivation, UI impact, security implications, and verification in the pull request. Screenshots are encouraged for visual changes. By contributing, you agree that your contribution is licensed under Apache-2.0.
