'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Archive, CalendarDays, Check, ChevronDown, Clock3, Mail, MoreHorizontal, Send, ShieldCheck, Sparkles, Star, UserRound } from 'lucide-react'

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

const mockConversations: Record<string, ConversationData> = {
  '1': {
    id: '1',
    subject: 'Q4 brand campaign — final assets',
    category: 'Assistant to Reply',
    confidence: 98,
    summary: 'Olivia sent final Q4 campaign assets and is waiting for your approval before scheduling launch.',
    why: 'The sender asks you to approve final assets before the team can schedule the campaign launch.',
    deadline: 'Campaign launch pending your approval · Follow up by end of day',
    participantCount: 3,
    thread: [
      { name: 'Olivia Rhye', email: 'olivia@acme.co', initials: 'OR', avatarColor: 'bg-rose-100 text-rose-700', time: 'Today, 9:18 AM', recipient: 'To Jordan Davis', content: 'Hi Jordan,\n\nSharing the latest campaign assets for Q4. We’ve incorporated the feedback from last week and updated the launch creative. Could you take a look and let me know if you’re happy for us to move forward?\n\nThanks,\nOlivia' },
      { name: 'Jordan Davis', email: 'jordan@acme.co', initials: 'JD', avatarColor: 'bg-indigo-100 text-indigo-700', time: 'Today, 9:34 AM', recipient: 'To Olivia Rhye', content: 'Thanks, Olivia — I’ll take a look this morning and get back to you.' },
      { name: 'Olivia Rhye', email: 'olivia@acme.co', initials: 'OR', avatarColor: 'bg-rose-100 text-rose-700', time: 'Today, 10:42 AM', recipient: 'To Jordan Davis', content: 'Just checking this landed in your inbox. The team is ready to schedule the launch as soon as we have your approval.' },
    ],
    suggestedDraft: 'Hi Olivia,\n\nThanks for the updated assets. The direction looks great — please go ahead and schedule the launch.\n\nBest,\nJordan',
  },
  '2': {
    id: '2',
    subject: 'Re: Design partner check-in',
    category: 'Action Required',
    confidence: 96,
    summary: 'Marcus is asking to move Thursday’s call to 2:30 PM; calendar is currently clear.',
    why: 'Schedule conflict resolution requires checking availability and updating the invite.',
    deadline: 'Respond before end of day today',
    participantCount: 2,
    thread: [
      { name: 'Marcus Chen', email: 'marcus@figma.com', initials: 'MC', avatarColor: 'bg-amber-100 text-amber-700', time: 'Today, 10:18 AM', recipient: 'To Jordan Davis', content: 'Hey Jordan,\n\nCan we push Thursday’s partner sync to 2:30 PM PT? Something urgent came up on my side for the morning slot.\n\nThanks,\nMarcus' },
    ],
    suggestedDraft: 'Hi Marcus,\n\n2:30 PM PT on Thursday works perfectly for me. I’ve updated the calendar invite.\n\nBest,\nJordan',
  },
  '3': {
    id: '3',
    subject: 'Updated proposal for workspace',
    category: 'Client to Reply',
    confidence: 94,
    summary: 'Revised proposal is ready to review, with updated pricing and the new team rollout plan.',
    why: 'Requires executive decision on team tier and annual budget allocation.',
    deadline: 'Decision requested by Friday',
    participantCount: 2,
    thread: [
      { name: 'Priya Sharma', email: 'priya@notion.so', initials: 'PS', avatarColor: 'bg-violet-100 text-violet-700', time: 'Today, 9:56 AM', recipient: 'To Jordan Davis', content: 'Hi Jordan,\n\nI’ve attached the revised proposal with the custom enterprise tiers we discussed. Let me know your thoughts on the user tiering.\n\nBest regards,\nPriya' },
    ],
    suggestedDraft: 'Hi Priya,\n\nThanks for sending over the revised numbers. I’ll review the user tier breakdown with the team and get back to you by tomorrow.\n\nBest,\nJordan',
  },
}

const labels = ['Assistant to Reply', 'Client to Reply', 'Action Required', 'Meetings', 'No Reply Needed', 'Waiting for Response']

export default function ConversationDynamicPage() {
  const params = useParams()
  const rawId = params?.id
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? '1')

  const conversation = useMemo(() => {
    if (mockConversations[id]) return mockConversations[id]
    // Default fallback dynamically using the id
    return {
      id,
      subject: `Conversation #${id}`,
      category: 'Assistant to Reply',
      confidence: 95,
      summary: `Conversation details and AI-classified message thread for #${id}.`,
      why: 'This thread requires follow-up according to your workspace rules.',
      deadline: 'Follow up needed soon',
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
    }
  }, [id])

  const [classification, setClassification] = useState(conversation.category)
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
                      <Send className="size-3" />Approve &amp; Send
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
