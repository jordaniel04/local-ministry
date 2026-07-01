import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateTask, useUpdateTask } from '../hooks/useTasks'
import { usePeople } from '@/features/people/hooks/usePeople'
import { useMinistries } from '@/features/ministries/hooks/useMinistries'
import { TASK_TYPE_LABELS, TASK_STATUS_LABELS } from '../types'
import type { TaskWithRelations, TaskType, TaskStatus } from '../types'

type FormState = {
  title: string
  description: string
  assigned_to: string
  related_person_id: string
  ministry_id: string
  task_type: TaskType
  status: TaskStatus
  due_date: string
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  assigned_to: '',
  related_person_id: '',
  ministry_id: '',
  task_type: 'other',
  status: 'pending',
  due_date: '',
}

type Props = {
  open: boolean
  onClose: () => void
  task?: TaskWithRelations
}

export function TaskForm({ open, onClose, task }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const { data: people } = usePeople()
  const { data: ministries } = useMinistries()

  const activePeople = (people ?? []).filter((p) => p.is_active)
  const activeMinistries = (ministries ?? []).filter((m) => m.is_active)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        assigned_to: task.assigned_to,
        related_person_id: task.related_person_id ?? '',
        ministry_id: task.ministry_id ?? '',
        task_type: task.task_type as TaskType,
        status: task.status as TaskStatus,
        due_date: task.due_date ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [task, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description || null,
      assigned_to: form.assigned_to,
      related_person_id: form.related_person_id || null,
      ministry_id: form.ministry_id || null,
      task_type: form.task_type,
      status: form.status,
      due_date: form.due_date || null,
    }

    if (task) {
      await updateTask.mutateAsync({ id: task.id, ...payload })
    } else {
      await createTask.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createTask.isPending || updateTask.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo de tarea *</Label>
            <Select
              value={form.task_type}
              onValueChange={(v) => setForm((prev) => ({ ...prev, task_type: v as TaskType }))}
            >
              <SelectTrigger>
                <SelectValue>{TASK_TYPE_LABELS[form.task_type]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((t) => (
                  <SelectItem key={t} value={t}>{TASK_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asignado a */}
          <div className="space-y-1.5">
            <Label>Asignado a *</Label>
            <Select
              value={form.assigned_to}
              onValueChange={(v) => setForm((prev) => ({ ...prev, assigned_to: v ?? '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar líder..." />
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

          {/* Persona relacionada (para visitas) */}
          {form.task_type === 'visit' && (
            <div className="space-y-1.5">
              <Label>Persona a visitar</Label>
              <Select
                value={form.related_person_id}
                onValueChange={(v) => setForm((prev) => ({ ...prev, related_person_id: v ?? '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar persona..." />
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
          )}

          {/* Ministerio */}
          <div className="space-y-1.5">
            <Label>Ministerio (opcional)</Label>
            <Select
              value={form.ministry_id}
              onValueChange={(v) => setForm((prev) => ({ ...prev, ministry_id: v ?? '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin ministerio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin ministerio</SelectItem>
                {activeMinistries.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado (solo en edición) */}
          {task && (
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((prev) => ({ ...prev, status: v as TaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue>{TASK_STATUS_LABELS[form.status]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fecha límite */}
          <div className="space-y-1.5">
            <Label htmlFor="due_date">Fecha límite</Label>
            <Input
              id="due_date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !form.title || !form.assigned_to}>
              {isPending ? 'Guardando...' : task ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
