-- Permite administrar rutas locales y sus manuales desde Configuración.
-- Los ciclos conservan sus manuales: el disparador route_module_study_cycle_check
-- impide retirar un manual que ya pertenece a un ciclo de esa ruta.
drop policy if exists formation_routes_insert_authenticated on public.formation_routes;
create policy formation_routes_insert_authenticated
on public.formation_routes
for insert to authenticated
with check (scope = 'local' and is_active = true);

drop policy if exists formation_route_modules_insert_authenticated on public.formation_route_modules;
create policy formation_route_modules_insert_authenticated
on public.formation_route_modules
for insert to authenticated
with check (
  exists (
    select 1 from public.formation_routes r
    where r.id = route_id and r.scope = 'local' and r.is_active = true
  )
);

drop policy if exists formation_route_modules_delete_authenticated on public.formation_route_modules;
create policy formation_route_modules_delete_authenticated
on public.formation_route_modules
for delete to authenticated
using (
  exists (
    select 1 from public.formation_routes r
    where r.id = route_id and r.scope = 'local'
  )
);