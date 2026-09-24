-- La ruta en curso se deriva del único ciclo de estudio activo.
-- Los ciclos nuevos quedan preparados hasta que se inicien explícitamente.
alter table public.formation_study_cycles
  alter column status set default 'paused';

create unique index if not exists formation_one_active_study_cycle_idx
  on public.formation_study_cycles (status)
  where status = 'active';

create or replace function public.activate_formation_study_cycle(p_cycle_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión autenticada.';
  end if;

  -- Serializa las activaciones concurrentes; el índice único refuerza la regla.
  perform pg_catalog.pg_advisory_xact_lock(20260924, 1);

  if not exists (
    select 1 from public.formation_study_cycles c
    join public.formation_routes r on r.id = c.route_id
    where c.id = p_cycle_id and r.is_active = true
  ) then
    raise exception 'No se encontró un ciclo con una ruta disponible.';
  end if;

  if not exists (
    select 1 from public.formation_study_cycle_modules
    where study_cycle_id = p_cycle_id
  ) then
    raise exception 'Agrega al menos un manual antes de iniciar el ciclo.';
  end if;

  update public.formation_study_cycles
  set status = 'paused'
  where status = 'active' and id <> p_cycle_id;

  update public.formation_study_cycles
  set status = 'active'
  where id = p_cycle_id;
end;
$$;

revoke all on function public.activate_formation_study_cycle(uuid) from public;
grant execute on function public.activate_formation_study_cycle(uuid) to authenticated;
-- Los manuales nuevos se asignan a la ruta elegida, sin agregarse automáticamente a Miramar.
drop trigger if exists formation_module_add_to_local_route on public.formation_modules;
drop function if exists public.add_local_route_module();

create or replace function public.create_formation_module_for_route(
  p_route_id uuid,
  p_name text,
  p_description text,
  p_order_index integer,
  p_route_order_index integer
)
returns public.formation_modules
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_module public.formation_modules;
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión autenticada.';
  end if;

  if not exists (
    select 1 from public.formation_routes
    where id = p_route_id and scope = 'local' and is_active = true
  ) then
    raise exception 'La ruta no está disponible.';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'El nombre del manual es obligatorio.';
  end if;

  insert into public.formation_modules (name, description, order_index, is_active)
  values (btrim(p_name), p_description, p_order_index, true)
  returning * into created_module;

  insert into public.formation_route_modules (route_id, module_id, order_index)
  values (p_route_id, created_module.id, p_route_order_index);

  return created_module;
end;
$$;

revoke all on function public.create_formation_module_for_route(uuid, text, text, integer, integer) from public;
grant execute on function public.create_formation_module_for_route(uuid, text, text, integer, integer) to authenticated;
-- Toda matrícula ligada a un ciclo debe usar su ruta y uno de sus manuales.
create or replace function public.check_module_enrollment_study_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.study_cycle_id is not null and not exists (
    select 1
    from public.formation_study_cycles c
    join public.formation_enrollments e on e.route_id = c.route_id
    join public.formation_study_cycle_modules cm
      on cm.study_cycle_id = c.id and cm.module_id = new.module_id
    where c.id = new.study_cycle_id and e.id = new.enrollment_id
  ) then
    raise exception 'La matrícula no pertenece a la ruta y al manual del ciclo.';
  end if;
  return new;
end;
$$;

drop trigger if exists module_enrollment_study_cycle_check on public.formation_module_enrollments;
create trigger module_enrollment_study_cycle_check
before insert or update of enrollment_id, module_id, study_cycle_id
on public.formation_module_enrollments
for each row execute function public.check_module_enrollment_study_cycle();