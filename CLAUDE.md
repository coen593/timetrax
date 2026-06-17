# TimeTrax

Freelancer time tracking app with per-client hourly rates.

## Stack

- React 19 + TypeScript + Vite
- Supabase (auth + Postgres + RLS)
- Tailwind CSS v4
- date-fns, lucide-react, react-router-dom v7

## Getting Started

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Copy `.env.example` to `.env` and fill in Supabase URL + anon key
4. `npm install && npm run dev`

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
  contexts/     # React context (auth)
  hooks/        # Custom hooks (useAuth, useClients, useTimeEntries, useTimer)
  components/   # Reusable UI components
  pages/        # Route-level page components
  lib/          # Supabase client, formatters
  types/        # TypeScript types
supabase/
  schema.sql    # Database schema with RLS policies
```

## Database

Two tables with RLS: `clients` and `time_entries`. Schema in `supabase/schema.sql`. Both use `user_id` for row-level security.

## Conventions

- No emojis anywhere
- No eslint-disable comments
- Run both lint and build before committing
- Correct diacritical marks in translations (ä, ö, å)
