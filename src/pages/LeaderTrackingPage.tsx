import { LeaderSessionsList } from '@/features/leader-tracking'
import { Link, useSearchParams } from 'react-router-dom'

export function LeaderTrackingPage() {
  const [searchParams] = useSearchParams()
  const personId = searchParams.get('person')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seguimiento 1:1</h1>
        <p className="text-muted-foreground text-sm">Registro de sesiones de seguimiento con líderes.</p>
        {personId && <Link to={`/people/${personId}`} className="inline-block mt-2 text-sm text-primary hover:underline">← Volver a la ficha de la persona</Link>}
      </div>
      <LeaderSessionsList />
    </div>
  )
}
