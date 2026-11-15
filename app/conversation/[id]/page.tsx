'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Archive, CalendarDays, Check, ChevronDown, Clock3, Mail, MoreHorizontal, Send, ShieldCheck, Sparkles, Star, UserRound } from 'lucide-react'
import { threads, Thread } from '@/data/mockThreads'

type ConversationData = {
  id: string
  subject: string
  classification: string
  confidence: number
  summary: string
  reason: string
  deadlines: string[]
  participantCount: number
  thread: Array<{
    name: string
    email: string
    initials: string
    avatarColor: string
    time: string
    recipient: string
    content: string
  }>
  suggestedDraft: string
  segment: string
  isImportant: boolean
  isRead: boolean
}

const labels = ['Assistant to Reply', 'Client to Reply', 'Action Required', 'Meetings', 'No Reply Needed', 'Waiting for Response', 'Important']

function getThreadData(id: string): ConversationData | null {
  const t = threads.find((thread) => thread.id === id)
  if (!t) return null

  const participants = t.participants
  const otherParticipant = participants.find(
    (p) => p.email !== "jordan@postmark.in" && p.email !== "jordan@personal.in"
  )
  const otherName = otherParticipant?.name || "Unknown"
  const otherEmail = otherParticipant?.email || ""
  const initials = otherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Generate avatar color based on classification
  const colorMap: Record<string, string> = {
    "Assistant to Reply": "bg-rose-100 text-rose-700",
    "Action Required": "bg-amber-100 text-amber-700",
    "Client to Reply": "bg-violet-100 text-violet-700",
    "No Reply Needed": "bg-sky-100 text-sky-700",
    Meetings: "bg-emerald-100 text-emerald-700",
    "Waiting for Response": "bg-pink-100 text-pink-700",
    Important: "bg-indigo-100 text-indigo-700",
  }

  const threadMessages = t.messages.map((msg, index) => {
    const isFromOther = msg.from === otherEmail
    const sender = isFromOther ? otherParticipant : { name: "Jordan Davis", email: "jordan@postmark.in" }
    const recipient = isFromOther ? "To Jordan Davis" : `To ${otherName}`
    const time = new Date(msg.sentAt).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
    })

    return {
      name: sender?.name || "Unknown",
      email: sender?.email || "",
      initials: isFromOther ? initials : "JD",
      avatarColor: isFromOther ? colorMap[t.classification] || "bg-indigo-100 text-indigo-700" : "bg-indigo-100 text-indigo-700",
      time,
      recipient,
      content: msg.body,
    }
  })

  // Generate a suggested draft based on classification
  const draftMap: Record<string, string> = {
    "Assistant to Reply": `Hi ${otherName},\n\nThanks for the update. I'll review and get back to you shortly.\n\nBest,\nJordan`,
    "Action Required": `Hi ${otherName},\n\nI'll take care of this and follow up soon.\n\nBest,\nJordan`,
    "Client to Reply": `Hi ${otherName},\n\nThanks for sending this over. I'll review with the team and get back to you.\n\nBest,\nJordan`,
    "No Reply Needed": `Hi ${otherName},\n\nThanks for the information. No action needed on my end.\n\nBest,\nJordan`,
    "Meetings": `Hi ${otherName},\n\nWorks for me. I'll update the calendar invite.\n\nBest,\nJordan`,
    "Waiting for Response": `Hi ${otherName},\n\nJust following up on this. Let me know if you need anything from my side.\n\nBest,\nJordan`,
    "Important": `Hi ${otherName},\n\nThanks for flagging this. I'll address it promptly.\n\nBest,\nJordan`,
  }

  return {
    id: t.id,
    subject: t.subject,
    classification: t.classification,
    confidence: t.confidence,
    summary: t.summary,
    reason: t.reason,
    deadlines: t.deadlines,
    participantCount: t.participants.length,
    thread: threadMessages,
    suggestedDraft: draftMap[t.classification] || draftMap["Assistant to Reply"],
    segment: t.segment,
    isImportant: t.isImportant,
    isRead: t.isRead,
  }
}

export default function ConversationDynamicPage() {
  const params = useParams()
  const rawId = params?.id
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? '1')

  const conversation = useMemo(() => {
    const data = getThreadData(id)
    if (data) return data
    // Default fallback dynamically using the id
    return {
      id,
      subject: `Conversation #${id}`,
      classification: 'Assistant to Reply',
      confidence: 95,
      summary: `Conversation details and AI-classified message thread for #${id}.`,
      reason: 'This thread requires follow-up according to your workspace rules.',
      deadlines: ['Follow up needed soon'],
      participantCount: 2,
      thread: [
        {
          name: 'Sender',
          email: `sender-${id}@example.com`,
          initials: 'SN',
          avatarColor: 'bg-indigo-100 text-indigo-700',
          time: 'Today, 10:00 AM',
          recipient: 'To Jordan Davis',
          content: 'Hi Jordan,\n\nFollowing up on our earlier discussion. Looking forward to your thoughts.\n\nBest regards,',
        },
      ],
      suggestedDraft: 'Hi,\n\nThanks for following up. Everything looks good on my end.\n\nBest,\nJordan',
      segment: 'workspace',
      isImportant: false,
      isRead: false,
    }
  }, [id])

  const [classification, setClassification] = useState(conversation.classification)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [draft, setDraft] = useState(conversation.suggestedDraft)
  const [sent, setSent] = useState(false)
  const [notice, setNotice] = useState('')

  function notify(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2400)
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900 antialiased">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:h-[68px] sm:px-7">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-700">
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to inbox</span>
        </Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-[-0.03em]">
          postmark<span className="text-indigo-600">.</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => notify('Conversation archived')} aria-label="Archive" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Archive className="size-4" />
          </button>
          <button onClick={() => notify('Marked important')} aria-label="Mark important" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Star className="size-4" />
          </button>
          <button aria-label="More actions" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1160px] px-4 pb-10 pt-5 sm:px-7 sm:pt-8">
        <div className="mb-5">
          <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.13em] text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-600">Inbox</Link> <span className="px-1 text-slate-300">/</span> Conversation
          </p>
          <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.04em] sm:text-[25px]">{conversation.subject}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {conversation.thread.length} messages <span className="px-1 text-slate-300">·</span> Last reply {conversation.thread[conversation.thread.length - 1]?.time}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="min-w-0 space-y-3">
            {conversation.thread.map((msg, index) => (
              <section key={index} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.025)] sm:p-5">
                <div className="flex items-start gap-3">
                  <div className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${msg.avatarColor}`}>
                    {msg.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-[13px] font-semibold text-slate-800">
                        {msg.name} <span className="font-normal text-slate-400">&lt;{msg.email}&gt;</span>
                      </p>
                      <span className="text-[13px] text-slate-400">{msg.time}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-slate-400">{msg.recipient}</p>
                    <p className="mt-4 whitespace-pre-line text-xs leading-[1.8] text-slate-600">{msg.content}</p>
                  </div>
                </div>
              </section>
            ))}

            <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-[0_2px_8px_rgba(15,23,42,.025)]">
              <div className="flex items-center justify-between border-b border-indigo-50 bg-indigo-50/50 px-4 py-3">
                <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Sparkles className="size-3.5 text-indigo-600" />Draft reply
                </h2>
                <button
                  onClick={() => setDraft(conversation.suggestedDraft)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <Sparkles className="size-3" />Generate AI draft
                </button>
              </div>
              {sent ? (
                <div className="flex items-center gap-2 px-4 py-5 text-xs font-medium text-emerald-700">
                  <Check className="size-4" />Reply sent successfully
                </div>
              ) : (
                <>
                  <textarea
                    aria-label="Draft reply text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={5}
                    className="w-full resize-y border-0 px-4 py-3 text-xs leading-[1.8] text-slate-600 outline-none focus:ring-0"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[13px] text-slate-400">
                      <ShieldCheck className="size-3.5" />AI drafts should be reviewed before sending.
                    </p>
                    <button
                      onClick={() => setSent(true)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[13px] font-semibold text-white hover:bg-indigo-700"
                    >
                      <Send className="size-3" />Approve & Send
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>

          <aside className="min-w-0">
            <button
              onClick={() => setInsightsOpen(!insightsOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left lg:hidden"
            >
              <span className="flex items-center gap-2 text-xs font-semibold">
                <Sparkles className="size-3.5 text-indigo-600" />AI Insights
              </span>
              <ChevronDown className={`size-4 text-slate-400 transition-transform ${insightsOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${insightsOpen ? 'block' : 'hidden'} mt-2 space-y-3 lg:sticky lg:top-[84px] lg:mt-0 lg:block`}>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.025)] sm:p-5">
                <h2 className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                  <Sparkles className="size-3.5 text-indigo-600" />AI Insights
                </h2>
                <p className="mt-4 text-[13px] font-semibold uppercase tracking-[.12em] text-slate-400">Summary</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{conversation.summary}</p>
                <p className="mt-4 text-[13px] font-semibold uppercase tracking-[.12em] text-slate-400">Classification</p>
                <div className="mt-2">
                  <select
                    aria-label="Change classification"
                    value={classification}
                    onChange={(event) => setClassification(event.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-semibold text-indigo-700 outline-none focus:border-indigo-300"
                  >
                    {labels.map((label) => <option key={label}>{label}</option>)}
                  </select>
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px] text-slate-400">
                  <span>Confidence</span>
                  <span className="font-semibold text-slate-600">{conversation.confidence}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${conversation.confidence}%` }} />
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-[13px] font-semibold text-slate-700">Why this classification?</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{conversation.reason}</p>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-slate-400">Dates & deadlines</p>
                  {conversation.deadlines.length > 0 ? (
                    conversation.deadlines.map((deadline, i) => (
                      <p key={i} className="mt-2 flex items-start gap-2 text-[13px] text-slate-600">
                        <CalendarDays className="size-3.5 shrink-0 text-indigo-500" />
                        {deadline}
                      </p>
                    ))
                  ) : (
                    <p className="mt-2 flex items-center gap-2 text-[13px] text-slate-500">
                      <Clock3 className="size-3.5 text-slate-400" />
                      No specific deadlines
                    </p>
                  )}
                  <p className="mt-2 flex items-center gap-2 text-[13px] text-slate-500">
                    <Clock3 className="size-3.5 text-slate-400" />
                    Follow up by end of day
                  </p>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-slate-400">Segment</p>
                  <p className="mt-1 text-xs text-slate-600 capitalize">{conversation.segment}</p>
                </div>
              </section>
              <section className="rounded-xl border border-slate-200/80 bg-white p-4">
                <p className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                  <UserRound className="size-3.5" />{conversation.participantCount} participants in this thread
                </p>
              </section>
            </div>
          </aside>
        </div>
      </div>
      <div aria-live="polite" className={`fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl transition ${notice ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>{notice}</div>
    </main>
  )
}