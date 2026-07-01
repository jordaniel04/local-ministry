import { TasksList } from '@/features/tasks'

export function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tareas</h1>
        <p className="text-muted-foreground text-sm">Delegación y seguimiento de tareas a líderes.</p>
      </div>
      <TasksList />
    </div>
  )
}
