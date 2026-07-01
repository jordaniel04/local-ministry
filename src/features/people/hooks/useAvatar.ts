import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Comprime la imagen usando Canvas API antes de subirla.
// Resultado: JPEG de máximo 800×800px a calidad 80% (~100-200KB desde 20MB)
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const MAX = 800
      let { width, height } = img

      // Escalar manteniendo proporción
      if (width > height && width > MAX) {
        height = Math.round((height * MAX) / width)
        width = MAX
      } else if (height > width && height > MAX) {
        width = Math.round((width * MAX) / height)
        height = MAX
      } else if (width > MAX) {
        width = MAX
        height = MAX
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Error al comprimir imagen'))
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error al cargar imagen')) }
    img.src = url
  })
}

export function useUploadAvatar(personId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Comprimir
      const compressed = await compressImage(file)

      // 2. Subir a Storage (ruta: avatars/{personId}.jpg)
      const path = `${personId}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) throw uploadError

      // 3. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // 4. Guardar URL en la tabla people (con cache-bust para forzar recarga)
      const avatarUrl = `${publicUrl}?t=${Date.now()}`
      const { error: updateError } = await supabase
        .from('people')
        .update({ avatar_url: avatarUrl })
        .eq('id', personId)
      if (updateError) throw updateError

      return avatarUrl
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['people'] })
      qc.invalidateQueries({ queryKey: ['people', personId] })
    },
  })
}
