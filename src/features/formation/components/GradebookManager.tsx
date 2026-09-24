import { useEffect, useMemo, useState } from 'react'
import { BookOpenCheck, LockKeyhole, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEvaluateModuleEnrollment, useModuleEnrollments } from '../hooks/useEnrollment'
import { useActiveStudyCycle, useStudyCycleModules } from '../hooks/useStudyCycles'
import { type AssessmentItem, useAssessmentComponents, useAssessmentItems, useAssessmentPlans, useAssessmentScoresForItems, useUpsertAssessmentScore } from '../hooks/useAssessment'

const MANAGED_COMPONENTS = new Set(['attendance', 'exposition_group'])

export function GradebookManager() {
  const { data: plans = [] } = useAssessmentPlans()
  const { data: attempts = [] } = useModuleEnrollments()
  const { data: activeCycle } = useActiveStudyCycle()
  const { data: cycleModules = [] } = useStudyCycleModules(activeCycle?.id ?? null)
  const cycleModuleIds = new Set(cycleModules.map((entry: { module_id: string }) => entry.module_id))
  const currentPlans = plans.filter((plan) => cycleModuleIds.has(plan.module_id))
  const upsertScore = useUpsertAssessmentScore()
  const evaluateModule = useEvaluateModuleEnrollment()
  const [planId, setPlanId] = useState('')
  const [scores, setScores] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const selectedPlan = currentPlans.find((plan) => plan.id === planId) ?? null
  const { data: components = [] } = useAssessmentComponents(planId)
  const { data: items = [] } = useAssessmentItems(components.map((component) => component.id))
  const { data: savedScores = [] } = useAssessmentScoresForItems(items.map((item) => item.id))
  const participants = useMemo(() => attempts.filter((attempt) => attempt.study_cycle_id === activeCycle?.id && attempt.module_id === selectedPlan?.module_id && attempt.status === 'in_progress'), [attempts, activeCycle?.id, selectedPlan?.module_id])
  const groups = useMemo(() => components.map((component) => ({ component, items: items.filter((item) => item.component_id === component.id) })).filter((group) => group.items.length), [components, items])
  const managedItems = useMemo(() => new Set(groups.filter((group) => MANAGED_COMPONENTS.has(group.component.component_key)).flatMap((group) => group.items.map((item) => item.id))), [groups])

  useEffect(() => { setScores({}) }, [planId])
  useEffect(() => { setPlanId('') }, [activeCycle?.id])
  useEffect(() => {
    const next: Record<string, string> = {}
    const participantIds = new Set(participants.map((attempt) => attempt.id))
    for (const score of savedScores) if (participantIds.has(score.module_enrollment_id)) next[`${score.item_id}:${score.module_enrollment_id}`] = Number(score.score).toFixed(1)
    setScores(next)
  }, [savedScores, participants])

  const results = useMemo(() => participants.map((attempt) => {
    let weight = 0
    let progress = 0
    for (const component of components) {
      const componentItems = items.filter((item) => item.component_id === component.id)
      const values = componentItems.map((item) => scores[`${item.id}:${attempt.id}`]).filter((value): value is string => value !== undefined && value.trim() !== '')
      if (values.length !== componentItems.length) continue
      const average = componentItems.reduce((sum, item) => sum + Number(scores[`${item.id}:${attempt.id}`]) / Number(item.max_score), 0) / componentItems.length
      weight += Number(component.weight)
      progress += average * Number(component.weight)
    }
    return { attemptId: attempt.id, finalGrade: weight >= 99.999 ? Number(((progress / 100) * Number(selectedPlan?.scale_max ?? 0)).toFixed(2)) : null }
  }), [participants, components, items, scores, selectedPlan?.scale_max])

  async function save() {
    const entries = Object.entries(scores).filter(([key, value]) => value.trim() && !managedItems.has(key.split(':')[0]))
    try {
      for (const [key, value] of entries) {
        const [itemId, enrollmentId] = key.split(':')
        const item = items.find((candidate) => candidate.id === itemId)
        const score = Number(value)
        if (!item || !Number.isFinite(score) || score < 0 || score > Number(item.max_score)) { setMessage('Revisa las notas: cada una debe estar entre 0 y su nota máxima.'); return }
        await upsertScore.mutateAsync({ item_id: itemId, module_enrollment_id: enrollmentId, score })
      }
      let closed = 0
      for (const result of results) {
        const attempt = participants.find((candidate) => candidate.id === result.attemptId)
        if (!attempt || result.finalGrade === null) continue
        await evaluateModule.mutateAsync({ id: attempt.id, enrollment_id: attempt.enrollment_id, module_id: attempt.module_id, final_grade: result.finalGrade.toFixed(2), final_result: result.finalGrade >= Number(selectedPlan?.passing_score) ? 'approved' : 'reinforcement', evaluated_at: new Date().toISOString().slice(0, 10), evaluation_notes: 'Resultado calculado automáticamente desde el cuaderno de notas.' })
        closed += 1
      }
      setMessage(`${entries.length} ${entries.length === 1 ? 'nota guardada' : 'notas guardadas'}${closed ? ` · ${closed} resultados calculados` : ''}.`)
    } catch { setMessage('No se pudieron guardar las notas.') }
  }

  return <section className="space-y-5">
    <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><BookOpenCheck className="size-5" /></div><div><h2 className="font-semibold">Cuaderno de notas</h2><p className="mt-1 text-sm text-muted-foreground">Una fila por persona y una columna por cada nota del manual.</p></div></div><label className="mt-5 block max-w-xl space-y-1.5 text-sm font-medium">Manual<select value={planId} onChange={(event) => setPlanId(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">Seleccionar manual...</option>{currentPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.formation_modules?.name}</option>)}</select></label>{message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}</div>
    {!selectedPlan ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Selecciona un manual para abrir su cuaderno de notas.</div> : <div className="overflow-hidden rounded-2xl border bg-card"><div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Notas de {selectedPlan.formation_modules?.name}</h2><p className="mt-1 text-sm text-muted-foreground">Asistencia y exposición grupal son automáticas; las demás notas se editan aquí.</p></div><Button type="button" onClick={() => void save()} disabled={upsertScore.isPending || evaluateModule.isPending} className="gap-2"><Save className="size-4" />Guardar notas</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-sm"><thead><tr className="border-b bg-muted/40"><th rowSpan={2} className="min-w-56 border-r px-4 py-3 text-left font-semibold">Participante</th>{groups.map((group) => <th key={group.component.id} colSpan={group.items.length} className="border-r px-3 py-2 text-center font-semibold">{group.component.name}<span className="ml-1 text-xs font-normal text-muted-foreground">{group.component.weight}%</span>{MANAGED_COMPONENTS.has(group.component.component_key) && <LockKeyhole className="ml-1 inline size-3 text-muted-foreground" />}</th>)}<th rowSpan={2} className="min-w-32 px-4 py-3 text-center font-semibold">Resultado</th></tr><tr className="border-b bg-muted/20">{groups.flatMap((group) => group.items.map((item: AssessmentItem) => <th key={item.id} className="min-w-32 border-r px-3 py-2 text-center font-medium">{item.title}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">/ {item.max_score}</span></th>))}</tr></thead><tbody>{participants.length === 0 ? <tr><td colSpan={items.length + 2} className="p-8 text-center text-muted-foreground">No hay participantes inscritos actualmente en este manual.</td></tr> : participants.map((attempt) => { const result = results.find((value) => value.attemptId === attempt.id); return <tr key={attempt.id} className="border-b last:border-b-0 hover:bg-muted/20"><td className="border-r px-4 py-3 font-medium">{attempt.formation_enrollments?.people?.last_name}, {attempt.formation_enrollments?.people?.first_name}</td>{groups.flatMap((group) => group.items.map((item) => { const managed = MANAGED_COMPONENTS.has(group.component.component_key); return <td key={item.id} className="border-r p-2 text-center"><input type="number" min="0" max={item.max_score} step="0.1" disabled={managed} value={scores[`${item.id}:${attempt.id}`] ?? ''} onChange={(event) => setScores((current) => ({ ...current, [`${item.id}:${attempt.id}`]: event.target.value }))} placeholder="—" aria-label={`${item.title} de ${attempt.formation_enrollments?.people?.first_name ?? 'participante'}`} className={`h-9 w-20 rounded-lg border border-input bg-background px-2 text-center text-sm ${managed ? 'cursor-not-allowed bg-muted text-muted-foreground' : ''}`} /></td> }))}<td className="px-4 py-3 text-center">{result?.finalGrade === null || result?.finalGrade === undefined ? <span className="text-xs text-muted-foreground">Pendiente</span> : <span className={result.finalGrade >= Number(selectedPlan.passing_score) ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'font-semibold text-destructive'}>{result.finalGrade.toFixed(2)} / {selectedPlan.scale_max}</span>}</td></tr> })}</tbody></table></div></div>}
  </section>
}
