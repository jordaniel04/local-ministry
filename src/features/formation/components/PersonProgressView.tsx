import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePeople } from '@/features/people/hooks/usePeople'
import { usePersonProgress } from '../hooks/useFormation'
import { LessonProgressRow } from './LessonProgressRow'

export function PersonProgressView() {
  const { data: people } = usePeople()
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null)

  const { data: modules, isLoading } = usePersonProgress(selectedPersonId)

  const activePeople = (people ?? []).filter((p) => p.is_active)

  const totalCompleted = (modules ?? []).reduce((sum, m) => sum + m.completedCount, 0)
  const totalLessons = (modules ?? []).reduce((sum, m) => sum + m.totalCount, 0)
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Selector de persona */}
      <div className="max-w-sm">
        <Select value={selectedPersonId} onValueChange={(v) => { setSelectedPersonId(v ?? ''); setExpandedModuleId(null) }}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar persona...">
                {selectedPersonId
                  ? (() => {
                      const p = activePeople.find((p) => p.id === selectedPersonId)
                      return p ? `${p.last_name}, ${p.first_name}` : 'Seleccionar persona...'
                    })()
                  : 'Seleccionar persona...'}
              </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {activePeople.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.last_name}, {p.first_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progreso */}
      {!selectedPersonId && (
        <p className="text-muted-foreground text-sm">Seleccioná una persona para ver su progreso de formación.</p>
      )}

      {selectedPersonId && isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
        </div>
      )}

      {selectedPersonId && !isLoading && (modules ?? []).length === 0 && (
        <p className="text-muted-foreground text-sm">No hay módulos definidos en el currículo.</p>
      )}

      {selectedPersonId && !isLoading && (modules ?? []).length > 0 && (
        <>
          {/* Barra de progreso general */}
          <div className="bg-muted rounded-lg p-3 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Progreso total</span>
                <span className="text-muted-foreground">{totalCompleted}/{totalLessons} lecciones</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold tabular-nums">{overallProgress}%</span>
          </div>

          {/* Módulos */}
          <div className="space-y-2">
            {(modules ?? []).map((m) => {
              const moduleProgress = m.totalCount > 0
                ? Math.round((m.completedCount / m.totalCount) * 100)
                : 0

              return (
                <div key={m.id} className="border rounded-lg bg-card overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left"
                    onClick={() => setExpandedModuleId(expandedModuleId === m.id ? null : m.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{m.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {m.completedCount}/{m.totalCount}
                        </span>
                        {m.averageScore != null && (
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                            Promedio: {m.averageScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0">
                      {expandedModuleId === m.id
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                  </button>

                  {/* Lecciones del módulo */}
                  {expandedModuleId === m.id && (
                    <div className="border-t px-4 py-2 bg-muted/20">
                      {m.lessons.length === 0
                        ? <p className="text-xs text-muted-foreground italic py-2">Sin lecciones definidas.</p>
                        : m.lessons.map((l, idx) => (
                          <LessonProgressRow
                            key={l.id}
                            lesson={l}
                            personId={selectedPersonId}
                            index={idx}
                          />
                        ))
                      }
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
