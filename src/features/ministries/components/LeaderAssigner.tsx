import { useState } from 'react'
import { X, UserPlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssignLeader, useRemoveLeader } from '../hooks/useMinistries'
import { usePeople } from '@/features/people/hooks/usePeople'
import { cn } from '@/lib/utils'
import type { MinistryWithLeaders } from '../types'

type Props = {
  ministry: MinistryWithLeaders
}

export function LeaderAssigner({ ministry }: Props) {
  const { data: allPeople } = usePeople()
  const assignLeader = useAssignLeader()
  const removeLeader = useRemoveLeader()
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const assignedIds = new Set(ministry.leaders.map((l) => l.person_id))

  // Solo Miembros activos no asignados aún
  const available = (allPeople ?? []).filter(
    (p) => p.is_active && p.person_type === 'member' && !assignedIds.has(p.id)
  )

  const filtered = available.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q)
    )
  })

  async function handleAssign(personId: string) {
    await assignLeader.mutateAsync({ ministryId: ministry.id, personId })
    setModalOpen(false)
    setSearch('')
  }

  async function handleRemove(leaderMinistryId: string) {
    await removeLeader.mutateAsync(leaderMinistryId)
  }

  return (
    <div className="space-y-3">
      {/* Chips de líderes actuales */}
      {ministry.leaders.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Sin líderes asignados</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {ministry.leaders.map((leader) => {
            const name = [leader.last_name, leader.first_name].filter(Boolean).join(', ') || 'Sin nombre'
            return (
              <div
                key={leader.id}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-2.5 py-1 rounded-full"
              >
                <span>{name}</span>
                <button
                  onClick={() => handleRemove(leader.id)}
                  disabled={removeLeader.isPending}
                  className="hover:text-destructive transition-colors ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Botón abrir modal */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        disabled={available.length === 0}
        className="gap-2 w-full"
      >
        <UserPlus className="h-4 w-4" />
        {available.length === 0 ? 'No hay miembros disponibles' : 'Asignar líder'}
      </Button>

      {/* Modal de selección */}
      {modalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => { setModalOpen(false); setSearch('') }}
          />

          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-card rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 md:rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border shrink-0">
              <p className="font-semibold text-sm">Asignar líder — {ministry.name}</p>
              <button
                onClick={() => { setModalOpen(false); setSearch('') }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Buscador */}
            <div className="px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar miembro..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto flex-1 px-2 pb-4">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {search ? 'Sin resultados' : 'No hay miembros disponibles'}
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAssign(p.id)}
                    disabled={assignLeader.isPending}
                    className={cn(
                      'w-full text-left px-3 py-3 rounded-lg text-sm transition-colors mb-1',
                      'hover:bg-accent hover:text-accent-foreground',
                      'disabled:opacity-50'
                    )}
                  >
                    <span className="font-medium">{p.last_name}, {p.first_name}</span>
                    {p.phone && <span className="block text-xs text-muted-foreground">{p.phone}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
