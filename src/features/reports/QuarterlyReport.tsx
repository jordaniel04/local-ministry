import { useState } from 'react'
import { useQuarterlyReport } from './useQuarterlyReport'

const QUARTERS = ['Ene–Mar', 'Abr–Jun', 'Jul–Set', 'Oct–Dic']

function Metric({ label, value, note, warning }: { label: string; value: string; note?: string; warning?: string }) {
  return <div className="rounded-xl border bg-card p-4">
    <dt className="text-sm font-medium">{label}</dt>
    <dd className="mt-2 text-2xl font-semibold">{value}</dd>
    {note && <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>}
    {warning && <p role="status" className="mt-2 rounded-lg bg-amber-500/10 px-2 py-1.5 text-xs text-amber-800 dark:text-amber-300">{warning}</p>}
  </div>
}

export function QuarterlyReport() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth() / 3) + 1)
  const { data, isPending, isError } = useQuarterlyReport(year, quarter)

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end gap-3">
      <div><h2 className="text-xl font-semibold">Estadística trimestral</h2><p className="mt-1 text-sm text-muted-foreground">Datos registrados para el reporte del ministerio de EsLider.</p></div>
      <div className="flex flex-wrap gap-2 sm:ml-auto">
        <label className="grid gap-1 text-xs font-medium">Trimestre<select aria-label="Trimestre" value={quarter} onChange={(event) => setQuarter(Number(event.target.value))} className="h-10 rounded-lg border bg-background px-3 text-sm">{QUARTERS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-medium">Año<input aria-label="Año" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} className="h-10 w-28 rounded-lg border bg-background px-3 text-sm" /></label>
      </div>
    </div>

    {isPending && <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>}
    {isError && <p role="alert" className="text-sm text-destructive">No se pudieron consultar las estadísticas. Inténtalo de nuevo.</p>}
    {data && <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Miembros en capacitación" value={String(data.members)} note="Personas distintas con matrícula de manual durante el trimestre." />
      <Metric label="Creyentes en capacitación" value={String(data.believers)} note="Según el tipo de persona registrado actualmente." />
      <Metric label="Promedio de asistencia de líderes" value={data.averageLeaders === null ? 'Sin cultos' : data.averageLeaders.toLocaleString('es-PE', { maximumFractionDigits: 1 })} note="Suma de líderes presentes o llegados tarde dividida entre todos los cultos del trimestre." warning={data.servicesWithoutAttendance.length > 0 ? `Registro de asistencia pendiente en ${data.servicesWithoutAttendance.length} culto(s): ${data.servicesWithoutAttendance.map((service) => service.session_date).join(', ')}` : undefined} />
      <Metric label="Servicios en el trimestre" value={String(data.services)} note="Cultos de EsLider identificados por el título de la sesión." />
      <Metric label="Cursos bíblicos enseñados" value="Pendiente" note="No se registra qué manual se enseñó en cada culto." />
      <Metric label="Consolidadores" value="Pendiente" note="TODO: registrar asignaciones y procesos de consolidación." />
      <Metric label="Discipuladores" value="Pendiente" note="TODO: registrar la función y sus asignaciones." />
      <Metric label="Mentores" value="Pendiente" note="TODO: registrar la función y sus asignaciones." />
    </dl>}
    <p className="rounded-xl border border-dashed p-4 text-xs leading-5 text-muted-foreground">Este reporte refleja los datos registrados, no una cifra oficial cerrada. Los retiros de matrícula, cambios de tipo de persona o de líderes y cultos anteriores no tienen historial suficiente para reconstruirlos con plena exactitud. Revisa las cifras antes de enviarlas.</p>
  </div>
}
