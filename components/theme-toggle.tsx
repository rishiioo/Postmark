'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const KEY = 'postmark.theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem(KEY) } catch { /* storage unavailable */ }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored ? stored === 'dark' : prefersDark
    setDark(initial)
    document.documentElement.classList.toggle('dark', initial)
    document.documentElement.classList.toggle('light', !initial)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    try { localStorage.setItem(KEY, next ? 'dark' : 'light') } catch { /* ignore */ }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 ${className}`}
    >
      {dark ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
    </button>
  )
}
