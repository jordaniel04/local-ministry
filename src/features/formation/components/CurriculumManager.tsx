import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModules, useDeleteModule, useDeleteLesson } from '../hooks/useFormation'
import { ModuleForm } from './ModuleForm'
import { LessonForm } from './LessonForm'
import type { FormationModule, FormationLesson, ModuleWithLessons } from '../types'

export function CurriculumManager() {
  const { data: modules, isLoading, error } = useModules()
  const deleteModule = useDeleteModule()
  const deleteLesson = useDeleteLesson()

  const [moduleFormOpen, setModuleFormOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<FormationModule | undefined>()
  const [lessonFormOpen, setLessonFormOpen] = useState(false)
  const [lessonFormModule, setLessonFormModule] = useState<ModuleWithLessons | undefined>()
  const [editingLesson, setEditingLesson] = useState<FormationLesson | undefined>()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (error) return <p className="text-destructive text-sm">Error al cargar currículo.</p>

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
    if (!confirm(`¿Eliminar el módulo "${m.name}"? Se eliminarán todas sus lecciones.`)) return
    await deleteModule.mutateAsync(m.id)
    if (expandedId === m.id) setExpandedId(null)
  }

  async function handleDeleteLesson(l: FormationLesson) {
    if (!confirm(`¿Eliminar la lección "${l.title}"?`)) return
    await deleteLesson.mutateAsync(l.id)
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button onClick={() => { setEditingModule(undefined); setModuleFormOpen(true) }} className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Nuevo módulo
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : (modules ?? []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay módulos definidos. Creá el primero para empezar.
          </div>
        ) : (
          <div className="space-y-2">
            {(modules ?? []).map((m) => (
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteModule(m)} disabled={deleteModule.isPending}>
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
