'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Check, CheckCircle2, Clock3, Mail, Sparkles, UserRound } from 'lucide-react'
import { threads } from '@/data/mockThreads'

type ClientEmail = {
  id: string;
  sender: string;
  email: string;
  subject: string;
  received: string;
  summary: string;
  reason: string
}

function getClientEmails(): ClientEmail[] {
  // Filter threads where the participant is the client (jordan@personal.in)
  // or threads that are marked as personal segment
  return threads
    .filter((t) => t.segment === 'personal')
    .map((thread) => {
      const lastMsg = thread.messages[thread.messages.length - 1]
      const time = new Date(lastMsg.sentAt).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        weekday: "short",
      })

      const sender = thread.participants.find(
        (p) => p.email !== "jordan@postmark.in" && p.email !== "jordan@personal.in"
      )

      return {
        id: thread.id,
        sender: sender?.name || "Unknown",
        email: sender?.email || "",
        subject: thread.subject,
        received: time,
        summary: thread.summary,
        reason: thread.reason,
      }
    })
}

export default function ClientInboxPage() {
  const [emails] = useState(getClientEmails)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  function resolve(id: string, message: string) {
    setEmails((current) => current.filter((email) => email.id !== id))
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  function showSkeletons() {
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1200)
  }

  // For demo purposes, show workspace items that need client attention
  // Filter for "Client to Reply" classification
  const clientAttentionEmails = useMemo(() =>
    threads
      .filter((t) => t.classification === 'Client to Reply')
      .map((thread) => {
        const lastMsg = thread.messages[thread.messages.length - 1]
        const time = new Date(lastMsg.sentAt).toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          weekday: "short",
        })

        const sender = thread.participants.find(
          (p) => p.email !== "jordan@postmark.in" && p.email !== "jordan@personal.in"
        )

        return {
          id: thread.id,
          sender: sender?.name || "Unknown",
          email: sender?.email || "",
          subject: thread.subject,
          received: time,
          summary: thread.summary,
          reason: thread.reason,
        }
      }),
  [])

  // Combine personal emails with client attention items for demo
  const displayEmails = [...clientAttentionEmails, ...emails]

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 pb-12 pt-5 text-slate-900 antialiased sm:px-8 sm:pt-9">
      <div className="mx-auto max-w-[720px]">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[13px] font-semibold tracking-[-.04em]">
            <span className="grid size-8 place-items-center rounded-[10px] bg-indigo-600 text-white"><Mail className="size-4" /></span>
            postmark<span className="-ml-2 text-indigo-600">.</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="size-3 text-slate-400" />
              Switch to assistant view
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5">
              <span className="grid size-6 place-items-center rounded-full bg-violet-100 text-violet-700"><UserRound className="size-3.5" /></span>
              <span className="text-[13px] font-medium text-slate-600">Priya Sharma</span>
            </div>
          </div>
        </header>

        <section className="mb-6">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[.15em] text-indigo-600">Your personal inbox</p>
          <h1 className="text-[25px] font-semibold leading-tight tracking-[-.055em] sm:text-[34px]">Good morning, Priya</h1>
          <p className="mt-2 text-[13px] text-slate-500 sm:text-sm">{displayEmails.length ? `${displayEmails.length} things need your attention` : 'You\'re all caught up'}</p>
        </section>

        {displayEmails.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_2px_8px_rgba(15,23,42,.025)]">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-6" /></div>
            <h2 className="mt-4 text-[14px] font-semibold tracking-[-.03em]">You&apos;re all caught up</h2>
            <p className="mt-1.5 text-xs text-slate-500">Nothing needs your personal reply right now.</p>
            <button onClick={showSkeletons} className="mt-4 text-xs font-semibold text-indigo-600">Refresh inbox</button>
          </section>
        ) : (
          <div className="space-y-3">
            {loading ? [1, 2].map((id) => <div key={id} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="h-3 w-28 rounded bg-slate-100" /><div className="mt-4 h-4 w-3/4 rounded bg-slate-100" /><div className="mt-3 h-3 w-full rounded bg-slate-100" /><div className="mt-2 h-3 w-2/3 rounded bg-slate-100" /></div>) : displayEmails.map((email) => (
              <article key={email.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.025)] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{email.sender}<span className="ml-1.5 font-normal text-slate-400">&lt;{email.email}&gt;</span></p>
                    <h2 className="mt-2 text-[13px] font-semibold leading-snug tracking-[-.02em] text-slate-900">{email.subject}</h2>
                  </div>
                  <span className="shrink-0 pt-0.5 text-[13px] text-slate-400">{email.received}</span>
                </div>
                <p className="mt-3 text-xs leading-[1.7] text-slate-600">{email.summary}</p>
                <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
                  <p className="text-[13px] font-semibold text-amber-800">Why you?</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-amber-800/80">{email.reason}</p>
                </div>
                <Link href={`/conversation/${email.id}`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
                  View conversation <ArrowUpRight className="size-3" />
                </Link>
                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2">
                  <button onClick={() => resolve(email.id, 'Marked as handled')} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[13px] font-semibold text-white hover:bg-indigo-700">
                    <Check className="size-3.5" />Mark as handled
                  </button>
                  <button onClick={() => resolve(email.id, 'Your assistant will take it from here')} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                    <Sparkles className="size-3.5" />Let my assistant take over
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-slate-400">
          <Clock3 className="size-3" />Updated just now <span className="px-1">·</span>
          <button onClick={showSkeletons} className="font-semibold text-indigo-600">Refresh</button>
        </div>
        <p className="mt-7 text-center text-[13px] leading-relaxed text-slate-400">Your assistant has already taken care of the rest of your inbox.</p>
      </div>
      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl transition ${notice ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
        <Check className="size-3.5 text-emerald-300" />{notice}
      </div>
    </main>
  )
}