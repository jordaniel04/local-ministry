import { useMemo, useState } from 'react'
import { BookOpen, Search, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePeople } from '@/features/people/hooks/usePeople'
import { useModules } from '../hooks/useFormation'
import { useLocalEnrollments, useLocalRoute, useModuleEnrollments, useStartModuleEnrollments, useUpdateModuleEnrollment, useWithdrawModuleEnrollment } from '../hooks/useEnrollment'
import { HistoricalTrainingPanel } from './HistoricalTrainingPanel'
import { useActiveStudyCycle, useStudyCycleModules } from '../hooks/useStudyCycles'

const TYPE_LABELS: Record<string, string> = { standard: 'Primera vez', repeat: 'Repetición', reinforcement: 'Refuerzo' }

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
}

export function EnrollmentManager() {
  const { data: people } = usePeople()
  const { data: modules } = useModules()
  const { data: route } = useLocalRoute()
  const { data: activeCycle } = useActiveStudyCycle()
  const { data: cycleModules = [] } = useStudyCycleModules(activeCycle?.id ?? null)
  const { data: enrollments } = useLocalEnrollments(route?.id ?? null)
  const { data: attempts, isLoading, error } = useModuleEnrollments()
  const createEnrollments = useStartModuleEnrollments()
  const updateEnrollment = useUpdateModuleEnrollment()
  const withdrawEnrollment = useWithdrawModuleEnrollment()
  const [view, setView] = useState<'current' | 'history'>('current')
  const [moduleId, setModuleId] = useState('')
  const [type, setType] = useState<'standard' | 'repeat' | 'reinforcement'>('standard')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<'standard' | 'repeat' | 'reinforcement'>('standard')
  const [message, setMessage] = useState('')

  const activePeople = useMemo(() => (people ?? []).filter((person) => person.is_active).sort((a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`, 'es')), [people])
  const cycleModuleIds = new Set(cycleModules.map((entry: { module_id: string }) => entry.module_id))
  const activeModules = (modules ?? []).filter((module) => module.is_active && cycleModuleIds.has(module.id))
  const currentAttempts = (attempts ?? []).filter((attempt) => attempt.study_cycle_id === activeCycle?.id && attempt.status === 'in_progress')
  const completedAttempts = (attempts ?? []).filter((attempt) => attempt.study_cycle_id === activeCycle?.id && attempt.status === 'completed')
  const groups = activeModules.map((module) => ({ module, current: currentAttempts.filter((attempt) => attempt.module_id === module.id), completed: completedAttempts.filter((attempt) => attempt.module_id === module.id) })).filter((group) => group.current.length || group.completed.length)
  const visibleGroups = moduleId ? groups.filter((group) => group.module.id === moduleId) : groups
  const alreadyInModule = new Set(currentAttempts.filter((attempt) => attempt.module_id === moduleId).map((attempt) => attempt.formation_enrollments?.person_id).filter(Boolean))
  const visiblePeople = activePeople.filter((person) => normalize(`${person.first_name} ${person.last_name}`).includes(normalize(search.trim())))
  const selectableIds = visiblePeople.filter((person) => !alreadyInModule.has(person.id)).map((person) => person.id)
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id))

  function toggleVisible() {
    setSelectedIds((current) => allSelected ? current.filter((id) => !selectableIds.includes(id)) : Array.from(new Set([...current, ...selectableIds])))
  }

  async function enroll(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!route || !moduleId || selectedIds.length === 0) return
    try {
      await createEnrollments.mutateAsync({ person_ids: selectedIds, route_id: route.id, module_id: moduleId, enrollment_type: type })
      setSelectedIds([])
      setMessage('')
    } catch { setMessage('No se pudieron registrar las inscripciones seleccionadas.') }
  }

  async function updateType(id: string) {
    try { await updateEnrollment.mutateAsync({ id, enrollment_type: editingType }); setEditingId(null); setMessage('Tipo de participación actualizado.') } catch { setMessage('No se pudo actualizar el tipo de participación.') }
  }

  async function withdraw(attempt: { id: string; enrollment_id: string }) {
    if (!window.confirm('¿Retirar a esta persona de este módulo? El historial se conservará y podrá inscribirse nuevamente.')) return
    try { await withdrawEnrollment.mutateAsync({ id: attempt.id, enrollment_id: attempt.enrollment_id }); setMessage('Participación retirada. El historial se conservó.') } catch { setMessage('No se pudo retirar la participación.') }
  }



  return <section className="space-y-5">
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Administrar matrículas</h2><p className="mt-1 text-sm text-muted-foreground">Inscribe grupos o registra formación realizada anteriormente.</p></div><div className="flex rounded-lg bg-muted p-1"><button type="button" onClick={() => setView('current')} className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'current' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Inscripciones</button><button type="button" onClick={() => setView('history')} className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'history' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Formación previa</button></div></div>
    <p className="rounded-lg border bg-primary/5 px-4 py-3 text-sm">Ciclo en curso: <strong>{activeCycle?.name ?? 'Ninguno'}</strong>{route ? ` · Ruta: ${route.name}` : ''}</p>
    {message && <p role="status" className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">{message}</p>}
    {view === 'history' ? <HistoricalTrainingPanel onMessage={setMessage} /> : <>
      <form onSubmit={enroll} className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="border-b p-5"><div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><UserPlus className="size-5" /></div><div><h2 className="font-semibold">Nueva inscripción</h2><p className="mt-1 text-sm text-muted-foreground">Elige el módulo y marca una o varias personas.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Módulo<select value={moduleId} onChange={(event) => { setModuleId(event.target.value); setSelectedIds([]) }} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" required><option value="">Seleccionar módulo...</option>{activeModules.map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium">Tipo de participación<select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="standard">Primera vez</option><option value="repeat">Repetición</option><option value="reinforcement">Refuerzo</option></select></label></div></div><div className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="block flex-1 space-y-1.5 text-sm font-medium">Personas<div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre..." className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm" /></div></label><Button type="button" variant="outline" onClick={toggleVisible} disabled={!moduleId || selectableIds.length === 0}>{allSelected ? 'Quitar visibles' : 'Seleccionar visibles'}</Button></div>{!moduleId ? <div className="mt-4 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Selecciona primero el módulo.</div> : <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border">{visiblePeople.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No se encontraron personas.</p> : visiblePeople.map((person) => { const unavailable = alreadyInModule.has(person.id); return <label key={person.id} className={`flex items-center gap-3 border-b px-4 py-3 last:border-b-0 ${unavailable ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:bg-muted/40'}`}><input type="checkbox" checked={selectedIds.includes(person.id)} disabled={unavailable} onChange={() => setSelectedIds((current) => current.includes(person.id) ? current.filter((id) => id !== person.id) : [...current, person.id])} className="size-4 accent-primary" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{person.last_name}, {person.first_name}</span>{unavailable && <span className="text-xs text-muted-foreground">Ya está en curso</span>}</label> })}</div>}<div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{selectedIds.length ? `${selectedIds.length} seleccionadas` : 'Ninguna persona seleccionada'}</p><Button type="submit" disabled={createEnrollments.isPending || !route || !moduleId || selectedIds.length === 0} className="gap-2"><Users className="size-4" />Inscribir</Button></div></div></form>
      <div className="space-y-4"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Personas del módulo seleccionado</h2><p className="mt-1 text-sm text-muted-foreground">Aquí se muestran solo quienes están inscritos en el módulo elegido.</p></div><span className="text-xs text-muted-foreground">{visibleGroups.reduce((total, group) => total + group.current.length + group.completed.length, 0)} registros</span></div>{error && <p className="text-sm text-destructive">No se pudieron cargar las inscripciones.</p>}{isLoading ? <div className="h-20 animate-pulse rounded-xl bg-muted" /> : visibleGroups.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todavía no hay personas inscritas en este módulo.</div> : visibleGroups.map(({ module, current, completed }) => <details key={module.id} open className="overflow-hidden rounded-2xl border bg-card"><summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4"><div><h3 className="font-semibold">{module.name}</h3><p className="mt-1 text-xs text-muted-foreground">{current.length} en curso · {completed.length} terminados</p></div><BookOpen className="size-5 text-primary" /></summary><div className="grid gap-5 border-t p-5 md:grid-cols-2"><AttemptList title="En curso" attempts={current} editingId={editingId} editingType={editingType} setEditingId={setEditingId} setEditingType={setEditingType} updateType={updateType} withdraw={withdraw} /><AttemptList title="Terminados" attempts={completed} /></div></details>)}</div><p className="text-center text-xs text-muted-foreground">Las {enrollments?.length ?? 0} personas registradas en la ruta se consultan desde Reportes → Avance en la Ruta.</p>
    </>}
  </section>
}

function AttemptList({ title, attempts, editingId, editingType, setEditingId, setEditingType, updateType, withdraw }: { title: string; attempts: Array<{ id: string; enrollment_id: string; status: string; enrollment_type: string; completed_at: string | null; formation_modules: { name: string } | null; formation_enrollments: { people: { first_name: string; last_name: string } | null } | null }>; editingId?: string | null; editingType?: 'standard' | 'repeat' | 'reinforcement'; setEditingId?: (id: string | null) => void; setEditingType?: (type: 'standard' | 'repeat' | 'reinforcement') => void; updateType?: (id: string) => void; withdraw?: (attempt: (typeof attempts)[number]) => void }) {
  return <div><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold">{title}</h4><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{attempts.length}</span></div>{attempts.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">No hay personas en este grupo.</p> : <div className="divide-y rounded-xl border">{attempts.map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center gap-3 p-3"><div className="min-w-40 flex-1"><p className="text-sm font-medium">{attempt.formation_enrollments?.people?.last_name}, {attempt.formation_enrollments?.people?.first_name}</p>{editingId === attempt.id && setEditingType && updateType ? <div className="mt-2 flex flex-wrap gap-2"><select value={editingType} onChange={(event) => setEditingType!(event.target.value as 'standard' | 'repeat' | 'reinforcement')} className="h-8 rounded-lg border border-input bg-background px-2 text-xs"><option value="standard">Primera vez</option><option value="repeat">Repetición</option><option value="reinforcement">Refuerzo</option></select><Button type="button" size="sm" onClick={() => updateType!(attempt.id)}>Guardar</Button><Button type="button" size="sm" variant="ghost" onClick={() => setEditingId!(null)}>Cancelar</Button></div> : <p className="text-xs text-muted-foreground">{attempt.status === 'completed' ? (attempt.completed_at ? `Terminado el ${attempt.completed_at}` : 'Módulo terminado') : TYPE_LABELS[attempt.enrollment_type]}</p>}</div>{attempt.status === 'in_progress' && editingId !== attempt.id && setEditingId && setEditingType && updateType && withdraw && <div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => { setEditingId!(attempt.id); setEditingType!((attempt.enrollment_type as 'standard' | 'repeat' | 'reinforcement') || 'standard') }}>Editar</Button><Button type="button" size="sm" variant="ghost" onClick={() => withdraw(attempt)} className="text-destructive hover:text-destructive">Retirar</Button></div>}</div>)}</div>}</div>
}
