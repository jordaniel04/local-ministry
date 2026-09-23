-- Evaluación que autoriza el cierre de una participación en un módulo.
alter table public.formation_module_enrollments
  add column if not exists final_grade text,
  add column if not exists final_result text,
  add column if not exists evaluated_at date,
  add column if not exists evaluation_notes text;

do $$
begin
  alter table public.formation_module_enrollments
    add constraint formation_module_enrollments_final_result_check
    check (final_result is null or final_result in ('approved', 'reinforcement'));
exception
  when duplicate_object then null;
end $$;
