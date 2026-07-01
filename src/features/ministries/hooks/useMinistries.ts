import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MinistryInsert, MinistryUpdate, MinistryWithLeaders } from '../types'

export function useMinistries() {
  return useQuery({
    queryKey: ['ministries'],
    queryFn: async (): Promise<MinistryWithLeaders[]> => {
      const { data, error } = await supabase
        .from('ministries')
        .select(`
          *,
          leader_ministries (
            id,
            person_id,
            people (
              first_name,
              last_name,
              person_type
            )
          )
        `)
        .order('name')
      if (error) throw error

      // Aplanar la estructura anidada que devuelve Supabase
      return (data ?? []).map((m) => ({
        ...m,
        leaders: (m.leader_ministries ?? []).map((lm: any) => ({
          id: lm.id,
          person_id: lm.person_id,
          first_name: lm.people?.first_name ?? '',
          last_name: lm.people?.last_name ?? '',
          person_type: lm.people?.person_type ?? '',
        })),
      }))
    },
  })
}

export function useCreateMinistry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ministry: MinistryInsert) => {
      const { data, error } = await supabase
        .from('ministries')
        .insert(ministry)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] })
    },
  })
}

export function useUpdateMinistry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: MinistryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('ministries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] })
    },
  })
}

export function useDeactivateMinistry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ministries')
        .update({ is_active: false })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] })
    },
  })
}

export function useAssignLeader() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ministryId, personId }: { ministryId: string; personId: string }) => {
      const { error } = await supabase
        .from('leader_ministries')
        .insert({ ministry_id: ministryId, person_id: personId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] })
    },
  })
}

export function useRemoveLeader() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (leaderMinistryId: string) => {
      const { error } = await supabase
        .from('leader_ministries')
        .delete()
        .eq('id', leaderMinistryId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] })
    },
  })
}
