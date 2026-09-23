import { useState } from 'react'
import { Pencil, ChevronDown, ChevronUp, Plus, Search, Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteMinistry, useMinistries } from '../hooks/useMinistries'
import { MinistryForm } from './MinistryForm'
import { LeaderAssigner } from './LeaderAssigner'
import type { MinistryWithLeaders } from '../types'

export function MinistriesList() {
  const { data: ministries, isLoading, error } = useMinistries()
  const deleteMinistry = useDeleteMinistry()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MinistryWithLeaders | undefined>()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [search, setSearch] = useState('')

  if (error) return <p className="text-destructive text-sm">Error al cargar ministerios.</p>

  const q = search.toLowerCase()
  const active = (ministries ?? []).filter((m) => m.is_active && m.name.toLowerCase().includes(q))
  const inactive = (ministries ?? []).filter((m) => !m.is_active && m.name.toLowerCase().includes(q))

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function openEdit(m: MinistryWithLeaders) {
    setEditing(m)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(undefined)
  }

  async function handleDelete(m: MinistryWithLeaders) {
    if (!window.confirm(`¿Eliminar el ministerio "${m.name}"? Esta acción también quitará sus asignaciones de líderes.`)) return
    await deleteMinistry.mutateAsync(m.id)
  }

  function MinistryCard({ m }: { m: MinistryWithLeaders }) {
    const isExpanded = expandedId === m.id
    return (
      <div className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
        {/* Cabecera del card */}
        <div className="flex items-center gap-3 border-l-4 border-l-primary/70 px-4 py-4">
          {/* Área clickeable principal */}
          <button
            className="flex-1 text-left min-w-0 overflow-hidden"
            onClick={() => toggleExpand(m.id)}
          >
            <span className="font-semibold leading-tight">{m.name}</span>
            {m.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.description}</p>
            )}
            {m.leaders.length > 0 && (
              <p className="mt-2 truncate text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Líder:</span>{' '}
                {m.leaders.slice(0, 2).map((leader) => `${leader.first_name} ${leader.last_name}`.trim()).join(' · ')}
                {m.leaders.length > 2 && ` +${m.leaders.length - 2}`}
              </p>
            )}
          </button>

          {/* Chip líderes — siempre visible, separado del nombre */}
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shrink-0 whitespace-nowrap ${m.leaders.length ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
            <Users className="h-3.5 w-3.5" />
            {m.leaders.length ? 'Con líder' : 'Sin líder'}
          </span>

          {/* Acciones — tamaño de toque 44px mínimo */}
          <div className="flex items-center shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEdit(m)}
              className="h-9 w-9"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(m)}
              disabled={deleteMinistry.isPending}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              title="Eliminar ministerio"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Panel expandido: asignación de líderes */}
        {isExpanded && (
          <div className="border-t bg-muted/30 px-4 py-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Líderes
            </p>
            <LeaderAssigner ministry={m} />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Directorio de ministerios</p>
          <span className="text-xs text-muted-foreground">{active.length} activos</span>
        </div>
        {/* Buscador + botón nuevo */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Buscar ministerio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2 h-10 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo ministerio</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Lista activos */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay ministerios registrados aún.
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((m) => <MinistryCard key={m.id} m={m} />)}
          </div>
        )}

        {/* Inactivos (colapsados por defecto) */}
        {inactive.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowInactive((v) => !v)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {showInactive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {inactive.length} ministerio{inactive.length > 1 ? 's' : ''} inactivo{inactive.length > 1 ? 's' : ''}
            </button>
            {showInactive && (
              <div className="space-y-2 opacity-60">
                {inactive.map((m) => <MinistryCard key={m.id} m={m} />)}
              </div>
            )}
          </div>
        )}
      </div>

      <MinistryForm open={formOpen} onClose={closeForm} ministry={editing} />
    </>
  )
}
