import { useState } from 'react'
import { CalendarDays, Trash2, Plus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClassSessions, useDeleteSession } from '../hooks/useAttendance'
import { SessionForm } from './SessionForm'

import { AttendanceSheet } from './AttendanceSheet'
import type { ClassSession } from '../types'

export function SessionList() {
  const { data: sessions, isLoading } = useClassSessions()
  const deleteSession = useDeleteSession()
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)
  const [showForm, setShowForm] = useState(false)

  if (selectedSession) {
    return (
      <div className="space-y-4">
        {/* Header de sesión abierta */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)} className="gap-1.5 text-muted-foreground">
            ← Volver
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base truncate">{selectedSession.title}</h2>
            <p className="text-xs text-muted-foreground">
              {new Date(selectedSession.session_date + 'T12:00:00').toLocaleDateString('es-AR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <AttendanceSheet sessionId={selectedSession.id} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Acciones */}
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />Nueva sesión
        </Button>
        <SessionForm open={showForm} onClose={() => setShowForm(false)} />
      </div>

      {/* Lista */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
        </div>
      )}

      {!isLoading && (sessions ?? []).length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          No hay sesiones registradas. Creá la primera sesión para empezar a tomar asistencia.
        </p>
      )}

      {!isLoading && (sessions ?? []).length > 0 && (
        <div className="space-y-2">
          {(sessions ?? []).map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-card hover:bg-muted/40 cursor-pointer transition-colors"
              onClick={() => setSelectedSession(session)}
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(session.session_date + 'T12:00:00').toLocaleDateString('es-AR', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`¿Eliminar "${session.title}"? Se borrará también su asistencia.`)) {
                      deleteSession.mutate(session.id)
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
