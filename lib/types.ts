export type Message = {
  from: string
  to: string
  body: string
  sentAt: string
}

export type Participant = {
  name: string
  email: string
}

export type Thread = {
  id: string
  subject: string
  participants: Participant[]
  messages: Message[]
  classification: string
  confidence: number // 0-100
  reason: string
  summary: string
  deadlines: string[]
  segment: 'workspace' | 'personal'
  needsReview: boolean
  correctedByUser: boolean
  isRead: boolean
  isImportant: boolean
  isArchived: boolean
  isCompleted: boolean
  handledBy: 'client' | 'assistant' | null
  handledAt?: string
  lastMessageAt: string
}