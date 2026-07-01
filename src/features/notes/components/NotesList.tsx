import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotes } from '../hooks/useNotes'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import type { ExpositionNote } from '../types'

export function NotesList() {
  const { data: notes, isLoading, error } = useNotes()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ExpositionNote | undefined>()

  if (error) return <p className="text-destructive text-sm">Error al cargar notas.</p>

  function openEdit(note: ExpositionNote) {
    setEditing(note)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(undefined)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva nota
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (notes ?? []).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay notas de exposiciones registradas aún.
          </div>
        ) : (
          <div className="space-y-2">
            {(notes ?? []).map((note) => (
              <NoteCard key={note.id} note={note} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>

      <NoteForm open={formOpen} onClose={closeForm} note={editing} />
    </>
  )
}
