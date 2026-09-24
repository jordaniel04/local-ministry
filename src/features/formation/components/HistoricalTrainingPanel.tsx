import { useState } from 'react'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePeople } from '@/features/people/hooks/usePeople'
import { useModules } from '../hooks/useFormation'
import { useHistoricalModuleCompletions, useLocalRoute, useRegisterHistoricalCompletion } from '../hooks/useEnrollment'
import { useRouteModules } from '../hooks/useRoutes'

const RESULT_LABELS: Record<string, string> = {
  validated: 'Validado',
  reinforcement: 'Necesita refuerzo',
  accompaniment: 'Requiere acompañamiento',
}

export function HistoricalTrainingPanel({ onMessage }: { onMessage: (message: string) => void }) {
  const { data: people } = usePeople()
  const { data: modules } = useModules()
  const { data: route } = useLocalRoute()
  const { data: routeModules = [] } = useRouteModules(route?.id ?? null)
  const { data: completions } = useHistoricalModuleCompletions(route?.id ?? null)
  const registerCompletion = useRegisterHistoricalCompletion()
  const [personId, setPersonId] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [grade, setGrade] = useState('')
  const [validateNow, setValidateNow] = useState(false)
  const [validationScore, setValidationScore] = useState('')
  const [validationResult, setValidationResult] = useState<'validated' | 'reinforcement' | 'accompaniment'>('validated')
  const [validationDate, setValidationDate] = useState('')
  const [validationNotes, setValidationNotes] = useState('')

  const activePeople = (people ?? []).filter((person) => person.is_active)
  const routeModuleIds = new Set(routeModules.map((item) => item.module_id))
  const activeModules = (modules ?? []).filter((module) => module.is_active && routeModuleIds.has(module.id))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!route || !personId || !moduleId) return
    try {
      await registerCompletion.mutateAsync({
        person_id: personId,
        route_id: route.id,
        module_id: moduleId,
        observed_at: date || null,
        notes: notes || 'Culminado antes del periodo actual.',
        historical_grade: grade || null,
        validation_score: validateNow ? validationScore || null : null,
        validation_result: validateNow ? validationResult : null,
        validation_date: validateNow ? validationDate || new Date().toISOString().slice(0, 10) : null,
        validation_notes: validateNow ? validationNotes || null : null,
      })
      setPersonId('')
      setModuleId('')
      setDate('')
      setNotes('')
      setGrade('')
      setValidateNow(false)
      setValidationScore('')
      setValidationResult('validated')
      setValidationDate('')
      setValidationNotes('')
      onMessage('La formación previa quedó registrada.')
    } catch {
      onMessage('No se pudo registrar la formación previa.')
    }
  }

  return (
    <>
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-amber-500/10 p-2 text-amber-600"><History className="size-5" /></div><div><h2 className="font-semibold">Registrar formación previa</h2><p className="mt-1 text-sm text-muted-foreground">Para una persona que culminó el módulo antes del periodo actual.</p></div></div>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">Persona<select value={personId} onChange={(event) => setPersonId(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required><option value="">Seleccionar persona...</option>{activePeople.map((person) => <option key={person.id} value={person.id}>{person.last_name}, {person.first_name}</option>)}</select></label>
          <label className="space-y-1.5 text-sm font-medium">Módulo culminado<select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required><option value="">Seleccionar módulo...</option>{activeModules.map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}</select></label>
          <label className="space-y-1.5 text-sm font-medium">Fecha de culminación (opcional)<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="space-y-1.5 text-sm font-medium">Nota anterior (opcional)<input value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="Ejemplo: 16/20" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Observación (opcional)<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Fuente o contexto del registro..." className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-muted/30 p-3 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={validateNow} onChange={(event) => setValidateNow(event.target.checked)} className="size-4 accent-primary" />También registrar una evaluación actual</label>
          {validateNow && <div className="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:col-span-2 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">Nota de validación (opcional)<input value={validationScore} onChange={(event) => setValidationScore(event.target.value)} placeholder="Ejemplo: 15/20" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
            <label className="space-y-1.5 text-sm font-medium">Resultado<select value={validationResult} onChange={(event) => setValidationResult(event.target.value as typeof validationResult)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="validated">Validado</option><option value="reinforcement">Necesita refuerzo</option><option value="accompaniment">Requiere acompañamiento</option></select></label>
            <label className="space-y-1.5 text-sm font-medium">Fecha de evaluación<input type="date" value={validationDate} onChange={(event) => setValidationDate(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
            <label className="space-y-1.5 text-sm font-medium">Observación<input value={validationNotes} onChange={(event) => setValidationNotes(event.target.value)} placeholder="Fortaleza o refuerzo recomendado..." className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          </div>}
          <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={registerCompletion.isPending || !route}>Registrar formación previa</Button></div>
        </form>
      </div>

      {(completions ?? []).length > 0 && <div className="space-y-3"><h2 className="font-semibold">Antecedentes registrados</h2><div className="grid gap-3 md:grid-cols-2">{completions?.map((completion: any) => <div key={completion.id} className="rounded-xl border bg-card p-4"><p className="font-medium">{completion.formation_enrollments?.people?.last_name}, {completion.formation_enrollments?.people?.first_name}</p><p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">{completion.formation_modules?.name} · Culminado</p><p className="mt-1 text-xs text-muted-foreground">{completion.observed_at ?? 'Fecha no registrada'}{completion.historical_grade ? ` · Nota anterior: ${completion.historical_grade}` : ''}</p>{completion.validation_result && <div className="mt-3 rounded-lg bg-muted/60 p-2.5 text-xs"><p className="font-medium">Validación actual: {RESULT_LABELS[completion.validation_result]}</p><p className="mt-1 text-muted-foreground">{completion.validation_date ?? 'Sin fecha'}{completion.validation_score ? ` · Nota: ${completion.validation_score}` : ''}</p>{completion.validation_notes && <p className="mt-1 text-muted-foreground">{completion.validation_notes}</p>}</div>}{completion.notes && <p className="mt-2 text-xs text-muted-foreground">{completion.notes}</p>}</div>)}</div></div>}
    </>
  )
}
