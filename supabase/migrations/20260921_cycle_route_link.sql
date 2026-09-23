alter table public.formation_module_cycles
  add column if not exists route_id uuid references public.formation_routes(id) on delete restrict;

create index if not exists formation_module_cycles_route_idx
  on public.formation_module_cycles(route_id);
