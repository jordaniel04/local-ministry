import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import type { Person } from '@/features/people/types'

type Student = { id: string; name: string; avatar: string; level: number }
type Props = { people?: Person[] }

const STAGES = [
  { level: 1, title: 'Consolidado', color: 'bg-sky-600' },
  { level: 2, title: 'Discipulado I', color: 'bg-cyan-600' },
  { level: 3, title: 'Discipulado II', color: 'bg-teal-600' },
  { level: 4, title: 'Discipulado III', color: 'bg-emerald-600' },
  { level: 5, title: 'Formación', color: 'bg-green-600' },
  { level: 6, title: 'Liderazgo', color: 'bg-lime-600' },
]

const EXAMPLE_STUDENTS: Student[] = [
  { id: 'example-1', name: 'Ana', avatar: 'A', level: 2 },
  { id: 'example-2', name: 'Luis', avatar: 'L', level: 5 },
  { id: 'example-3', name: 'Marta', avatar: 'M', level: 1 },
  { id: 'example-4', name: 'José', avatar: 'J', level: 5 },
]

export function ProgressStaircase({ people }: Props) {
  const avatarRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const students = useMemo(() => people?.length
    ? people.slice(0, 30).map((person, index) => ({
        id: person.id,
        name: `${person.first_name} ${person.last_name}`,
        avatar: `${person.first_name[0] ?? ''}${person.last_name[0] ?? ''}`,
        // Provisional hasta relacionar el avance con la ruta oficial registrada.
        level: (index % STAGES.length) + 1,
      }))
    : EXAMPLE_STUDENTS, [people])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      students.forEach((student, studentIndex) => {
        const avatar = avatarRefs.current[student.id]
        if (!avatar) return
        gsap.fromTo(avatar, { y: 28, scale: 0.75, opacity: 0 }, {
          y: 0, scale: 1, opacity: 1, duration: 0.55, delay: studentIndex * 0.16, ease: 'back.out(1.7)',
        })
      })
    })
    return () => ctx.revert()
  }, [students])

  return (
    <section className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold sm:text-lg">Mapa de progreso</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ruta local de formación y liderazgo en EsLider.</p>
      </div>
      <div className="overflow-x-auto pb-3">
        <div className="relative flex min-w-[690px] items-end gap-2 px-1 pt-8">
          <div className="pointer-events-none absolute bottom-10 left-5 right-5 h-1 rounded-full bg-primary/20" />
          {STAGES.map((stage) => {
            const stageStudents = students.filter((student) => student.level === stage.level)
            return (
              <article key={stage.level} className="relative z-10 flex w-[102px] shrink-0 flex-col justify-end" style={{ height: `${150 + stage.level * 24}px` }}>
                <div className="flex min-h-[72px] flex-wrap content-end gap-1 rounded-t-xl border border-primary/20 bg-muted/50 p-2 shadow-sm">
                  {stageStudents.map((student) => (
                    <div key={student.id} ref={(element) => { avatarRefs.current[student.id] = element }} title={student.name} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground shadow">
                      {student.avatar}
                    </div>
                  ))}
                  {!stageStudents.length && <span className="text-[10px] text-muted-foreground/60">Sin registros</span>}
                </div>
                <div className={`rounded-b-xl px-2 py-2 text-center text-primary-foreground shadow-sm ${stage.color}`}>
                  <span className="block text-lg font-bold leading-none">{stage.level}</span>
                  <span className="mt-1 block text-[11px] font-semibold leading-tight">{stage.title}</span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">La posición es una ayuda visual. El registro de lecciones, asistencia y evaluación formativa sigue siendo la fuente oficial.</p>
    </section>
  )
}
