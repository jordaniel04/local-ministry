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
import { useCreateLeaderSession, useUpdateLeaderSession } from '../hooks/useLeaderSessions'
import { usePeople } from '@/features/people/hooks/usePeople'
import type { LeaderSessionWithPerson } from '../types'

type FormState = {
  leader_id: string
  session_date: string
  summary: string
  agreements: string
  next_session_date: string
}

const EMPTY_FORM: FormState = {
  leader_id: '',
  session_date: '',
  summary: '',
  agreements: '',
  next_session_date: '',
}

type Props = {
  open: boolean
  onClose: () => void
  session?: LeaderSessionWithPerson
}

export function SessionForm({ open, onClose, session }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const createSession = useCreateLeaderSession()
  const updateSession = useUpdateLeaderSession()
  const { data: people } = usePeople()

  const activePeople = (people ?? []).filter((p) => p.is_active)

  useEffect(() => {
    if (session) {
      setForm({
        leader_id: session.leader_id,
        session_date: session.session_date,
        summary: session.summary ?? '',
        agreements: session.agreements ?? '',
        next_session_date: session.next_session_date ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [session, open])

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      leader_id: form.leader_id,
      session_date: form.session_date,
      summary: form.summary || null,
      agreements: form.agreements || null,
      next_session_date: form.next_session_date || null,
    }
    if (session) {
      await updateSession.mutateAsync({ id: session.id, ...payload })
    } else {
      await createSession.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createSession.isPending || updateSession.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session ? 'Editar sesión 1:1' : 'Nueva sesión 1:1'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Líder *</Label>
            <Select
              value={form.leader_id}
              onValueChange={(v) => setForm((prev) => ({ ...prev, leader_id: v ?? '' }))}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="session_date">Fecha de sesión *</Label>
              <Input id="session_date" type="date" value={form.session_date} onChange={set('session_date')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next_session_date">Próxima sesión</Label>
              <Input id="next_session_date" type="date" value={form.next_session_date} onChange={set('next_session_date')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">Resumen de la sesión</Label>
            <Textarea id="summary" value={form.summary} onChange={set('summary')} rows={3} placeholder="Temas tratados, estado del líder, observaciones..." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="agreements">Acuerdos y compromisos</Label>
            <Textarea id="agreements" value={form.agreements} onChange={set('agreements')} rows={2} placeholder="Compromisos adquiridos, próximos pasos..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !form.leader_id || !form.session_date}>
              {isPending ? 'Guardando...' : session ? 'Guardar cambios' : 'Registrar sesión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
