import { SessionList } from '@/features/attendance'
import { Link, useSearchParams } from 'react-router-dom'

export function AttendancePage() {
  const [searchParams] = useSearchParams()
  const personId = searchParams.get('person')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Asistencia</h1>
        <p className="text-muted-foreground text-sm">Sesiones de clase o culto. Seleccioná una para tomar asistencia.</p>
        {personId && <Link to={`/people/${personId}`} className="inline-block mt-2 text-sm text-primary hover:underline">← Volver a la ficha de la persona</Link>}
      </div>
      <SessionList />
    </div>
  )
}
