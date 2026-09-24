import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useActiveStudyCycle } from './useStudyCycles'

const db = supabase as any

export type LocalEnrollment = {
  id: string
  person_id: string
  status: 'active' | 'paused' | 'completed' | 'withdrawn'
  current_module_id: string | null
  enrolled_at: string
  notes: string | null
  people: { first_name: string; last_name: string } | null
  formation_modules: { name: string } | null
}

export type ModuleEnrollment = {
  id: string
  enrollment_id: string
  module_id: string
  study_cycle_id: string | null
  status: 'in_progress' | 'completed' | 'paused' | 'withdrawn'
  enrollment_type: 'standard' | 'repeat' | 'reinforcement' | 'historical'
  enrolled_at: string
  completed_at: string | null
  notes: string | null
  final_grade: string | null
  final_result: 'approved' | 'reinforcement' | null
  evaluated_at: string | null
  evaluation_notes: string | null
  formation_modules: { name: string } | null
  formation_enrollments: {
    person_id: string
    people: { first_name: string; last_name: string } | null
  } | null
}

export function useLocalEnrollments(routeId: string | null) {
  return useQuery({
    queryKey: ['local-enrollments', routeId],
    enabled: Boolean(routeId),
    queryFn: async (): Promise<LocalEnrollment[]> => {
      const { data, error } = await db
        .from('formation_enrollments')
        .select('id,person_id,status,current_module_id,enrolled_at,notes,people(first_name,last_name),formation_modules(name)')
        .eq('route_id', routeId)
        .order('enrolled_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useHistoricalModuleCompletions(routeId: string | null) {
  return useQuery({
    queryKey: ['historical-module-completions', routeId],
    enabled: Boolean(routeId),
    queryFn: async () => {
      const { data, error } = await db
        .from('formation_module_progress')
        .select('id,status,observed_at,notes,historical_grade,validation_score,validation_result,validation_date,validation_notes,formation_modules(name),formation_enrollments!inner(person_id,route_id,people(first_name,last_name))')
        .eq('status', 'completed')
        .eq('formation_enrollments.route_id', routeId)
        .order('observed_at', { ascending: false, nullsFirst: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useModuleEnrollments() {
  return useQuery({
    queryKey: ['module-enrollments'],
    queryFn: async (): Promise<ModuleEnrollment[]> => {
      const { data, error } = await db
        .from('formation_module_enrollments')
        .select('id,enrollment_id,module_id,study_cycle_id,status,enrollment_type,enrolled_at,completed_at,notes,final_grade,final_result,evaluated_at,evaluation_notes,formation_modules(name),formation_enrollments!inner(person_id,route_id,people(first_name,last_name))')
        .order('enrolled_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCurrentModuleEnrollments(moduleId: string) {
  return useQuery({
    queryKey: ['current-module-enrollments', moduleId],
    enabled: Boolean(moduleId),
    queryFn: async (): Promise<ModuleEnrollment[]> => {
      const { data, error } = await db
        .from('formation_module_enrollments')
        .select('id,enrollment_id,module_id,study_cycle_id,status,enrollment_type,enrolled_at,completed_at,notes,final_grade,final_result,evaluated_at,evaluation_notes,formation_modules(name),formation_enrollments!inner(person_id,route_id,people(first_name,last_name))')
        .eq('module_id', moduleId)
        .eq('status', 'in_progress')
        .order('enrolled_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useStartModuleEnrollments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      person_ids: string[]
      route_id: string
      module_id: string
      enrollment_type: 'standard' | 'repeat' | 'reinforcement'
    }) => {
      const { data: activeStudyCycle, error: cycleError } = await db
        .from('formation_study_cycles')
        .select('id')
        .eq('status', 'active')
        .eq('route_id', payload.route_id)
        .order('starts_on', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()
      if (cycleError) throw cycleError
      if (!activeStudyCycle) throw new Error('No hay un ciclo en curso para esta ruta.')
      const { data: cycleModule, error: moduleError } = await db.from('formation_study_cycle_modules')
        .select('module_id').eq('study_cycle_id', activeStudyCycle.id).eq('module_id', payload.module_id).maybeSingle()
      if (moduleError) throw moduleError
      if (!cycleModule) throw new Error('El manual no pertenece al ciclo en curso.')
      let created = 0
      let skipped = 0
      let failed = 0

      for (const personId of payload.person_ids) {
        try {
          const { data: existing, error: findError } = await db
            .from('formation_enrollments')
            .select('id')
            .eq('person_id', personId)
            .eq('route_id', payload.route_id)
            .maybeSingle()
          if (findError) throw findError

          let enrollmentId = existing?.id
          if (enrollmentId) {
            const { data: activeAttempt, error: activeError } = await db
              .from('formation_module_enrollments')
              .select('id')
              .eq('enrollment_id', enrollmentId)
              .eq('module_id', payload.module_id)
              .eq('status', 'in_progress')
              .maybeSingle()
            if (activeError) throw activeError
            if (activeAttempt) {
              skipped += 1
              continue
            }

            const { error: updateError } = await db
              .from('formation_enrollments')
              .update({ status: 'active', current_module_id: payload.module_id })
              .eq('id', enrollmentId)
            if (updateError) throw updateError
          } else {
            const { data: newEnrollment, error: createError } = await db
              .from('formation_enrollments')
              .insert({
                person_id: personId,
                route_id: payload.route_id,
                status: 'active',
                current_module_id: payload.module_id,
              })
              .select('id')
              .single()
            if (createError) throw createError
            enrollmentId = newEnrollment.id
          }

          const { error } = await db.from('formation_module_enrollments').insert({
            enrollment_id: enrollmentId,
            module_id: payload.module_id,
            study_cycle_id: activeStudyCycle.id,
            enrollment_type: payload.enrollment_type,
            status: 'in_progress',
          })
          if (error) throw error
          created += 1
        } catch {
          failed += 1
        }
      }

      if (created === 0 && failed > 0) throw new Error('No se pudo registrar ninguna inscripción.')
      return { created, skipped, failed }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['module-enrollments'] })
    },
  })
}

export function useUpdateModuleEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; enrollment_type: 'standard' | 'repeat' | 'reinforcement' }) => {
      const { error } = await db
        .from('formation_module_enrollments')
        .update({ enrollment_type: payload.enrollment_type })
        .eq('id', payload.id)
        .eq('status', 'in_progress')
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['module-enrollments'] }),
  })
}

export function useWithdrawModuleEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; enrollment_id: string }) => {
      const { error } = await db
        .from('formation_module_enrollments')
        .update({ status: 'withdrawn', completed_at: null })
        .eq('id', payload.id)
        .eq('status', 'in_progress')
      if (error) throw error

      const { data: remaining, error: remainingError } = await db
        .from('formation_module_enrollments')
        .select('module_id')
        .eq('enrollment_id', payload.enrollment_id)
        .eq('status', 'in_progress')
        .order('enrolled_at', { ascending: false })
        .limit(1)
      if (remainingError) throw remainingError

      const { error: enrollmentError } = await db
        .from('formation_enrollments')
        .update({ current_module_id: remaining?.[0]?.module_id ?? null })
        .eq('id', payload.enrollment_id)
      if (enrollmentError) throw enrollmentError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['local-enrollments'] })
    },
  })
}

export function useEvaluateModuleEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id: string
      enrollment_id: string
      module_id: string
      final_grade: string
      final_result: 'approved' | 'reinforcement'
      evaluated_at: string
      evaluation_notes: string | null
    }) => {
      const approved = payload.final_result === 'approved'
      const { error: attemptError } = await db
        .from('formation_module_enrollments')
        .update({
          final_grade: payload.final_grade,
          final_result: payload.final_result,
          evaluated_at: payload.evaluated_at,
          evaluation_notes: payload.evaluation_notes,
          status: approved ? 'completed' : 'in_progress',
          completed_at: approved ? payload.evaluated_at : null,
        })
        .eq('id', payload.id)
      if (attemptError) throw attemptError

      if (!approved) return

      const { data: summary, error: summaryError } = await db
        .from('formation_module_progress')
        .select('id')
        .eq('enrollment_id', payload.enrollment_id)
        .eq('module_id', payload.module_id)
        .maybeSingle()
      if (summaryError) throw summaryError

      if (summary?.id) {
        const { error } = await db
          .from('formation_module_progress')
          .update({ status: 'completed' })
          .eq('id', summary.id)
        if (error) throw error
      } else {
        const { error } = await db.from('formation_module_progress').insert({
          enrollment_id: payload.enrollment_id,
          module_id: payload.module_id,
          status: 'completed',
          observed_at: payload.evaluated_at,
        })
        if (error) throw error
      }

      const { data: remaining, error: remainingError } = await db
        .from('formation_module_enrollments')
        .select('module_id')
        .eq('enrollment_id', payload.enrollment_id)
        .eq('status', 'in_progress')
        .order('enrolled_at', { ascending: false })
        .limit(1)
      if (remainingError) throw remainingError

      const { error: enrollmentError } = await db
        .from('formation_enrollments')
        .update({ current_module_id: remaining?.[0]?.module_id ?? null })
        .eq('id', payload.enrollment_id)
      if (enrollmentError) throw enrollmentError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['module-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['historical-module-completions'] })
    },
  })
}

export function useRegisterHistoricalCompletion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      person_id: string
      route_id: string
      module_id: string
      observed_at: string | null
      notes: string | null
      historical_grade: string | null
      validation_score: string | null
      validation_result: 'validated' | 'reinforcement' | 'accompaniment' | null
      validation_date: string | null
      validation_notes: string | null
    }) => {
      const { data: existing, error: findError } = await db
        .from('formation_enrollments')
        .select('id')
        .eq('person_id', payload.person_id)
        .eq('route_id', payload.route_id)
        .maybeSingle()
      if (findError) throw findError

      let enrollmentId = existing?.id
      if (!enrollmentId) {
        const { data: created, error: createError } = await db
          .from('formation_enrollments')
          .insert({ person_id: payload.person_id, route_id: payload.route_id, status: 'paused', current_module_id: null, notes: 'Tiene formación previa registrada.' })
          .select('id')
          .single()
        if (createError) throw createError
        enrollmentId = created.id
      }

      const { error } = await db.from('formation_module_progress').upsert({
        enrollment_id: enrollmentId,
        module_id: payload.module_id,
        status: 'completed',
        observed_at: payload.observed_at || null,
        notes: payload.notes || null,
        historical_grade: payload.historical_grade || null,
        validation_score: payload.validation_score || null,
        validation_result: payload.validation_result,
        validation_date: payload.validation_date || null,
        validation_notes: payload.validation_notes || null,
      }, { onConflict: 'enrollment_id,module_id' })
      if (error) throw error

      const { data: historicalAttempt, error: historicalFindError } = await db
        .from('formation_module_enrollments')
        .select('id')
        .eq('enrollment_id', enrollmentId)
        .eq('module_id', payload.module_id)
        .eq('enrollment_type', 'historical')
        .maybeSingle()
      if (historicalFindError) throw historicalFindError

      const historicalValues = {
        status: 'completed',
        enrolled_at: payload.observed_at || new Date().toISOString().slice(0, 10),
        completed_at: payload.observed_at || null,
        notes: payload.notes || null,
      }

      if (historicalAttempt?.id) {
        const { error: historicalUpdateError } = await db
          .from('formation_module_enrollments')
          .update(historicalValues)
          .eq('id', historicalAttempt.id)
        if (historicalUpdateError) throw historicalUpdateError
      } else {
        const { error: historicalInsertError } = await db
          .from('formation_module_enrollments')
          .insert({
            enrollment_id: enrollmentId,
            module_id: payload.module_id,
            enrollment_type: 'historical',
            ...historicalValues,
          })
        if (historicalInsertError) throw historicalInsertError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['historical-module-completions'] })
      queryClient.invalidateQueries({ queryKey: ['module-enrollments'] })
    },
  })
}

export function useLocalRoute() {
  const { data: activeCycle } = useActiveStudyCycle()
  return useQuery({
    queryKey: ['local-formation-route', activeCycle?.route_id],
    enabled: Boolean(activeCycle?.route_id),
    queryFn: async () => {
      const { data, error } = await db.from('formation_routes')
        .select('id,key,name,version')
        .eq('id', activeCycle!.route_id)
        .single()
      if (error) throw error
      return data as { id: string; key: string; name: string; version: string }
    },
  })
}