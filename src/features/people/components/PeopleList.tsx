import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePeople } from '../hooks/usePeople'
import { PersonBadge } from './PersonBadge'
import type { Person, PersonType } from '../types'
import { PERSON_TYPE_LABELS } from '../types'

type FilterType = PersonType | 'all'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'member', label: PERSON_TYPE_LABELS.member },
  { value: 'believer', label: PERSON_TYPE_LABELS.believer },
  { value: 'visitor', label: PERSON_TYPE_LABELS.visitor },
]

type Props = {
  onNewPerson: () => void
}

export function PeopleList({ onNewPerson }: Props) {
  const navigate = useNavigate()
  const { data: people, isLoading, error } = usePeople()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = (people ?? []).filter((p: Person) => {
    const matchesType = filter === 'all' || p.person_type === filter
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(search.toLowerCase())
    return matchesType && matchesSearch && p.is_active
  })

  if (error) {
    return (
      <p className="text-destructive text-sm">
        Error al cargar personas: {error.message}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onNewPerson} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Nueva persona
        </Button>
      </div>

      {/* Filtros por tipo */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 opacity-70">
                ({(people ?? []).filter((p: Person) => p.person_type === f.value && p.is_active).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || filter !== 'all'
            ? 'No hay personas que coincidan con el filtro.'
            : 'No hay personas registradas aún.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((person: Person) => (
            <button
              key={person.id}
              onClick={() => navigate(`/people/${person.id}`)}
              className="w-full text-left flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              {/* Avatar con iniciales */}
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {person.first_name[0]}{person.last_name[0]}
                </span>
              </div>

              {/* Nombre y datos */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {person.last_name}, {person.first_name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {person.phone ?? person.email ?? 'Sin contacto registrado'}
                </p>
              </div>

              <PersonBadge type={person.person_type as PersonType} />
            </button>
          ))}
        </div>
      )}

      {/* Total */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} de {(people ?? []).filter((p: Person) => p.is_active).length} personas
        </p>
      )}
    </div>
  )
}
