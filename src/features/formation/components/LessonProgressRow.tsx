import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSaveLessonProgress } from '../hooks/useFormation'
import type { LessonWithProgress } from '../types'

type Props = {
  lesson: LessonWithProgress
  personId: string
  index: number
}

export function LessonProgressRow({ lesson, personId, index }: Props) {
  const save = useSaveLessonProgress()
  const [editing, setEditing] = useState(false)
  const [score, setScore] = useState(lesson.progress?.score?.toString() ?? '')
  const [notes, setNotes] = useState(lesson.progress?.score_notes ?? '')

  const completed = lesson.progress?.completed ?? false

  async function toggleCompleted() {
    await save.mutateAsync({
      id: lesson.progress?.id,
      person_id: personId,
      lesson_id: lesson.id,
      completed: !completed,
      completed_at: !completed ? new Date().toISOString() : null,
      score: lesson.progress?.score ?? null,
      score_notes: lesson.progress?.score_notes ?? null,
    })
  }

  async function handleSaveScore() {
    const parsedScore = score ? parseFloat(score) : null
    await save.mutateAsync({
      id: lesson.progress?.id,
      person_id: personId,
      lesson_id: lesson.id,
      completed: completed,
      completed_at: lesson.progress?.completed_at ?? null,
      score: parsedScore,
      score_notes: notes || null,
    })
    setEditing(false)
  }

  return (
    <div className={cn('py-2 border-b last:border-0', completed && 'opacity-80')}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleCompleted}
          disabled={save.isPending}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
        >
          {completed
            ? <CheckCircle className="h-4 w-4 text-green-600" />
            : <Circle className="h-4 w-4" />
          }
        </button>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
            <span className={cn('text-sm', completed && 'line-through text-muted-foreground')}>
              {lesson.title}
            </span>
            {lesson.progress?.score != null && (
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                {lesson.progress.score.toFixed(1)}
              </span>
            )}
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              {editing ? 'Cancelar' : lesson.progress?.score != null ? 'Editar nota' : 'Agregar nota'}
            </button>
          </div>

          {/* Panel de nota */}
          {editing && (
            <div className="mt-2 space-y-2 pl-7">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Nota (0-100)"
                  className="w-32 h-8 text-sm"
                />
              </div>
              <Textarea
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder="Observaciones del evaluador..."
                rows={2}
                className="text-sm"
              />
              <Button size="sm" onClick={handleSaveScore} disabled={save.isPending}>
                Guardar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
