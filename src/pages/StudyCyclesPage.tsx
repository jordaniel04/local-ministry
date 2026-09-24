import { Link } from 'react-router-dom'
import { StudyCycleSettings } from '@/features/formation/components/StudyCycleSettings'

export function StudyCyclesPage() {
  return (
    <div className="space-y-5">
      <Link to="/settings" className="inline-block text-sm font-medium text-primary hover:underline">
        ← Volver a Configuración
      </Link>
      <StudyCycleSettings />
    </div>
  )
}