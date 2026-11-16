'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { threads as seedThreads } from '@/data/mockThreads'
import type { Thread } from '@/lib/types'
import { incomingSamples, keywordClassify, localAsk, localDraft } from '@/lib/localAi'

/**
 * One shared data layer for every screen.
 *  - If NEXT_PUBLIC_API_URL is set and reachable, data comes from the Express/MongoDB backend.
 *  - Otherwise it runs in "demo mode": seeded mock threads kept in localStorage, so the
 *    assistant dashboard, client view and conversation page still stay in sync.
 */
const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
const KEY = 'postmark.threads.v2'

export type Rule = { id: string; sender: string; category: string }
export const apiConfigured = Boolean(API)
const RULES_KEY = 'postmark.rules.v1'
const defaultRules: Rule[] = [
  { id: 'r1', sender: 'billing@vendor.com', category: 'Assistant to Reply' },
  { id: 'r2', sender: 'support@acme.co', category: 'Client to Reply' },
]

type State = { threads: Thread[]; rules: Rule[]; loading: boolean; error: string | null; mode: 'api' | 'demo' }
let state: State = { threads: seedThreads, rules: defaultRules, loading: true, error: null, mode: 'demo' }
let started = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; emit() }

function saveLocal(threads: Thread[]) {
  try { localStorage.setItem(KEY, JSON.stringify(threads)) } catch { /* storage can be unavailable */ }
}
function loadLocal(): Thread[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Thread[]
  } catch { /* ignore */ }
  return seedThreads
}

function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(RULES_KEY)
    if (raw) return JSON.parse(raw) as Rule[]
  } catch { /* ignore */ }
  return defaultRules
}
function saveRules(rules: Rule[]) {
  try { localStorage.setItem(RULES_KEY, JSON.stringify(rules)) } catch { /* ignore */ }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch(`${API}${path}`, { ...init, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
    if (!res.ok) throw new Error(`Request failed (${res.status})`)
    const json = await res.json()
    return (json.data ?? json) as T
  } finally { clearTimeout(timer) }
}

export async function refresh() {
  set({ loading: true, error: null })
  if (API) {
    try {
      const data = await http<Thread[]>('/api/threads')
      const rules = await http<Array<{ id: string; senderEmail: string; classification: string }>>('/api/rules').catch(() => [])
      set({ threads: data, rules: rules.map((r) => ({ id: r.id, sender: r.senderEmail, category: r.classification })), mode: 'api', loading: false })
      return
    } catch {
      set({ mode: 'demo', error: 'Backend unreachable — showing demo data.' })
    }
  }
  set({ threads: loadLocal(), rules: loadRules(), mode: 'demo', loading: false })
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  refresh()
  window.addEventListener('storage', (e) => {
    if (state.mode !== 'demo') return
    if (e.key === KEY) set({ threads: loadLocal() })
    if (e.key === RULES_KEY) set({ rules: loadRules() })
  })
}

/** Optimistic update, then persist to the API (or localStorage in demo mode). */
export async function updateThread(id: string, patch: Partial<Thread>) {
  const next = state.threads.map((t) => (t.id === id ? { ...t, ...patch } : t))
  set({ threads: next })
  if (state.mode === 'api') {
    try { await http(`/api/threads/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }) }
    catch { set({ error: 'Could not save your change. Please retry.' }); await refresh() }
  } else saveLocal(next)
}

/** "Teach the AI": remember how a sender should be classified. Used before the AI on new emails. */
export async function saveRule(sender: string, category: string, id?: string) {
  const email = sender.trim().toLowerCase()
  if (!email) return
  const existing = state.rules.find((r) => r.id === id || r.sender === email)
  const next = existing
    ? state.rules.map((r) => (r.id === existing.id ? { ...r, sender: email, category } : r))
    : [{ id: `r${Date.now()}`, sender: email, category }, ...state.rules]
  set({ rules: next })
  if (state.mode === 'api') {
    try { await http('/api/rules', { method: 'POST', body: JSON.stringify({ senderEmail: email, classification: category }) }); await refresh() }
    catch { set({ error: 'Could not save the rule.' }) }
  } else saveRules(next)
}

export async function removeRule(id: string) {
  const next = state.rules.filter((r) => r.id !== id)
  set({ rules: next })
  if (state.mode === 'api') { try { await http(`/api/rules/${id}`, { method: 'DELETE' }) } catch { await refresh() } }
  else saveRules(next)
}

/** Classify any thread the AI has not scored yet (used at the end of the onboarding sync). */
export async function classifyAll() {
  if (state.mode !== 'api') return
  try { await http('/api/threads/classify-all', { method: 'POST' }); await refresh() } catch { /* the app still works with the existing data */ }
}

export async function simulateEmail(): Promise<Thread | null> {
  if (state.mode === 'api') {
    try {
      const created = await http<Thread>('/api/simulate-email', { method: 'POST', body: JSON.stringify({}) })
      await refresh()
      return created
    } catch { /* fall through to demo behaviour */ }
  }
  const sample = incomingSamples[Math.floor(Math.random() * incomingSamples.length)]
  const me = { name: 'Jordan Davis', email: 'jordan@postmark.in' }
  const sentAt = new Date().toISOString()
  const draft = { subject: sample.subject, messages: [{ from: sample.email, to: me.email, body: sample.body, sentAt }] }
  let ai = keywordClassify(draft)
  const rule = state.rules.find((r) => r.sender === sample.email.toLowerCase())
  if (rule) ai = { ...ai, classification: rule.category, confidence: 100, needsReview: false, reason: 'Matched your saved rule for this sender.' }
  const thread: Thread = {
    id: `local-${Date.now()}`, subject: sample.subject,
    participants: [{ name: sample.name, email: sample.email }, me],
    messages: draft.messages, ...ai, segment: 'workspace', correctedByUser: false,
    isRead: false, isImportant: false, isArchived: false, isCompleted: false, handledBy: null, lastMessageAt: sentAt,
  }
  const next = [thread, ...state.threads]
  set({ threads: next }); saveLocal(next)
  return thread
}

export async function generateDraft(id: string): Promise<string> {
  const thread = state.threads.find((t) => t.id === id)
  if (state.mode === 'api') {
    try { const r = await http<{ draft: string }>(`/api/threads/${id}/draft`, { method: 'POST' }); return r.draft } catch { /* fall back */ }
  }
  await new Promise((r) => setTimeout(r, 700))
  return thread ? localDraft(thread) : ''
}

export async function askInbox(question: string): Promise<{ answer: string; threadIds: string[] }> {
  if (state.mode === 'api') {
    try { return await http('/api/chat', { method: 'POST', body: JSON.stringify({ question }) }) } catch { /* fall back */ }
  }
  await new Promise((r) => setTimeout(r, 500))
  return localAsk(question, state.threads)
}

export function resetDemo() {
  try { localStorage.removeItem(KEY); localStorage.removeItem(RULES_KEY) } catch { /* ignore */ }
  set({ threads: seedThreads, rules: defaultRules })
}

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useThreads() {
  useEffect(() => { start() }, [])
  const snap = useSyncExternalStore(subscribe, () => state, () => state)
  const reload = useCallback(() => refresh(), [])
  return { ...snap, refresh: reload, updateThread, simulateEmail, generateDraft, askInbox, saveRule, removeRule, classifyAll }
}

export function useThread(id: string) {
  const all = useThreads()
  return { ...all, thread: all.threads.find((t) => t.id === id) }
}
