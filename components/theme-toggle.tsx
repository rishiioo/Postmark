'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const KEY = 'postmark.theme'

/** Dark is the default. The choice is saved in the browser and applied before first paint (see app/layout.tsx). */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    const root = document.documentElement.classList
    root.toggle('dark', next)
    root.toggle('light', !next)
    try { localStorage.setItem(KEY, next ? 'dark' : 'light') } catch { /* storage unavailable */ }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`fixed bottom-4 right-4 z-40 grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:text-slate-900 dark:border-white/10 dark:bg-[#18181b] dark:text-zinc-300 dark:hover:text-white ${className}`}
    >
      {dark ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
    </button>
  )
}
