import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Cloud, Flag, Play, Search, Trophy } from 'lucide-react'
import { gsap } from 'gsap'
import { Input } from '@/components/ui/input'
import { usePeople } from '@/features/people/hooks/usePeople'
import { cn } from '@/lib/utils'
import { useAllPeopleProgress, useModules } from '../hooks/useFormation'
import type { Person } from '@/features/people/types'
import type { PersonProgressSummary } from '../types'

type Props = {
  onSelectPerson: (personId: string) => void
}

type MapPoint = { x: number; y: number }

const MAP_WIDTH = 1000
const X_POSITIONS = [220, 500, 820]
const NODE_COLORS = [
  'from-emerald-400 to-emerald-600 ring-emerald-200',
  'from-teal-400 to-teal-600 ring-teal-200',
  'from-sky-400 to-blue-600 ring-sky-200',
  'from-blue-400 to-indigo-600 ring-blue-200',
  'from-violet-400 to-purple-600 ring-violet-200',
  'from-fuchsia-400 to-violet-600 ring-fuchsia-200',
  'from-purple-400 to-indigo-600 ring-purple-200',
  'from-amber-300 to-orange-500 ring-amber-200',
]

function createRoutePoints(count: number, mapHeight: number): MapPoint[] {
  const rows = Math.ceil(count / X_POSITIONS.length)
  const rowGap = rows > 1 ? (mapHeight - 160) / (rows - 1) : 0
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / X_POSITIONS.length)
    const column = index % X_POSITIONS.length
    const rowXs = row % 2 === 0 ? X_POSITIONS : [...X_POSITIONS].reverse()
    return {
      x: rowXs[column],
      y: mapHeight - 80 - row * rowGap,
    }
  })
}

export function StudentsProgressOverview({ onSelectPerson }: Props) {
  const [search, setSearch] = useState('')
  const [animationRun, setAnimationRun] = useState(0)
  const boardRef = useRef<HTMLDivElement>(null)
  const { data: people, isLoading: peopleLoading } = usePeople()
  const { data: modules, isLoading: modulesLoading } = useModules()
  const activePeople = useMemo(
    () => (people ?? []).filter((person) => person.is_active),
    [people]
  )
  const personIds = useMemo(() => activePeople.map((person) => person.id), [activePeople])
  const { data: summaries, isLoading: progressLoading } = useAllPeopleProgress(personIds)
  const summaryByPerson = useMemo(
    () => new Map((summaries ?? []).map((summary) => [summary.personId, summary])),
    [summaries]
  )
  const activeModules = (modules ?? []).filter((module) => module.is_active)
  // La ruta visual se alimenta del catálogo de Supabase. La lista oficial local
  // solo sirve para sembrar módulos faltantes desde el administrador.
  const routeStages = activeModules
  const mapHeight = Math.max(680, Math.ceil((routeStages.length + 1) / X_POSITIONS.length) * 170)
  const startPoint: MapPoint = { x: 70, y: mapHeight - 50 }
  const routePoints = createRoutePoints(routeStages.length + 1, mapHeight)
  const modulePoints = routePoints.slice(0, routeStages.length)
  const goalPoint = routePoints[routeStages.length] ?? { x: 820, y: 80 }
  const pathPoints = [startPoint, ...modulePoints, goalPoint]
    .map((point) => `${point.x},${point.y}`)
    .join(' ')
  const normalizedSearch = search.trim().toLocaleLowerCase('es')
  const visiblePeople = useMemo(() => activePeople.filter((person) =>
    !normalizedSearch || `${person.first_name} ${person.last_name}`
      .toLocaleLowerCase('es')
      .includes(normalizedSearch)
  ), [activePeople, normalizedSearch])
  const isLoading = peopleLoading || modulesLoading || progressLoading

  useLayoutEffect(() => {
    if (!boardRef.current || isLoading) return
    const context = gsap.context(() => {
      gsap.fromTo('[data-route-node]',
        { scale: 0.75, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, stagger: 0.09, ease: 'back.out(1.6)' }
      )
      gsap.fromTo('[data-student-avatar]',
        { y: 24, scale: 0.45, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, delay: 0.25, stagger: 0.07, ease: 'back.out(1.9)' }
      )
    }, boardRef)
    return () => context.revert()
  }, [animationRun, isLoading])

  return (
    <section className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Cloud className="size-4" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">EsLider</span>
        </div>
        <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Ruta del Creyente</h2>
        <p className="mx-auto mt-1 max-w-2xl text-sm font-medium text-muted-foreground sm:text-base">
          Un viaje de formación paso a paso. Observa cómo cada persona avanza por la ruta.
        </p>
        <button
          type="button"
          onClick={() => setAnimationRun((run) => run + 1)}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-blue-600 px-6 font-bold text-white shadow-[0_5px_0_rgb(29,78,216)] transition hover:bg-blue-700 active:translate-y-1 active:shadow-none"
        >
          <Play className="size-4 fill-current" />
          Iniciar recorrido
        </button>
      </div>

      <div className="mx-auto max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar estudiante..."
            className="rounded-full bg-background pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-[520px] animate-pulse rounded-[2rem] bg-muted" />
      ) : (
        <div className="rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 p-2 shadow-2xl ring-1 ring-sky-200 dark:border-slate-800 dark:from-sky-950 dark:via-slate-900 dark:to-emerald-950 sm:p-4">
          <div className="overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:thin]">
            <div
              ref={boardRef}
              className="relative min-w-[760px] overflow-hidden rounded-[1.5rem] [background-image:radial-gradient(circle_at_center,rgba(14,165,233,0.18)_1.5px,transparent_1.5px)] [background-size:28px_28px]"
              style={{ aspectRatio: `${MAP_WIDTH}/${mapHeight}` }}
            >
              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${mapHeight}`}
                className="pointer-events-none absolute inset-0 size-full"
                aria-hidden="true"
              >
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke="rgb(148 163 184)"
                  strokeWidth="10"
                  strokeDasharray="14 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center text-slate-500"
                style={{ left: `${startPoint.x / MAP_WIDTH * 100}%`, top: `${startPoint.y / mapHeight * 100}%` }}
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-full border-4 border-dashed border-slate-400 bg-white/60 dark:bg-slate-900/60">
                  <Flag className="size-5" />
                </div>
                <span className="mt-1 block text-xs font-bold">Inicio</span>
              </div>

              {routeStages.map((module, index) => {
                const point = modulePoints[index]
                const stagePeople = visiblePeople.filter((person) =>
                  summaryByPerson.get(person.id)?.currentModuleId === module.id
                )
                return (
                  <RouteNode
                    key={module.id}
                    point={point}
                    mapHeight={mapHeight}
                    index={index}
                    title={module.name}
                    people={stagePeople}
                    summaryByPerson={summaryByPerson}
                    onSelectPerson={onSelectPerson}
                  />
                )
              })}

              <RouteNode
                point={goalPoint}
                mapHeight={mapHeight}
                index={routeStages.length}
                title="Ruta completada"
                people={visiblePeople.filter((person) => summaryByPerson.get(person.id)?.completedRoute)}
                summaryByPerson={summaryByPerson}
                onSelectPerson={onSelectPerson}
                goal
              />
            </div>
          </div>
          <p className="px-3 pb-1 pt-2 text-center text-xs text-slate-600 dark:text-slate-300 sm:hidden">
            Desliza el mapa hacia los lados para ver todo el recorrido.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span>{activePeople.length} estudiantes activos</span>
        <span>{routeStages.length} etapas de formación</span>
        <span>Selecciona un avatar para abrir su ruta</span>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        La ubicación representa avance formativo registrado; no expresa rango espiritual ni importancia dentro de la iglesia.
      </p>
    </section>
  )
}

function RouteNode({
  point,
  mapHeight,
  index,
  title,
  people,
  summaryByPerson,
  onSelectPerson,
  goal = false,
}: {
  point: MapPoint
  mapHeight: number
  index: number
  title: string
  people: Person[]
  summaryByPerson: Map<string, PersonProgressSummary>
  onSelectPerson: (personId: string) => void
  goal?: boolean
}) {
  const visibleAvatars = people.slice(0, 5)
  const remaining = people.length - visibleAvatars.length
  const orbitPositions = [
    '-left-5 -top-4',
    '-right-5 -top-4',
    '-left-7 top-6',
    '-right-7 top-6',
    'left-1/2 top-10 -translate-x-1/2',
  ]

  return (
    <div
      data-route-node
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${point.x / MAP_WIDTH * 100}%`, top: `${point.y / mapHeight * 100}%` }}
    >
      <div className="absolute bottom-[calc(100%+7px)] left-1/2 max-w-40 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-900/90 dark:text-slate-200">
        {title}
      </div>
      <div
        className={cn(
          'relative flex size-14 items-center justify-center rounded-full border-b-4 bg-gradient-to-br text-xl font-black text-white shadow-lg ring-4 sm:size-16',
          goal
            ? 'border-amber-600 from-amber-300 to-orange-500 text-amber-950 ring-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.65)]'
            : `border-slate-700/30 ${NODE_COLORS[index % NODE_COLORS.length]}`
        )}
      >
        {goal ? <Trophy className="size-7" /> : index + 1}
        {visibleAvatars.map((person, avatarIndex) => (
          <button
            key={person.id}
            type="button"
            data-student-avatar
            title={`${person.first_name} ${person.last_name} · ${summaryByPerson.get(person.id)?.progressPercentage ?? 0}%`}
            onClick={() => onSelectPerson(person.id)}
            className={cn(
              'absolute z-20 flex size-9 items-center justify-center overflow-hidden rounded-full border-3 border-white bg-slate-800 text-[10px] font-black text-white shadow-md transition hover:z-30 hover:scale-125 focus-visible:z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-900',
              orbitPositions[avatarIndex]
            )}
          >
            {person.avatar_url ? (
              <img src={person.avatar_url} alt="" className="size-full object-cover" />
            ) : (
              <span>{person.first_name[0] ?? ''}{person.last_name[0] ?? ''}</span>
            )}
          </button>
        ))}
        {remaining > 0 && (
          <span className="absolute left-1/2 top-10 z-30 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border-3 border-white bg-slate-700 text-[10px] font-bold text-white shadow-md dark:border-slate-900">
            +{remaining}
          </span>
        )}
      </div>

      {people.length > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-[calc(100%+34px)] z-40 hidden w-48 -translate-x-1/2 rounded-xl bg-slate-900 p-2.5 text-white shadow-xl group-hover:block group-focus-within:block">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">En esta etapa</p>
          {people.map((person) => (
            <div key={person.id} className="flex items-center justify-between gap-2 py-0.5 text-xs">
              <span className="truncate">{person.first_name} {person.last_name}</span>
              <span className="shrink-0 text-sky-300">{summaryByPerson.get(person.id)?.progressPercentage ?? 0}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
