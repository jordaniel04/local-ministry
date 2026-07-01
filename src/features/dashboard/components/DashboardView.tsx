import {
  Users, UserCheck, ClipboardList, AlertTriangle, BookOpen, CalendarCheck, HeartHandshake
} from 'lucide-react'
import { StatCard } from './StatCard'
import {
  usePeopleStats, useTasksStats, useFormationStats, useLastAttendance, useLeaderAlerts
} from '../hooks/useDashboard'

function SkeletonCard() {
  return <div className="rounded-xl border bg-card p-4 h-24 animate-pulse bg-muted" />
}

export function DashboardView() {
  const people = usePeopleStats()
  const tasks = useTasksStats()
  const formation = useFormationStats()
  const attendance = useLastAttendance()
  const leaders = useLeaderAlerts()

  return (
    <div className="space-y-8">

      {/* Personas */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {people.isLoading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard title="Personas activas" value={people.data?.total ?? 0} icon={Users} />
              <StatCard title="Miembros" value={people.data?.members ?? 0} icon={UserCheck} />
              <StatCard title="Creyentes" value={people.data?.believers ?? 0} icon={UserCheck} />
              <StatCard title="Visitantes" value={people.data?.visitors ?? 0} icon={Users} />
            </>
          )}
        </div>
      </section>

      {/* Tareas */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tareas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tasks.isLoading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard title="Pendientes" value={tasks.data?.pending ?? 0} icon={ClipboardList} />
              <StatCard
                title="Vencidas"
                value={tasks.data?.overdue ?? 0}
                icon={AlertTriangle}
                variant={tasks.data?.overdue ? 'danger' : 'default'}
                subtitle={tasks.data?.overdue ? 'Requieren atención' : undefined}
              />
              <StatCard
                title="Completadas esta semana"
                value={tasks.data?.doneThisWeek ?? 0}
                icon={ClipboardList}
              />
            </>
          )}
        </div>
      </section>

      {/* Formación */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Formación</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {formation.isLoading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard title="Con progreso" value={formation.data?.totalWithProgress ?? 0} icon={BookOpen} />
              <StatCard
                title="Sin ningún avance"
                value={formation.data?.noProgress ?? 0}
                icon={BookOpen}
                variant={formation.data?.noProgress ? 'warning' : 'default'}
              />
              <StatCard
                title="Promedio general"
                value={formation.data?.avgScore != null ? `${formation.data.avgScore}` : '—'}
                subtitle={formation.data?.avgScore != null ? 'sobre lecciones evaluadas' : 'Sin lecciones evaluadas'}
                icon={BookOpen}
              />
            </>
          )}
        </div>
      </section>

      {/* Asistencia */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Última sesión</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {attendance.isLoading ? (
            [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
          ) : attendance.data ? (
            <>
              <StatCard
                title={attendance.data.title}
                value={`${attendance.data.present}/${attendance.data.total}`}
                subtitle={new Date(attendance.data.date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                icon={CalendarCheck}
              />
              <StatCard
                title="% Presentes"
                value={attendance.data.total > 0
                  ? `${Math.round((attendance.data.present / attendance.data.total) * 100)}%`
                  : '—'}
                icon={CalendarCheck}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground col-span-2">No hay sesiones registradas aún.</p>
          )}
        </div>
      </section>

      {/* Alertas de líderes */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Seguimiento de líderes</h2>
        {leaders.isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard title="Total líderes" value={leaders.data?.total ?? 0} icon={HeartHandshake} />
              <StatCard
                title="Sin sesión en 30 días"
                value={leaders.data?.withoutSession.length ?? 0}
                icon={AlertTriangle}
                variant={leaders.data?.withoutSession.length ? 'warning' : 'default'}
              />
            </div>
            {(leaders.data?.withoutSession.length ?? 0) > 0 && (
              <div className="rounded-lg border border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                  Líderes sin sesión reciente
                </p>
                <div className="flex flex-wrap gap-2">
                  {leaders.data?.withoutSession.map((p, i) => (
                    <span key={i} className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                      {p?.last_name}, {p?.first_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  )
}
