import { useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { useModules } from '../hooks/useFormation'
import { useModuleCycles, useCreateModuleCycle } from '../hooks/useAssessment'

export function ModuleCycleSettings() {
  const { data: modules = [] } = useModules()
  const createCycle = useCreateModuleCycle()
  const [moduleId, setModuleId] = useState('')
  const [name, setName] = useState('')
  const [startsOn, setStartsOn] = useState('')
  const { data: groups = [] } = useModuleCycles(moduleId)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!moduleId || !name.trim()) return
    await createCycle.mutateAsync({ route_id: null, module_id: moduleId, name: name.trim(), starts_on: startsOn || null })
    setName(''); setStartsOn('')
  }

  return <section className="rounded-2xl border bg-card p-5"><div className="flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></span><div><h2 className="font-semibold">Grupos dentro de un módulo</h2><p className="mt-1 text-sm text-muted-foreground">Crea grupos pequeños del módulo actual para organizar exposiciones. No son ciclos de estudio.</p></div></div><div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]"><label className="text-sm font-medium">Módulo<select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="mt-2 h-10 w-full rounded-lg border bg-background px-3"><option value="">Seleccionar módulo...</option>{modules.filter((module) => module.is_active).map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}</select></label><div>{moduleId && <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_170px_auto]"><input value={name} onChange={(event) => setName(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm" placeholder="Ejemplo: Grupo de casas" /><input type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm" /><button type="submit" disabled={createCycle.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"><Plus className="size-4" />Crear grupo</button></form>}{moduleId && <div className="mt-3 flex flex-wrap gap-2">{groups.map((group) => <span key={group.id} className="rounded-full border px-3 py-1 text-xs">{group.name}</span>)}{groups.length === 0 && <span className="text-sm text-muted-foreground">No hay grupos para este módulo.</span>}</div>}</div></div></section>
}
