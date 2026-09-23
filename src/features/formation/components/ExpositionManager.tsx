import { useEffect, useMemo, useState } from 'react'
import { Check, ClipboardCheck, Plus, Search, Save } from 'lucide-react'
import { useModules } from '../hooks/useFormation'
import { useModuleEnrollments, useCurrentModuleEnrollments } from '../hooks/useEnrollment'
import {
  useAssessmentComponents,
  useAssessmentItems,
  useAssessmentPlans,
  useCreateExposition,
  useExpositionMembers,
  useExpositions,
  useModuleCycles,
  useUpdateExposition,
  useUpsertAssessmentScore,
} from '../hooks/useAssessment'

const personName = (person: { first_name: string; last_name: string } | null | undefined) =>
  person ? `${person.last_name}, ${person.first_name}` : 'Persona sin nombre'

const EXPOSITION_CRITERIA = [
  ['fidelity', 'Fidelidad al manual y a la Biblia', 30],
  ['clarity', 'Comprensión y claridad', 20],
  ['structure', 'Estructura y manejo del tiempo', 15],
  ['application', 'Aplicación pastoral y práctica', 15],
  ['teamwork', 'Participación y trabajo del grupo', 10],
  ['communication', 'Comunicación', 10],
] as const

export function ExpositionManager() {
  const { data: modules = [] } = useModules()
  const { data: attempts = [] } = useModuleEnrollments()
  const { data: plans = [] } = useAssessmentPlans()
  const createExposition = useCreateExposition()
  const updateExposition = useUpdateExposition()
  const saveScore = useUpsertAssessmentScore()

  const [moduleId, setModuleId] = useState('')
  const { data: currentModuleAttempts = [] } = useCurrentModuleEnrollments(moduleId)
  const [cycleId, setCycleId] = useState('')
  const [title, setTitle] = useState('')
  const [plannedAt, setPlannedAt] = useState('')
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedExposureId, setSelectedExposureId] = useState('')
  const [rubricScores, setRubricScores] = useState<Record<string, string>>({})
  const [observations, setObservations] = useState('')
  const [message, setMessage] = useState('')
  const [editingEvaluation, setEditingEvaluation] = useState(false)

  const selectedModule = modules.find((module) => module.id === moduleId)
  const { data: cycles = [] } = useModuleCycles(moduleId)
  const { data: expositions = [] } = useExpositions(moduleId)
  const selectedExposure = expositions.find((item) => item.id === selectedExposureId)
  const { data: members = [] } = useExpositionMembers(selectedExposureId)
  const selectedPlan = plans.find((plan) => plan.module_id === moduleId && plan.is_active)
  const componentIds = useMemo(
    () => selectedPlan ? [] : [],
    [selectedPlan],
  )
  const { data: components = [] } = useAssessmentComponents(selectedPlan?.id ?? '')
  const expositionComponent = components.find((component) => component.component_key === 'exposition_group')
  const { data: items = [] } = useAssessmentItems(expositionComponent ? [expositionComponent.id] : componentIds)

  const participants = currentModuleAttempts.length > 0
    ? currentModuleAttempts
    : attempts.filter((attempt) => attempt.module_id === moduleId && attempt.status === 'in_progress')
  const modulesWithParticipants = useMemo(
    () => modules.filter((module) => attempts.some((attempt) => attempt.module_id === module.id && attempt.status === 'in_progress')),
    [attempts, modules],
  )
  const visibleParticipants = participants.filter((attempt) => {
    const name = personName(attempt.formation_enrollments?.people)
    return name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  })

  useEffect(() => {
    setEditingEvaluation(false)
    if (!moduleId && modulesWithParticipants[0]) setModuleId(modulesWithParticipants[0].id)
  }, [moduleId, modulesWithParticipants])

  useEffect(() => {
    setCycleId(cycles[0]?.id ?? '')
    setSelectedIds([])
    setSelectedExposureId('')
  }, [moduleId, cycles])

  useEffect(() => {
    setRubricScores(Object.fromEntries(EXPOSITION_CRITERIA.map(([key]) => {
      const stored = selectedExposure?.rubric_scores?.[key]
      const normalized = stored == null ? null : stored > 20 ? stored / 5 : stored
      return [key, normalized == null ? '' : normalized.toFixed(1)]
    })))
    setObservations(selectedExposure?.group_observations ?? '')
  }, [selectedExposure])

  useEffect(() => {
    const locked = selectedExposure?.status === 'presented' && !editingEvaluation
    const saveButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).filter((button) => button.textContent?.includes('Guardar avance') || button.textContent?.includes('Guardar y marcar presentada'))
    saveButtons.forEach((button) => { button.style.display = locked ? 'none' : '' })
    const existingEdit = document.querySelector<HTMLButtonElement>('[data-exposition-edit]')
    if (locked && saveButtons[0] && !existingEdit) {
      const editButton = document.createElement('button')
      editButton.type = 'button'; editButton.dataset.expositionEdit = 'true'; editButton.textContent = 'Editar evaluación'
      editButton.className = 'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium'
      editButton.onclick = () => setEditingEvaluation(true)
      saveButtons[0].parentElement?.prepend(editButton)
    } else if (!locked && existingEdit) existingEdit.remove()
    document.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach((input) => { input.disabled = locked })
    document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => { textarea.disabled = locked })
    return () => {
      document.querySelector('[data-exposition-edit]')?.remove()
      saveButtons.forEach((button) => { button.style.display = '' })
      document.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach((input) => { input.disabled = false })
      document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => { textarea.disabled = false })
    }
  }, [selectedExposure, editingEvaluation])

  const toggleParticipant = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const updateRubricScore = (key: string, value: string) => {
    const normalized = value.replace(',', '.')
    if (normalized !== '' && !/^\d{0,2}(\.\d?)?$/.test(normalized)) return
    const numeric = Number(normalized)
    if (Number.isFinite(numeric) && numeric > 20) {
      setRubricScores((current) => ({ ...current, [key]: '20.0' }))
      return
    }
    setRubricScores((current) => ({ ...current, [key]: normalized }))
  }

  const handleCreateExposition = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!moduleId || !cycleId || selectedIds.length === 0) return
    const fallbackName = title.trim() || `Exposición ${expositions.length + 1}`
    const created = await createExposition.mutateAsync({
      module_id: moduleId,
      cycle_id: cycleId,
      group_name: fallbackName,
      title: title.trim() || null,
      planned_at: plannedAt || null,
      member_ids: selectedIds,
    })
    setSelectedExposureId(created.id)
    setSelectedIds([])
    setTitle('')
    setPlannedAt('')
    setMessage('Exposición creada. Registra la devolución cuando se presente.')
  }

  const saveEvaluation = async () => {
    if (!selectedExposure) return
    if (selectedExposure.status === 'presented' && !editingEvaluation) {
      setMessage('La evaluación ya está presentada. Activa edición para modificarla.')
      return false
    }
    const numericRubric = Object.fromEntries(Object.entries(rubricScores).filter(([, value]) => value.trim() !== '').map(([key, value]) => [key, Number(value)])) as Record<string, number>
    if (Object.values(numericRubric).some((value) => !Number.isFinite(value) || value < 0 || value > 20)) { setMessage('Cada criterio debe tener una nota entre 0 y 20.'); return false }
    const complete = EXPOSITION_CRITERIA.every(([key]) => numericRubric[key] !== undefined)
    const weighted = complete ? EXPOSITION_CRITERIA.reduce((total, [key, , weight]) => total + (numericRubric[key] * weight) / 100, 0) : null
    const numericScore = weighted == null ? null : Number(weighted.toFixed(1))
    await updateExposition.mutateAsync({
      id: selectedExposure.id,
      module_id: selectedExposure.module_id,
      group_score: numericScore,
      rubric_scores: numericRubric,
      group_observations: observations.trim() || null,
    })
    setMessage('Avance guardado. Puedes completar los criterios más adelante.')
    return numericScore
  }

  const markPresented = async () => {
    if (!selectedExposure) return
    const numericScore = await saveEvaluation()
    if (numericScore === false) return
    if (typeof numericScore === 'number' && selectedPlan && expositionComponent && items[0]) {
      const converted = (numericScore / selectedPlan.scale_max) * items[0].max_score
      for (const member of members) {
        await saveScore.mutateAsync({ item_id: items[0].id, module_enrollment_id: member.module_enrollment_id, score: converted, feedback: observations.trim() || null })
      }
      setMessage('Evaluación guardada y nota grupal enviada al cuaderno de notas.')
    } else if (typeof numericScore === 'number') {
      setMessage('Evaluación guardada. Para enviarla al cuaderno agrega “Exposición grupal” al plan de notas.')
    } else {
      setMessage('Evaluación guardada sin nota. Puedes añadirla cuando la tengas.')
    }
    await updateExposition.mutateAsync({ id: selectedExposure.id, module_id: selectedExposure.module_id, status: 'presented', presented_at: new Date().toISOString() })
  }

  if (selectedExposure) {
    const isSaving = updateExposition.isPending || saveScore.isPending
    return <section className="space-y-5">
      <div className="grid gap-5 rounded-2xl border bg-card p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-wrap items-start justify-between gap-4 lg:col-span-2">
          <div><p className="text-sm text-muted-foreground">{selectedModule?.name} · {cycles.find((cycle) => cycle.id === selectedExposure.cycle_id)?.name ?? 'Ciclo'}</p><h2 className="mt-1 text-xl font-semibold">{selectedExposure.group_name}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedExposure.title || 'Sin tema indicado'} · {members.length} participantes</p></div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{selectedExposure.status === 'presented' ? 'Presentada' : 'Pendiente'}</span>
        </div>
        <div className="mt-2 grid gap-5 lg:col-start-2 lg:row-start-2 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div><div className="flex items-center justify-between"><h3 className="font-semibold">Evaluación grupal</h3><span className="text-xs text-muted-foreground">0–20 por criterio</span></div><div className="mt-3 overflow-hidden rounded-xl border">{EXPOSITION_CRITERIA.map(([key, label, weight]) => <label key={key} className="grid grid-cols-[1fr_72px_72px] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0"><span>{label}</span><span className="text-right text-xs text-muted-foreground">{weight}%</span><input type="number" min="0" max="20" step="0.1" value={rubricScores[key] ?? ''} onChange={(event) => updateRubricScore(key, event.target.value)} className="w-full rounded-lg border bg-background px-2 py-1.5 text-right" placeholder="—" /></label>)}</div></div>
          <div className="space-y-4"><div className="rounded-xl bg-muted/40 p-4"><p className="text-sm text-muted-foreground">Nota calculada</p><p className="mt-1 text-3xl font-bold">{EXPOSITION_CRITERIA.every(([key]) => rubricScores[key]?.trim()) ? (EXPOSITION_CRITERIA.reduce((total, [key, , weight]) => total + (Number(rubricScores[key]) * weight) / 100, 0)).toFixed(1) : 'Pendiente'}</p><p className="mt-1 text-xs text-muted-foreground">Escala del plan: {selectedPlan?.scale_max ?? 20}</p></div><label className="text-sm font-medium">Observaciones<textarea value={observations} onChange={(event) => setObservations(event.target.value)} className="mt-2 min-h-28 w-full rounded-lg border bg-background px-3 py-2" placeholder="Aciertos, correcciones y próximos pasos..." /></label></div>
        </div>
        <div className="mt-5 rounded-xl border p-4 lg:col-start-1 lg:row-start-2"><p className="text-sm font-semibold">Integrantes ({members.length})</p><div className="mt-3 grid gap-2">{members.map((member) => <div key={member.module_enrollment_id} className="rounded-lg bg-muted/40 px-3 py-2 text-sm">{personName(member.formation_module_enrollments?.formation_enrollments?.people)}</div>)}</div></div>
        <div className="mt-5 flex flex-wrap gap-3 lg:col-span-2"><button type="button" onClick={() => void saveEvaluation()} disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-wait disabled:opacity-70"><Save className="size-4" /> {isSaving ? 'Guardando...' : 'Guardar avance'}</button><button type="button" onClick={() => void markPresented()} disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-wait disabled:opacity-70"><Check className="size-4" /> {isSaving ? 'Guardando...' : 'Guardar y marcar presentada'}</button></div>
        {message && <p className="mt-4 text-sm text-muted-foreground lg:col-span-2">{message}</p>}
      </div>
    </section>
  }

  return <section className="space-y-5">
    <div className="rounded-2xl border bg-card p-6"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="size-5" /></span><div><h2 className="text-xl font-semibold">Grupos y participantes</h2><p className="text-sm text-muted-foreground">Primero organiza el ciclo, el grupo y las personas que expondrán.</p></div></div><label className="mt-5 block max-w-xl text-sm font-medium">Módulo con participantes<select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="mt-2 w-full rounded-lg border bg-background px-3 py-2">{modulesWithParticipants.map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}</select></label></div>
    <details open className="rounded-2xl border bg-card p-5"><summary className="cursor-pointer font-semibold">Nueva exposición</summary><p className="mt-2 text-sm text-muted-foreground">La exposición pertenece a un ciclo del módulo. Los ciclos se gestionan desde la matrícula; aquí solo se elige el ciclo y sus participantes.</p><form onSubmit={handleCreateExposition} className="mt-4 space-y-4"><div className="grid gap-3 md:grid-cols-3"><select value={cycleId} onChange={(event) => setCycleId(event.target.value)} className="rounded-lg border bg-background px-3 py-2" required><option value="">Seleccionar ciclo del módulo...</option>{cycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name}</option>)}</select><input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-lg border bg-background px-3 py-2" placeholder="Tema o lección (opcional)" /><input type="date" value={plannedAt} onChange={(event) => setPlannedAt(event.target.value)} className="rounded-lg border bg-background px-3 py-2" /></div>{cycles.length === 0 && <p className="text-sm text-amber-700 dark:text-amber-300">Este módulo todavía no tiene ciclos activos. Registra primero el ciclo desde Matrícula.</p>}<div className="max-w-xl"><label className="text-sm font-medium">Agregar participantes</label><div className="mt-2 flex items-center gap-2 rounded-lg border bg-background px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent py-2 outline-none" placeholder="Buscar por nombre..." /></div><div className="mt-2 grid gap-2 sm:grid-cols-2">{visibleParticipants.map((attempt) => <label key={attempt.id} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={selectedIds.includes(attempt.id)} onChange={() => toggleParticipant(attempt.id)} />{personName(attempt.formation_enrollments?.people)}</label>)}</div></div><button type="submit" disabled={!cycleId || selectedIds.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"><Plus className="size-4" /> Crear exposición</button></form></details>
    <div className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Exposiciones creadas</h3>{expositions.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Todavía no hay exposiciones registradas.</p> : <div className="mt-3 grid gap-2 md:grid-cols-2">{expositions.map((exposition) => <button key={exposition.id} type="button" onClick={() => setSelectedExposureId(exposition.id)} className="rounded-xl border p-3 text-left transition hover:border-primary/50"><span className="font-medium">{exposition.group_name}</span><span className="mt-1 block text-xs text-muted-foreground">{exposition.title || 'Sin tema'} · {exposition.status === 'presented' ? 'Presentada' : 'Pendiente'}</span><span className="mt-2 block text-xs font-medium text-primary">Abrir evaluación →</span></button>)}</div>}</div>
  </section>
}
