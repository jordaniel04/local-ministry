import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Task = Tables<'tasks'>
export type TaskInsert = TablesInsert<'tasks'>
export type TaskUpdate = TablesUpdate<'tasks'>

export type TaskStatus = 'pending' | 'in_progress' | 'done'
export type TaskType = 'visit' | 'administrative' | 'other'

export type TaskWithRelations = Task & {
  assigned_person: { first_name: string; last_name: string } | null
  related_person: { first_name: string; last_name: string } | null
  ministry: { name: string } | null
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Completada',
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  visit: 'Visita',
  administrative: 'Administrativa',
  other: 'Otra',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
}
