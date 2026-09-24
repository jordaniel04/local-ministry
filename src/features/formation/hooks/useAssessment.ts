import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const db = supabase as any

export type AssessmentPlan = {
  id: string
  module_id: string
  name: string
  scale_max: number
  passing_score: number
  recovery_rule: 'manual' | 'replace_final' | 'replace_lowest' | 'average'
  is_active: boolean
  formation_modules: { name: string } | null
}

export type AssessmentComponent = {
  id: string
  plan_id: string
  component_key: string
  name: string
  weight: number
  order_index: number
  is_active: boolean
}

export function useAssessmentPlans() {
  return useQuery({
    queryKey: ['assessment-plans'],
    queryFn: async (): Promise<AssessmentPlan[]> => {
      const { data, error } = await db
        .from('formation_assessment_plans')
        .select('id,module_id,name,scale_max,passing_score,recovery_rule,is_active,formation_modules(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAssessmentComponents(planId: string) {
  return useQuery({
    queryKey: ['assessment-components', planId],
    enabled: Boolean(planId),
    queryFn: async (): Promise<AssessmentComponent[]> => {
      const { data, error } = await db
        .from('formation_assessment_components')
        .select('id,plan_id,component_key,name,weight,order_index,is_active')
        .eq('plan_id', planId)
        .order('order_index')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateAssessmentPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Omit<AssessmentPlan, 'id' | 'formation_modules' | 'is_active'>) => {
      const { data, error } = await db.from('formation_assessment_plans').insert(values).select().single()
      if (error) throw error
      return data as AssessmentPlan
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessment-plans'] }),
  })
}

export function useUpdateAssessmentPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Pick<AssessmentPlan, 'id' | 'scale_max' | 'passing_score' | 'recovery_rule'>) => {
      const { id, ...updates } = values
      const { error } = await db.from('formation_assessment_plans').update(updates).eq('id', id)
      if (error) throw error
      return values
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessment-plans'] }),
  })
}

export function useAddAssessmentComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Omit<AssessmentComponent, 'id' | 'is_active'>) => {
      const { data, error } = await db.from('formation_assessment_components').insert(values).select().single()
      if (error) throw error
      return data as AssessmentComponent
    },
    onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ['assessment-components', values.plan_id] }),
  })
}

export function useDeleteAssessmentComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await db.from('formation_assessment_components').delete().eq('id', id)
      if (error) throw error
      return planId
    },
    onSuccess: (planId) => queryClient.invalidateQueries({ queryKey: ['assessment-components', planId] }),
  })
}

export function useUpdateAssessmentComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Pick<AssessmentComponent, 'id' | 'plan_id' | 'name' | 'weight'>) => {
      const { id, plan_id, ...updates } = values
      const { error } = await db.from('formation_assessment_components').update(updates).eq('id', id)
      if (error) throw error
      return plan_id
    },
    onSuccess: (planId) => queryClient.invalidateQueries({ queryKey: ['assessment-components', planId] }),
  })
}

export function useReorderAssessmentComponents() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { planId: string; componentIds: string[] }) => {
      for (const [index, id] of values.componentIds.entries()) {
        const { error } = await db.from('formation_assessment_components').update({ order_index: index + 1 }).eq('id', id)
        if (error) throw error
      }
      return values.planId
    },
    onSuccess: (planId) => queryClient.invalidateQueries({ queryKey: ['assessment-components', planId] }),
  })
}

export type AssessmentItem = {
  id: string
  component_id: string
  title: string
  assessed_at: string | null
  max_score: number
  notes: string | null
  is_active: boolean
}

export function useAssessmentItems(componentIds: string[]) {
  const ids = [...componentIds].sort()
  return useQuery({
    queryKey: ['assessment-items', ids],
    enabled: ids.length > 0,
    queryFn: async (): Promise<AssessmentItem[]> => {
      const { data, error } = await db
        .from('formation_assessment_items')
        .select('id,component_id,title,assessed_at,max_score,notes,is_active')
        .in('component_id', ids)
        .eq('is_active', true)
        .order('assessed_at', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export type AssessmentScore = {
  id: string
  item_id: string
  module_enrollment_id: string
  score: number
  feedback: string | null
}

export function useAssessmentScores(itemId: string) {
  return useQuery({
    queryKey: ['assessment-scores', itemId],
    enabled: Boolean(itemId),
    queryFn: async (): Promise<AssessmentScore[]> => {
      const { data, error } = await db
        .from('formation_assessment_scores')
        .select('id,item_id,module_enrollment_id,score,feedback')
        .eq('item_id', itemId)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAssessmentScoresForItems(itemIds: string[]) {
  const ids = [...itemIds].sort()
  return useQuery({
    queryKey: ['assessment-scores-for-items', ids],
    enabled: ids.length > 0,
    queryFn: async (): Promise<AssessmentScore[]> => {
      const { data, error } = await db
        .from('formation_assessment_scores')
        .select('id,item_id,module_enrollment_id,score,feedback')
        .in('item_id', ids)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateAssessmentItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Omit<AssessmentItem, 'id' | 'is_active'>) => {
      const { data, error } = await db.from('formation_assessment_items').insert(values).select().single()
      if (error) throw error
      return data as AssessmentItem
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessment-items'] }),
  })
}

export function useUpsertAssessmentScore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { item_id: string; module_enrollment_id: string; score: number; feedback?: string | null }) => {
      const { error } = await db.from('formation_assessment_scores').upsert(values, {
        onConflict: 'item_id,module_enrollment_id',
      })
      if (error) throw error
      return values.item_id
    },
    onSuccess: (itemId) => queryClient.invalidateQueries({ queryKey: ['assessment-scores', itemId] }),
  })
}

export type Exposition = {
  id: string
  module_id: string
  cycle_id: string | null
  study_cycle_id: string | null
  group_name: string
  title: string | null
  planned_at: string | null
  presented_at: string | null
  status: 'planned' | 'prepared' | 'presented' | 'reinforcement'
  outline_received: boolean
  group_feedback: string | null
  group_score: number | null
  rubric_scores: Record<string, number> | null
  group_observations: string | null
  objective: string | null
  biblical_texts: string | null
  central_ideas: string | null
  application: string | null
  group_question: string | null
}

export type FormationCycle = {
  id: string
  route_id: string | null
  module_id: string
  name: string
  starts_on: string | null
  ends_on: string | null
  status: 'active' | 'closed' | 'paused'
}

export function useModuleCycles(moduleId: string) {
  return useQuery({
    queryKey: ['formation-module-cycles', moduleId],
    enabled: Boolean(moduleId),
    queryFn: async (): Promise<FormationCycle[]> => {
      const { data, error } = await db
        .from('formation_module_cycles')
        .select('id,route_id,module_id,name,starts_on,ends_on,status')
        .eq('module_id', moduleId)
        .eq('status', 'active')
        .order('starts_on', { ascending: false, nullsFirst: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateModuleCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { route_id: string | null; module_id: string; name: string; starts_on: string | null }) => {
      const { data, error } = await db.from('formation_module_cycles').insert(values).select().single()
      if (error) throw error
      return data as FormationCycle
    },
    onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ['formation-module-cycles', values.module_id] }),
  })
}

export type ExpositionMember = {
  exposition_id: string
  module_enrollment_id: string
  assigned_part: string | null
  strength: string | null
  reinforcement: string | null
  next_step: string | null
  formation_module_enrollments: {
    formation_enrollments: { people: { first_name: string; last_name: string } | null } | null
  } | null
}

export type ExpositionRubricItem = {
  id: string
  exposition_id: string
  scope: 'group' | 'individual'
  criterion: string
  max_score: number
  order_index: number
}

export type ExpositionScore = {
  id: string
  rubric_item_id: string
  module_enrollment_id: string | null
  score: number
  feedback: string | null
}

export function useExpositions(moduleId: string) {
  return useQuery({
    queryKey: ['formation-expositions', moduleId],
    enabled: Boolean(moduleId),
    queryFn: async (): Promise<Exposition[]> => {
      const { data, error } = await db
        .from('formation_expositions')
        .select('id,module_id,cycle_id,study_cycle_id,group_name,title,planned_at,presented_at,status,outline_received,group_feedback,group_score,rubric_scores,group_observations,objective,biblical_texts,central_ideas,application,group_question')
        .eq('module_id', moduleId)
        .order('planned_at', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useExpositionMembers(expositionId: string) {
  return useQuery({
    queryKey: ['formation-exposition-members', expositionId],
    enabled: Boolean(expositionId),
    queryFn: async (): Promise<ExpositionMember[]> => {
      const { data, error } = await db
        .from('formation_exposition_members')
        .select('exposition_id,module_enrollment_id,assigned_part,strength,reinforcement,next_step,formation_module_enrollments!inner(formation_enrollments!inner(people(first_name,last_name)))')
        .eq('exposition_id', expositionId)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useExpositionRubricItems(expositionId: string) {
  return useQuery({
    queryKey: ['formation-exposition-rubric', expositionId],
    enabled: Boolean(expositionId),
    queryFn: async (): Promise<ExpositionRubricItem[]> => {
      const { data, error } = await db
        .from('formation_exposition_rubric_items')
        .select('id,exposition_id,scope,criterion,max_score,order_index')
        .eq('exposition_id', expositionId)
        .order('scope')
        .order('order_index')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useExpositionScores(rubricItemIds: string[]) {
  const ids = [...rubricItemIds].sort()
  return useQuery({
    queryKey: ['formation-exposition-scores', ids],
    enabled: ids.length > 0,
    queryFn: async (): Promise<ExpositionScore[]> => {
      const { data, error } = await db
        .from('formation_exposition_scores')
        .select('id,rubric_item_id,module_enrollment_id,score,feedback')
        .in('rubric_item_id', ids)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateExposition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: {
      module_id: string
      cycle_id: string
      study_cycle_id: string
      group_name: string
      title: string | null
      planned_at: string | null
      member_ids: string[]
    }) => {
      const { member_ids, ...exposition } = values
      const { data: created, error } = await db.from('formation_expositions').insert(exposition).select().single()
      if (error) throw error
      const expositionId = created.id as string
      const { error: membersError } = await (member_ids.length > 0
        ? db.from('formation_exposition_members').insert(member_ids.map((module_enrollment_id) => ({ exposition_id: expositionId, module_enrollment_id })))
        : Promise.resolve({ error: null }))
      if (membersError) throw membersError
      const { error: cycleMembersError } = await db
        .from('formation_module_cycle_members')
        .upsert(member_ids.map((module_enrollment_id) => ({ cycle_id: exposition.cycle_id, module_enrollment_id })), { onConflict: 'cycle_id,module_enrollment_id' })
      if (cycleMembersError) throw cycleMembersError
      return created as Exposition
    },
    onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ['formation-expositions', values.module_id] }),
  })
}

export function useUpdateExpositionMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Pick<ExpositionMember, 'exposition_id' | 'module_enrollment_id' | 'assigned_part' | 'strength' | 'reinforcement' | 'next_step'>) => {
      const { exposition_id, module_enrollment_id, ...updates } = values
      const { error } = await db
        .from('formation_exposition_members')
        .update(updates)
        .eq('exposition_id', exposition_id)
        .eq('module_enrollment_id', module_enrollment_id)
      if (error) throw error
      return exposition_id
    },
    onSuccess: (expositionId) => queryClient.invalidateQueries({ queryKey: ['formation-exposition-members', expositionId] }),
  })
}

export function useUpdateExposition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Partial<Exposition> & { id: string }) => {
      const { id, ...updates } = values
      const { error } = await db.from('formation_expositions').update(updates).eq('id', id)
      if (error) throw error
      return values
    },
    onSuccess: (values) => queryClient.invalidateQueries({ queryKey: ['formation-expositions', values.module_id] }),
  })
}

export function useUpsertExpositionScore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { rubric_item_id: string; module_enrollment_id: string | null; score: number }) => {
      let query = db.from('formation_exposition_scores').select('id').eq('rubric_item_id', values.rubric_item_id)
      query = values.module_enrollment_id === null ? query.is('module_enrollment_id', null) : query.eq('module_enrollment_id', values.module_enrollment_id)
      const { data: existing, error: findError } = await query.maybeSingle()
      if (findError) throw findError
      const result = existing?.id
        ? await db.from('formation_exposition_scores').update({ score: values.score }).eq('id', existing.id)
        : await db.from('formation_exposition_scores').insert(values)
      if (result.error) throw result.error
      return values.rubric_item_id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-exposition-scores'] }),
  })
}
