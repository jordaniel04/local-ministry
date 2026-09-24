import { BookOpen, Church, Settings2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  { to: '/people', label: 'Personas', description: 'Registro, datos personales y estado de cada persona.', icon: Users, tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  { to: '/ministries', label: 'Ministerios', description: 'Catálogo de ministerios y líderes asignados.', icon: Church, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { to: '/settings/formation-routes', label: 'Rutas de formación', description: 'Crea rutas y administra sus manuales y lecciones.', icon: BookOpen, tone: 'bg-teal-500/10 text-teal-700 dark:text-teal-300' },
  { to: '/settings/study-cycles', label: 'Ciclos de estudio', description: 'Administra el ciclo, sus módulos y el módulo activo.', icon: BookOpen, tone: 'bg-amber-500/10 text-amber-600' },
  { to: '/settings/assessment-plan', label: 'Plan de notas', description: 'Define la escala, los componentes y sus ponderaciones por manual.', icon: Settings2, tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300' },
]

export function SettingsPage() {
  return <div className="space-y-6">
    <div className="rounded-2xl border bg-card p-6"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Settings2 className="size-5" /></span><div><h1 className="text-2xl font-bold">Configuración</h1><p className="mt-1 text-sm text-muted-foreground">Administra los catálogos y registros generales de EsLider.</p></div></div></div>
    <div><h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Catálogos y registros</h2><div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sections.map(({ to, label, description, icon: Icon, tone }) => <Link key={to} to={to} className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"><span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" /></span><h3 className="mt-4 font-semibold">{label}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p><span className="mt-4 block text-sm font-medium text-primary">Abrir →</span></Link>)}</div></div>
  </div>
}
