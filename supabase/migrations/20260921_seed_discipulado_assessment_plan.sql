update public.formation_assessment_plans p
set scale_max = source.scale_max,
    passing_score = source.passing_score,
    recovery_rule = source.recovery_rule
from public.formation_modules target_module
join public.formation_assessment_plans source
  on source.module_id = (select id from public.formation_modules where name = 'Consolidado' limit 1)
where p.module_id = target_module.id
  and target_module.name = 'Discipulado I';

insert into public.formation_assessment_components (plan_id, component_key, name, weight, order_index, is_active)
select target.id, source_component.component_key, source_component.name, source_component.weight, source_component.order_index, source_component.is_active
from public.formation_assessment_plans target
join public.formation_modules target_module on target_module.id = target.module_id and target_module.name = 'Discipulado I'
join public.formation_assessment_plans source on source.module_id = (select id from public.formation_modules where name = 'Consolidado' limit 1)
join public.formation_assessment_components source_component on source_component.plan_id = source.id
where not exists (
  select 1 from public.formation_assessment_components existing
  where existing.plan_id = target.id and existing.component_key = source_component.component_key
);
