import { useState } from 'react'
import { BookOpenCheck, ClipboardCheck, LayoutDashboard, UserPlus } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { EnrollmentManager, ExpositionManager, GradebookManager } from '@/features/formation'
import { cn } from '@/lib/utils'
import { useActiveStudyCycle } from '@/features/formation/hooks/useStudyCycles'
import { useLocalRoute } from '@/features/formation/hooks/useEnrollment'

type Section = 'home' | 'enrollment' | 'gradebook' | 'expositions' | 'exposition-groups' | 'exposition-notes'

const SECTIONS: { key: Exclude<Section, 'home' | 'exposition-groups' | 'exposition-notes'>; label: string; description: string; icon: typeof UserPlus; tone: string }[] = [
  { key: 'enrollment', label: 'Matrícula', description: 'Inscribir grupos, registrar formación previa y cerrar módulos.', icon: UserPlus, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { key: 'gradebook', label: 'Cuaderno de notas', description: 'Registra las notas de cada participante y calcula el resultado.', icon: BookOpenCheck, tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  { key: 'expositions', label: 'Exposiciones', description: 'Organiza los grupos y registra sus notas.', icon: ClipboardCheck, tone: 'bg-amber-500/10 text-amber-800 dark:text-amber-300' },
]

export function FormationPage() {
  const { data: activeCycle } = useActiveStudyCycle()
  const { data: currentRoute } = useLocalRoute()
  const [searchParams] = useSearchParams()
  const personId = searchParams.get('person') ?? ''
  const sectionFromUrl = searchParams.get('section')
  const evaluationFromUrl = searchParams.get('view')
  const initialSection: Section = sectionFromUrl === 'enrollment' || sectionFromUrl === 'gradebook' || sectionFromUrl === 'expositions' || sectionFromUrl === 'exposition-groups' || sectionFromUrl === 'exposition-notes'
    ? sectionFromUrl
    : sectionFromUrl === 'evaluation' && evaluationFromUrl === 'gradebook'
      ? 'gradebook'
      : sectionFromUrl === 'expositions' || (sectionFromUrl === 'evaluation' && evaluationFromUrl === 'expositions')
        ? 'expositions'
        : 'home'
  const [section, setSection] = useState<Section>(initialSection)

  function openSection(next: Section) {
    setSection(next)
  }

  if (personId || sectionFromUrl === 'students') {
    return <Navigate to={personId ? `/reports?view=route&person=${encodeURIComponent(personId)}` : '/reports?view=route'} replace />
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm font-medium text-primary">EsLider · formación local</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Formación</h1><p className="mt-1 text-sm text-muted-foreground">Acompaña a las personas y registra el proceso de cada manual.</p><p className="mt-3 text-sm font-medium">Ciclo en curso: {activeCycle?.name ?? 'Ninguno'}{currentRoute ? ` · Ruta: ${currentRoute.name}` : ''}</p></div>
          {section !== 'home' && <button type="button" onClick={() => openSection('home')} className="inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"><LayoutDashboard className="size-4" />Vista general</button>}
        </div>
      </header>

      {section === 'home' && <section>
        <div className="mb-4"><h2 className="font-semibold">¿Qué necesitas hacer?</h2><p className="mt-1 text-sm text-muted-foreground">Cada espacio reúne una tarea distinta para evitar mezclar el registro diario con la configuración.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{SECTIONS.map((item) => { const Icon = item.icon; return <button key={item.key} type="button" onClick={() => openSection(item.key)} className="group flex min-h-48 flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className={cn('flex size-11 items-center justify-center rounded-xl', item.tone)}><Icon className="size-5" /></span><span className="mt-5 font-semibold">{item.label}</span><span className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</span><span className="mt-auto pt-4 text-sm font-medium text-primary">Abrir sección →</span></button> })}</div>
        <div className="mt-6 rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">La matrícula, las notas y las exposiciones quedan separadas porque cumplen funciones diferentes. El avance de la ruta se consulta desde Reportes.</div>
      </section>}

      {section === 'enrollment' && <EnrollmentManager />}
      {section === 'gradebook' && <section className="evaluation-shell"><GradebookManager /></section>}
      {section === 'expositions' && <section className="space-y-5">
        <div><h2 className="font-semibold">Exposiciones</h2><p className="mt-1 text-sm text-muted-foreground">Elige si vas a preparar los grupos o registrar sus notas.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => openSection('exposition-groups')} className="group flex min-h-48 flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300"><ClipboardCheck className="size-5" /></span>
            <span className="mt-5 font-semibold">Grupos de exposición</span>
            <span className="mt-1 text-sm leading-5 text-muted-foreground">Configura y crea los grupos que expondrán cada manual.</span>
            <span className="mt-auto pt-4 text-sm font-medium text-primary">Abrir sección →</span>
          </button>
          <button type="button" onClick={() => openSection('exposition-notes')} className="group flex min-h-48 flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-800 dark:text-orange-300"><BookOpenCheck className="size-5" /></span>
            <span className="mt-5 font-semibold">Notas de exposición</span>
            <span className="mt-1 text-sm leading-5 text-muted-foreground">Evalúa a los grupos y registra sus notas y observaciones.</span>
            <span className="mt-auto pt-4 text-sm font-medium text-primary">Abrir sección →</span>
          </button>
        </div>
      </section>}
      {(section === 'exposition-groups' || section === 'exposition-notes') && <button type="button" onClick={() => openSection('expositions')} className="text-sm font-medium text-primary hover:underline">← Volver a Exposiciones</button>}
      {section === 'exposition-groups' && <section className="evaluation-shell"><ExpositionManager mode="groups" /></section>}
      {section === 'exposition-notes' && <section className="evaluation-shell"><ExpositionManager mode="grades" /></section>}
    </div>
  )
}
