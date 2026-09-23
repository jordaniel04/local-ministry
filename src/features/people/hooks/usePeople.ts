import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { PersonInsert, PersonUpdate } from '../types'

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
}

async function ensureUniqueName(person: { first_name: string; last_name: string }, excludeId?: string) {
  const { data, error } = await supabase.from('people').select('id,first_name,last_name')
  if (error) throw error
  const duplicate = (data ?? []).find((candidate) => candidate.id !== excludeId && normalizeName(candidate.first_name) === normalizeName(person.first_name) && normalizeName(candidate.last_name) === normalizeName(person.last_name))
  if (duplicate) throw new Error('DUPLICATE_PERSON_NAME')
}

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('last_name')
        .order('first_name')
      if (error) throw error
      return data
    },
  })
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ['people', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (person: PersonInsert) => {
      await ensureUniqueName(person)
      const { data, error } = await supabase
        .from('people')
        .insert(person)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}

export function useUpdatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: PersonUpdate & { id: string }) => {
      if (updates.first_name && updates.last_name) await ensureUniqueName({ first_name: updates.first_name, last_name: updates.last_name }, id)
      const { data, error } = await supabase
        .from('people')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['people', data.id] })
    },
  })
}

export function useDeactivatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('people')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}
