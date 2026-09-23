import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Check, ChevronDown, ChevronUp, Circle, Route } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePeople } from '@/features/people/hooks/usePeople'
import { cn } from '@/lib/utils'
import { usePersonProgress } from '../hooks/useFormation'
import { LessonProgressRow } from './LessonProgressRow'

type Props = {
  selectedPersonId?: string
  onPersonChange?: (personId: string) => void
}

export function PersonProgressView({ selectedPersonId = '', onPersonChange }: Props) {
  const { data: people } = usePeople()
  const [internalPersonId, setInternalPersonId] = useState(selectedPersonId)
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null)
  const currentPersonId = selectedPersonId || internalPersonId

  useEffect(() => {
    if (selectedPersonId) setInternalPersonId(selectedPersonId)
  }, [selectedPersonId])

  const { data: modules, isLoading } = usePersonProgress(currentPersonId)
  const activePeople = useMemo(
    () => (people ?? []).filter((person) => person.is_active),
    [people]
  )
  const selectedPerson = activePeople.find((person) => person.id === currentPersonId)
  const totalCompleted = (modules ?? []).reduce((sum, module) => sum + module.completedCount, 0)
  const totalLessons = (modules ?? []).reduce((sum, module) => sum + module.totalCount, 0)
  const overallProgress = totalLessons > 0
    ? Math.round((totalCompleted / totalLessons) * 100)
    : 0

  function selectPerson(personId: string) {
    setInternalPersonId(personId)
    setExpandedModuleId(null)
    onPersonChange?.(personId)
  }

  return (
    <section className="space-y-5">
      <div className="max-w-md">
        <label className="mb-1.5 block text-sm font-medium">Estudiante</label>
        <Select value={currentPersonId} onValueChange={(value) => selectPerson(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar estudiante...">
              {selectedPerson
                ? `${selectedPerson.first_name} ${selectedPerson.last_name}`
                : 'Seleccionar estudiante...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {activePeople.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.last_name}, {person.first_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!currentPersonId && (
        <div className="rounded-2xl border border-dashed px-5 py-10 text-center">
          <Route className="mx-auto size-9 text-muted-foreground/60" />
          <p className="mt-3 font-medium">Selecciona un estudiante</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Verás su recorrido completo y podrás revisar cada lección.
          </p>
        </div>
      )}

      {currentPersonId && isLoading && (
        <div className="space-y-3">
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {currentPersonId && !isLoading && (modules ?? []).length === 0 && (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay módulos activos definidos en el currículo.
        </p>
      )}

      {currentPersonId && !isLoading && (modules ?? []).length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-6">
            <div className="flex items-center gap-4">
              {selectedPerson?.avatar_url ? (
                <img
                  src={selectedPerson.avatar_url}
                  alt=""
                  className="size-14 rounded-full object-cover ring-4 ring-background sm:size-16"
                />
              ) : (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-4 ring-background sm:size-16 sm:text-lg">
                  {selectedPerson
                    ? `${selectedPerson.first_name[0] ?? ''}${selectedPerson.last_name[0] ?? ''}`
                    : '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ruta individual</p>
                <h2 className="truncate text-lg font-bold sm:text-xl">
                  {selectedPerson
                    ? `${selectedPerson.first_name} ${selectedPerson.last_name}`
                    : 'Estudiante'}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {totalCompleted} de {totalLessons} lecciones completadas
                </p>
              </div>
              <span className="text-2xl font-bold tabular-nums sm:text-3xl">{overallProgress}%</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-background/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-primary transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="relative space-y-3 pl-3 sm:pl-5">
            <div className="absolute bottom-8 left-[31px] top-8 w-0.5 bg-border sm:left-[39px]" />
            {(modules ?? []).map((module, moduleIndex) => {
              const moduleProgress = module.totalCount > 0
                ? Math.round((module.completedCount / module.totalCount) * 100)
                : 0
              const isComplete = module.totalCount > 0 && module.completedCount === module.totalCount
              const isStarted = module.completedCount > 0
              const isExpanded = expandedModuleId === module.id

              return (
                <article key={module.id} className="relative flex gap-3 sm:gap-4">
                  <div
                    className={cn(
                      'relative z-10 mt-4 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-background font-bold shadow-sm sm:size-12',
                      isComplete && 'bg-emerald-600 text-white',
                      isStarted && !isComplete && 'bg-primary text-primary-foreground',
                      !isStarted && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isComplete ? <Check className="size-5" /> : moduleIndex + 1}
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-4 text-left"
                      onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{module.name}</h3>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[11px] font-medium',
                              isComplete && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                              isStarted && !isComplete && 'bg-primary/10 text-primary',
                              !isStarted && 'bg-muted text-muted-foreground'
                            )}
                          >
                            {isComplete ? 'Completado' : isStarted ? 'En progreso' : 'Pendiente'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn('h-full rounded-full', isComplete ? 'bg-emerald-600' : 'bg-primary')}
                              style={{ width: `${moduleProgress}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {module.completedCount}/{module.totalCount}
                          </span>
                        </div>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                        : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-muted/20 px-3 py-2 sm:px-4">
                        {module.lessons.length === 0 ? (
                          <p className="py-2 text-xs italic text-muted-foreground">Sin lecciones definidas.</p>
                        ) : (
                          module.lessons.map((lesson, lessonIndex) => (
                            <LessonProgressRow
                              key={lesson.id}
                              lesson={lesson}
                              personId={currentPersonId}
                              index={lessonIndex}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}

            <div className="relative flex items-center gap-3 pt-1 sm:gap-4">
              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-background bg-amber-400 text-amber-950 shadow-sm sm:size-12">
                {overallProgress === 100 ? <Check className="size-5" /> : <Circle className="size-4" />}
              </div>
              <div className="flex-1 rounded-2xl border border-dashed bg-amber-50/70 p-4 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-amber-700 dark:text-amber-400" />
                  <span className="font-semibold">Meta de la ruta</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Completar la formación y continuar aplicándola en el servicio y acompañamiento.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
