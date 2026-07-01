import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: 'default' | 'warning' | 'danger'
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }: Props) {
  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-3',
      variant === 'warning' && 'border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20',
      variant === 'danger' && 'border-red-400/50 bg-red-50/50 dark:bg-red-950/20',
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <Icon className={cn(
          'h-4 w-4',
          variant === 'default' && 'text-muted-foreground',
          variant === 'warning' && 'text-yellow-600',
          variant === 'danger' && 'text-red-600',
        )} />
      </div>
      <div>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
