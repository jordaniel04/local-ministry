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
import { useCreateLesson, useUpdateLesson } from '../hooks/useFormation'
import type { FormationLesson } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  moduleId: string
  moduleName: string
  lesson?: FormationLesson
  nextOrderIndex: number
}

export function LessonForm({ open, onClose, moduleId, moduleName, lesson, nextOrderIndex }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const createLesson = useCreateLesson()
  const updateLesson = useUpdateLesson()

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setDescription(lesson.description ?? '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [lesson, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (lesson) {
      await updateLesson.mutateAsync({ id: lesson.id, title, description: description || null })
    } else {
      await createLesson.mutateAsync({
        module_id: moduleId,
        title,
        description: description || null,
        order_index: nextOrderIndex,
      })
    }
    onClose()
  }

  const isPending = createLesson.isPending || updateLesson.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Editar lección' : `Nueva lección — ${moduleName}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ej: La salvación, El bautismo..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} rows={2} placeholder="Descripción o temas de la lección..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !title}>
              {isPending ? 'Guardando...' : lesson ? 'Guardar' : 'Crear lección'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
