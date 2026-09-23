import { TasksList } from '@/features/tasks'
import { Link, useSearchParams } from 'react-router-dom'

export function TasksPage() {
  const [searchParams] = useSearchParams()
  const personId = searchParams.get('person')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tareas</h1>
        <p className="text-muted-foreground text-sm">Delegación y seguimiento de tareas a líderes.</p>
        {personId && <Link to={`/people/${personId}`} className="inline-block mt-2 text-sm text-primary hover:underline">← Volver a la ficha de la persona</Link>}
      </div>
      <TasksList />
    </div>
  )
}
