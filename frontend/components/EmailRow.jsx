import { cn } from '@/lib/utils'
import { ClassificationChip } from './ClassificationChip'

export function EmailRow({ thread, onClick, className }) {
  const getVariant = (classification) => {
    switch (classification?.toLowerCase()) {
      case 'urgent':
        return 'urgent'
      case 'follow-up':
      case 'followup':
        return 'followup'
      case 'client':
        return 'client'
      default:
        return 'outline'
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all',
        thread.unread && 'border-l-4 border-l-primary font-medium',
        className
      )}
    >
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{thread.clientName}</span>
          <ClassificationChip variant={getVariant(thread.classification)}>
            {thread.classification}
          </ClassificationChip>
        </div>
        <h4 className="text-sm font-medium text-foreground truncate">
          {thread.subject}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {thread.snippet}
        </p>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {thread.timestamp}
      </div>
    </div>
  )
}
