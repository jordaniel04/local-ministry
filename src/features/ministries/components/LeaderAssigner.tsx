import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAssignLeader, useRemoveLeader } from '../hooks/useMinistries'
import { usePeople } from '@/features/people/hooks/usePeople'
import type { MinistryWithLeaders } from '../types'

type Props = {
  ministry: MinistryWithLeaders
}

export function LeaderAssigner({ ministry }: Props) {
  const { data: allPeople } = usePeople()
  const assignLeader = useAssignLeader()
  const removeLeader = useRemoveLeader()
  const [selectedPersonId, setSelectedPersonId] = useState('')

  // Solo personas activas que aún no están asignadas a este ministerio
  const assignedIds = new Set(ministry.leaders.map((l) => l.person_id))
  const available = (allPeople ?? []).filter(
    (p) => p.is_active && !assignedIds.has(p.id)
  )

  async function handleAssign() {
    if (!selectedPersonId) return
    await assignLeader.mutateAsync({
      ministryId: ministry.id,
      personId: selectedPersonId,
    })
    setSelectedPersonId('')
  }

  async function handleRemove(leaderMinistryId: string) {
    await removeLeader.mutateAsync(leaderMinistryId)
  }

  return (
    <div className="space-y-3">
      {/* Líderes actuales */}
      {ministry.leaders.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Sin líderes asignados</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {ministry.leaders.map((leader) => (
            <div
              key={leader.id}
              className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-2.5 py-1 rounded-full"
            >
              <span>{leader.last_name}, {leader.first_name}</span>
              <button
                onClick={() => handleRemove(leader.id)}
                disabled={removeLeader.isPending}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Asignar nuevo líder */}
      {available.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedPersonId} onValueChange={(v) => setSelectedPersonId(v ?? '')}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Asignar líder..." />
            </SelectTrigger>
            <SelectContent>
              {available.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.last_name}, {p.first_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            onClick={handleAssign}
            disabled={!selectedPersonId || assignLeader.isPending}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
