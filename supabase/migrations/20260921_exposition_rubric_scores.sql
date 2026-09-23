alter table public.formation_expositions
  add column if not exists rubric_scores jsonb not null default '{}'::jsonb;

comment on column public.formation_expositions.rubric_scores is
  'Notas de 0 a 100 por criterio de la evaluacion grupal, guardadas como JSON.';
