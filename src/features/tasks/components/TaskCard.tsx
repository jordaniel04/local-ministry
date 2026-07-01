import { useState } from 'react'
import { Pencil, Trash2, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useUpdateTaskStatus, useDeleteTask } from '../hooks/useTasks'
import {
  TASK_STATUS_LABELS,
  TASK_TYPE_LABELS,
  TASK_STATUS_COLORS,
} from '../types'
import type { TaskWithRelations, TaskStatus } from '../types'

type Props = {
  task: TaskWithRelations
  onEdit: (task: TaskWithRelations) => void
}

export function TaskCard({ task, onEdit }: Props) {
  const updateStatus = useUpdateTaskStatus()
  const deleteTask = useDeleteTask()
  const [showResultInput, setShowResultInput] = useState(false)
  const [resultNotes, setResultNotes] = useState(task.result_notes ?? '')

  const assignedName = task.assigned_person
    ? `${task.assigned_person.last_name}, ${task.assigned_person.first_name}`
    : '—'

  const relatedName = task.related_person
    ? `${task.related_person.last_name}, ${task.related_person.first_name}`
    : null

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date()

  async function handleMarkDone() {
    await updateStatus.mutateAsync({
      id: task.id,
      status: 'done',
      result_notes: resultNotes || undefined,
    })
    setShowResultInput(false)
  }

  async function handleMarkInProgress() {
    await updateStatus.mutateAsync({ id: task.id, status: 'in_progress' })
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return
    await deleteTask.mutateAsync(task.id)
  }

  return (
    <div className={cn('border rounded-lg bg-card p-4 space-y-3', isOverdue && 'border-destructive/50')}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{task.title}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TASK_STATUS_COLORS[task.status as TaskStatus])}>
              {TASK_STATUS_LABELS[task.status as TaskStatus]}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {TASK_TYPE_LABELS[task.task_type as keyof typeof TASK_TYPE_LABELS]}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Metadatos */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>👤 {assignedName}</span>
        {relatedName && <span>→ {relatedName}</span>}
        {task.ministry?.name && <span>🏛 {task.ministry.name}</span>}
        {task.due_date && (
          <span className={cn(isOverdue && 'text-destructive font-medium')}>
            📅 {new Date(task.due_date).toLocaleDateString('es-CO')}
            {isOverdue && ' · Vencida'}
          </span>
        )}
      </div>

      {/* Notas de resultado (si ya está done) */}
      {task.status === 'done' && task.result_notes && (
        <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Resultado: </span>
          {task.result_notes}
        </div>
      )}

      {/* Acciones de estado */}
      {task.status !== 'done' && (
        <div className="flex flex-wrap gap-2 pt-1">
          {task.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkInProgress}
              disabled={updateStatus.isPending}
            >
              <Loader2 className="h-3.5 w-3.5 mr-1.5" />
              Iniciar
            </Button>
          )}
          {!showResultInput ? (
            <Button
              size="sm"
              variant="outline"
              className="text-green-700 border-green-300 hover:bg-green-50"
              onClick={() => setShowResultInput(true)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Completar
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Textarea
                placeholder="Notas del resultado (opcional)..."
                value={resultNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResultNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleMarkDone} disabled={updateStatus.isPending}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Marcar como completada
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowResultInput(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          {task.status === 'in_progress' && !showResultInput && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> En progreso
            </span>
          )}
        </div>
      )}
    </div>
  )
}
