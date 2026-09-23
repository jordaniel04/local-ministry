alter table public.formation_module_enrollments
  add column if not exists study_cycle_id uuid references public.formation_study_cycles(id) on delete set null;

create index if not exists formation_module_enrollments_study_cycle_idx
  on public.formation_module_enrollments(study_cycle_id);

insert into public.formation_study_cycle_modules (study_cycle_id, module_id, order_index, status)
select c.id, m.id, m.order_index,
  case when m.order_index = 1 then 'active' else 'pending' end
from public.formation_study_cycles c
cross join public.formation_modules m
where c.name = 'Ciclo 2026 - 2027' and m.is_active = true
on conflict (study_cycle_id, module_id) do update set order_index = excluded.order_index;

update public.formation_module_enrollments e
set study_cycle_id = c.id
from public.formation_study_cycles c
where c.name = 'Ciclo 2026 - 2027' and e.study_cycle_id is null;
