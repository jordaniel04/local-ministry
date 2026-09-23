alter table public.formation_expositions
  add column if not exists study_cycle_id uuid references public.formation_study_cycles(id) on delete set null;

update public.formation_expositions
set study_cycle_id = c.id
from public.formation_study_cycles c
where c.name = 'Ciclo 2026 - 2027' and study_cycle_id is null;
