'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, CornerDownLeft, MessageSquareText, Paperclip, Plus, Sparkles, X } from 'lucide-react'

type EmailReference = { sender: string; subject: string; classification: string; initials: string; avatar: string; email: string }
type ChatMessage = { role: 'user' | 'assistant'; text: string; references?: EmailReference[] }
const suggestions = ['Show emails that need my attention', 'What am I waiting on?', 'Which emails need the client?', "Summarize today's emails"]
const emails: EmailReference[] = [
  { sender: 'Olivia Rhye', subject: 'Q4 brand campaign — final assets', classification: 'Assistant to Reply', initials: 'OR', avatar: 'bg-rose-100 text-rose-700', email: 'olivia@acme.co' },
  { sender: 'Priya Sharma', subject: 'Updated proposal for workspace', classification: 'Client to Reply', initials: 'PS', avatar: 'bg-violet-100 text-violet-700', email: 'priya@notion.so' },
  { sender: 'Sofia Andersson', subject: 'Next week’s leadership offsite', classification: 'Action Required', initials: 'SA', avatar: 'bg-emerald-100 text-emerald-700', email: 'sofia@acme.co' },
]

function answerFor(prompt: string) {
  const q = prompt.toLowerCase()
  if (q.includes('client')) return { text: 'These conversations are waiting on a reply from the client. Here are a few to follow up on:', references: emails.filter((email) => email.classification === 'Client to Reply') }
  if (q.includes('waiting')) return { text: 'You’re waiting on a response in a few conversations. Here are the latest ones:', references: [emails[2], { ...emails[0], classification: 'Waiting for Response' }] }
  if (q.includes('summarize')) return { text: 'You’ve had a busy morning. A campaign is ready for your approval, a partner shared updated terms, and the offsite dinner needs a decision.', references: emails }
  return { text: 'I found a few conversations that could use your attention today. These are the most time-sensitive:', references: emails }
}

function categoryStyle(category: string) {
  if (category === 'Client to Reply') return 'bg-violet-50 text-violet-700'
  if (category === 'Waiting for Response') return 'bg-sky-50 text-sky-700'
  if (category === 'Action Required') return 'bg-amber-50 text-amber-700'
  return 'bg-indigo-50 text-indigo-700'
}

export function InboxChatPanel({ open, onClose, onOpenEmail }: { open: boolean; onClose: () => void; onOpenEmail: (email: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!typing) return
    const timer = window.setTimeout(() => {
      const prompt = [...messages].reverse().find((message) => message.role === 'user')?.text ?? ''
      setMessages((current) => [...current, { role: 'assistant', ...answerFor(prompt) }])
      setTyping(false)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [typing, messages])

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  function sendMessage(value: string) {
    const text = value.trim()
    if (!text || typing) return
    setMessages((current) => [...current, { role: 'user', text }])
    setDraft('')
    setTyping(true)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage(draft)
  }

  return <>
    <button aria-label="Close Ask your inbox panel" tabIndex={open ? 0 : -1} onClick={onClose} className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
    <aside role="dialog" aria-modal="true" aria-label="Ask your inbox" aria-hidden={!open} className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-slate-200 bg-[#fbfcfd] shadow-2xl shadow-slate-950/10 transition-transform duration-300 ease-out sm:max-w-[420px] ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Sparkles className="size-[17px]" /></span><div><h2 className="text-[13px] font-semibold tracking-[-0.02em] text-slate-900">Ask your inbox</h2><p className="mt-0.5 text-[9px] text-slate-400">Your email, a little easier</p></div></div><button tabIndex={open ? 0 : -1} aria-label="Close chat" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="size-4" /></button></header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
        {messages.length === 0 ? <div className="flex min-h-full flex-col justify-center pb-8"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><MessageSquareText className="size-5" /></div><h3 className="text-center text-[18px] font-semibold tracking-[-0.04em] text-slate-900">A little more clarity,</h3><p className="mt-1 text-center text-[11px] text-slate-500">right where you need it.</p><div className="mt-7"><p className="mb-2.5 px-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">Try asking</p><div className="flex flex-col gap-2">{suggestions.map((suggestion) => <button key={suggestion} tabIndex={open ? 0 : -1} onClick={() => sendMessage(suggestion)} className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 text-left text-[10px] font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700"><span>{suggestion}</span><ArrowRight className="size-3 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" /></button>)}</div></div></div> : <div className="flex flex-col gap-5">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>{message.role === 'assistant' && <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Sparkles className="size-3.5" /></span>}<div className={`${message.role === 'user' ? 'max-w-[88%] rounded-2xl rounded-tr-sm bg-indigo-600 px-3.5 py-2.5 text-white' : 'min-w-0 flex-1'}`}><p className={`text-[11px] leading-[1.75] ${message.role === 'assistant' ? 'text-slate-700' : ''}`}>{message.text}</p>{message.references && <div className="mt-3 flex flex-col gap-2">{message.references.map((email) => <button key={`${email.email}-${email.subject}`} tabIndex={open ? 0 : -1} onClick={() => onOpenEmail(email.email)} className="group w-full rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-indigo-200 hover:shadow-sm"><div className="flex items-start gap-2.5"><span className={`grid size-7 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${email.avatar}`}>{email.initials}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[10px] font-semibold text-slate-800">{email.sender}</span><ArrowUpRight className="size-3 shrink-0 text-slate-300 transition group-hover:text-indigo-500" /></span><span className="mt-1 block truncate text-[10px] text-slate-500">{email.subject}</span><span className={`mt-2 inline-flex rounded-md px-1.5 py-1 text-[8px] font-semibold ${categoryStyle(email.classification)}`}>{email.classification}</span></span></div></button>)}</div>}</div></div>)}{typing && <div className="flex items-start gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Sparkles className="size-3.5" /></span><div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-3.5 py-3"><span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.24s]" /><span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.12s]" /><span className="size-1.5 animate-bounce rounded-full bg-indigo-400" /><span className="sr-only">Assistant is typing</span></div></div>}</div>}
      </div>
      {messages.length > 0 && !typing && <button tabIndex={open ? 0 : -1} onClick={() => { setMessages([]); setDraft('') }} className="mx-5 mb-2 inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><Plus className="size-3" />New conversation</button>}
      <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 sm:px-5"><form onSubmit={submit} className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 transition focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50"><label htmlFor="inbox-chat-input" className="sr-only">Ask your inbox a question</label><textarea id="inbox-chat-input" tabIndex={open ? 0 : -1} rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage(draft) } }} placeholder="Ask anything about your emails..." className="max-h-28 min-h-[42px] w-full resize-none bg-transparent px-1.5 py-1 text-[11px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400" /><div className="flex items-center justify-between"><button type="button" tabIndex={open ? 0 : -1} aria-label="Attach file" className="grid size-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><Paperclip className="size-3.5" /></button><div className="flex items-center gap-2"><span className="hidden text-[9px] text-slate-400 sm:block"><CornerDownLeft className="mr-1 inline size-3" />to send</span><button type="submit" tabIndex={open ? 0 : -1} disabled={!draft.trim() || typing} aria-label="Send message" className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"><ArrowRight className="size-4" /></button></div></div></form><p className="mt-2 text-center text-[8px] text-slate-400">Answers are based on the emails in your inbox.</p></div>
    </aside>
  </>
}
