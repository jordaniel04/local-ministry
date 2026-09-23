import { useModules } from '../hooks/useFormation'
import { useActiveFormationModule } from '../hooks/useActiveFormationModule'

export function ActiveFormationModuleSettings() {
  const { data: modules = [], isLoading } = useModules()
  const { activeModuleId, setActiveModuleId } = useActiveFormationModule()
  const activeModules = modules.filter((module) => module.is_active)
  const selectedModule = activeModules.find((module) => module.id === activeModuleId)

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Período de formación activo</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Define el módulo que se está llevando actualmente. La asistencia solo mostrará a las personas matriculadas y en curso en este módulo.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {selectedModule ? selectedModule.name : 'Sin configurar'}
        </span>
      </div>
      <div className="mt-4 max-w-md space-y-1.5">
        <label htmlFor="active-formation-module" className="text-sm font-medium">Módulo actual</label>
        <select
          id="active-formation-module"
          value={activeModuleId ?? ''}
          onChange={(event) => setActiveModuleId(event.target.value || null)}
          disabled={isLoading}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Seleccionar módulo...</option>
          {activeModules.map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}
        </select>
        <p className="text-xs text-muted-foreground">Puedes cambiarlo cuando termine un módulo y comience el siguiente.</p>
      </div>
    </section>
  )
}
