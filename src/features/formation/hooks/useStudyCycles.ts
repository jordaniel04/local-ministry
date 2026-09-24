import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const db = supabase as any

export type StudyCycle = {
  id: string
  route_id: string | null
  name: string
  starts_on: string | null
  status: 'active' | 'closed' | 'paused'
}

export function useStudyCycles() {
  return useQuery({
    queryKey: ['formation-study-cycles'],
    queryFn: async (): Promise<StudyCycle[]> => {
      const { data, error } = await db.from('formation_study_cycles').select('id,route_id,name,starts_on,status').order('starts_on', { ascending: false, nullsFirst: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useActiveStudyCycle() {
  return useQuery({
    queryKey: ['active-formation-study-cycle'],
    queryFn: async (): Promise<StudyCycle | null> => {
      const { data, error } = await db.from('formation_study_cycles')
        .select('id,route_id,name,starts_on,status')
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data ?? null
    },
  })
}

export function useActivateStudyCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (studyCycleId: string) => {
      const { error } = await db.rpc('activate_formation_study_cycle', { p_cycle_id: studyCycleId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-study-cycles'] })
      queryClient.invalidateQueries({ queryKey: ['active-formation-study-cycle'] })
      queryClient.invalidateQueries({ queryKey: ['local-formation-route'] })
    },
  })
}
export function useCreateStudyCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { route_id: string | null; name: string; starts_on: string | null }) => {
      const { data, error } = await db.from('formation_study_cycles').insert({ ...values, status: 'paused' }).select().single()
      if (error) throw error
      return data as StudyCycle
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-study-cycles'] }),
  })
}

export function useUpdateStudyCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { id: string; name: string; starts_on: string | null }) => {
      const { data, error } = await db.from('formation_study_cycles').update({ name: values.name, starts_on: values.starts_on }).eq('id', values.id).select().single()
      if (error) throw error
      return data as StudyCycle
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-study-cycles'] }),
  })
}

export function useStudyCycleModules(studyCycleId: string | null) {
  return useQuery({
    queryKey: ['formation-study-cycle-modules', studyCycleId],
    enabled: Boolean(studyCycleId),
    queryFn: async () => {
      const { data, error } = await db.from('formation_study_cycle_modules').select('study_cycle_id,module_id,order_index,status,formation_modules(id,name,order_index)').eq('study_cycle_id', studyCycleId).order('order_index')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpdateStudyCycleModuleStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { studyCycleId: string; moduleId: string; status: 'pending' | 'active' | 'completed' | 'paused' }) => {
      if (values.status === 'active') {
        const { error: resetError } = await db.from('formation_study_cycle_modules').update({ status: 'completed' }).eq('study_cycle_id', values.studyCycleId).eq('status', 'active').neq('module_id', values.moduleId)
        if (resetError) throw resetError
      }
      const { error } = await db.from('formation_study_cycle_modules').update({ status: values.status }).eq('study_cycle_id', values.studyCycleId).eq('module_id', values.moduleId)
      if (error) throw error
    },
    onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ['formation-study-cycle-modules', values.studyCycleId] }),
  })
}

export function useAddModuleToStudyCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { studyCycleId: string; moduleId: string; orderIndex: number }) => {
      const { error } = await db.from('formation_study_cycle_modules').upsert({ study_cycle_id: values.studyCycleId, module_id: values.moduleId, order_index: values.orderIndex, status: 'pending' }, { onConflict: 'study_cycle_id,module_id' })
      if (error) throw error
    },
    onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ['formation-study-cycle-modules', values.studyCycleId] }),
  })
}
