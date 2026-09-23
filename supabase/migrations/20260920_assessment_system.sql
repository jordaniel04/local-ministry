-- Planes configurables, evaluaciones y rúbricas de exposiciones.
create table if not exists public.formation_assessment_plans (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.formation_modules(id) on delete cascade,
  name text not null,
  scale_max numeric(6,2) not null check (scale_max > 0),
  passing_score numeric(6,2) not null check (passing_score >= 0 and passing_score <= scale_max),
  recovery_rule text not null default 'manual' check (recovery_rule in ('manual', 'replace_final', 'replace_lowest', 'average')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.formation_assessment_components (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.formation_assessment_plans(id) on delete cascade,
  component_key text not null,
  name text not null,
  weight numeric(5,2) not null check (weight > 0 and weight <= 100),
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, component_key)
);

create table if not exists public.formation_assessment_items (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.formation_assessment_components(id) on delete cascade,
  title text not null,
  assessed_at date,
  max_score numeric(6,2) not null check (max_score > 0),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.formation_assessment_scores (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.formation_assessment_items(id) on delete cascade,
  module_enrollment_id uuid not null references public.formation_module_enrollments(id) on delete cascade,
  score numeric(6,2) not null check (score >= 0),
  feedback text,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, module_enrollment_id)
);

create table if not exists public.formation_expositions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.formation_modules(id) on delete cascade,
  lesson_id uuid references public.formation_lessons(id) on delete set null,
  group_name text not null,
  title text,
  planned_at date,
  presented_at date,
  status text not null default 'planned' check (status in ('planned', 'prepared', 'presented', 'reinforcement')),
  outline_received boolean not null default false,
  group_feedback text,
  group_assessment_item_id uuid references public.formation_assessment_items(id) on delete set null,
  individual_assessment_item_id uuid references public.formation_assessment_items(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.formation_exposition_members (
  exposition_id uuid not null references public.formation_expositions(id) on delete cascade,
  module_enrollment_id uuid not null references public.formation_module_enrollments(id) on delete cascade,
  assigned_part text,
  primary key (exposition_id, module_enrollment_id)
);

create table if not exists public.formation_exposition_rubric_items (
  id uuid primary key default gen_random_uuid(),
  exposition_id uuid not null references public.formation_expositions(id) on delete cascade,
  scope text not null check (scope in ('group', 'individual')),
  criterion text not null,
  max_score numeric(6,2) not null check (max_score > 0),
  order_index integer not null default 0
);

create table if not exists public.formation_exposition_scores (
  id uuid primary key default gen_random_uuid(),
  rubric_item_id uuid not null references public.formation_exposition_rubric_items(id) on delete cascade,
  module_enrollment_id uuid references public.formation_module_enrollments(id) on delete cascade,
  score numeric(6,2) not null check (score >= 0),
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists formation_exposition_group_score_unique
  on public.formation_exposition_scores(rubric_item_id)
  where module_enrollment_id is null;
create unique index if not exists formation_exposition_individual_score_unique
  on public.formation_exposition_scores(rubric_item_id, module_enrollment_id)
  where module_enrollment_id is not null;
create index if not exists formation_assessment_components_plan_idx on public.formation_assessment_components(plan_id);
create index if not exists formation_assessment_items_component_idx on public.formation_assessment_items(component_id);
create index if not exists formation_assessment_scores_enrollment_idx on public.formation_assessment_scores(module_enrollment_id);
create index if not exists formation_expositions_module_idx on public.formation_expositions(module_id);

alter table public.formation_assessment_plans enable row level security;
alter table public.formation_assessment_components enable row level security;
alter table public.formation_assessment_items enable row level security;
alter table public.formation_assessment_scores enable row level security;
alter table public.formation_expositions enable row level security;
alter table public.formation_exposition_members enable row level security;
alter table public.formation_exposition_rubric_items enable row level security;
alter table public.formation_exposition_scores enable row level security;

create policy formation_assessment_plans_authenticated on public.formation_assessment_plans for all to authenticated using (true) with check (true);
create policy formation_assessment_components_authenticated on public.formation_assessment_components for all to authenticated using (true) with check (true);
create policy formation_assessment_items_authenticated on public.formation_assessment_items for all to authenticated using (true) with check (true);
create policy formation_assessment_scores_authenticated on public.formation_assessment_scores for all to authenticated using (true) with check (true);
create policy formation_expositions_authenticated on public.formation_expositions for all to authenticated using (true) with check (true);
create policy formation_exposition_members_authenticated on public.formation_exposition_members for all to authenticated using (true) with check (true);
create policy formation_exposition_rubric_items_authenticated on public.formation_exposition_rubric_items for all to authenticated using (true) with check (true);
create policy formation_exposition_scores_authenticated on public.formation_exposition_scores for all to authenticated using (true) with check (true);
