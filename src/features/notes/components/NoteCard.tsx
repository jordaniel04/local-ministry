import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteNote } from '../hooks/useNotes'
import type { ExpositionNote } from '../types'

type Props = {
  note: ExpositionNote
  onEdit: (note: ExpositionNote) => void
}

export function NoteCard({ note, onEdit }: Props) {
  const deleteNote = useDeleteNote()
  const [expanded, setExpanded] = useState(false)

  async function handleDelete() {
    if (!confirm(`¿Eliminar la nota "${note.title}"?`)) return
    await deleteNote.mutateAsync(note.id)
  }

  const hasDetail = note.content || note.highlights || note.improvements

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-start gap-3 p-4">
        <button
          className="flex-1 text-left"
          onClick={() => hasDetail && setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{note.title}</span>
            {note.speaker && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {note.speaker}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(note.exposition_date).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(note)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteNote.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {hasDetail && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
          {note.content && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Resumen</p>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          )}
          {note.highlights && (
            <div>
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">✓ Puntos destacados</p>
              <p className="text-sm whitespace-pre-wrap">{note.highlights}</p>
            </div>
          )}
          {note.improvements && (
            <div>
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">↑ Por mejorar</p>
              <p className="text-sm whitespace-pre-wrap">{note.improvements}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
