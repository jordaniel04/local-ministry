import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AttendanceStatus } from '../types'

export function useClassSessions() {
  return useQuery({
    queryKey: ['class-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_sessions')
        .select('*')
        .order('session_date', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useSessionAttendance(sessionId: string) {
  return useQuery({
    queryKey: ['attendance', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('session_id', sessionId)
      if (error) throw error
      return data
    },
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: { title: string; session_date: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('class_sessions')
        .insert({ ...values, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['class-sessions'] }),
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('class_sessions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['class-sessions'] }),
  })
}

// Upsert: inserta si no existe, actualiza si existe (por UNIQUE session_id+person_id)
export function useUpsertAttendance(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ personId, status }: { personId: string; status: AttendanceStatus }) => {
      const { error } = await supabase
        .from('attendance')
        .upsert(
          { session_id: sessionId, person_id: personId, status },
          { onConflict: 'session_id,person_id' }
        )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance', sessionId] }),
  })
}
