import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePeopleStats() {
  return useQuery({
    queryKey: ['dashboard-people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('person_type, is_active')
      if (error) throw error
      const active = data.filter((p) => p.is_active)
      return {
        total: active.length,
        members: active.filter((p) => p.person_type === 'member').length,
        believers: active.filter((p) => p.person_type === 'believer').length,
        visitors: active.filter((p) => p.person_type === 'visitor').length,
      }
    },
  })
}

export function useTasksStats() {
  return useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('tasks')
        .select('status, due_date, updated_at')
      if (error) throw error

      return {
        pending: data.filter((t) => t.status === 'pending').length,
        overdue: data.filter(
          (t) => t.status !== 'done' && t.due_date && t.due_date < today
        ).length,
        doneThisWeek: data.filter(
          (t) => t.status === 'done' && t.updated_at >= weekAgo
        ).length,
      }
    },
  })
}

export function useFormationStats() {
  return useQuery({
    queryKey: ['dashboard-formation'],
    queryFn: async () => {
      const { data: people, error: pe } = await supabase
        .from('people')
        .select('id')
        .eq('is_active', true)
      if (pe) throw pe

      const { data: progress, error: pre } = await supabase
        .from('person_lesson_progress')
        .select('person_id, score')
        .eq('completed', true)
      if (pre) throw pre

      const peopleWithProgress = new Set(progress?.map((p) => p.person_id))
      const noProgress = (people ?? []).filter((p) => !peopleWithProgress.has(p.id)).length

      const scores = (progress ?? []).map((p) => p.score).filter((s): s is number => s != null)
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
        : null

      return { noProgress, avgScore, totalWithProgress: peopleWithProgress.size }
    },
  })
}

export function useLastAttendance() {
  return useQuery({
    queryKey: ['dashboard-attendance'],
    queryFn: async () => {
      const { data: sessions, error: se } = await supabase
        .from('class_sessions')
        .select('id, title, session_date')
        .order('session_date', { ascending: false })
        .limit(1)
      if (se) throw se
      if (!sessions || sessions.length === 0) return null

      const session = sessions[0]
      const { data: attendance, error: ae } = await supabase
        .from('attendance')
        .select('status')
        .eq('session_id', session.id)
      if (ae) throw ae

      const present = (attendance ?? []).filter((a) => a.status === 'present').length
      const total = (attendance ?? []).length

      return { title: session.title, date: session.session_date, present, total }
    },
  })
}

export function useLeaderAlerts() {
  return useQuery({
    queryKey: ['dashboard-leaders'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      // Líderes: personas con al menos un ministerio asignado
      const { data: leaders, error: le } = await supabase
        .from('leader_ministries')
        .select('person_id, people(first_name, last_name)')
      if (le) throw le

      const { data: sessions, error: se } = await supabase
        .from('leader_sessions')
        .select('leader_id, session_date')
        .gte('session_date', thirtyDaysAgo)
      if (se) throw se

      const leadersWithRecentSession = new Set(sessions?.map((s) => s.leader_id))

      // Deduplica líderes (uno puede liderar varios ministerios)
      const uniqueLeaders = new Map(
        (leaders ?? []).map((l) => [l.person_id, l.people])
      )

      const withoutSession = [...uniqueLeaders.entries()]
        .filter(([id]) => !leadersWithRecentSession.has(id))
        .map(([, person]) => person as { first_name: string; last_name: string } | null)
        .filter(Boolean)

      return { total: uniqueLeaders.size, withoutSession }
    },
  })
}
