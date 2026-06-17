# TimeTrax

Freelancer time tracking app. Local-first -- all data in IndexedDB via Dexie.js, no backend.

## Stack

- React 19 + TypeScript + Vite
- Dexie.js (IndexedDB) + dexie-react-hooks
- Tailwind CSS v4
- date-fns, lucide-react, react-router-dom v7

## Commands

```bash
npm run dev      # Start dev server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint (zero errors policy)
npm run preview  # Preview production build
```

## Project Structure

```
src/
  hooks/        # Custom hooks (useClients, useTimeEntries, useTimer)
  components/   # Reusable UI components
  pages/        # Route-level page components
  lib/          # Dexie database, formatters
  types/        # TypeScript types
```

## Database

Dexie.js with two object stores: `clients` and `time_entries`. Schema defined in `src/lib/db.ts`. Data lives in the browser's IndexedDB -- no server, no auth.

## Conventions

- No emojis anywhere
- No eslint-disable comments
- Run both lint and build before committing
- Correct diacritical marks in translations (ä, ö, å)
