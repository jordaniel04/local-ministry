-- Mantiene separada la nota histórica de la evaluación local realizada ahora.
alter table public.formation_module_progress
  add column if not exists historical_grade text,
  add column if not exists validation_score text,
  add column if not exists validation_result text,
  add column if not exists validation_date date,
  add column if not exists validation_notes text;

do $$
begin
  alter table public.formation_module_progress
    add constraint formation_module_progress_validation_result_check
    check (
      validation_result is null
      or validation_result in ('validated', 'reinforcement', 'accompaniment')
    );
exception
  when duplicate_object then null;
end $$;
