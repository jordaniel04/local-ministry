import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreatePerson, useUpdatePerson } from '../hooks/usePeople'
import {
  PERSON_TYPE_LABELS,
  MARITAL_STATUS_LABELS,
  HOLY_SPIRIT_LABELS,
} from '../types'
import type {
  Person,
  PersonType,
  MaritalStatus,
  HolySpiritExperience,
} from '../types'

type FormState = {
  first_name: string
  last_name: string
  phone: string
  address: string
  birth_date: string
  person_type: PersonType
  marital_status: MaritalStatus | ''
  conversion_date: string
  water_baptism_date: string
  holy_spirit_experience: HolySpiritExperience
  holy_spirit_baptism_date: string
  notes: string
}

const EMPTY_FORM: FormState = {
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  birth_date: '',
  person_type: 'visitor',
  marital_status: '',
  conversion_date: '',
  water_baptism_date: '',
  holy_spirit_experience: 'none',
  holy_spirit_baptism_date: '',
  notes: '',
}

type Props = {
  open: boolean
  onClose: () => void
  person?: Person
}

export function PersonForm({ open, onClose, person }: Props) {
  const isEditing = !!person
  const createPerson = useCreatePerson()
  const updatePerson = useUpdatePerson()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (person) {
      setForm({
        first_name: person.first_name,
        last_name: person.last_name,
        phone: person.phone ?? '',
        address: person.address ?? '',
        birth_date: person.birth_date ?? '',
        person_type: person.person_type as PersonType,
        marital_status: (person.marital_status as MaritalStatus) ?? '',
        conversion_date: person.conversion_date ?? '',
        water_baptism_date: person.water_baptism_date ?? '',
        holy_spirit_experience: person.holy_spirit_experience as HolySpiritExperience,
        holy_spirit_baptism_date: person.holy_spirit_baptism_date ?? '',
        notes: person.notes ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError(null)
  }, [person, open])

  // Si se llena la fecha de bautismo E.S., actualizar experiencia automáticamente
  function handleHolySpiritDateChange(date: string) {
    setForm((prev) => ({
      ...prev,
      holy_spirit_baptism_date: date,
      holy_spirit_experience: date ? 'baptized' : prev.holy_spirit_experience,
    }))
  }

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      birth_date: form.birth_date || null,
      person_type: form.person_type,
      marital_status: form.marital_status || null,
      conversion_date: form.conversion_date || null,
      water_baptism_date: form.water_baptism_date || null,
      holy_spirit_experience: form.holy_spirit_experience,
      holy_spirit_baptism_date: form.holy_spirit_baptism_date || null,
      notes: form.notes.trim() || null,
    }

    try {
      if (isEditing && person) {
        await updatePerson.mutateAsync({ id: person.id, ...payload })
      } else {
        await createPerson.mutateAsync(payload)
      }
      onClose()
    } catch {
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
    }
  }

  const isPending = createPerson.isPending || updatePerson.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar persona' : 'Nueva persona'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Datos personales */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Datos personales
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombres *</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellidos *</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('birth_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado civil</Label>
                <Select
                  value={form.marital_status}
                  onValueChange={(v) => set('marital_status', v as MaritalStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar...">
                      {form.marital_status ? MARITAL_STATUS_LABELS[form.marital_status] : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(MARITAL_STATUS_LABELS) as [MaritalStatus, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de persona *</Label>
              <Select
                value={form.person_type}
                onValueChange={(v) => set('person_type', v as PersonType)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {PERSON_TYPE_LABELS[form.person_type]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PERSON_TYPE_LABELS) as [PersonType, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Contacto */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Contacto
            </p>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('address', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Historia espiritual */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Historia espiritual
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conversion_date">Fecha de conversión</Label>
                <Input
                  id="conversion_date"
                  type="date"
                  value={form.conversion_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('conversion_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water_baptism_date">Fecha de bautismo en agua</Label>
                <Input
                  id="water_baptism_date"
                  type="date"
                  value={form.water_baptism_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('water_baptism_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experiencia con el Espíritu Santo</Label>
                <Select
                  value={form.holy_spirit_experience}
                  onValueChange={(v) => set('holy_spirit_experience', v as HolySpiritExperience)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {HOLY_SPIRIT_LABELS[form.holy_spirit_experience]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(HOLY_SPIRIT_LABELS) as [HolySpiritExperience, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="holy_spirit_baptism_date">
                  Fecha de bautismo E.S.
                </Label>
                <Input
                  id="holy_spirit_baptism_date"
                  type="date"
                  value={form.holy_spirit_baptism_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleHolySpiritDateChange(e.target.value)
                  }
                />
                {form.holy_spirit_baptism_date && (
                  <p className="text-xs text-muted-foreground">
                    Experiencia actualizada automáticamente a "Bautizado/a".
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('notes', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Observaciones sobre la persona..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear persona'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
