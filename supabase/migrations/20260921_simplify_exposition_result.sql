alter table public.formation_expositions
  add column if not exists group_score numeric(6,2),
  add column if not exists group_observations text;
