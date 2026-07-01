import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteLeaderSession } from '../hooks/useLeaderSessions'
import type { LeaderSessionWithPerson } from '../types'

type Props = {
  session: LeaderSessionWithPerson
  onEdit: (session: LeaderSessionWithPerson) => void
}

export function SessionCard({ session, onEdit }: Props) {
  const deleteSession = useDeleteLeaderSession()
  const [expanded, setExpanded] = useState(false)

  const leaderName = session.leader
    ? `${session.leader.last_name}, ${session.leader.first_name}`
    : '—'

  const hasDetail = session.summary || session.agreements

  async function handleDelete() {
    if (!confirm(`¿Eliminar esta sesión con ${leaderName}?`)) return
    await deleteSession.mutateAsync(session.id)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-start gap-3 p-4">
        <button
          className="flex-1 text-left"
          onClick={() => hasDetail && setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{leaderName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(session.session_date)}
            </span>
          </div>
          {session.next_session_date && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3 w-3" />
              Próxima: {formatDate(session.next_session_date)}
            </div>
          )}
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(session)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteSession.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {hasDetail && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
          {session.summary && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Resumen</p>
              <p className="text-sm whitespace-pre-wrap">{session.summary}</p>
            </div>
          )}
          {session.agreements && (
            <div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">✓ Acuerdos</p>
              <p className="text-sm whitespace-pre-wrap">{session.agreements}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
