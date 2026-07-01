import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { LeaderSessionInsert, LeaderSessionUpdate, LeaderSessionWithPerson } from '../types'

export function useLeaderSessions() {
  return useQuery({
    queryKey: ['leader-sessions'],
    queryFn: async (): Promise<LeaderSessionWithPerson[]> => {
      const { data, error } = await supabase
        .from('leader_sessions')
        .select('*, leader:people (first_name, last_name)')
        .order('session_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as LeaderSessionWithPerson[]
    },
  })
}

export function useCreateLeaderSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (session: LeaderSessionInsert) => {
      const { data, error } = await supabase
        .from('leader_sessions')
        .insert(session)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leader-sessions'] })
    },
  })
}

export function useUpdateLeaderSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: LeaderSessionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('leader_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leader-sessions'] })
    },
  })
}

export function useDeleteLeaderSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leader_sessions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leader-sessions'] })
    },
  })
}
