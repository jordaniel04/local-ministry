import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TaskInsert, TaskUpdate, TaskWithRelations } from '../types'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<TaskWithRelations[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_person:people!tasks_assigned_to_fkey (first_name, last_name),
          related_person:people!tasks_related_person_id_fkey (first_name, last_name),
          ministry:ministries (name)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as TaskWithRelations[]
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, result_notes }: { id: string; status: string; result_notes?: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status, result_notes, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
