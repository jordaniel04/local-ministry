import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { useUploadAvatar } from '../hooks/useAvatar'
import { cn } from '@/lib/utils'

type Props = {
  personId: string
  personName: string
  avatarUrl: string | null
}

export function AvatarUpload({ personId, personName, avatarUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAvatar(personId)
  const [preview, setPreview] = useState<string | null>(null)

  const initials = personName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Mostrar preview local inmediato mientras sube
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    await upload.mutateAsync(file)
    URL.revokeObjectURL(localUrl)
    setPreview(null)

    // Limpiar input para poder subir la misma foto de nuevo si quiere
    e.target.value = ''
  }

  const displayUrl = preview ?? avatarUrl

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        className={cn(
          'relative w-24 h-24 rounded-full overflow-hidden border-2 border-border',
          'hover:border-primary transition-colors group',
          'disabled:cursor-not-allowed'
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={personName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-2xl font-semibold text-muted-foreground">{initials}</span>
          </div>
        )}

        {/* Overlay con ícono de cámara al hover o durante carga */}
        <div className={cn(
          'absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity',
          upload.isPending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}>
          {upload.isPending
            ? <Loader2 className="h-6 w-6 text-white animate-spin" />
            : <Camera className="h-6 w-6 text-white" />
          }
        </div>
      </button>

      <p className="text-xs text-muted-foreground">
        {upload.isPending ? 'Subiendo...' : 'Toca para cambiar foto'}
      </p>

      {upload.isError && (
        <p className="text-xs text-destructive">Error al subir. Intentá de nuevo.</p>
      )}

      {/* Input oculto — accept="image/*" en móvil abre cámara o galería */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
