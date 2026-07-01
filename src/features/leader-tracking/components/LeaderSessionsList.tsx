import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLeaderSessions } from '../hooks/useLeaderSessions'
import { SessionCard } from './SessionCard'
import { SessionForm } from './SessionForm'
import type { LeaderSessionWithPerson } from '../types'

export function LeaderSessionsList() {
  const { data: sessions, isLoading, error } = useLeaderSessions()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LeaderSessionWithPerson | undefined>()

  if (error) return <p className="text-destructive text-sm">Error al cargar sesiones.</p>

  function openEdit(session: LeaderSessionWithPerson) {
    setEditing(session)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(undefined)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva sesión
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (sessions ?? []).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay sesiones 1:1 registradas aún.
          </div>
        ) : (
          <div className="space-y-2">
            {(sessions ?? []).map((session) => (
              <SessionCard key={session.id} session={session} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>

      <SessionForm open={formOpen} onClose={closeForm} session={editing} />
    </>
  )
}
