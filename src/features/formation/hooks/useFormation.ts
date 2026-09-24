import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  FormationModuleInsert,
  FormationModuleUpdate,
  FormationLessonInsert,
  FormationLessonUpdate,
  ModuleWithLessons,
  ModuleWithProgress,
  LessonWithProgress,
  LessonProgressInsert,
  LessonProgressUpdate,
  PersonProgressSummary,
} from '../types'
import { matchesOfficialModule, OFFICIAL_ROUTE_MODULES } from '../officialRoute'

// ─── Módulos ────────────────────────────────────────────────────────────────

export function useModules() {
  return useQuery({
    queryKey: ['formation-modules'],
    queryFn: async (): Promise<ModuleWithLessons[]> => {
      const { data, error } = await supabase
        .from('formation_modules')
        .select('*, formation_lessons(*)')
        .order('order_index')
      if (error) throw error
      return (data ?? []).map((m) => ({
        ...m,
        formation_lessons: (m.formation_lessons ?? []).sort(
          (a, b) => a.order_index - b.order_index
        ),
      }))
    },
  })
}

export function useCreateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { module: FormationModuleInsert; routeId: string; routeOrderIndex: number }) => {
      const { data, error } = await (supabase as any).rpc('create_formation_module_for_route', {
        p_route_id: values.routeId,
        p_name: values.module.name,
        p_description: values.module.description ?? null,
        p_order_index: values.module.order_index,
        p_route_order_index: values.routeOrderIndex,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] })
      queryClient.invalidateQueries({ queryKey: ['formation-route-modules'] })
    },
  })
}
export function useUpdateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: FormationModuleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('formation_modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] })
      queryClient.invalidateQueries({ queryKey: ['formation-route-modules'] })
    },
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formation_modules').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] })
      queryClient.invalidateQueries({ queryKey: ['formation-route-modules'] })
    },
  })
}

// ─── Lecciones ───────────────────────────────────────────────────────────────

export function useCreateLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (lesson: FormationLessonInsert) => {
      const { data, error } = await supabase
        .from('formation_lessons')
        .insert(lesson)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] })
      queryClient.invalidateQueries({ queryKey: ['formation-route-modules'] })
    },
  })
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: FormationLessonUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('formation_lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] })
      queryClient.invalidateQueries({ queryKey: ['formation-route-modules'] })
    },
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formation_lessons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] })
      queryClient.invalidateQueries({ queryKey: ['formation-route-modules'] })
    },
  })
}

// ─── Progreso por persona ─────────────────────────────────────────────────────

export function usePersonProgress(personId: string, moduleIds: string[]) {
  const orderedModuleIds = [...moduleIds]
  return useQuery({
    queryKey: ['formation-progress', personId, orderedModuleIds],
    enabled: Boolean(personId) && orderedModuleIds.length > 0,
    queryFn: async (): Promise<ModuleWithProgress[]> => {
      // Traer módulos + lecciones
      const { data: modules, error: modError } = await supabase
        .from('formation_modules')
        .select('*, formation_lessons(*)')
        .eq('is_active', true)
        .in('id', orderedModuleIds)
      if (modError) throw modError

      // Traer progreso de esta persona
      const { data: progress, error: progError } = await supabase
        .from('person_lesson_progress')
        .select('*')
        .eq('person_id', personId)
      if (progError) throw progError

      const progressMap = new Map(
        (progress ?? []).map((p) => [p.lesson_id, p])
      )

      return orderedModuleIds.flatMap((moduleId) => {
        const m = modules?.find((item) => item.id === moduleId)
        if (!m) return []
        const lessons: LessonWithProgress[] = (m.formation_lessons ?? [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((l) => ({
            ...l,
            progress: progressMap.get(l.id) ?? null,
          }))

        const completed = lessons.filter((l) => l.progress?.completed).length
        const scores = lessons
          .map((l) => l.progress?.score)
          .filter((s): s is number => s != null)
        const avg = scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null

        return [{
          ...m,
          formation_lessons: m.formation_lessons ?? [],
          lessons,
          completedCount: completed,
          totalCount: lessons.length,
          averageScore: avg,
        }]
      })
    },
  })
}

export function useAddMissingOfficialModules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: { existingModules: ModuleWithLessons[]; routeId: string }) => {
      const existingModules = values.existingModules
      const missingModules = OFFICIAL_ROUTE_MODULES.filter((official) =>
        !existingModules.some((module) => matchesOfficialModule(module.name, official))
      )

      for (const official of OFFICIAL_ROUTE_MODULES) {
        const existingModule = existingModules.find((module) =>
          matchesOfficialModule(module.name, official)
        )
        if (!existingModule || existingModule.order_index === official.orderIndex) continue

        const { error: orderError } = await supabase
          .from('formation_modules')
          .update({ order_index: official.orderIndex })
          .eq('id', existingModule.id)
        if (orderError) throw orderError
      }

      if (missingModules.length === 0) return []

      const created = []
      for (const module of missingModules) {
        const { data, error } = await (supabase as any).rpc('create_formation_module_for_route', {
          p_route_id: values.routeId,
          p_name: module.name,
          p_description: module.description,
          p_order_index: module.orderIndex,
          p_route_order_index: module.orderIndex,
        })
        if (error) throw error
        created.push(data)
      }
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] })
      queryClient.invalidateQueries({ queryKey: ['formation-route-modules'] })
    },
  })
}

export function useAllPeopleProgress(personIds: string[], moduleIds: string[]) {
  const sortedPersonIds = [...personIds].sort()
  const orderedModuleIds = [...moduleIds]

  return useQuery({
    queryKey: ['formation-progress-summary', sortedPersonIds, orderedModuleIds],
    enabled: sortedPersonIds.length > 0 && orderedModuleIds.length > 0,
    queryFn: async (): Promise<PersonProgressSummary[]> => {
      const { data: modules, error: modulesError } = await supabase
        .from('formation_modules')
        .select('*, formation_lessons(*)')
        .eq('is_active', true)
        .in('id', orderedModuleIds)
      if (modulesError) throw modulesError

      const { data: progress, error: progressError } = await supabase
        .from('person_lesson_progress')
        .select('person_id, lesson_id, completed')
        .in('person_id', sortedPersonIds)
      if (progressError) throw progressError

      const orderedModules = orderedModuleIds.flatMap((moduleId) => {
        const module = modules?.find((item) => item.id === moduleId)
        return module ? [{
          ...module,
          formation_lessons: (module.formation_lessons ?? []).sort((a, b) => a.order_index - b.order_index),
        }] : []
      })
      const totalCount = orderedModules.reduce(
        (total, module) => total + module.formation_lessons.length,
        0
      )
      const activeLessonIds = new Set(
        orderedModules.flatMap((module) =>
          module.formation_lessons.map((lesson) => lesson.id)
        )
      )
      const completedByPerson = new Map<string, Set<string>>()

      for (const item of progress ?? []) {
        if (!item.completed || !activeLessonIds.has(item.lesson_id)) continue
        const completedLessons = completedByPerson.get(item.person_id) ?? new Set<string>()
        completedLessons.add(item.lesson_id)
        completedByPerson.set(item.person_id, completedLessons)
      }

      return sortedPersonIds.map((personId) => {
        const completedLessons = completedByPerson.get(personId) ?? new Set<string>()
        const completedCount = completedLessons.size
        const currentModule = orderedModules.find((module) =>
          module.formation_lessons.some((lesson) => !completedLessons.has(lesson.id))
        )
        const completedRoute = totalCount > 0 && completedCount >= totalCount

        return {
          personId,
          completedCount,
          totalCount,
          progressPercentage: totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0,
          currentModuleId: currentModule?.id ?? null,
          currentModuleName: completedRoute
            ? 'Ruta completada'
            : currentModule?.name ?? 'Sin módulos activos',
          completedRoute,
        }
      })
    },
  })
}

export function useSaveLessonProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: LessonProgressInsert & { id?: string }
    ) => {
      if (payload.id) {
        const { id, ...updates } = payload
        const { error } = await supabase
          .from('person_lesson_progress')
          .update(updates as LessonProgressUpdate)
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('person_lesson_progress')
          .insert(payload)
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['formation-progress', variables.person_id] })
      queryClient.invalidateQueries({ queryKey: ['formation-progress-summary'] })
    },
  })
}
