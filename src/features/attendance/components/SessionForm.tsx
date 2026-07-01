import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateSession } from '../hooks/useAttendance'

type Props = {
  open: boolean
  onClose: () => void
}

export function SessionForm({ open, onClose }: Props) {
  const [form, setForm] = useState({ title: '', session_date: '', notes: '' })
  const createSession = useCreateSession()

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createSession.mutateAsync({ title: form.title, session_date: form.session_date, notes: form.notes || undefined })
    setForm({ title: '', session_date: '', notes: '' })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva sesión</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input placeholder="Culto 30 Jun, Clase Módulo 2..." value={form.title} onChange={set('title')} required />
          </div>
          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input type="date" value={form.session_date} onChange={set('session_date')} required />
          </div>
          <div className="space-y-1.5">
            <Label>Notas (opcional)</Label>
            <Input placeholder="Observaciones de la sesión..." value={form.notes} onChange={set('notes')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending ? 'Guardando...' : 'Crear sesión'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
