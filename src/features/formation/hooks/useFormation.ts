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
} from '../types'

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
    mutationFn: async (module: FormationModuleInsert) => {
      const { data, error } = await supabase
        .from('formation_modules')
        .insert(module)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-modules'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-modules'] }),
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formation_modules').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-modules'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-modules'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-modules'] }),
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formation_lessons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-modules'] }),
  })
}

// ─── Progreso por persona ─────────────────────────────────────────────────────

export function usePersonProgress(personId: string) {
  return useQuery({
    queryKey: ['formation-progress', personId],
    enabled: !!personId,
    queryFn: async (): Promise<ModuleWithProgress[]> => {
      // Traer módulos + lecciones
      const { data: modules, error: modError } = await supabase
        .from('formation_modules')
        .select('*, formation_lessons(*)')
        .eq('is_active', true)
        .order('order_index')
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

      return (modules ?? []).map((m) => {
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

        return {
          ...m,
          formation_lessons: m.formation_lessons ?? [],
          lessons,
          completedCount: completed,
          totalCount: lessons.length,
          averageScore: avg,
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
      queryClient.invalidateQueries({
        queryKey: ['formation-progress', variables.person_id],
      })
    },
  })
}
