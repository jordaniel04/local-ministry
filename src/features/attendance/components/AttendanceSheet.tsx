import { usePeople } from '@/features/people/hooks/usePeople'
import { useSessionAttendance, useUpsertAttendance } from '../hooks/useAttendance'
import type { AttendanceStatus } from '../types'
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from '../types'
import { cn } from '@/lib/utils'

type Props = {
  sessionId: string
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'justified', 'late']

export function AttendanceSheet({ sessionId }: Props) {
  const { data: people } = usePeople()
  const { data: attendanceRecords, isLoading } = useSessionAttendance(sessionId)
  const upsert = useUpsertAttendance(sessionId)

  const activePeople = (people ?? []).filter((p) => p.is_active)

  // Map para O(1): personId → status actual
  const attendanceMap = new Map(
    (attendanceRecords ?? []).map((a) => [a.person_id, a.status as AttendanceStatus])
  )

  const presentCount = (attendanceRecords ?? []).filter((a) => a.status === 'present').length

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Resumen */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{presentCount}</span> de {activePeople.length} personas presentes
      </div>

      {/* Lista de personas */}
      <div className="divide-y rounded-lg border overflow-hidden">
        {activePeople.map((person) => {
          const currentStatus = attendanceMap.get(person.id) ?? null

          return (
            <div key={person.id} className="flex items-center gap-3 px-3 py-2.5 bg-card">
              {/* Nombre */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {person.last_name}, {person.first_name}
                </p>
                {currentStatus && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-medium',
                    ATTENDANCE_STATUS_COLORS[currentStatus]
                  )}>
                    {ATTENDANCE_STATUS_LABELS[currentStatus]}
                  </span>
                )}
              </div>

              {/* Botones de estado */}
              <div className="flex gap-1 shrink-0">
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
    </div>
  )
}
