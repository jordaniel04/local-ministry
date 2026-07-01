import { useState } from 'react'
import { Pencil, PowerOff, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMinistries, useDeactivateMinistry } from '../hooks/useMinistries'
import { MinistryForm } from './MinistryForm'
import { LeaderAssigner } from './LeaderAssigner'
import type { MinistryWithLeaders } from '../types'

export function MinistriesList() {
  const { data: ministries, isLoading, error } = useMinistries()
  const deactivate = useDeactivateMinistry()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MinistryWithLeaders | undefined>()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  if (error) return <p className="text-destructive text-sm">Error al cargar ministerios.</p>

  const active = (ministries ?? []).filter((m) => m.is_active)
  const inactive = (ministries ?? []).filter((m) => !m.is_active)

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  async function handleDeactivate(m: MinistryWithLeaders) {
    if (!confirm(`¿Desactivar "${m.name}"? No aparecerá en los listados activos.`)) return
    await deactivate.mutateAsync(m.id)
    if (expandedId === m.id) setExpandedId(null)
  }

  function openEdit(m: MinistryWithLeaders) {
    setEditing(m)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(undefined)
  }

  function MinistryCard({ m }: { m: MinistryWithLeaders }) {
    const isExpanded = expandedId === m.id
    return (
      <div className="border rounded-lg bg-card overflow-hidden">
        {/* Cabecera del card */}
        <div className="flex items-center gap-3 p-4">
          <button
            className="flex-1 text-left"
            onClick={() => toggleExpand(m.id)}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{m.name}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {m.leaders.length} {m.leaders.length === 1 ? 'líder' : 'líderes'}
              </span>
            </div>
            {m.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>
            )}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEdit(m)}
              className="h-8 w-8"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {m.is_active && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeactivate(m)}
                disabled={deactivate.isPending}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <PowerOff className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleExpand(m.id)}
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Panel expandido: asignación de líderes */}
        {isExpanded && (
          <div className="border-t px-4 py-3 bg-muted/30">
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
      <div className="space-y-4">
        {/* Botón nuevo */}
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo ministerio
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
