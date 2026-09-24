import { useState } from 'react'
import { BookOpenCheck, ClipboardCheck, LayoutDashboard, Settings2, UserPlus, UsersRound } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AssessmentPlanManager, EnrollmentManager, ExpositionManager, GradebookManager, PersonProgressView, StudentsProgressOverview } from '@/features/formation'
import { cn } from '@/lib/utils'

type Section = 'home' | 'students' | 'enrollment' | 'evaluation'
type EvaluationView = 'home' | 'plans' | 'gradebook' | 'expositions'

const SECTIONS: { key: Exclude<Section, 'home'>; label: string; description: string; icon: typeof UsersRound; tone: string }[] = [
  { key: 'students', label: 'Estudiantes', description: 'Ver la ruta y acompañar el avance de cada persona.', icon: UsersRound, tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  { key: 'enrollment', label: 'Matrícula', description: 'Inscribir grupos, registrar formación previa y cerrar módulos.', icon: UserPlus, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { key: 'evaluation', label: 'Evaluación', description: 'Configurar notas, registrar resultados y revisar exposiciones.', icon: BookOpenCheck, tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300' },
]

export function FormationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const personId = searchParams.get('person') ?? ''
  const sectionFromUrl = searchParams.get('section')
  const evaluationFromUrl = searchParams.get('view')
  const [section, setSection] = useState<Section>(personId ? 'students' : sectionFromUrl === 'evaluation' || sectionFromUrl === 'enrollment' || sectionFromUrl === 'students' ? sectionFromUrl : 'home')
  const [evaluationView, setEvaluationView] = useState<EvaluationView>(evaluationFromUrl === 'gradebook' || evaluationFromUrl === 'expositions' || evaluationFromUrl === 'plans' ? evaluationFromUrl : 'home')

  function openSection(next: Section) {
    if (next !== 'students' && personId) {
      const params = new URLSearchParams(searchParams)
      params.delete('person')
      setSearchParams(params)
    }
    if (next === 'evaluation') setEvaluationView('home')
    setSection(next)
  }

  function openPerson(personIdToOpen: string) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('person', personIdToOpen)
    setSearchParams(nextParams)
    setSection('students')
  }

  function returnToStudents() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('person')
    setSearchParams(nextParams)
    setSection('students')
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm font-medium text-primary">EsLider · formación local</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Formación</h1><p className="mt-1 text-sm text-muted-foreground">Organiza la ruta local, acompaña a las personas y registra el proceso de cada manual.</p></div>
          {section !== 'home' && <button type="button" onClick={() => openSection('home')} className="inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"><LayoutDashboard className="size-4" />Vista general</button>}
        </div>
      </header>

      {section === 'home' && <section>
        <div className="mb-4"><h2 className="font-semibold">¿Qué necesitas hacer?</h2><p className="mt-1 text-sm text-muted-foreground">Cada espacio reúne una tarea distinta para evitar mezclar el registro diario con la configuración.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{SECTIONS.map((item) => { const Icon = item.icon; return <button key={item.key} type="button" onClick={() => openSection(item.key)} className="group flex min-h-48 flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className={cn('flex size-11 items-center justify-center rounded-xl', item.tone)}><Icon className="size-5" /></span><span className="mt-5 font-semibold">{item.label}</span><span className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</span><span className="mt-auto pt-4 text-sm font-medium text-primary">Abrir sección →</span></button> })}</div>
        <div className="mt-6 rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">La matrícula, las notas y las exposiciones quedan separadas porque cumplen funciones diferentes. El avance de la ruta se consulta desde Estudiantes.</div>
      </section>}

      {section === 'students' && (personId ? <section className="space-y-4"><button type="button" onClick={returnToStudents} className="text-sm font-medium text-primary hover:underline">← Volver a estudiantes</button><PersonProgressView selectedPersonId={personId} onPersonChange={openPerson} /><Link to={`/people/${personId}`} className="inline-block text-sm text-primary hover:underline">Abrir ficha completa de la persona</Link></section> : <StudentsProgressOverview onSelectPerson={openPerson} />)}
      {section === 'enrollment' && <EnrollmentManager />}
      {section === 'evaluation' && <section className="evaluation-shell space-y-5">
        {evaluationView !== 'home' && <nav aria-label="Migas de pan" className="flex items-center gap-2 text-sm"><button type="button" onClick={() => setEvaluationView('home')} className="text-primary hover:underline">Evaluación</button><span className="text-muted-foreground">/</span><span className="text-muted-foreground">{evaluationView === 'expositions' ? 'Exposiciones' : evaluationView === 'plans' ? 'Plan de notas' : 'Cuaderno de notas'}</span></nav>}
        {evaluationView === 'home' ? <><div><h2 className="font-semibold">Evaluación</h2><p className="mt-1 text-sm text-muted-foreground">Elige la tarea que necesitas realizar.</p></div><div className="grid gap-4 md:grid-cols-3">{([{ key: 'plans', label: 'Plan de notas', description: 'Define qué se evalúa, sus pesos y el orden de las columnas.', icon: Settings2, tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300' }, { key: 'gradebook', label: 'Cuaderno de notas', description: 'Registra las notas de cada participante y calcula el resultado.', icon: BookOpenCheck, tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' }, { key: 'expositions', label: 'Exposiciones', description: 'Organiza grupos, revisa su preparación y registra su devolución.', icon: ClipboardCheck, tone: 'bg-amber-500/10 text-amber-800 dark:text-amber-300' }] as { key: Exclude<EvaluationView, 'home'>; label: string; description: string; icon: typeof Settings2; tone: string }[]).map((item) => { const Icon = item.icon; return <button key={item.key} type="button" onClick={() => setEvaluationView(item.key)} className="group flex min-h-48 flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><span className={cn('flex size-11 items-center justify-center rounded-xl', item.tone)}><Icon className="size-5" /></span><span className="mt-5 font-semibold">{item.label}</span><span className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</span><span className="mt-auto pt-4 text-sm font-medium text-primary">Abrir →</span></button> })}</div></> : <><button type="button" onClick={() => setEvaluationView('home')} className="text-sm font-medium text-primary hover:underline">← Volver a Evaluación</button>{evaluationView === 'plans' && <AssessmentPlanManager />}{evaluationView === 'gradebook' && <GradebookManager />}{evaluationView === 'expositions' && <ExpositionManager />}</>}
      </section>}
    </div>
  )
}
