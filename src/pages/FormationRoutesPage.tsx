import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CurriculumManager } from '@/features/formation/components/CurriculumManager'
import { useActiveStudyCycle } from '@/features/formation/hooks/useStudyCycles'
import { useCreateFormationRoute, useFormationRoutes, useUpdateFormationRoute } from '@/features/formation/hooks/useRoutes'

export function FormationRoutesPage() {
  const { data: routes = [], isLoading: routesLoading, error: routesError } = useFormationRoutes()
  const { data: activeCycle } = useActiveStudyCycle()
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [version, setVersion] = useState('')
  const [message, setMessage] = useState('')
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editVersion, setEditVersion] = useState('')
  const createRoute = useCreateFormationRoute()
  const updateRoute = useUpdateFormationRoute()
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes.find((route) => route.key === 'local-miramar') ?? routes[0]

  async function create(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !version.trim()) return
    setMessage('')
    try {
      const route = await createRoute.mutateAsync({ name, version })
      setSelectedRouteId(route.id)
      setName('')
      setVersion('')
      setEditingRouteId(null)
      setMessage('Ruta creada. Ahora agrega sus manuales.')
    } catch {
      setMessage('No se pudo crear la ruta. Revisa los permisos de la base de datos.')
    }
  }

  async function saveRoute(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedRoute || editingRouteId !== selectedRoute.id || !editName.trim() || !editVersion.trim()) return
    setMessage('')
    try {
      await updateRoute.mutateAsync({ id: selectedRoute.id, name: editName, version: editVersion })
      setEditingRouteId(null)
      setMessage('Nombre y versión de la ruta actualizados.')
    } catch {
      setMessage('No se pudo actualizar la ruta. Revisa que la nueva migración esté aplicada.')
    }
  }
  return <div className="space-y-5">
    <Link to="/settings" className="inline-block text-sm font-medium text-primary hover:underline">← Volver a Configuración</Link>
    <div className="rounded-2xl border bg-card p-5">
      <h1 className="text-xl font-semibold">Rutas de formación</h1>
      <p className="mt-1 text-sm text-muted-foreground">Crea una ruta, organiza sus manuales y lecciones, y luego úsala en un ciclo de estudio.</p>
    </div>
    {message && <p role="status" className="rounded-lg border bg-card px-4 py-3 text-sm">{message}</p>}
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="font-semibold">Crear ruta</h2>
      <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end">
        <label className="space-y-1 text-sm font-medium">Nombre de la ruta<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ejemplo: Ruta de formación 2027" className="block h-10 w-full rounded-lg border bg-background px-3 font-normal" /></label>
        <label className="space-y-1 text-sm font-medium">Versión<input value={version} onChange={(event) => setVersion(event.target.value)} required placeholder="2027" className="block h-10 w-full rounded-lg border bg-background px-3 font-normal" /></label>
        <button type="submit" disabled={createRoute.isPending} className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">Crear ruta</button>
      </form>
    </section>
    <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <section className="rounded-2xl border bg-card p-5"><h2 className="font-semibold">Rutas existentes</h2>{routesError ? <p className="mt-3 text-sm text-destructive">No se pudieron cargar las rutas.</p> : routesLoading ? <p className="mt-3 text-sm text-muted-foreground">Cargando...</p> : routes.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Todavía no hay rutas.</p> : <div className="mt-3 space-y-2">{routes.map((route) => <button key={route.id} type="button" onClick={() => { setSelectedRouteId(route.id); setEditingRouteId(null); setMessage('') }} className={`w-full rounded-lg border p-3 text-left text-sm ${selectedRoute?.id === route.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}><span className="block font-medium">{route.name}</span><span className="text-xs text-muted-foreground">Versión {route.version}{activeCycle?.route_id === route.id ? ' · En curso' : ''}{!route.is_active ? ' · Inactiva' : ''}</span></button>)}</div>}</section>
      <section className="min-w-0 rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Manuales y lecciones de {selectedRoute?.name ?? 'la ruta'}</h2>{selectedRoute && editingRouteId !== selectedRoute.id && <button type="button" onClick={() => { setEditingRouteId(selectedRoute.id); setEditName(selectedRoute.name); setEditVersion(selectedRoute.version); setMessage('') }} className="text-sm font-medium text-primary hover:underline">Editar nombre y versión</button>}</div>
        {selectedRoute && editingRouteId === selectedRoute.id && <form onSubmit={saveRoute} className="mt-4 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-[minmax(0,1fr)_120px]">
          <label className="space-y-1 text-sm font-medium">Nombre<input value={editName} onChange={(event) => setEditName(event.target.value)} required className="block h-10 w-full rounded-lg border bg-background px-3 font-normal" /></label>
          <label className="space-y-1 text-sm font-medium">Versión<input value={editVersion} onChange={(event) => setEditVersion(event.target.value)} required className="block h-10 w-full rounded-lg border bg-background px-3 font-normal" /></label>
          <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={updateRoute.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Guardar cambios</button><button type="button" onClick={() => setEditingRouteId(null)} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button></div>
        </form>}{!selectedRoute ? <p className="mt-3 text-sm text-muted-foreground">Crea o selecciona una ruta.</p> : <div className="mt-4"><CurriculumManager key={selectedRoute.id} route={selectedRoute} /></div>}</section>
    </div>
  </div>
}