import { DashboardView } from '@/features/dashboard'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Resumen y alertas del ministerio.</p>
      </div>
      <DashboardView />
    </div>
  )
}
