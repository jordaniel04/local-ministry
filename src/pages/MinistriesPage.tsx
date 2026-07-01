import { MinistriesList } from '@/features/ministries'

export function MinistriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ministerios</h1>
        <p className="text-muted-foreground text-sm">Catálogo de ministerios y sus líderes asignados.</p>
      </div>
      <MinistriesList />
    </div>
  )
}
