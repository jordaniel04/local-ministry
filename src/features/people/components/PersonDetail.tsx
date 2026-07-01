import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePerson, useDeactivatePerson } from '../hooks/usePeople'
import { PersonBadge } from './PersonBadge'
import { PersonForm } from './PersonForm'
import { AvatarUpload } from './AvatarUpload'
import {
  MARITAL_STATUS_LABELS,
  HOLY_SPIRIT_LABELS,
} from '../types'
import type { PersonType, MaritalStatus, HolySpiritExperience } from '../types'

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

type FieldProps = { label: string; value: string }

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

export function PersonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: person, isLoading, error } = usePerson(id!)
  const deactivate = useDeactivatePerson()
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (error || !person) {
    return <p className="text-destructive text-sm">Persona no encontrada.</p>
  }

  async function handleDeactivate() {
    if (!confirm(`¿Desactivar a ${person!.first_name} ${person!.last_name}? No aparecerá en los listados activos.`)) return
    await deactivate.mutateAsync(person!.id)
    navigate('/people')
  }

  return (
    <>
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="space-y-3">
          {/* Fila top: botón volver + botones acción */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate('/people')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              {person.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeactivate}
                  disabled={deactivate.isPending}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <UserX className="h-3.5 w-3.5" />
                  Desactivar
                </Button>
              )}
            </div>
          </div>

          {/* Avatar + nombre */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <AvatarUpload
              personId={person.id}
              personName={`${person.first_name} ${person.last_name}`}
              avatarUrl={person.avatar_url ?? null}
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight">
                {person.last_name}, {person.first_name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <PersonBadge type={person.person_type as PersonType} />
                {!person.is_active && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Datos personales */}
        <section className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Datos personales
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Fecha de nacimiento" value={formatDate(person.birth_date)} />
            <Field
              label="Estado civil"
              value={person.marital_status
                ? MARITAL_STATUS_LABELS[person.marital_status as MaritalStatus]
                : '—'}
            />
          </div>
        </section>

        <Separator />

        {/* Contacto */}
        <section className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Contacto
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Teléfono" value={person.phone ?? '—'} />
            <Field label="Dirección" value={person.address ?? '—'} />
          </div>
        </section>

        <Separator />

        {/* Historia espiritual */}
        <section className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Historia espiritual
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Fecha de conversión" value={formatDate(person.conversion_date)} />
            <Field label="Bautismo en agua" value={formatDate(person.water_baptism_date)} />
            <Field
              label="Experiencia con el Espíritu Santo"
              value={HOLY_SPIRIT_LABELS[person.holy_spirit_experience as HolySpiritExperience]}
            />
            <Field label="Bautismo E.S." value={formatDate(person.holy_spirit_baptism_date)} />
          </div>
        </section>

        {person.notes && (
          <>
            <Separator />
            <section className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Notas
              </p>
              <p className="text-sm whitespace-pre-wrap">{person.notes}</p>
            </section>
          </>
        )}
      </div>

      <PersonForm open={editOpen} onClose={() => setEditOpen(false)} person={person} />
    </>
  )
}
