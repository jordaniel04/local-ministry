import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const db = supabase as any

type Session = { id: string; title: string; session_date: string }
type Attendance = { session_id: string; person_id: string; status: string }
type Leader = { person_id: string; assigned_at: string }
type Enrollment = {
  status: string
  enrollment_type: string
  enrolled_at: string
  completed_at: string | null
  formation_enrollments: { person_id: string; people: { person_type: string } | null } | null
}

async function allRows<T>(makeQuery: (from: number, to: number) => any): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await makeQuery(from, from + 999)
    if (error) throw error
    rows.push(...((data ?? []) as T[]))
    if (!data || data.length < 1000) return rows
  }
}

export function quarterBounds(year: number, quarter: number) {
  const start = `${year}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01`
  const endYear = quarter === 4 ? year + 1 : year
  const endMonth = quarter === 4 ? 1 : quarter * 3 + 1
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`
  return { start, end }
}

export function useQuarterlyReport(year: number, quarter: number) {
  return useQuery({
    queryKey: ['quarterly-report', year, quarter],
    queryFn: async () => {
      const { start, end } = quarterBounds(year, quarter)
      const [sessions, enrollments, leaders] = await Promise.all([
        allRows<Session>((from, to) => db.from('class_sessions').select('id,title,session_date').gte('session_date', start).lt('session_date', end).order('session_date').order('id').range(from, to)),
        allRows<Enrollment>((from, to) => db.from('formation_module_enrollments').select('status,enrollment_type,enrolled_at,completed_at,formation_enrollments!inner(person_id,people(person_type))').lt('enrolled_at', end).order('enrolled_at').order('id').range(from, to)),
        allRows<Leader>((from, to) => db.from('leader_ministries').select('person_id,assigned_at').lt('assigned_at', `${end}T00:00:00Z`).order('assigned_at').order('id').range(from, to)),
      ])

      const trainees = new Map<string, string>()
      for (const enrollment of enrollments) {
        if (enrollment.enrollment_type === 'historical' || enrollment.status === 'withdrawn' || enrollment.status === 'paused') continue
        if (enrollment.completed_at && enrollment.completed_at < start) continue
        const person = enrollment.formation_enrollments
        if (person?.people) trainees.set(person.person_id, person.people.person_type)
      }

      // Las sesiones carecen de tipo formal. Solo se incluyen las tituladas como culto de EsLider.
      const today = new Date()
      const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const services = sessions.filter((session) => session.session_date <= todayLocal && /culto/i.test(session.title) && /es\s*lider/i.test(session.title))
      const leaderIds = new Set(leaders.map((leader) => leader.person_id))
      let averageLeaders: number | null = null
      let servicesWithoutAttendance: Session[] = []
      if (services.length > 0) {
        const serviceIds = services.map((service) => service.id)
        const attendance: Attendance[] = []
        for (let index = 0; index < serviceIds.length; index += 100) {
          const ids = serviceIds.slice(index, index + 100)
          attendance.push(...await allRows<Attendance>((from, to) => db.from('attendance').select('session_id,person_id,status').in('session_id', ids).order('id').range(from, to)))
        }
        const recordedIds = new Set(attendance.map((record) => record.session_id))
        servicesWithoutAttendance = services.filter((service) => !recordedIds.has(service.id))
        const attended = new Set(attendance.filter((record) => leaderIds.has(record.person_id) && (record.status === 'present' || record.status === 'late')).map((record) => `${record.session_id}:${record.person_id}`))
        averageLeaders = attended.size / services.length
      }

      return {
        members: [...trainees.values()].filter((type) => type === 'member').length,
        believers: [...trainees.values()].filter((type) => type === 'believer').length,
        services: services.length,
        averageLeaders,
        servicesWithoutAttendance,
      }
    },
  })
}
