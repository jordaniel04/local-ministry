import { BarChart3, UsersRound } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PersonProgressView, StudentsProgressOverview } from '@/features/formation'

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const personId = searchParams.get('person') ?? ''
  const showRoute = searchParams.get('view') === 'route' || Boolean(personId)

  function openRoute() {
    setSearchParams({ view: 'route' })
  }

  function openPerson(id: string) {
    setSearchParams({ view: 'route', person: id })
  }

  return <div className="space-y-6">
    <header className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><BarChart3 className="size-5" /></span><div><h1 className="text-2xl font-bold">Reportes</h1><p className="mt-1 text-sm text-muted-foreground">Consulta el avance de la formación y los reportes disponibles.</p></div></div>
    </header>

    {!showRoute ? <section className="space-y-4">
      <div><h2 className="font-semibold">Reportes disponibles</h2><p className="mt-1 text-sm text-muted-foreground">Elige el reporte que necesitas consultar.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button type="button" onClick={openRoute} className="group flex min-h-48 flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300"><UsersRound className="size-5" /></span>
          <span className="mt-5 font-semibold">Avance en la Ruta</span>
          <span className="mt-1 text-sm leading-5 text-muted-foreground">Consulta la ruta y el avance de cada persona.</span>
          <span className="mt-auto pt-4 text-sm font-medium text-primary">Abrir reporte →</span>
        </button>
      </div>
    </section> : <section className="space-y-4">
      <nav aria-label="Migas de pan" className="flex items-center gap-2 text-sm">
        <button type="button" onClick={() => setSearchParams({})} className="text-primary hover:underline">Reportes</button>
        <span className="text-muted-foreground">/</span>
        {personId ? <><button type="button" onClick={openRoute} className="text-primary hover:underline">Avance en la Ruta</button><span className="text-muted-foreground">/</span><span className="text-muted-foreground">Persona</span></> : <span className="text-muted-foreground">Avance en la Ruta</span>}
      </nav>
      {personId ? <>
        <PersonProgressView selectedPersonId={personId} onPersonChange={openPerson} />
        <Link to={`/people/${personId}`} className="inline-block text-sm text-primary hover:underline">Abrir ficha completa de la persona</Link>
      </> : <StudentsProgressOverview onSelectPerson={openPerson} />}
    </section>}
  </div>
}
