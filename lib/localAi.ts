import type { Thread } from '@/lib/types'

export const CLASSIFICATIONS = [
  'Assistant to Reply',
  'Client to Reply',
  'No Reply Needed',
  'Action Required',
  'Waiting for Response',
  'Meetings',
  'Important',
] as const

export type AiResult = Pick<Thread, 'classification' | 'confidence' | 'reason' | 'summary' | 'deadlines' | 'needsReview'>

const has = (text: string, words: string[]) => words.some((w) => text.includes(w))

/** Rule-based classifier. Used as the offline fallback when no LLM is reachable. */
export function keywordClassify(thread: Pick<Thread, 'subject' | 'messages'>): AiResult {
  const last = thread.messages[thread.messages.length - 1]
  const text = `${thread.subject} ${last?.body ?? ''}`.toLowerCase()
  let classification = 'Assistant to Reply'
  let confidence = 62
  let reason = 'Routine message with no clear owner, so it is flagged for assistant review.'

  if (has(text, ['unsubscribe', 'newsletter', 'digest', 'no-reply', 'noreply', 'receipt', 'otp', 'security alert', 'fyi'])) {
    classification = 'No Reply Needed'; confidence = 90; reason = 'Looks like a newsletter, notification or FYI update.'
  } else if (has(text, ['approve', 'approval', 'sign off', 'sign-off', 'your decision', 'your call', 'budget', 'contract', 'agreement', 'confidential'])) {
    classification = 'Client to Reply'; confidence = 84; reason = 'Asks for a decision or approval that only the client can give.'
  } else if (has(text, ['reschedule', 'schedule', 'meeting', 'call at', 'calendar', 'availability'])) {
    classification = 'Meetings'; confidence = 82; reason = 'Scheduling request the assistant can handle from the calendar.'
  } else if (has(text, ['invoice', 'gst', 'quote', 'quotation', 'payment', 'follow up', 'following up', 'reminder'])) {
    classification = 'Assistant to Reply'; confidence = 80; reason = 'Routine business or admin request the assistant can handle.'
  } else if (has(text, ['thanks', 'thank you', 'noted', 'resolved', 'done'])) {
    classification = 'No Reply Needed'; confidence = 72; reason = 'Conversation looks resolved.'
  }

  const firstLine = (last?.body ?? '').replace(/\s+/g, ' ').trim().slice(0, 140)
  return {
    classification,
    confidence,
    reason,
    summary: firstLine ? `${thread.subject}: ${firstLine}${firstLine.length >= 140 ? '…' : ''}` : thread.subject,
    deadlines: [],
    needsReview: confidence < 70,
  }
}

export function localDraft(thread: Thread): string {
  const last = thread.messages[thread.messages.length - 1]
  const sender = thread.participants.find((p) => p.email === last?.from)?.name?.split(' ')[0] ?? 'there'
  return `Hi ${sender},\n\nThank you for your message regarding "${thread.subject}". I have noted the details and will come back to you shortly with next steps.\n\nBest regards,\nJordan Davis`
}

/** Offline answer for "Ask your inbox" questions. */
export function localAsk(question: string, threads: Thread[]): { answer: string; threadIds: string[] } {
  const q = question.toLowerCase()
  const active = threads.filter((t) => !t.isArchived && !t.isCompleted)
  let picked: Thread[] = []
  let answer = ''
  if (q.includes('client')) {
    picked = active.filter((t) => t.classification === 'Client to Reply')
    answer = picked.length ? 'These conversations need the client’s personal reply:' : 'Nothing needs the client right now.'
  } else if (q.includes('waiting')) {
    picked = active.filter((t) => t.classification === 'Waiting for Response')
    answer = picked.length ? 'You are waiting on a response for:' : 'You are not waiting on anyone right now.'
  } else if (q.includes('review') || q.includes('unsure')) {
    picked = active.filter((t) => t.needsReview)
    answer = picked.length ? 'The AI was not confident about these, so they need your review:' : 'No conversations are flagged for review.'
  } else if (q.includes('meeting') || q.includes('schedule')) {
    picked = active.filter((t) => t.classification === 'Meetings')
    answer = picked.length ? 'Meetings and scheduling requests:' : 'No scheduling requests found.'
  } else if (q.includes('attention') || q.includes('action') || q.includes('need')) {
    picked = active.filter((t) => ['Assistant to Reply', 'Client to Reply', 'Action Required'].includes(t.classification))
    answer = picked.length ? 'These need a reply or action:' : 'Everything is handled.'
  } else {
    picked = active.filter((t) => `${t.subject} ${t.summary}`.toLowerCase().includes(q.split(' ').slice(-1)[0] ?? ''))
    answer = picked.length ? 'Here is what I found:' : 'I could not find a matching conversation. Try asking what needs attention.'
  }
  return { answer, threadIds: picked.slice(0, 5).map((t) => t.id) }
}

/** Sample "incoming" emails used by the Simulate-new-email demo button. */
export const incomingSamples: Array<{ name: string; email: string; subject: string; body: string }> = [
  { name: 'Neha Kulkarni', email: 'neha.kulkarni@punebiz.in', subject: 'Reschedule Thursday’s vendor call', body: 'Hi, could we reschedule Thursday’s vendor call to Friday 11 AM? Please confirm availability on the calendar.' },
  { name: 'CA Mohan Joshi', email: 'mohan@joshiassociates.in', subject: 'GST invoice for October — please confirm', body: 'Attached is the GST invoice for October. Kindly confirm the payment date so we can close the books.' },
  { name: 'Ananya Rao', email: 'ananya@northstar.vc', subject: 'Term sheet — need your decision by Monday', body: 'We have shared the revised term sheet. Please approve or share your concerns by Monday, this needs your personal sign off.' },
  { name: 'Tech Weekly', email: 'no-reply@techweekly.io', subject: 'Your weekly digest', body: 'Top stories this week. To unsubscribe click here. This is an automated newsletter.' },
]
