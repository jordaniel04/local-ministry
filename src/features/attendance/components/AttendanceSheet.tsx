import { useSessionAttendance, useUpsertAttendance } from '../hooks/useAttendance'
import { useModuleEnrollments } from '@/features/formation/hooks/useEnrollment'
import type { AttendanceStatus } from '../types'
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from '../types'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

type Props = {
  sessionId: string
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'justified', 'late']

export function AttendanceSheet({ sessionId }: Props) {
  const [search, setSearch] = useState('')
  const [onlyPending, setOnlyPending] = useState(false)
  const { data: moduleEnrollments, isLoading: isLoadingEnrollments } = useModuleEnrollments()
  const { data: attendanceRecords, isLoading } = useSessionAttendance(sessionId)
  const upsert = useUpsertAttendance(sessionId)

  // La asistencia se toma únicamente a quienes tienen una matrícula activa
  // en un módulo en curso. Así, quienes ya terminaron un módulo anterior no
  // vuelven a aparecer automáticamente en el período actual.
  const activePeople = Array.from(
    new Map(
      (moduleEnrollments ?? [])
        .filter((enrollment) => enrollment.status === 'in_progress' && enrollment.formation_enrollments?.people)
        .map((enrollment) => {
          const person = enrollment.formation_enrollments!.people!
          return [enrollment.formation_enrollments!.person_id, { ...person, id: enrollment.formation_enrollments!.person_id }]
        })
    ).values()
  )
  // Map para O(1): personId → status actual
  const attendanceMap = new Map(
    (attendanceRecords ?? []).map((a) => [a.person_id, a.status as AttendanceStatus])
  )

  const pendingCount = activePeople.filter((person) => !attendanceMap.has(person.id)).length
  const visiblePeople = activePeople.filter((person) => {
    const matchesSearch = `${person.first_name} ${person.last_name}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (!onlyPending || !attendanceMap.has(person.id))
  })


  if (isLoading || isLoadingEnrollments) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-3 mt-4">
      {upsert.isError && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          No se pudo guardar la asistencia. Comprueba la conexión e inténtalo de nuevo.
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar persona..."
          aria-label="Buscar persona en la asistencia"
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2 text-xs"><button type="button" onClick={() => setOnlyPending(false)} className={cn('rounded-full px-3 py-1.5', !onlyPending ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>Todas ({activePeople.length})</button><button type="button" onClick={() => setOnlyPending(true)} className={cn('rounded-full px-3 py-1.5', onlyPending ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>Pendientes ({pendingCount})</button></div>

      {/* Lista de personas */}
      <div className="divide-y rounded-lg border overflow-hidden">
        {visiblePeople.map((person) => {
          const currentStatus = attendanceMap.get(person.id) ?? null

          return (
            <div key={person.id} className="flex flex-col gap-2 px-3 py-2.5 bg-card sm:flex-row sm:items-center">
              {/* Nombre */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {person.last_name}, {person.first_name}
                </p>
              </div>

              {/* Botones de estado */}
              <div className="grid grid-cols-4 gap-1 sm:flex sm:shrink-0">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => upsert.mutate({ personId: person.id, status })}
                    disabled={upsert.isPending}
                    className={cn(
                      'text-xs px-2 py-1 rounded-md border transition-colors',
                      currentStatus === status
                        ? ATTENDANCE_STATUS_COLORS[status] + ' border-transparent font-medium'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {ATTENDANCE_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {visiblePeople.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No hay personas que coincidan con la búsqueda.</p>
      )}
    </div>
  )
}
