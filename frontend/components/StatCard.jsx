import { cn } from '@/lib/utils'

export function StatCard({ title, value, icon: Icon, description, className }) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 text-card-foreground shadow-sm flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
