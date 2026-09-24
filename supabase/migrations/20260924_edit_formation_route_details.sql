-- Edita únicamente el nombre y la versión; la clave interna de la ruta permanece estable.
create or replace function public.update_formation_route_details(
  p_route_id uuid,
  p_name text,
  p_version text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión autenticada.';
  end if;

  if p_name is null or btrim(p_name) = '' or p_version is null or btrim(p_version) = '' then
    raise exception 'El nombre y la versión son obligatorios.';
  end if;

  update public.formation_routes
  set name = btrim(p_name), version = btrim(p_version)
  where id = p_route_id and scope = 'local';

  if not found then
    raise exception 'No se encontró la ruta local.';
  end if;
end;
$$;

revoke all on function public.update_formation_route_details(uuid, text, text) from public;
grant execute on function public.update_formation_route_details(uuid, text, text) to authenticated;