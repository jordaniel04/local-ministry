-- Ciclos/grupos concretos de un mismo módulo.
create table if not exists public.formation_module_cycles (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.formation_modules(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  status text not null default 'active' check (status in ('active', 'closed', 'paused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.formation_module_cycle_members (
  cycle_id uuid not null references public.formation_module_cycles(id) on delete cascade,
  module_enrollment_id uuid not null references public.formation_module_enrollments(id) on delete cascade,
  joined_at date not null default current_date,
  primary key (cycle_id, module_enrollment_id)
);

alter table public.formation_expositions add column if not exists cycle_id uuid references public.formation_module_cycles(id) on delete set null;

create index if not exists formation_module_cycles_module_idx on public.formation_module_cycles(module_id);
create index if not exists formation_module_cycle_members_enrollment_idx on public.formation_module_cycle_members(module_enrollment_id);
create index if not exists formation_expositions_cycle_idx on public.formation_expositions(cycle_id);

alter table public.formation_module_cycles enable row level security;
alter table public.formation_module_cycle_members enable row level security;

drop policy if exists formation_module_cycles_authenticated on public.formation_module_cycles;
create policy formation_module_cycles_authenticated on public.formation_module_cycles for all to authenticated using (true) with check (true);
drop policy if exists formation_module_cycle_members_authenticated on public.formation_module_cycle_members;
create policy formation_module_cycle_members_authenticated on public.formation_module_cycle_members for all to authenticated using (true) with check (true);
