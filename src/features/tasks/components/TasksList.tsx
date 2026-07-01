import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import type { TaskWithRelations, TaskStatus } from '../types'

const FILTERS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'En progreso', value: 'in_progress' },
  { label: 'Completadas', value: 'done' },
]

export function TasksList() {
  const { data: tasks, isLoading, error } = useTasks()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TaskWithRelations | undefined>()
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  if (error) return <p className="text-destructive text-sm">Error al cargar tareas.</p>

  // Estado derivado: filtrar sin useState extra
  const filtered = (tasks ?? []).filter(
    (t) => filter === 'all' || t.status === filter
  )

  function openEdit(task: TaskWithRelations) {
    setEditing(task)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(undefined)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Acciones superiores */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Filtros por estado */}
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({(tasks ?? []).filter((t) => t.status === f.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <Button onClick={() => setFormOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva tarea
          </Button>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {filter === 'all'
              ? 'No hay tareas registradas aún.'
              : `No hay tareas ${filter === 'pending' ? 'pendientes' : filter === 'in_progress' ? 'en progreso' : 'completadas'}.`}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>

      <TaskForm open={formOpen} onClose={closeForm} task={editing} />
    </>
  )
}
