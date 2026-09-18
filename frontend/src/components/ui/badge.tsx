import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors duration-[var(--motion-fast)] focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-status-neutral-bg text-status-neutral-fg',
        secondary: 'border-transparent bg-muted text-muted-foreground',
        destructive: 'border-transparent bg-status-danger-bg text-status-danger-fg',
        outline: 'border-border text-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
