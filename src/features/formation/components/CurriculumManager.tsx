import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen, BookPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModules, useDeleteLesson, useAddMissingOfficialModules } from '../hooks/useFormation'
import { useRemoveRouteModule, useRouteModules } from '../hooks/useRoutes'
import type { FormationRoute } from '../hooks/useRoutes'
import { ModuleForm } from './ModuleForm'
import { LessonForm } from './LessonForm'
import type { FormationModule, FormationLesson, ModuleWithLessons } from '../types'
import { matchesOfficialModule, OFFICIAL_ROUTE_MODULES } from '../officialRoute'

export function CurriculumManager({ route }: { route: FormationRoute }) {
  const { data: modules, isLoading, error } = useModules()
  const { data: routeModules = [], isLoading: routeModulesLoading, error: routeModulesError } = useRouteModules(route.id)
  const visibleModules = routeModules
    .map((entry) => modules?.find((module) => module.id === entry.module_id))
    .filter((module): module is ModuleWithLessons => Boolean(module))
  const removeModule = useRemoveRouteModule()
  const deleteLesson = useDeleteLesson()
  const addOfficialModules = useAddMissingOfficialModules()

  const [moduleFormOpen, setModuleFormOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<FormationModule | undefined>()
  const [lessonFormOpen, setLessonFormOpen] = useState(false)
  const [lessonFormModule, setLessonFormModule] = useState<ModuleWithLessons | undefined>()
  const [editingLesson, setEditingLesson] = useState<FormationLesson | undefined>()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState('')
  const [moduleMessage, setModuleMessage] = useState('')

  if (error) return <p className="text-destructive text-sm">Error al cargar los manuales.</p>

  function openNewLesson(m: ModuleWithLessons) {
    setLessonFormModule(m)
    setEditingLesson(undefined)
    setLessonFormOpen(true)
  }

  function openEditLesson(m: ModuleWithLessons, l: FormationLesson) {
    setLessonFormModule(m)
    setEditingLesson(l)
    setLessonFormOpen(true)
  }

  async function handleDeleteModule(m: ModuleWithLessons) {
    if (!confirm(`¿Retirar "${m.name}" de esta ruta? Sus lecciones se conservarán.`)) return
    setModuleMessage('')
    try {
      await removeModule.mutateAsync({ routeId: route.id, moduleId: m.id })
      if (expandedId === m.id) setExpandedId(null)
    } catch {
      setModuleMessage('No se puede retirar un manual que ya forma parte de un ciclo de esta ruta.')
    }
  }

  async function handleDeleteLesson(l: FormationLesson) {
    if (!confirm(`¿Eliminar la lección "${l.title}"?`)) return
    await deleteLesson.mutateAsync(l.id)
  }

  async function handleAddOfficialModules() {
    setSyncMessage('')
    try {
      const created = await addOfficialModules.mutateAsync({ existingModules: modules ?? [], routeId: route!.id })
      setSyncMessage(created.length > 0
        ? `Se agregaron ${created.length} módulos oficiales.`
        : 'La ruta oficial ya tiene todos sus módulos.')
    } catch {
      setSyncMessage('No se pudieron agregar los módulos. Revisa tu conexión y permisos.')
    }
  }

  const missingOfficialModules = OFFICIAL_ROUTE_MODULES.filter((official) =>
    !(modules ?? []).some((module) => matchesOfficialModule(module.name, official))
  )

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handleAddOfficialModules}
              disabled={route.key !== 'local-miramar' || addOfficialModules.isPending || missingOfficialModules.length === 0}
              className="gap-2"
              size="sm"
            >
              {addOfficialModules.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <BookPlus className="h-4 w-4" />}
              {missingOfficialModules.length > 0
                ? `Agregar ${missingOfficialModules.length} módulos oficiales faltantes`
                : 'Ruta oficial completa'}
            </Button>
            {syncMessage && <p className="mt-1 text-xs text-muted-foreground">{syncMessage}</p>}
          </div>
          <Button onClick={() => { setEditingModule(undefined); setModuleFormOpen(true) }} className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Nuevo módulo
          </Button>
        </div>

        {moduleMessage && <p role="alert" className="text-sm text-destructive">{moduleMessage}</p>}
        {isLoading || routeModulesLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : routeModulesError ? <p className="text-sm text-destructive">No se pudieron cargar los manuales de esta ruta.</p> : visibleModules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay módulos definidos. Creá el primero para empezar.
          </div>
        ) : (
          <div className="space-y-2">
            {visibleModules.map((m) => (
              <div key={m.id} className="border rounded-lg bg-card overflow-hidden">
                {/* Cabecera del módulo */}
                <div className="flex items-center gap-2 p-3">
                  <button className="flex-1 text-left flex items-center gap-2" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">{m.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {m.formation_lessons.length} lecciones
                    </span>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingModule(m); setModuleFormOpen(true) }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => void handleDeleteModule(m)} disabled={removeModule.isPending} aria-label={`Retirar ${m.name} de la ruta`} title="Retirar de la ruta">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                      {expandedId === m.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Lecciones */}
                {expandedId === m.id && (
                  <div className="border-t bg-muted/20 px-3 py-2 space-y-1">
                    {m.formation_lessons.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-1">Sin lecciones aún.</p>
                    ) : (
                      m.formation_lessons.map((l, idx) => (
                        <div key={l.id} className="flex items-center gap-2 py-1 text-sm group">
                          <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                          <span className="flex-1">{l.title}</span>
                          {l.description && (
                            <span className="text-xs text-muted-foreground hidden group-hover:block truncate max-w-40">{l.description}</span>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditLesson(m, l)}>
                              <Pencil className="h-2.5 w-2.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteLesson(l)} disabled={deleteLesson.isPending}>
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground gap-1 h-7 text-xs mt-1" onClick={() => openNewLesson(m)}>
                      <Plus className="h-3 w-3" />
                      Añadir lección
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ModuleForm
        open={moduleFormOpen}
        onClose={() => { setModuleFormOpen(false); setEditingModule(undefined) }}
        module={editingModule}
        nextOrderIndex={(modules ?? []).length}
        routeId={route.id}
        nextRouteOrderIndex={Math.max(-1, ...routeModules.map((entry) => entry.order_index)) + 1}
      />

      {lessonFormModule && (
        <LessonForm
          open={lessonFormOpen}
          onClose={() => { setLessonFormOpen(false); setEditingLesson(undefined) }}
          moduleId={lessonFormModule.id}
          moduleName={lessonFormModule.name}
          lesson={editingLesson}
          nextOrderIndex={lessonFormModule.formation_lessons.length}
        />
      )}
    </>
  )
}
