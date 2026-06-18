# TimeTrax

A simple time tracking desktop app for freelancers. Track hours per client, see overviews, and export to CSV.

Local-first -- all data stays on your machine (IndexedDB). No accounts, no cloud, no backend.

## Features

- **One-click timer** -- click a client to start tracking, click again to stop
- **Manual entry** -- log time after the fact with start/end times
- **Per-client hourly rates** (EUR) -- earnings calculated automatically
- **Overviews** -- daily, weekly, monthly breakdowns per client or total
- **CSV export** -- export filtered time entries for invoicing
- **Seconds precision** -- durations tracked to the second

## Download

Grab the latest installer from the [Releases page](https://github.com/coen593/timetrax/releases):

- **Windows** -- `.exe` (NSIS installer, no setup required beyond running it)
- **macOS** -- `.dmg`

> Windows may show a SmartScreen warning on first install since the app is not code-signed. Click "More info" then "Run anyway".

## Development

```bash
npm install
npm run dev          # Vite dev server
npm run electron:dev # Build + launch Electron locally
npm run lint         # ESLint
npm run build        # TypeScript + Vite production build
```

### Building installers

Push a version tag to trigger the GitHub Actions build:

```bash
# bump version in package.json, then:
git tag v1.x.x
git push --tags
```

This builds Windows and macOS installers and creates a draft GitHub Release.

## Stack

- React 19 + TypeScript + Vite
- Electron (desktop wrapper)
- Dexie.js (IndexedDB)
- Tailwind CSS v4
- date-fns, lucide-react, react-router-dom

## License

[GPL-3.0](LICENSE)
