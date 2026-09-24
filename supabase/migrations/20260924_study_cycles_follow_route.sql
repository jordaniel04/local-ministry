-- El currículo local aporta los manuales de la ruta; cada ciclo solo puede usar manuales de esa ruta.
insert into public.formation_route_modules (route_id, module_id, order_index)
select r.id, m.id, m.order_index
from public.formation_routes r
cross join public.formation_modules m
where r.key = 'local-miramar' and m.is_active = true
on conflict (route_id, module_id) do nothing;

-- Los ciclos tienen una ruta concreta; los existentes ya fueron vinculados.
alter table public.formation_study_cycles
  alter column route_id set not null;

-- Los manuales nuevos se vinculan a una ruta desde create_formation_module_for_route.

create or replace function public.check_study_cycle_module_route()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  cycle_route_id uuid;
begin
  select route_id into cycle_route_id
  from public.formation_study_cycles
  where id = new.study_cycle_id;

  if not exists (
    select 1 from public.formation_route_modules
    where route_id = cycle_route_id and module_id = new.module_id
  ) then
    raise exception 'El manual no pertenece a la ruta del ciclo.';
  end if;
  return new;
end;
$$;

drop trigger if exists study_cycle_module_route_check on public.formation_study_cycle_modules;
create trigger study_cycle_module_route_check
before insert or update of study_cycle_id, module_id on public.formation_study_cycle_modules
for each row execute function public.check_study_cycle_module_route();

create or replace function public.check_study_cycle_route_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.formation_study_cycle_modules cm
    where cm.study_cycle_id = new.id
      and not exists (
        select 1 from public.formation_route_modules rm
        where rm.route_id = new.route_id and rm.module_id = cm.module_id
      )
  ) then
    raise exception 'La nueva ruta no contiene todos los manuales del ciclo.';
  end if;
  return new;
end;
$$;

drop trigger if exists study_cycle_route_change_check on public.formation_study_cycles;
create trigger study_cycle_route_change_check
before update of route_id on public.formation_study_cycles
for each row execute function public.check_study_cycle_route_change();

create or replace function public.protect_route_module_in_study_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.formation_study_cycle_modules cm
    join public.formation_study_cycles c on c.id = cm.study_cycle_id
    where c.route_id = old.route_id and cm.module_id = old.module_id
  ) then
    raise exception 'El manual pertenece a un ciclo de esta ruta.';
  end if;
  return old;
end;
$$;

drop trigger if exists route_module_study_cycle_check on public.formation_route_modules;
create trigger route_module_study_cycle_check
before delete on public.formation_route_modules
for each row execute function public.protect_route_module_in_study_cycle();