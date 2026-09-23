-- Participaciones por módulo dentro de una única matrícula de ruta.
create table if not exists public.formation_module_enrollments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.formation_enrollments(id) on delete cascade,
  module_id uuid not null references public.formation_modules(id),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'paused', 'withdrawn')),
  enrollment_type text not null default 'standard'
    check (enrollment_type in ('standard', 'repeat', 'reinforcement', 'historical')),
  enrolled_at date not null default current_date,
  completed_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists formation_module_enrollments_enrollment_idx
  on public.formation_module_enrollments(enrollment_id);

create index if not exists formation_module_enrollments_module_idx
  on public.formation_module_enrollments(module_id);

create unique index if not exists formation_module_enrollments_one_active_idx
  on public.formation_module_enrollments(enrollment_id, module_id)
  where status = 'in_progress';

create unique index if not exists formation_module_enrollments_one_historical_idx
  on public.formation_module_enrollments(enrollment_id, module_id)
  where enrollment_type = 'historical';

alter table public.formation_module_enrollments enable row level security;

drop policy if exists formation_module_enrollments_authenticated
  on public.formation_module_enrollments;

create policy formation_module_enrollments_authenticated
  on public.formation_module_enrollments
  for all to authenticated
  using (true)
  with check (true);

-- Conserva como participación el módulo actual de las matrículas existentes.
insert into public.formation_module_enrollments (
  enrollment_id,
  module_id,
  status,
  enrollment_type,
  enrolled_at
)
select
  enrollment.id,
  enrollment.current_module_id,
  'in_progress',
  'standard',
  enrollment.enrolled_at
from public.formation_enrollments enrollment
where enrollment.current_module_id is not null
  and enrollment.status = 'active'
on conflict do nothing;

-- Conserva como antecedente cada módulo culminado que ya estaba registrado.
insert into public.formation_module_enrollments (
  enrollment_id,
  module_id,
  status,
  enrollment_type,
  enrolled_at,
  completed_at,
  notes
)
select
  progress.enrollment_id,
  progress.module_id,
  'completed',
  'historical',
  coalesce(progress.observed_at, current_date),
  progress.observed_at,
  progress.notes
from public.formation_module_progress progress
where progress.status = 'completed'
on conflict do nothing;
