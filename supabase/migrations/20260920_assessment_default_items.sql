-- Cada componente del plan abre automáticamente una columna inicial en el cuaderno.
create or replace function public.create_default_assessment_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_scale numeric(6,2);
begin
  select scale_max into plan_scale
  from public.formation_assessment_plans
  where id = new.plan_id;

  insert into public.formation_assessment_items (
    component_id,
    title,
    max_score
  ) values (
    new.id,
    new.name,
    coalesce(plan_scale, 20)
  );

  return new;
end;
$$;

drop trigger if exists formation_assessment_component_default_item on public.formation_assessment_components;
create trigger formation_assessment_component_default_item
after insert on public.formation_assessment_components
for each row execute function public.create_default_assessment_item();

-- Completa los componentes creados antes de este cambio sin duplicar columnas existentes.
insert into public.formation_assessment_items (component_id, title, max_score)
select component.id, component.name, plan.scale_max
from public.formation_assessment_components component
join public.formation_assessment_plans plan on plan.id = component.plan_id
where not exists (
  select 1
  from public.formation_assessment_items item
  where item.component_id = component.id
);
