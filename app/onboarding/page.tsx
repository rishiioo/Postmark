'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { classifyAll } from '@/lib/store'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Circle, LoaderCircle, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [provider, setProvider] = useState<'Gmail' | 'Outlook'>('Gmail')
  const [consent, setConsent] = useState(false)
  const [failed, setFailed] = useState(false)
  const [done, setDone] = useState(false)
  const [stage, setStage] = useState(0)
  const timers = useRef<number[]>([])

  function startSync() {
    timers.current.forEach((t) => window.clearTimeout(t))
    setConsent(false)
    setFailed(false)
    setDone(false)
    setStage(0)
    setStep(3)
    timers.current = [
      window.setTimeout(() => { setStage(1); classifyAll() }, 1400),
      window.setTimeout(() => { setStage(2); setDone(true) }, 3400),
    ]
  }

  function simulateFailure() {
    timers.current.forEach((t) => window.clearTimeout(t))
    setDone(false)
    setFailed(true)
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#09090b] [color-scheme:dark] px-4 pb-8 pt-5 text-zinc-100 antialiased sm:px-8 sm:pt-7">
      <AnimatedBackground />
      <header className="mx-auto flex w-full max-w-[900px] items-center justify-between animate-fade-in-up">
        <Link href="/dashboard" className="flex items-center gap-2 text-[14px] font-semibold tracking-[-.04em]">
          <span className="grid size-8 place-items-center rounded-[10px] bg-indigo-500 text-white"><Mail className="size-4" /></span>
          postmark<span className="-ml-2 text-indigo-400">.</span>
        </Link>
        {step > 1 && <button onClick={() => setStep((step - 1) as Step)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 hover:text-zinc-100"><ArrowLeft className="size-3.5" />Back</button>}
      </header>
      <div className="mx-auto mt-8 w-full max-w-[440px] sm:mt-12">
        <div className="mb-8 flex items-center justify-center gap-2 animate-fade-in-up animation-delay-100" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((number) => (
            <div key={number} className="flex items-center gap-2 animate-scale-in" style={{ animationDelay: `${number * 100}ms` }}>
              <span className={`grid size-7 place-items-center rounded-full text-[13px] font-semibold ${step === number ? 'bg-indigo-500 text-white' : step > number ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-zinc-500'}`}>
                {step > number ? <Check className="size-3.5" /> : number}
              </span>
              {number < 3 && <span className={`h-px w-8 ${step > number ? 'bg-emerald-500/50' : 'bg-white/15'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113] shadow-[0_8px_40px_rgba(0,0,0,.5)] animate-fade-in-up animation-delay-200">
            <div className="p-5 sm:p-8">
              <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-400 animate-scale-in animation-delay-300"><Sparkles className="size-5" /></div>
              <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-indigo-400 animate-fade-in-up animation-delay-400">A calmer inbox starts here</p>
              <h1 className="mt-2 text-[25px] font-semibold leading-tight tracking-[-.055em] sm:text-[30px] animate-fade-in-up animation-delay-500">Never miss an email that needs you.</h1>
              <p className="mt-3 text-[13px] leading-relaxed text-zinc-400 animate-fade-in-up animation-delay-600">Postmark sorts the noise, surfaces what matters, and helps your team stay on top of every conversation.</p>
              <form onSubmit={(event) => { event.preventDefault(); setStep(2) }} className="mt-7 animate-fade-in-up animation-delay-700">
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-zinc-200">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-[13px]"
                />
                <button type="submit" className="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-indigo-500 text-xs font-semibold text-white transition hover:bg-indigo-400">Continue</button>
              </form>
              <div className="my-5 flex items-center gap-3 text-[13px] text-zinc-500 animate-fade-in animation-delay-700"><span className="h-px flex-1 bg-white/10" />OR TRY A DEMO<span className="h-px flex-1 bg-white/10" /></div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 animate-fade-in-up animation-delay-700">
                <Link href="/dashboard" className="flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[13px] font-semibold text-zinc-200 transition hover:bg-white/10">Continue as demo assistant</Link>
                <Link href="/client" className="flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[13px] font-semibold text-zinc-200 transition hover:bg-white/10">Continue as demo client</Link>
              </div>
            </div>
            <div className="border-t border-white/10 bg-white/[.03] px-5 py-3.5 text-center text-[13px] text-zinc-400 sm:px-8 animate-fade-in animation-delay-700">
              Already have access? <button type="button" onClick={() => setStep(2)} className="font-semibold text-indigo-400 hover:text-indigo-300">Log in</button>
            </div>
            <div className="border-t border-white/10 bg-[linear-gradient(135deg,rgba(251,146,60,.08),transparent)] px-5 py-3 text-center text-[12px] font-semibold text-orange-400 sm:px-8 animate-fade-in animation-delay-700">Prototype mode · sample data</div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-2xl border border-white/10 bg-[#111113] p-5 shadow-[0_8px_40px_rgba(0,0,0,.5)] sm:p-8 animate-fade-in-up animation-delay-200">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-indigo-400 animate-fade-in-up animation-delay-300">Step 2 of 3</p>
            <h1 className="mt-2 text-[23px] font-semibold tracking-[-.05em] animate-fade-in-up animation-delay-400">Connect your email</h1>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 animate-fade-in-up animation-delay-500">Choose the inbox you use for work. You can add more accounts later.</p>
            <div className="mt-6 space-y-2 animate-fade-in-up animation-delay-600">
              <button onClick={() => { setProvider('Gmail'); setConsent(true) }} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${provider === 'Gmail' && consent ? 'border-indigo-400/50 bg-indigo-500/150/10' : 'border-white/10 hover:border-white/20'}`}>
                <span className="grid size-9 place-items-center rounded-lg bg-rose-500/15 font-bold text-rose-400 animate-scale-in animation-delay-700">M</span>
                <span className="flex-1"><span className="block text-xs font-semibold text-zinc-100">Gmail</span><span className="mt-0.5 block text-[13px] text-zinc-500">Connect your Google inbox</span></span>
                <ChevronRight className="size-4 text-zinc-500" />
              </button>
              <button onClick={() => { setProvider('Outlook'); setConsent(true) }} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${provider === 'Outlook' && consent ? 'border-indigo-400/50 bg-indigo-500/150/10' : 'border-white/10 hover:border-white/20'}`}>
                <span className="grid size-9 place-items-center rounded-lg bg-sky-500/15 font-bold text-sky-400 animate-scale-in animation-delay-700">O</span>
                <span className="flex-1"><span className="block text-xs font-semibold text-zinc-100">Outlook</span><span className="mt-0.5 block text-[13px] text-zinc-500">Connect your Microsoft inbox</span></span>
                <ChevronRight className="size-4 text-zinc-500" />
              </button>
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-lg bg-white/5 p-3 animate-fade-in animation-delay-700">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
              <p className="text-[13px] leading-relaxed text-zinc-400">Your credentials are never stored here. You control what Postmark can access.</p>
            </div>
            {consent && (
              <div role="dialog" aria-modal="true" aria-label={`${provider} permissions`} className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/150/10 p-4 animate-scale-in animation-delay-700">
                <h2 className="text-xs font-semibold text-zinc-100">Allow Postmark to connect to {provider}?</h2>
                <p className="mt-1 text-[13px] text-zinc-400">This demo consent previews the permissions requested.</p>
                <ul className="mt-3 space-y-2 text-[13px] text-zinc-300">
                  <li className="flex items-center gap-2 animate-slide-in-right animation-delay-700"><CheckCircle2 className="size-3.5 text-emerald-400" />Read and organize your email</li>
                  <li className="flex items-center gap-2 animate-slide-in-right animation-delay-700" style={{animationDelay: '800ms'}}><CheckCircle2 className="size-3.5 text-emerald-400" />Send replies only after your approval</li>
                  <li className="flex items-center gap-2 animate-slide-in-right animation-delay-700" style={{animationDelay: '900ms'}}><Circle className="size-3.5 text-zinc-500" />We will never send without permission</li>
                </ul>
                <div className="mt-4 flex gap-2 animate-fade-in-up animation-delay-700" style={{animationDelay: '1000ms'}}>
                  <button onClick={() => setConsent(false)} className="h-9 flex-1 rounded-lg border border-white/10 bg-[#111113] text-[13px] font-semibold text-zinc-300">Cancel</button>
                  <button onClick={startSync} className="h-9 flex-1 rounded-lg bg-indigo-500 text-[13px] font-semibold text-white">Allow access</button>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="rounded-2xl border border-white/10 bg-[#111113] p-5 shadow-[0_8px_40px_rgba(0,0,0,.5)] sm:p-8 animate-fade-in-up animation-delay-200">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-indigo-400 animate-fade-in-up animation-delay-300">Step 3 of 3</p>
            <div className="mt-2 flex items-center gap-2 animate-fade-in-up animation-delay-400">
              <h1 className="text-[23px] font-semibold tracking-[-.05em]">{done ? "You’re all set" : failed ? ‘Sync needs attention’ : ‘Getting your inbox ready’}</h1>
              {!failed && !done && <LoaderCircle className="size-4 animate-spin text-indigo-400" />}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 animate-fade-in animation-delay-500">{failed ? `We couldn’t finish connecting to ${provider}. Check your connection and try again.` : done ? "Your inbox is connected and ready for a fresh start." : `Connecting ${provider} and organizing your messages.`}</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10 animate-scale-in animation-delay-600">
              <div className={`h-full rounded-full transition-all duration-700 ${failed ? ‘w-[55%] bg-rose-500/150’ : done ? ‘w-full bg-emerald-500’ : stage === 0 ? ‘w-[30%] bg-indigo-500’ : ‘w-[70%] animate-pulse bg-indigo-500’}`} />
            </div>
            <ul className="mt-6 space-y-4 animate-fade-in-up animation-delay-700">
              {[‘Fetching emails’, ‘AI is classifying conversations’, ‘Done’].map((label, index) => {
                const complete = done || index < stage;
                const current = !failed && !done && index === stage;
                return (
                  <li key={label} className="flex items-center gap-3 text-xs animate-slide-in-right" style={{animationDelay: `${700 + index * 100}ms`}}>
                    <span className={`grid size-5 place-items-center rounded-full ${complete ? ‘bg-emerald-500/15 text-emerald-400’ : current ? ‘bg-indigo-500/15 text-indigo-400’ : ‘bg-white/10 text-zinc-500’}`}>
                      {complete ? <Check className="size-3" /> : current ? <LoaderCircle className="size-3 animate-spin" /> : <span className="size-1 rounded-full bg-current" />}
                    </span>
                    <span className={complete || current ? ‘font-medium text-zinc-200’ : ‘text-zinc-500’}>{label}</span>
                    {failed && index === stage && <span className="ml-auto text-[13px] font-medium text-rose-400">Connection failed</span>}
                  </li>
                )
              })}
            </ul>
            <div className="mt-7 animate-fade-in-up animation-delay-700" style={{animationDelay: ‘1000ms’}}>
              {failed ? (
                <button onClick={startSync} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-400">Retry connection <ArrowRight className="size-3.5" /></button>
              ) : done ? (
                <Link href="/dashboard" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-400">Open inbox <ArrowRight className="size-3.5" /></Link>
              ) : (
                <button onClick={simulateFailure} className="flex h-10 w-full items-center justify-center rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-300">Simulate a connection failure (demo)</button>
              )}
            </div>
          </section>
        )}
        <p className="mt-5 text-center text-[13px] text-zinc-500 animate-fade-in animation-delay-700">By continuing, you agree to our <a href="#" className="underline underline-offset-2">Terms</a> and <a href="#" className="underline underline-offset-2">Privacy Policy</a>.</p>
      </div>
    </main>
  )
}
