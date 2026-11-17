'use client'

import { useEffect, useMemo, useState } from 'react'
import { useThread } from '@/lib/store'
import { overdueDays } from '@/lib/radar'
import { classificationStyle, confidenceBarStyle } from '@/lib/classification'
import type { Thread } from '@/lib/types'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Archive, AlertTriangle, CalendarDays, Check, ChevronDown, Clock3, Mail, MoreHorizontal, Send, ShieldCheck, Sparkles, Star, UserRound } from 'lucide-react'

type ConversationData = {
  id: string
  subject: string
  category: string
  confidence: number
  summary: string
  why: string
  deadline: string
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
}

function toConversation(t: Thread): ConversationData {
  return {
    id: t.id,
    subject: t.subject,
    category: t.classification,
    confidence: t.confidence,
    summary: t.summary,
    why: t.reason,
    deadline: t.deadlines[0] ?? 'No dates or deadlines detected',
    participantCount: t.participants.length,
    thread: t.messages.map((m) => {
      const sender = t.participants.find((p) => p.email === m.from)
      const name = sender?.name ?? m.from
      const recipient = t.participants.find((p) => p.email === m.to)?.name ?? m.to
      const d = new Date(m.sentAt)
      return {
        name,
        email: m.from,
        initials: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
        avatarColor: 'bg-indigo-100 text-indigo-700',
        time: d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
        recipient: `To ${recipient}`,
        content: m.body,
      }
    }),
    suggestedDraft: '',
  }
}

export default function ConversationDynamicPage() {
  const params = useParams()
  const rawId = params?.id
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? '')
  const { thread, loading, updateThread, generateDraft, saveRule } = useThread(id)
  const conversation = useMemo(() => (thread ? toConversation(thread) : null), [thread])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [sent, setSent] = useState(false)
  const [rulePrompt, setRulePrompt] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (thread && !thread.isRead) updateThread(thread.id, { isRead: true })
  }, [thread, updateThread])

  function notify(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2400)
  }

  if (!thread || !conversation) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-4 text-center text-slate-900">
        <div>
          <p className="text-sm font-semibold">{loading ? 'Loading conversation…' : 'Conversation not found'}</p>
          {!loading && <p className="mt-1 text-[13px] text-slate-500">It may have been removed or the link is incorrect.</p>}
          <Link href="/dashboard" className="mt-4 inline-flex text-[13px] font-semibold text-indigo-600">Back to inbox</Link>
        </div>
      </main>
    )
  }

  const classification = thread.classification
  const otherParty = thread.participants.find((p) => !p.email.includes('jordan@')) ?? thread.participants[0]

  function changeClassification(value: string) {
    updateThread(thread!.id, { classification: value, correctedByUser: true, needsReview: false })
    setRulePrompt(value)
    notify(`Moved to ${value}`)
  }

  async function handleGenerate() {
    setDrafting(true)
    try { setDraft(await generateDraft(thread!.id)) } finally { setDrafting(false) }
  }

  function handleSend() {
    const now = new Date().toISOString()
    updateThread(thread!.id, {
      messages: [...thread!.messages, { from: 'jordan@postmark.in', to: otherParty.email, body: draft, sentAt: now }],
      lastMessageAt: now,
      classification: 'Waiting for Response',
      needsReview: false,
      isRead: true,
    })
    setSent(true)
    setConfirming(false)
    notify('Reply sent (simulated) — now waiting for a response')
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
          <button onClick={() => { updateThread(thread.id, { isArchived: !thread.isArchived }); notify(thread.isArchived ? 'Moved back to inbox' : 'Conversation archived') }} aria-label="Archive" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Archive className="size-4" />
          </button>
          <button onClick={() => { updateThread(thread.id, { isImportant: !thread.isImportant }); notify(thread.isImportant ? 'Removed from important' : 'Marked important') }} aria-label="Mark important" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Star className={`size-4 ${thread.isImportant ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
          <button onClick={() => { updateThread(thread.id, { isRead: false }); notify('Marked as unread') }} aria-label="Mark unread" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Mail className="size-4" />
          </button>
          <button onClick={() => { updateThread(thread.id, { isCompleted: !thread.isCompleted, handledBy: thread.isCompleted ? null : 'assistant' }); notify(thread.isCompleted ? 'Reopened' : 'Marked as completed') }} aria-label="Mark completed" className={`grid size-8 place-items-center rounded-lg hover:bg-slate-100 ${thread.isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
            <Check className="size-4" />
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
                  onClick={handleGenerate}
                  disabled={drafting}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
                >
                  <Sparkles className="size-3" />{drafting ? 'Drafting…' : 'Generate AI draft'}
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
                    placeholder="Click "Generate AI draft", or write your own reply. Nothing is sent until you approve."
                    className="w-full resize-y border-0 px-4 py-3 text-base sm:text-xs leading-[1.8] text-slate-600 outline-none focus:ring-0"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[13px] text-slate-400">
                      <ShieldCheck className="size-3.5" />AI drafts should be reviewed before sending.
                    </p>
                    <div className="flex items-center gap-2">
                      {confirming && (
                        <button onClick={() => setConfirming(false)} className="h-8 rounded-lg px-3 text-[13px] font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
                      )}
                      <button
                        onClick={() => (confirming ? handleSend() : setConfirming(true))}
                        disabled={!draft.trim()}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        <Send className="size-3" />{confirming ? 'Yes, send it' : 'Approve & Send'}
                      </button>
                    </div>
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
                <div className="mt-2 flex items-center gap-2">
                  {(() => {
                    const { chip, dot } = classificationStyle(classification);
                    return (
                      <span className={chip}>
                        <span className={dot} aria-hidden="true" />
                        {classification}
                      </span>
                    );
                  })()}
                  <select
                    aria-label="Change classification"
                    value={classification}
                    onChange={(event) => changeClassification(event.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-semibold text-indigo-700 outline-none focus:border-indigo-300"
                  >
                    <option>Assistant to Reply</option>
                    <option>Client to Reply</option>
                    <option>Action Required</option>
                    <option>Meetings</option>
                    <option>Important</option>
                    <option>No Reply Needed</option>
                    <option>Waiting for Response</option>
                  </select>
                </div>
                {thread.correctedByUser && <p className="mt-1.5 text-[12px] font-semibold text-emerald-600">Corrected by you</p>}
                {rulePrompt && (
                  <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-2.5 text-[13px] text-indigo-900">
                    Always treat emails from {otherParty.name} as <strong>{rulePrompt}</strong>?
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => { saveRule(otherParty.email, rulePrompt).catch(() => {}); setRulePrompt(null); notify('Rule saved for this sender') }} className="rounded-md bg-indigo-600 px-2.5 py-1 text-[12px] font-semibold text-white">Yes, remember</button>
                      <button onClick={() => setRulePrompt(null)} className="rounded-md px-2.5 py-1 text-[12px] font-semibold text-slate-500 hover:bg-white">Just this once</button>
                    </div>
                  </div>
                )}
                {thread.needsReview && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[13px] text-amber-800">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />The AI is not confident about this one. Please confirm or change the classification.
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between text-[13px] text-slate-400">
                  <span>Confidence</span>
                  <span className="font-semibold text-slate-600">{conversation.confidence}%</span>
                </div>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-slate-100">
                  <div className={`${confidenceBarStyle(conversation.confidence)} h-full rounded-full`} style={{ width: `${conversation.confidence}%` }} />
                </div>
                {overdueDays(thread) !== null && (
                  <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-[13px] text-orange-800">
                    <p className="font-semibold">Reply Radar</p>
                    <p className="mt-0.5">The client hasn’t replied in {overdueDays(thread)} days.</p>
                    <button onClick={() => notify('Nudge sent to the client (simulated)')} className="mt-2 rounded-md bg-orange-600 px-2.5 py-1 font-semibold text-white hover:bg-orange-700">Nudge client</button>
                  </div>
                )}
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-[13px] font-semibold text-slate-700">Why this classification?</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{conversation.why}</p>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-slate-400">Dates &amp; deadlines</p>
                  <p className="mt-2 flex items-start gap-2 text-[13px] text-slate-600">
                    <CalendarDays className="size-3.5 shrink-0 text-indigo-500" />
                    {conversation.deadline}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-[13px] text-slate-500">
                    <Clock3 className="size-3.5 text-slate-400" />
                    Follow up by end of day
                  </p>
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
