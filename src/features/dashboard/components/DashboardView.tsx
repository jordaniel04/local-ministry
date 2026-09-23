import { ArrowRight, BookOpen, CalendarCheck, CheckCircle2, HeartHandshake, Users, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFormationStats, useLastAttendance, useLeaderAlerts, usePeopleStats, useTasksStats } from '../hooks/useDashboard'

function LoadingCard() {
  return <div className="h-28 animate-pulse rounded-2xl border bg-muted" />
}

function ActionCard({ to, title, description, count, icon: Icon, tone = 'default' }: { to: string; title: string; description: string; count?: number; icon: LucideIcon; tone?: 'default' | 'warning' }) {
  return <Link to={to} className={`group flex min-h-32 flex-col rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${tone === 'warning' ? 'border-amber-500/30 bg-amber-500/5' : 'bg-card hover:border-primary/40'}`}><div className="flex items-start justify-between gap-3"><span className={`flex size-9 items-center justify-center rounded-xl ${tone === 'warning' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-primary/10 text-primary'}`}><Icon className="size-4" /></span>{count !== undefined && <span className="text-2xl font-bold tabular-nums">{count}</span>}</div><p className="mt-3 font-semibold">{title}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p><span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-primary">Abrir <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span></Link>
}

export function DashboardView() {
  const people = usePeopleStats()
  const tasks = useTasksStats()
  const formation = useFormationStats()
  const attendance = useLastAttendance()
  const leaders = useLeaderAlerts()
  const loading = people.isLoading || tasks.isLoading || formation.isLoading || attendance.isLoading || leaders.isLoading
  const withoutSession = leaders.data?.withoutSession ?? []

  if (loading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><LoadingCard /><LoadingCard /><LoadingCard /></div>

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4"><h2 className="font-semibold">Trabajo de la semana</h2><p className="mt-1 text-sm text-muted-foreground">Accede primero a los registros que usarás durante la semana.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ActionCard to="/attendance" title={attendance.data ? 'Registrar asistencia' : 'Crear primera sesión'} description={attendance.data ? `Última sesión: ${attendance.data.title} · ${attendance.data.attendees} asistentes registrados.` : 'Aún no hay sesiones realizadas. Crea la primera cuando corresponda.'} icon={CalendarCheck} />
          <ActionCard to="/formation?section=evaluation&view=gradebook" title="Notas de formación" count={formation.data?.activeModuleEnrollments ?? 0} description="Abre el cuaderno para registrar o completar las notas de los manuales en curso." icon={BookOpen} />
          <ActionCard to="/leader-tracking" title="Seguimiento de líderes" count={withoutSession.length} description={withoutSession.length ? 'Líderes sin una sesión registrada en los últimos 30 días.' : 'Todos los líderes tienen una sesión reciente registrada.'} icon={HeartHandshake} tone={withoutSession.length ? 'warning' : 'default'} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Formación</h2><p className="mt-1 text-sm text-muted-foreground">Solo considera personas inscritas en la ruta local.</p></div><BookOpen className="size-5 text-primary" /></div><div className="mt-5 flex items-end gap-8"><div><p className="text-3xl font-bold tabular-nums">{formation.data?.activeModuleEnrollments ?? 0}</p><p className="mt-1 text-sm text-muted-foreground">participaciones en curso</p></div><div><p className="text-3xl font-bold tabular-nums">{formation.data?.enrolledPeople ?? 0}</p><p className="mt-1 text-sm text-muted-foreground">personas en la ruta</p></div></div><Link to="/formation" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver formación <ArrowRight className="size-4" /></Link></div>
        <div className="rounded-2xl border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Personas</h2><p className="mt-1 text-sm text-muted-foreground">Registro activo de la iglesia.</p></div><Users className="size-5 text-primary" /></div><p className="mt-5 text-3xl font-bold tabular-nums">{people.data?.total ?? 0}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-muted px-2.5 py-1">{people.data?.members ?? 0} miembros</span><span className="rounded-full bg-muted px-2.5 py-1">{people.data?.believers ?? 0} creyentes</span><span className="rounded-full bg-muted px-2.5 py-1">{people.data?.visitors ?? 0} visitantes</span></div><Link to="/people" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver personas <ArrowRight className="size-4" /></Link></div>
      </section>

      <section className="rounded-2xl border bg-card p-5"><div className="flex items-start gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" /></span><div><h2 className="font-semibold">Estado de la semana</h2><p className="mt-1 text-sm text-muted-foreground">{tasks.data?.doneThisWeek ?? 0} tareas completadas esta semana.</p></div></div>{withoutSession.length > 0 && <details className="mt-5 rounded-xl border"><summary className="cursor-pointer px-4 py-3 text-sm font-medium">Ver líderes pendientes de seguimiento ({withoutSession.length})</summary><div className="flex flex-wrap gap-2 border-t p-4">{withoutSession.map((person, index) => <span key={index} className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-300">{person?.last_name}, {person?.first_name}</span>)}</div></details>}</section>
    </div>
  )
}
