-- La participación requiere seguimiento; no archiva a la persona ni borra su historial.
alter table public.people
  add column if not exists participation_status text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.people'::regclass
      and conname = 'people_participation_status_check'
  ) then
    alter table public.people
      add constraint people_participation_status_check
      check (participation_status is null or participation_status in ('active', 'inactive'));
  end if;
end $$;

comment on column public.people.participation_status is
  'Participación observada para acompañamiento: active, inactive o null si aún no se ha definido. Independiente de is_active (archivo).';