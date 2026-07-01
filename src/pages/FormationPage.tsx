import { useState } from 'react'
import { CurriculumManager } from '@/features/formation'
import { PersonProgressView } from '@/features/formation'
import { cn } from '@/lib/utils'

type Tab = 'curriculum' | 'progress'

export function FormationPage() {
  const [tab, setTab] = useState<Tab>('progress')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Formación</h1>
        <p className="text-muted-foreground text-sm">Currículo de módulos, lecciones y progreso por persona.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: 'progress', label: 'Progreso por persona' },
          { key: 'curriculum', label: 'Gestionar currículo' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'curriculum' && <CurriculumManager />}
      {tab === 'progress' && <PersonProgressView />}
    </div>
  )
}
