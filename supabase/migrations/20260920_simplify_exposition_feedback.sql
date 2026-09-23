-- La exposición conserva su evaluación grupal y la devolución personal cualitativa.
-- No vincula automáticamente resultados al cuaderno de notas.
alter table public.formation_expositions
  add column if not exists objective text,
  add column if not exists biblical_texts text,
  add column if not exists central_ideas text,
  add column if not exists application text,
  add column if not exists group_question text;

alter table public.formation_exposition_members
  add column if not exists strength text,
  add column if not exists reinforcement text,
  add column if not exists next_step text;
