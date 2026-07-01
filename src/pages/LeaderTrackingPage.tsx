import { LeaderSessionsList } from '@/features/leader-tracking'

export function LeaderTrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seguimiento 1:1</h1>
        <p className="text-muted-foreground text-sm">Registro de sesiones de seguimiento con líderes.</p>
      </div>
      <LeaderSessionsList />
    </div>
  )
}
