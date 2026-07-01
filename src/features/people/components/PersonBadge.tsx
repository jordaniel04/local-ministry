import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PersonType } from '../types'
import { PERSON_TYPE_LABELS } from '../types'

type Props = {
  type: PersonType
  className?: string
}

const typeStyles: Record<PersonType, string> = {
  member: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  believer: 'bg-green-100 text-green-800 hover:bg-green-100',
  visitor: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
}

export function PersonBadge({ type, className }: Props) {
  return (
    <Badge className={cn(typeStyles[type], className)}>
      {PERSON_TYPE_LABELS[type]}
    </Badge>
  )
}
