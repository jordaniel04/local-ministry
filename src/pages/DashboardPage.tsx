import { DashboardView } from '@/features/dashboard'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inicio</h1>
        <p className="text-muted-foreground text-sm">Lo que requiere atención en EsLider.</p>
      </div>
      <DashboardView />
    </div>
  )
}
