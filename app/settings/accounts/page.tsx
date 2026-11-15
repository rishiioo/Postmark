'use client'

import { useState, type ReactNode } from 'react'
import { ArrowLeft, Check, CheckCircle2, ChevronDown, CircleAlert, Clock3, LoaderCircle, Mail, Plus, RefreshCw, Settings2, ShieldCheck, Trash2, X } from 'lucide-react'

type AccountStatus = 'Connected' | 'Syncing' | 'Error'
type Account = { id: number; provider: 'Gmail' | 'Outlook'; email: string; status: AccountStatus; lastSynced: string }
type Rule = { id: number; sender: string; category: string }

const initialAccounts: Account[] = [
  { id: 1, provider: 'Gmail', email: 'jordan@acme.co', status: 'Connected', lastSynced: '2 minutes ago' },
  { id: 2, provider: 'Outlook', email: 'jordan.davis@outlook.com', status: 'Error', lastSynced: 'Yesterday, 6:42 PM' },
]
const initialRules: Rule[] = [
  { id: 1, sender: 'billing@vendor.com', category: 'Assistant to Reply' },
  { id: 2, sender: 'support@acme.co', category: 'Client to Reply' },
  { id: 3, sender: 'olivia@acme.co', category: 'Assistant to Reply' },
]
const categories = ['Assistant to Reply', 'Client to Reply', 'Action Required', 'No Reply Needed']

function StatusBadge({ status }: { status: AccountStatus }) {
  const style = status === 'Connected' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : status === 'Syncing' ? 'bg-indigo-50 text-indigo-700 ring-indigo-100' : 'bg-rose-50 text-rose-700 ring-rose-100'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ring-1 ring-inset ${style}`}>{status === 'Connected' ? <CheckCircle2 className="size-3" /> : status === 'Syncing' ? <LoaderCircle className="size-3 animate-spin" /> : <CircleAlert className="size-3" />}{status}</span>
}

function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-[430px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/15 sm:p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-[15px] font-semibold tracking-[-0.03em] text-slate-900">{title}</h2><button aria-label="Close dialog" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div>{children}</section></div>
}

export default function AccountsSettingsPage() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [rules, setRules] = useState(initialRules)
  const [disconnectId, setDisconnectId] = useState<number | null>(null)
  const [ruleDraft, setRuleDraft] = useState<Rule | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newProvider, setNewProvider] = useState<'Gmail' | 'Outlook'>('Gmail')
  const [newEmail, setNewEmail] = useState('')
  const [notice, setNotice] = useState('')

  function syncAccount(id: number) {
    setAccounts((current) => current.map((account) => account.id === id ? { ...account, status: 'Syncing' } : account))
    window.setTimeout(() => setAccounts((current) => current.map((account) => account.id === id ? { ...account, status: 'Connected', lastSynced: 'Just now' } : account)), 1400)
  }

  function disconnectAccount() {
    if (disconnectId === null) return
    setAccounts((current) => current.filter((account) => account.id !== disconnectId))
    setDisconnectId(null)
    setNotice('Email account disconnected')
    window.setTimeout(() => setNotice(''), 2800)
  }

  function saveRule() {
    if (!ruleDraft || !ruleDraft.sender.trim()) return
    setRules((current) => ruleDraft.id < 0 ? [...current, { ...ruleDraft, id: Date.now() }] : current.map((rule) => rule.id === ruleDraft.id ? ruleDraft : rule))
    setRuleDraft(null)
  }

  function addAccount() {
    if (!newEmail.trim()) return
    const id = Date.now()
    setAccounts((current) => [...current, { id, provider: newProvider, email: newEmail.trim(), status: 'Syncing', lastSynced: 'Syncing now' }])
    setNewEmail('')
    setAddOpen(false)
    window.setTimeout(() => setAccounts((current) => current.map((account) => account.id === id ? { ...account, status: 'Connected', lastSynced: 'Just now' } : account)), 1500)
  }

  const pendingDisconnect = accounts.find((account) => account.id === disconnectId)

  return <main className="min-h-screen bg-[#f7f8fa] text-slate-900 antialiased">
    <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md sm:px-8"><a href="/" aria-label="Postmark inbox" className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-[10px] bg-indigo-600 text-white"><Mail className="size-4" /></span><span className="text-[15px] font-semibold tracking-[-0.04em]">postmark<span className="text-indigo-600">.</span></span></a><a href="/" className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 transition hover:text-indigo-700"><ArrowLeft className="size-3.5" />Back to inbox</a></header>
    <div className="mx-auto w-full max-w-[940px] px-5 pb-16 pt-8 sm:px-8 sm:pt-11">
      <div className="mb-8"><div className="mb-2 flex items-center gap-2 text-[10px] font-medium text-slate-400"><Settings2 className="size-3.5" />Settings <span className="text-slate-300">/</span><span className="text-slate-600">Connected accounts</span></div><h1 className="text-[26px] font-semibold tracking-[-0.05em] text-slate-900 sm:text-[32px]">Connected accounts</h1><p className="mt-2 max-w-[560px] text-[11px] leading-relaxed text-slate-500 sm:text-[12px]">Manage your email connections and decide how messages from specific senders are sorted.</p></div>

      <section aria-labelledby="accounts-title" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 id="accounts-title" className="text-[12px] font-semibold text-slate-800">Email accounts</h2><p className="mt-1 text-[10px] text-slate-400">Connected inboxes and sync health</p></div><button onClick={() => setAddOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[10px] font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"><Plus className="size-3.5" />Add another account</button></div>
        {accounts.length === 0 ? <div className="px-5 py-12 text-center sm:px-6"><div className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-400"><Mail className="size-5" /></div><p className="mt-3 text-[12px] font-semibold text-slate-700">No email accounts connected</p><p className="mt-1 text-[10px] text-slate-500">Connect an inbox to let Postmark organize your email.</p><button onClick={() => setAddOpen(true)} className="mt-4 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">Connect an account</button></div> : <div className="divide-y divide-slate-100">{accounts.map((account) => <article key={account.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-6"><span className={`grid size-10 shrink-0 place-items-center rounded-xl text-[14px] font-bold ${account.provider === 'Gmail' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'}`}>{account.provider === 'Gmail' ? 'M' : 'O'}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[11px] font-semibold text-slate-800">{account.provider}</p><StatusBadge status={account.status} /></div><p className="mt-1 truncate text-[10px] text-slate-500">{account.email}</p>{account.status === 'Error' ? <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[9px] text-rose-600"><CircleAlert className="size-3" />Connection interrupted. Please reconnect to resume syncing.</p> : <p className="mt-1.5 flex items-center gap-1.5 text-[9px] text-slate-400"><Clock3 className="size-3" />Last synced {account.lastSynced}</p>}</div><div className="flex items-center gap-2 sm:shrink-0"><button disabled={account.status === 'Syncing'} onClick={() => syncAccount(account.id)} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700 disabled:cursor-wait disabled:opacity-60 sm:flex-none">{account.status === 'Syncing' ? <LoaderCircle className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}{account.status === 'Error' ? 'Retry sync' : 'Sync now'}</button><button onClick={() => setDisconnectId(account.id)} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[9px] font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 sm:flex-none"><X className="size-3" />Disconnect</button></div></article>)}</div>}
      </section>

      <section aria-labelledby="rules-title" className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 id="rules-title" className="text-[12px] font-semibold text-slate-800">AI classification rules</h2><p className="mt-1 text-[10px] text-slate-400">Customize how mail from specific senders is handled</p></div><button onClick={() => setRuleDraft({ id: -1, sender: '', category: categories[0] })} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"><Plus className="size-3" />Add rule</button></div>
        {rules.length === 0 ? <div className="px-5 py-12 text-center sm:px-6"><div className="mx-auto grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-500"><Settings2 className="size-4" /></div><p className="mt-3 text-[11px] font-semibold text-slate-700">No sender rules yet</p><p className="mt-1 text-[10px] text-slate-500">Add a rule to customize how messages are classified.</p><button onClick={() => setRuleDraft({ id: -1, sender: '', category: categories[0] })} className="mt-3 text-[10px] font-semibold text-indigo-600">Create your first rule</button></div> : <><div className="hidden grid-cols-[minmax(220px,1fr)_minmax(190px,0.8fr)_100px] gap-4 bg-slate-50/60 px-6 py-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400 sm:grid"><span>Sender</span><span>Classification</span><span className="text-right">Actions</span></div><div className="divide-y divide-slate-100">{rules.map((rule) => <article key={rule.id} className="flex flex-col gap-2.5 px-5 py-3.5 sm:grid sm:grid-cols-[minmax(220px,1fr)_minmax(190px,0.8fr)_100px] sm:items-center sm:gap-4 sm:px-6"><div><p className="text-[9px] font-medium uppercase tracking-[0.08em] text-slate-400 sm:hidden">Sender</p><p className="mt-1 font-mono text-[10px] text-slate-700 sm:mt-0">{rule.sender}</p></div><div><p className="text-[9px] font-medium uppercase tracking-[0.08em] text-slate-400 sm:hidden">Classification</p><span className="mt-1 inline-flex rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700 sm:mt-0">{rule.category}</span></div><div className="flex items-center gap-1 sm:justify-end"><button aria-label={`Edit rule for ${rule.sender}`} onClick={() => setRuleDraft(rule)} className="rounded-md px-2.5 py-1.5 text-[9px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Edit</button><button aria-label={`Delete rule for ${rule.sender}`} onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-3.5" /></button></div></article>)}</div></>}
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/40 px-5 py-3 text-[9px] text-slate-400 sm:px-6"><ShieldCheck className="size-3.5 text-indigo-500" />Rules apply to new messages as they arrive.</div>
      </section>
    </div>

    {pendingDisconnect && <Dialog title="Disconnect email account?" onClose={() => setDisconnectId(null)}><p className="text-[11px] leading-relaxed text-slate-500">Postmark will stop syncing <span className="font-semibold text-slate-700">{pendingDisconnect.email}</span>. Your existing email and classifications won’t be deleted.</p><div className="mt-6 flex gap-2"><button onClick={() => setDisconnectId(null)} className="h-10 flex-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Keep account</button><button onClick={disconnectAccount} className="h-10 flex-1 rounded-lg bg-rose-600 text-[10px] font-semibold text-white hover:bg-rose-700">Disconnect</button></div></Dialog>}
    {ruleDraft && <Dialog title={ruleDraft.id < 0 ? 'Add sender rule' : 'Edit sender rule'} onClose={() => setRuleDraft(null)}><label htmlFor="rule-sender" className="mb-1.5 block text-[10px] font-medium text-slate-600">Sender email</label><input id="rule-sender" type="email" value={ruleDraft.sender} onChange={(event) => setRuleDraft({ ...ruleDraft, sender: event.target.value })} placeholder="billing@vendor.com" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50" /><label htmlFor="rule-category" className="mb-1.5 mt-4 block text-[10px] font-medium text-slate-600">Classify as</label><div className="relative"><select id="rule-category" value={ruleDraft.category} onChange={(event) => setRuleDraft({ ...ruleDraft, category: event.target.value })} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-[11px] text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50">{categories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /></div><div className="mt-6 flex gap-2"><button onClick={() => setRuleDraft(null)} className="h-10 flex-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={!ruleDraft.sender.trim()} onClick={saveRule} className="h-10 flex-1 rounded-lg bg-indigo-600 text-[10px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Save rule</button></div></Dialog>}
    {addOpen && <Dialog title="Add an email account" onClose={() => setAddOpen(false)}><p className="mb-4 text-[10px] leading-relaxed text-slate-500">Connect another inbox to keep all your email organized in one place.</p><div className="mb-4 grid grid-cols-2 gap-2"><button onClick={() => setNewProvider('Gmail')} className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-[10px] font-semibold ${newProvider === 'Gmail' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}><span className="font-bold text-rose-500">M</span>Gmail</button><button onClick={() => setNewProvider('Outlook')} className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-[10px] font-semibold ${newProvider === 'Outlook' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}><span className="font-bold text-sky-600">O</span>Outlook</button></div><label htmlFor="new-account-email" className="mb-1.5 block text-[10px] font-medium text-slate-600">Account email</label><input id="new-account-email" type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="you@company.com" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50" /><div className="mt-6 flex gap-2"><button onClick={() => setAddOpen(false)} className="h-10 flex-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={!newEmail.trim()} onClick={addAccount} className="h-10 flex-1 rounded-lg bg-indigo-600 text-[10px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Connect account</button></div></Dialog>}
    <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 transition-all ${notice ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}><div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[10px] font-medium text-white shadow-xl"><Check className="size-4 text-emerald-300" />{notice}</div></div>
  </main>
}
