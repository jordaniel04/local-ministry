import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Settings2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModules } from '../hooks/useFormation'
import {
  useAddAssessmentComponent,
  useAssessmentComponents,
  useAssessmentPlans,
  useCreateAssessmentPlan,
  useDeleteAssessmentComponent,
  useUpdateAssessmentComponent,
  useReorderAssessmentComponents,
  useUpdateAssessmentPlan,
} from '../hooks/useAssessment'

const COMPONENT_OPTIONS = [
  ['attendance', 'Asistencia'],
  ['participation', 'Participación en clase'],
  ['practice', 'Práctica'],
  ['exposition_group', 'Exposición grupal'],
  ['final_exam', 'Evaluación final'],
  ['recovery', 'Recuperación'],
  ['custom', 'Otro componente'],
] as const

const RECOVERY_LABELS: Record<string, string> = {
  manual: 'Decisión manual',
  replace_final: 'Reemplaza evaluación final',
  replace_lowest: 'Reemplaza nota más baja',
  average: 'Se promedia con la nota anterior',
}

export function AssessmentPlanManager() {
  const { data: modules } = useModules()
  const { data: plans, isLoading, error } = useAssessmentPlans()
  const createPlan = useCreateAssessmentPlan()
  const addComponent = useAddAssessmentComponent()
  const deleteComponent = useDeleteAssessmentComponent()
  const updateComponent = useUpdateAssessmentComponent()
  const reorderComponents = useReorderAssessmentComponents()
  const updatePlan = useUpdateAssessmentPlan()
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [scaleMax, setScaleMax] = useState('')
  const [passingScore, setPassingScore] = useState('')
  const [recoveryRule, setRecoveryRule] = useState<'manual' | 'replace_final' | 'replace_lowest' | 'average'>('manual')
  const [componentKey, setComponentKey] = useState<(typeof COMPONENT_OPTIONS)[number][0]>('attendance')
  const [componentName, setComponentName] = useState('Asistencia')
  const [weight, setWeight] = useState('')
  const [message, setMessage] = useState('')
  const [editingComponentId, setEditingComponentId] = useState('')
  const [editingComponentName, setEditingComponentName] = useState('')
  const [editingComponentWeight, setEditingComponentWeight] = useState('')
  const [isEditingPlan, setIsEditingPlan] = useState(false)
  const [editedScaleMax, setEditedScaleMax] = useState('')
  const [editedPassingScore, setEditedPassingScore] = useState('')
  const [editedRecoveryRule, setEditedRecoveryRule] = useState<'manual' | 'replace_final' | 'replace_lowest' | 'average'>('manual')

  const activeModules = (modules ?? []).filter((module) => module.is_active)
  const selectedPlan = (plans ?? []).find((plan) => plan.id === selectedPlanId) ?? null
  const { data: components } = useAssessmentComponents(selectedPlanId)
  const totalWeight = (components ?? []).reduce((total, component) => total + Number(component.weight), 0)
  const usedComponentKeys = new Set((components ?? []).map((component) => component.component_key))
  const availableModules = activeModules.filter((module) => !(plans ?? []).some((plan) => plan.module_id === module.id))
  const remainingWeight = Math.max(0, 100 - totalWeight)
  const isPlanReady = Math.abs(totalWeight - 100) < 0.001

  const selectedModuleName = useMemo(() => activeModules.find((module) => module.id === moduleId)?.name ?? '', [activeModules, moduleId])

  useEffect(() => {
    if (!selectedPlan) return
    setEditedScaleMax(String(selectedPlan.scale_max))
    setEditedPassingScore(String(selectedPlan.passing_score))
    setEditedRecoveryRule(selectedPlan.recovery_rule)
    setIsEditingPlan(false)
  }, [selectedPlan])

  function updateComponentKey(value: (typeof COMPONENT_OPTIONS)[number][0]) {
    setComponentKey(value)
    const found = COMPONENT_OPTIONS.find(([key]) => key === value)
    setComponentName(value === 'custom' ? '' : found?.[1] ?? '')
  }

  async function handleCreatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const max = Number(scaleMax)
    const passing = Number(passingScore)
    if (!moduleId || !Number.isFinite(max) || !Number.isFinite(passing) || max <= 0 || passing < 0 || passing > max) {
      setMessage('Revisa la escala y la nota mínima de aprobación.')
      return
    }
    try {
      const plan = await createPlan.mutateAsync({
        module_id: moduleId,
        name: `Plan de notas · ${selectedModuleName}`,
        scale_max: max,
        passing_score: passing,
        recovery_rule: recoveryRule,
      })
      setSelectedPlanId(plan.id)
      setModuleId('')
      setMessage('Plan creado. Ahora agrega los componentes y sus ponderaciones.')
    } catch {
      setMessage('No se pudo crear el plan. Puede que el manual ya tenga uno.')
    }
  }

  async function handleAddComponent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPlan || !componentName.trim()) return
    const numericWeight = Number(weight)
    if (!Number.isFinite(numericWeight) || numericWeight <= 0 || numericWeight > remainingWeight) {
      setMessage(`La ponderación debe ser mayor que 0 y no superar ${remainingWeight} %. `)
      return
    }
    try {
      const suffix = componentName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
      await addComponent.mutateAsync({
        plan_id: selectedPlan.id,
        component_key: componentKey === 'custom' ? `custom-${suffix}` : componentKey,
        name: componentName.trim(),
        weight: numericWeight,
        order_index: (components ?? []).length + 1,
      })
      setWeight('')
      setMessage('Componente agregado.')
    } catch {
      setMessage('No se pudo agregar el componente.')
    }
  }

  async function handleUpdatePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPlan) return
    const maximum = Number(editedScaleMax)
    const passing = Number(editedPassingScore)
    if (!Number.isFinite(maximum) || !Number.isFinite(passing) || maximum <= 0 || passing < 0 || passing > maximum) {
      setMessage('Revisa la escala y la nota mínima de aprobación.')
      return
    }
    try {
      await updatePlan.mutateAsync({ id: selectedPlan.id, scale_max: maximum, passing_score: passing, recovery_rule: editedRecoveryRule })
      setIsEditingPlan(false)
      setMessage('Criterios del plan actualizados.')
    } catch {
      setMessage('No se pudieron actualizar los criterios del plan.')
    }
  }

  function startEditingComponent(component: { id: string; name: string; weight: number }) {
    setEditingComponentId(component.id)
    setEditingComponentName(component.name)
    setEditingComponentWeight(String(component.weight))
  }

  async function saveComponent(component: { id: string; plan_id: string; weight: number }) {
    const nextWeight = Number(editingComponentWeight)
    const otherWeight = totalWeight - Number(component.weight)
    if (!editingComponentName.trim() || !Number.isFinite(nextWeight) || nextWeight <= 0 || otherWeight + nextWeight > 100.001) {
      setMessage(`El peso debe ser mayor que 0 y la suma total no puede superar 100 %. Disponible: ${Math.max(0, 100 - otherWeight)} %.`)
      return
    }
    try {
      await updateComponent.mutateAsync({ id: component.id, plan_id: component.plan_id, name: editingComponentName.trim(), weight: nextWeight })
      setEditingComponentId('')
      setMessage('Componente actualizado.')
    } catch {
      setMessage('No se pudo actualizar el componente.')
    }
  }

  async function moveComponent(index: number, direction: -1 | 1) {
    if (!selectedPlan || !(components ?? []).length) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= (components ?? []).length) return
    const next = [...(components ?? [])]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    try {
      await reorderComponents.mutateAsync({ planId: selectedPlan.id, componentIds: next.map((component) => component.id) })
      setMessage('Orden de columnas actualizado.')
    } catch {
      setMessage('No se pudo actualizar el orden de las columnas.')
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><Settings2 className="size-5" /></div><div><h2 className="font-semibold">Plan de notas por manual</h2><p className="mt-1 text-sm text-muted-foreground">Configura la escala, aprobación, recuperación y componentes ponderados.</p></div></div>
        <form onSubmit={handleCreatePlan} className="mt-5 grid gap-3 md:grid-cols-4 md:items-end">
          <label className="space-y-1.5 text-sm font-medium">Manual<select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required><option value="">Seleccionar manual...</option>{availableModules.map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}</select></label>
          <label className="space-y-1.5 text-sm font-medium">Escala máxima<input type="number" min="1" step="0.01" value={scaleMax} onChange={(event) => setScaleMax(event.target.value)} placeholder="Ejemplo: 20" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required /></label>
          <label className="space-y-1.5 text-sm font-medium">Nota mínima<input type="number" min="0" step="0.01" value={passingScore} onChange={(event) => setPassingScore(event.target.value)} placeholder="Ejemplo: 11" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required /></label>
          <Button type="submit" disabled={createPlan.isPending || availableModules.length === 0} className="gap-2"><Plus className="size-4" />Crear plan</Button>
          <label className="space-y-1.5 text-sm font-medium md:col-span-4">Regla de recuperación<select value={recoveryRule} onChange={(event) => setRecoveryRule(event.target.value as typeof recoveryRule)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">{Object.entries(RECOVERY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </form>
        {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold">Planes configurados</h2>
          {error && <p className="mt-3 text-sm text-destructive">No se pudieron cargar los planes.</p>}
          {isLoading ? <div className="mt-3 h-20 animate-pulse rounded-xl bg-muted" /> : (plans ?? []).length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Todavía no hay planes configurados.</p> : <div className="mt-3 space-y-2">{plans?.map((plan) => <button key={plan.id} type="button" onClick={() => setSelectedPlanId(plan.id)} className={`w-full rounded-xl border p-3 text-left ${selectedPlanId === plan.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}><p className="font-medium">{plan.formation_modules?.name}</p><p className="mt-1 text-xs text-muted-foreground">Escala {plan.scale_max} · aprueba con {plan.passing_score}</p></button>)}</div>}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          {!selectedPlan ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Crea o selecciona un plan para configurar sus componentes.</div> : <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold">{selectedPlan.formation_modules?.name}</h2><p className="mt-1 text-sm text-muted-foreground">Escala {selectedPlan.scale_max} · aprobación desde {selectedPlan.passing_score} · {RECOVERY_LABELS[selectedPlan.recovery_rule]}</p></div><div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setIsEditingPlan((current) => !current)} className="gap-2"><Pencil className="size-3.5" />Editar plan</Button><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPlanReady ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>{isPlanReady ? 'Ponderación completa' : `${totalWeight} % configurado`}</span></div></div>
            {isEditingPlan && <form onSubmit={handleUpdatePlan} className="mt-4 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3 sm:items-end"><label className="space-y-1.5 text-sm font-medium">Escala máxima<input type="number" min="1" step="0.01" value={editedScaleMax} onChange={(event) => setEditedScaleMax(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required /></label><label className="space-y-1.5 text-sm font-medium">Nota mínima de aprobación<input type="number" min="0" step="0.01" value={editedPassingScore} onChange={(event) => setEditedPassingScore(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required /></label><label className="space-y-1.5 text-sm font-medium">Recuperación<select value={editedRecoveryRule} onChange={(event) => setEditedRecoveryRule(event.target.value as typeof editedRecoveryRule)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">{Object.entries(RECOVERY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="sm:col-span-3 flex gap-2"><Button type="submit" disabled={updatePlan.isPending}>Guardar criterios</Button><Button type="button" variant="ghost" onClick={() => setIsEditingPlan(false)}>Cancelar</Button></div></form>}
            <div className="mt-5 overflow-hidden rounded-xl border">{(components ?? []).length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">Agrega los componentes que se usarán durante este manual.</p> : components?.map((component, index) => <div key={component.id} className="border-b p-3 last:border-b-0">{editingComponentId === component.id ? <div className="grid gap-3 sm:grid-cols-[1fr_0.45fr_auto] sm:items-end"><label className="space-y-1 text-sm font-medium">Nombre<input value={editingComponentName} onChange={(event) => setEditingComponentName(event.target.value)} className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm" /></label><label className="space-y-1 text-sm font-medium">Peso %<input type="number" min="0.01" max={100} step="0.01" value={editingComponentWeight} onChange={(event) => setEditingComponentWeight(event.target.value)} className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm" /></label><div className="flex gap-1"><Button type="button" size="icon-sm" aria-label="Guardar componente" disabled={updateComponent.isPending} onClick={() => saveComponent(component)}><Check className="size-4" /></Button><Button type="button" size="icon-sm" variant="ghost" aria-label="Cancelar edición" onClick={() => setEditingComponentId('')}><X className="size-4" /></Button></div></div> : <div className="flex items-center justify-between gap-3"><div><p className="font-medium">{component.name}</p><p className="text-xs text-muted-foreground">Ponderación: {component.weight} %</p></div><div className="flex gap-1"><Button type="button" size="icon-sm" variant="ghost" aria-label={`Subir ${component.name}`} disabled={index === 0 || reorderComponents.isPending} onClick={() => moveComponent(index, -1)}><ChevronUp className="size-4" /></Button><Button type="button" size="icon-sm" variant="ghost" aria-label={`Bajar ${component.name}`} disabled={index === (components?.length ?? 0) - 1 || reorderComponents.isPending} onClick={() => moveComponent(index, 1)}><ChevronDown className="size-4" /></Button><Button type="button" size="icon-sm" variant="ghost" aria-label={`Editar ${component.name}`} onClick={() => startEditingComponent(component)}><Pencil className="size-4" /></Button><Button type="button" size="icon-sm" variant="ghost" aria-label={`Eliminar ${component.name}`} disabled={deleteComponent.isPending} onClick={() => deleteComponent.mutate({ id: component.id, planId: selectedPlan.id })}><Trash2 className="size-4 text-destructive" /></Button></div></div>}</div>)}</div>
            <form onSubmit={handleAddComponent} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_0.55fr_auto] sm:items-end">
              <label className="space-y-1.5 text-sm font-medium">Componente<select value={componentKey} onChange={(event) => updateComponentKey(event.target.value as typeof componentKey)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">{COMPONENT_OPTIONS.map(([key, label]) => <option key={key} value={key} disabled={key !== 'custom' && usedComponentKeys.has(key)}>{label}{key !== 'custom' && usedComponentKeys.has(key) ? ' (agregado)' : ''}</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-medium">Nombre<input value={componentName} onChange={(event) => setComponentName(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required /></label>
              <label className="space-y-1.5 text-sm font-medium">Peso %<input type="number" min="0.01" max={remainingWeight} step="0.01" value={weight} onChange={(event) => setWeight(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required /></label>
              <Button type="submit" disabled={addComponent.isPending || remainingWeight === 0} className="gap-2"><Plus className="size-4" />Agregar</Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">Faltan {remainingWeight} % por distribuir. Podrás crear evaluaciones y registrar el libro de notas cuando la ponderación llegue a 100 %.</p>
          </>}
        </div>
      </div>
    </section>
  )
}
