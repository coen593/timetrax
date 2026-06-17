create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  hourly_rate numeric(10,2) not null default 0,
  color text not null default '#3B82F6',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index clients_user_id_idx on public.clients(user_id);

alter table public.clients enable row level security;

create policy "Users manage own clients"
  on public.clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_minutes integer,
  note text,
  created_at timestamptz not null default now()
);

create index time_entries_user_id_idx on public.time_entries(user_id);
create index time_entries_client_id_idx on public.time_entries(client_id);
create index time_entries_start_time_idx on public.time_entries(start_time);

alter table public.time_entries enable row level security;

create policy "Users manage own time entries"
  on public.time_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
