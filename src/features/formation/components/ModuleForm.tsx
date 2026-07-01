import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCreateModule, useUpdateModule } from '../hooks/useFormation'
import type { FormationModule } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  module?: FormationModule
  nextOrderIndex: number
}

export function ModuleForm({ open, onClose, module, nextOrderIndex }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createModule = useCreateModule()
  const updateModule = useUpdateModule()

  useEffect(() => {
    if (module) {
      setName(module.name)
      setDescription(module.description ?? '')
    } else {
      setName('')
      setDescription('')
    }
  }, [module, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (module) {
      await updateModule.mutateAsync({ id: module.id, name, description: description || null })
    } else {
      await createModule.mutateAsync({ name, description: description || null, order_index: nextOrderIndex })
    }
    onClose()
  }

  const isPending = createModule.isPending || updateModule.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{module ? 'Editar módulo' : 'Nuevo módulo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Consolidado, Discipulado 1..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} rows={2} placeholder="Descripción del módulo..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !name}>
              {isPending ? 'Guardando...' : module ? 'Guardar' : 'Crear módulo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
