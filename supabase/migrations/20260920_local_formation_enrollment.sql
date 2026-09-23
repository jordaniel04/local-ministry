-- Matrícula y progreso resumido de la ruta local de EsLider.
create table if not exists public.formation_routes (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  scope text not null default 'local',
  version text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.formation_route_modules (
  route_id uuid not null references public.formation_routes(id) on delete cascade,
  module_id uuid not null references public.formation_modules(id) on delete cascade,
  order_index integer not null,
  primary key (route_id, module_id)
);

create table if not exists public.formation_enrollments (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  route_id uuid not null references public.formation_routes(id),
  status text not null default 'active' check (status in ('active','paused','completed','withdrawn')),
  current_module_id uuid references public.formation_modules(id),
  enrolled_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (person_id, route_id)
);

create table if not exists public.formation_module_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.formation_enrollments(id) on delete cascade,
  module_id uuid not null references public.formation_modules(id),
  status text not null default 'pending' check (status in ('pending','in_progress','completed','reinforcement','accompaniment')),
  observed_at date,
  notes text,
  historical_grade text,
  validation_score text,
  validation_result text check (validation_result is null or validation_result in ('validated','reinforcement','accompaniment')),
  validation_date date,
  validation_notes text,
  updated_at timestamptz not null default now(),
  unique (enrollment_id, module_id)
);

create index if not exists formation_enrollments_person_idx on public.formation_enrollments(person_id);
create index if not exists formation_enrollments_route_idx on public.formation_enrollments(route_id);
create index if not exists formation_module_progress_enrollment_idx on public.formation_module_progress(enrollment_id);

alter table public.formation_routes enable row level security;
alter table public.formation_route_modules enable row level security;
alter table public.formation_enrollments enable row level security;
alter table public.formation_module_progress enable row level security;

create policy formation_routes_authenticated on public.formation_routes for select to authenticated using (true);
create policy formation_route_modules_authenticated on public.formation_route_modules for select to authenticated using (true);
create policy formation_enrollments_authenticated on public.formation_enrollments for all to authenticated using (true) with check (true);
create policy formation_module_progress_authenticated on public.formation_module_progress for all to authenticated using (true) with check (true);

insert into public.formation_routes (key, name, scope, version)
values ('local-miramar', 'Ruta local EsLider Miramar', 'local', '2026')
on conflict (key) do nothing;

insert into public.formation_route_modules (route_id, module_id, order_index)
select r.id, m.id, m.order_index
from public.formation_routes r
cross join public.formation_modules m
where r.key = 'local-miramar' and m.is_active = true
on conflict (route_id, module_id) do update set order_index = excluded.order_index;
