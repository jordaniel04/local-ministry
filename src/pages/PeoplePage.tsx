import { useState } from 'react'
import { PeopleList } from '@/features/people'
import { PersonForm } from '@/features/people'

export function PeoplePage() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Personas</h1>
        <p className="text-muted-foreground text-sm">Miembros, creyentes y visitantes del ministerio.</p>
      </div>

      <PeopleList onNewPerson={() => setFormOpen(true)} />

      <PersonForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
