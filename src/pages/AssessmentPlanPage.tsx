import { Link } from 'react-router-dom'
import { AssessmentPlanManager } from '@/features/formation'

export function AssessmentPlanPage() {
  return <div className="space-y-5">
    <Link to="/settings" className="inline-block text-sm font-medium text-primary hover:underline">← Volver a Configuración</Link>
    <div className="rounded-2xl border bg-card p-5">
      <h1 className="text-xl font-semibold">Plan de notas</h1>
      <p className="mt-1 text-sm text-muted-foreground">Define la escala, los componentes y sus ponderaciones para cada manual.</p>
    </div>
    <AssessmentPlanManager />
  </div>
}
