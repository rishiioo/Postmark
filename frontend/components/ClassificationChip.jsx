import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/80',
        urgent:
          'bg-destructive/10 text-destructive border border-destructive/20',
        followup:
          'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        client:
          'bg-blue-500/10 text-blue-600 border border-blue-500/20',
        outline: 'text-foreground border border-input',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export function ClassificationChip({ className, variant, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
}
