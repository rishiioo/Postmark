import type { Thread } from '@/lib/types'

const HOUR = 60 * 60 * 1000

/** "Reply Radar": days since a Client-to-Reply thread went quiet (null when it is not overdue). */
export function overdueDays(t: Pick<Thread, 'classification' | 'handledBy' | 'isCompleted' | 'isArchived' | 'lastMessageAt'>): number | null {
  if (t.classification !== 'Client to Reply' || t.handledBy || t.isCompleted || t.isArchived) return null
  const age = Date.now() - new Date(t.lastMessageAt).getTime()
  return age >= 48 * HOUR ? Math.floor(age / (24 * HOUR)) : null
}

export function timeAgo(iso?: string): string {
  if (!iso) return ''
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  return `${Math.round(hrs / 24)} d ago`
}
