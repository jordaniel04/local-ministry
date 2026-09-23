create table if not exists public.formation_study_cycles (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.formation_routes(id) on delete set null,
  name text not null,
  starts_on date,
  ends_on date,
  status text not null default 'active' check (status in ('active','closed','paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.formation_study_cycle_modules (
  study_cycle_id uuid not null references public.formation_study_cycles(id) on delete cascade,
  module_id uuid not null references public.formation_modules(id) on delete cascade,
  order_index integer not null default 0,
  status text not null default 'pending' check (status in ('pending','active','completed','paused')),
  primary key (study_cycle_id, module_id)
);

alter table public.formation_study_cycles enable row level security;
alter table public.formation_study_cycle_modules enable row level security;
drop policy if exists formation_study_cycles_authenticated on public.formation_study_cycles;
create policy formation_study_cycles_authenticated on public.formation_study_cycles for all to authenticated using (true) with check (true);
drop policy if exists formation_study_cycle_modules_authenticated on public.formation_study_cycle_modules;
create policy formation_study_cycle_modules_authenticated on public.formation_study_cycle_modules for all to authenticated using (true) with check (true);
