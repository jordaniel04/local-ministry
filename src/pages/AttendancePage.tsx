import { SessionList } from '@/features/attendance'

export function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Asistencia</h1>
        <p className="text-muted-foreground text-sm">Sesiones de clase o culto. Seleccioná una para tomar asistencia.</p>
      </div>
      <SessionList />
    </div>
  )
}
