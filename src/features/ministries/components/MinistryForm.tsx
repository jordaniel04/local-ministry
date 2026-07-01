import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateMinistry, useUpdateMinistry } from '../hooks/useMinistries'
import type { Ministry } from '../types'

type FormState = {
  name: string
  description: string
}

type Props = {
  open: boolean
  onClose: () => void
  ministry?: Ministry
}

export function MinistryForm({ open, onClose, ministry }: Props) {
  const isEditing = !!ministry
  const createMinistry = useCreateMinistry()
  const updateMinistry = useUpdateMinistry()

  const [form, setForm] = useState<FormState>({ name: '', description: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ministry) {
      setForm({ name: ministry.name, description: ministry.description ?? '' })
    } else {
      setForm({ name: '', description: '' })
    }
    setError(null)
  }, [ministry, open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    try {
      if (isEditing && ministry) {
        await updateMinistry.mutateAsync({
          id: ministry.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
        })
      } else {
        await createMinistry.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim() || null,
        })
      }
      onClose()
    } catch {
      setError('Ocurrió un error al guardar. ¿Ya existe un ministerio con ese nombre?')
    }
  }

  const isPending = createMinistry.isPending || updateMinistry.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar ministerio' : 'Nuevo ministerio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ej: Ministerio de Alabanza"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Descripción opcional del ministerio..."
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear ministerio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
