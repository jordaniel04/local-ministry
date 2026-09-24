import { useState } from 'react'
import { Pencil, Route } from 'lucide-react'
import { useFormationRoutes, useRouteModules } from '../hooks/useRoutes'
import { useModules } from '../hooks/useFormation'
import { useActivateStudyCycle, useAddModuleToStudyCycle, useCreateStudyCycle, useStudyCycles, useStudyCycleModules, useUpdateStudyCycle, useUpdateStudyCycleModuleStatus } from '../hooks/useStudyCycles'

export function StudyCycleSettings() {
  const { data: routes = [], isLoading: routeLoading, error: routeError } = useFormationRoutes()
  const { data: cycles = [] } = useStudyCycles()
  const activeCycle = cycles.find((cycle) => cycle.status === 'active')
  const [creationRouteId, setCreationRouteId] = useState('')
  const creationRoute = routes.find((item) => item.id === creationRouteId && item.is_active)
    ?? routes.find((item) => item.id === activeCycle?.route_id && item.is_active)
    ?? routes.find((item) => item.key === 'local-miramar' && item.is_active)
    ?? routes.find((item) => item.is_active)
  const { data: modules = [], isLoading: modulesLoading } = useModules()
  const createCycle = useCreateStudyCycle()
  const activateCycle = useActivateStudyCycle()
  const updateCycle = useUpdateStudyCycle()
  const updateModule = useUpdateStudyCycleModuleStatus()
  const addModuleMutation = useAddModuleToStudyCycle()
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [startsOn, setStartsOn] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const selectedCycle = cycles.find((cycle) => cycle.id === selectedCycleId) ?? activeCycle ?? cycles[0]
  const selectedCycleRoute = routes.find((item) => item.id === selectedCycle?.route_id)
  const { data: cycleModules = [] } = useStudyCycleModules(selectedCycle?.id ?? null)
  const { data: creationRouteModules = [], isLoading: creationModulesLoading } = useRouteModules(creationRoute?.id ?? null)
  const { data: routeModules = [], isLoading: routeModulesLoading, error: routeModulesError } = useRouteModules(selectedCycle?.route_id ?? null)
  const availableModules = routeModules
    .map((entry) => ({ module: modules.find((module) => module.id === entry.module_id), orderIndex: entry.order_index }))
    .filter((entry) => entry.module?.is_active)

  async function create(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !creationRoute || creationRouteModules.length === 0) return
    setMessage('')
    try {
      const cycle = await createCycle.mutateAsync({ route_id: creationRoute.id, name: name.trim(), starts_on: startsOn || null })
      setSelectedCycleId(cycle.id)
      setName('')
      setStartsOn('')
    } catch {
      setMessage('No se pudo crear el ciclo. Revisa la conexión y vuelve a intentar.')
    }
  }

  async function activate() {
    if (!selectedCycle || cycleModules.length === 0) return
    setMessage('')
    try {
      await activateCycle.mutateAsync(selectedCycle.id)
      setMessage(`Ahora está en curso ${selectedCycle.name}. Su ruta determina los manuales de formación.`)
    } catch {
      setMessage('No se pudo iniciar el ciclo. Comprueba que tenga manuales y que la migración esté aplicada.')
    }
  }
  async function saveEdit(event: React.FormEvent) {
    event.preventDefault()
    if (!editingId || !name.trim()) return
    setMessage('')
    try {
      await updateCycle.mutateAsync({ id: editingId, name: name.trim(), starts_on: startsOn || null })
      setEditingId(null)
      setName('')
      setStartsOn('')
    } catch {
      setMessage('No se pudo guardar el ciclo.')
    }
  }

  async function addModule(moduleId: string, orderIndex: number) {
    if (!selectedCycle) return
    setMessage('')
    try {
      await addModuleMutation.mutateAsync({ studyCycleId: selectedCycle.id, moduleId, orderIndex })
    } catch {
      setMessage('No se pudo agregar el manual al ciclo.')
    }
  }

  async function changeStatus(moduleId: string, status: 'pending' | 'active' | 'completed' | 'paused') {
    if (!selectedCycle) return
    setMessage('')
    try {
      await updateModule.mutateAsync({ studyCycleId: selectedCycle.id, moduleId, status })
    } catch {
      setMessage('No se pudo actualizar el estado del manual.')
    }
  }

  return <section className="rounded-2xl border bg-card p-5">
    <div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Route className="size-5" /></span><div><h2 className="font-semibold">Ciclos de estudio</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Cada ciclo usa los manuales de su ruta de formación. Aquí defines cuáles se cursan y su estado.</p></div></div>
    <p className="mt-4 rounded-lg border bg-primary/5 px-3 py-2 text-sm">Ciclo en curso: <strong>{activeCycle?.name ?? 'Ninguno'}</strong>{activeCycle ? ` · Ruta: ${routes.find((item) => item.id === activeCycle.route_id)?.name ?? 'No disponible'}` : ''}</p>
    {routeError && <p className="mt-3 text-sm text-destructive">No se pudieron cargar las rutas. No es posible crear ciclos.</p>}
    {message && <p role="alert" className="mt-3 text-sm text-destructive">{message}</p>}
    <form onSubmit={create} className="mt-5 space-y-4 rounded-xl border bg-muted/20 p-4">
      <div>
        <h3 className="font-medium">Crear ciclo de estudio</h3>
        <p className="mt-1 text-sm text-muted-foreground">El nuevo ciclo quedará asociado a esta ruta y podrá usar sus manuales.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
        <label className="space-y-1 text-sm font-medium">Nombre del ciclo
          <input value={name} onChange={(event) => setName(event.target.value)} className="block h-10 w-full rounded-lg border bg-background px-3 text-sm font-normal" placeholder="Ejemplo: Ciclo 2026 - 2027" required />
        </label>
        <label className="space-y-1 text-sm font-medium">Fecha de inicio
          <input type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} className="block h-10 w-full rounded-lg border bg-background px-3 text-sm font-normal" />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="min-w-0 text-sm font-medium">Ruta de formación<select value={creationRoute?.id ?? ''} onChange={(event) => setCreationRouteId(event.target.value)} disabled={routeLoading} className="mt-1 block h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-normal sm:min-w-64"><option value="" disabled>Seleccionar ruta...</option>{routes.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name} · Versión {item.version}</option>)}</select><span className="mt-1 block text-xs font-normal text-muted-foreground">El ciclo usará únicamente los manuales de esta ruta.{creationRoute && !creationModulesLoading && creationRouteModules.length === 0 ? ' Agrega al menos un manual antes de crear el ciclo.' : ''}</span></label>
        <button type="submit" disabled={createCycle.isPending || !creationRoute || creationModulesLoading || creationRouteModules.length === 0} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Crear ciclo</button>
      </div>
    </form>
    <div className="mt-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><div className="space-y-2">{cycles.map((cycle) => editingId === cycle.id ? <form key={cycle.id} onSubmit={saveEdit} className="space-y-2 rounded-lg border p-3"><input value={name} onChange={(event) => setName(event.target.value)} className="h-9 w-full rounded border bg-background px-2 text-sm" required /><input type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} className="h-9 w-full rounded border bg-background px-2 text-sm" /><div className="flex gap-2"><button className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">Guardar</button><button type="button" onClick={() => setEditingId(null)} className="rounded border px-2 py-1 text-xs">Cancelar</button></div></form> : <button type="button" key={cycle.id} onClick={() => setSelectedCycleId(cycle.id)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left text-sm ${selectedCycle?.id === cycle.id ? 'border-primary bg-primary/5' : ''}`}><span><span className="block font-medium">{cycle.name}</span><span className="text-xs text-muted-foreground">{cycle.status === 'active' ? 'En curso' : cycle.status === 'paused' ? 'No está en curso' : 'Cerrado'}</span></span><Pencil className="size-4 text-muted-foreground" onClick={(event) => { event.stopPropagation(); setEditingId(cycle.id); setName(cycle.name); setStartsOn(cycle.starts_on ?? '') }} /></button>)}</div><div className="min-w-0"><h3 className="font-semibold">Manuales del ciclo{selectedCycle ? ` · ${selectedCycle.name}` : ''}</h3>{selectedCycle && <p className="mt-1 text-xs text-muted-foreground">Ruta: {selectedCycleRoute?.name ?? 'No disponible'}</p>}{selectedCycle && selectedCycle.status !== 'active' && <button type="button" onClick={() => void activate()} disabled={cycleModules.length === 0 || activateCycle.isPending} className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Poner este ciclo en curso</button>}{selectedCycle && selectedCycle.status !== 'active' && cycleModules.length === 0 && <p className="mt-1 text-xs text-muted-foreground">Agrega al menos un manual al ciclo para iniciarlo.</p>}{!selectedCycle ? <p className="mt-2 text-sm text-muted-foreground">Crea o selecciona un ciclo para administrar sus manuales.</p> : routeModulesError ? <p className="mt-2 text-sm text-destructive">No se pudieron cargar los manuales de la ruta.</p> : routeModulesLoading || modulesLoading ? <p className="mt-2 text-sm text-muted-foreground">Cargando manuales...</p> : availableModules.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Esta ruta aún no tiene manuales activos.</p> : <div className="mt-3 space-y-2">{availableModules.map(({ module, orderIndex }) => { if (!module) return null; const item = cycleModules.find((entry: { module_id: string; status: string }) => entry.module_id === module.id); return <div key={module.id} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2"><span className="min-w-0 text-sm font-medium">{module.name}</span>{item ? <select value={item.status} onChange={(event) => void changeStatus(module.id, event.target.value as 'pending' | 'active' | 'completed' | 'paused')} className="h-8 shrink-0 rounded border bg-background px-2 text-xs"><option value="pending">Pendiente</option><option value="active">Activo</option><option value="completed">Terminado</option><option value="paused">Pausado</option></select> : <button type="button" onClick={() => void addModule(module.id, orderIndex)} className="rounded border px-2 py-1 text-xs">Agregar</button>}</div> })}</div>}</div></div>
  </section>
}