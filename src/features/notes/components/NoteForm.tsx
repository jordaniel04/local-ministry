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
import { useCreateNote, useUpdateNote } from '../hooks/useNotes'
import type { ExpositionNote } from '../types'

type FormState = {
  title: string
  speaker: string
  exposition_date: string
  content: string
  highlights: string
  improvements: string
}

const EMPTY_FORM: FormState = {
  title: '',
  speaker: '',
  exposition_date: '',
  content: '',
  highlights: '',
  improvements: '',
}

type Props = {
  open: boolean
  onClose: () => void
  note?: ExpositionNote
}

export function NoteForm({ open, onClose, note }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title,
        speaker: note.speaker ?? '',
        exposition_date: note.exposition_date,
        content: note.content ?? '',
        highlights: note.highlights ?? '',
        improvements: note.improvements ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [note, open])

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: form.title,
      speaker: form.speaker || null,
      exposition_date: form.exposition_date,
      content: form.content || null,
      highlights: form.highlights || null,
      improvements: form.improvements || null,
    }
    if (note) {
      await updateNote.mutateAsync({ id: note.id, ...payload })
    } else {
      await createNote.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createNote.isPending || updateNote.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? 'Editar nota' : 'Nueva nota de exposición'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={form.title} onChange={set('title')} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="speaker">Expositor</Label>
              <Input id="speaker" value={form.speaker} onChange={set('speaker')} placeholder="Nombre del expositor" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exposition_date">Fecha *</Label>
              <Input id="exposition_date" type="date" value={form.exposition_date} onChange={set('exposition_date')} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Contenido / Resumen</Label>
            <Textarea id="content" value={form.content} onChange={set('content')} rows={4} placeholder="Resumen de la exposición..." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="highlights">Puntos destacados</Label>
            <Textarea id="highlights" value={form.highlights} onChange={set('highlights')} rows={2} placeholder="Cosas positivas, puntos fuertes..." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="improvements">Por mejorar</Label>
            <Textarea id="improvements" value={form.improvements} onChange={set('improvements')} rows={2} placeholder="Áreas de mejora, observaciones..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !form.title || !form.exposition_date}>
              {isPending ? 'Guardando...' : note ? 'Guardar cambios' : 'Crear nota'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
