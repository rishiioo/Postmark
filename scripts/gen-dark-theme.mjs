// Generates app/dark-theme.css from the Tailwind colour classes used in app/ and components/.
// Run after you add new light-colour classes:  node scripts/gen-dark-theme.mjs
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOTS = ['app', 'components']
const SKIP = ['app/onboarding'] // the login flow is already dark-only

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.tsx')) out.push(p)
  }
  return out
}

const RGB = {
  indigo: '99,102,241', emerald: '16,185,129', amber: '245,158,11', rose: '244,63,94',
  sky: '14,165,233', violet: '139,92,246', orange: '249,115,22', pink: '236,72,153',
}
const LIGHT = {
  indigo: { 100: '#e0e7ff', 300: '#a5b4fc', 400: '#818cf8' },
  emerald: { 300: '#6ee7b7', 400: '#34d399' },
  amber: { 300: '#fcd34d', 400: '#fbbf24' },
  rose: { 300: '#fda4af', 400: '#fb7185' },
  sky: { 300: '#7dd3fc', 400: '#38bdf8' },
  violet: { 300: '#c4b5fd', 400: '#a78bfa' },
  orange: { 300: '#fdba74', 400: '#fb923c' },
  pink: { 300: '#f9a8d4', 400: '#f472b6' },
}
const SLATE_BG = { 50: '#16161a', 100: '#1c1c21', 200: '#27272d', 900: '#2b2b32' }
const SLATE_TEXT = { 900: '#fafafa', 800: '#f4f4f5', 700: '#e4e4e7', 600: '#d4d4d8', 500: '#a1a1aa', 400: '#8e8e98', 300: '#6b6b75' }
const SLATE_BORDER = { 50: 'rgba(255,255,255,.05)', 100: 'rgba(255,255,255,.07)', 200: 'rgba(255,255,255,.1)', 300: 'rgba(255,255,255,.16)' }
const ARBITRARY_BG = { '#f7f8fa': '#09090b', '#f8f9fb': '#09090b', '#fbfcfd': '#0c0c0f' }

const rgba = (name, a) => `rgba(${RGB[name]},${a})`
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

// Returns a colour for (utility, name, shade, alpha) or null when the light value can stay.
function colour(util, hover, name, shade, alpha) {
  const a = alpha == null ? 1 : alpha / 100
  if (name === 'white') {
    if (util === 'bg') return a < 1 ? `rgba(17,17,19,${clamp(a, 0.85, 0.95)})` : hover ? '#1a1a1f' : '#111113'
    if (util === 'ring') return '#111113'
    return null // text-white stays white
  }
  if (name === 'slate') {
    if (util === 'bg') {
      if (shade === 950) return `rgba(0,0,0,${clamp(a * 2.5, 0.5, 0.7)})`
      if (a < 1) return `rgba(255,255,255,${clamp(a * 0.05, 0.02, 0.06)})`
      if (hover) return shade === 50 ? '#1c1c21' : '#27272d'
      return SLATE_BG[shade] ?? null
    }
    if (util === 'text') return SLATE_TEXT[shade] ?? null
    if (util === 'border' || util === 'divide' || util === 'ring') return SLATE_BORDER[shade] ?? null
    if (util === 'shadow') return 'rgba(0,0,0,.45)'
    return null
  }
  if (!RGB[name]) return null
  if (util === 'bg') {
    if (shade <= 100) {
      const base = shade === 50 ? 0.12 : 0.2
      const alphaFinal = alpha == null ? (hover ? base + 0.06 : base) : clamp(base * a, 0.05, base)
      return rgba(name, +alphaFinal.toFixed(3))
    }
    return null
  }
  if (util === 'border' || util === 'ring') {
    const map = { 50: 0.2, 100: 0.22, 200: 0.32, 300: 0.42 }
    return map[shade] ? rgba(name, hover ? map[shade] + 0.1 : map[shade]) : null
  }
  if (util === 'text') {
    if (shade <= 300) return null
    const l = LIGHT[name] || {}
    if (name === 'indigo' && shade === 900) return l[100]
    if (shade === 400 || shade === 500) return l[400] ?? null
    return l[300] ?? null // 600, 700, 800, 900
  }
  if (util === 'fill') return null
  if (util === 'from' || util === 'to' || util === 'via') return rgba(name, 0.25)
  if (util === 'shadow') return rgba(name, 0.25)
  return null
}

const esc = (s) => s.replace(/[^A-Za-z0-9_-]/g, (c) => '\\' + c)

const files = ROOTS.flatMap((r) => walk(r)).filter((f) => !SKIP.some((s) => f.replaceAll('\\', '/').startsWith(s)))
const tokens = new Set()
for (const f of files) {
  for (let t of readFileSync(f, 'utf8').match(/[A-Za-z0-9_\-:/.[\]#%(),!]+/g) ?? []) {
    t = t.replace(/^\(+/, '').replace(/[,.)]+$/, '')
    if (/^(?:[a-z-]+:)*(bg|text|border|ring|divide|from|to|via|fill|shadow)-/.test(t)) tokens.add(t)
  }
}

const KNOWN = { hover: ':hover', focus: ':focus', 'focus-within': ':focus-within', disabled: ':disabled', placeholder: '::placeholder', 'group-hover': 'group-hover' }
const rules = []
for (const token of [...tokens].sort()) {
  const parts = token.split(/:(?![^[]*\])/)
  const base = parts.pop()
  const variants = parts
  if (variants.some((v) => !(v in KNOWN))) continue // unknown variant: leave untouched rather than guess
  const m = base.match(/^(bg|text|border|ring|divide|from|to|via|fill|shadow)-(?:(white)|\[(#[0-9a-fA-F]+)\]|([a-z]+)-(\d{2,3}))(?:\/(\d+))?$/)
  if (!m) continue
  const [, util, white, hex, name, shadeRaw, alphaRaw] = m
  const hover = variants.includes('hover') || variants.includes('group-hover')
  let value = null
  if (hex) value = util === 'bg' ? ARBITRARY_BG[hex.toLowerCase()] ?? null : null
  else value = colour(util, hover, white ? 'white' : name, shadeRaw ? +shadeRaw : 0, alphaRaw ? +alphaRaw : null)
  if (!value) continue

  const prop = { bg: 'background-color', text: 'color', border: 'border-color', divide: 'border-color', fill: 'fill', ring: '--tw-ring-color', from: '--tw-gradient-from', to: '--tw-gradient-to', via: '--tw-gradient-via', shadow: '--tw-shadow-color' }[util]
  let selector = `.dark .${esc(token)}`
  let target = selector
  if (variants.includes('group-hover')) target = `.dark .group:hover .${esc(token)}`
  else {
    const pseudo = variants.map((v) => KNOWN[v]).join('')
    target = `${selector}${pseudo}`
  }
  if (util === 'divide') target = `${target} > :not(:last-child)`
  rules.push(`${target} { ${prop}: ${value}; }`)
}

const header = `/* AUTO-GENERATED by scripts/gen-dark-theme.mjs — do not edit by hand.
   Maps the light Tailwind colour classes used by the pages to a dark palette when <html class="dark">.
   Re-run:  node scripts/gen-dark-theme.mjs  after adding new colour classes. */\n`
writeFileSync('app/dark-theme.css', `${header}\n.dark { color-scheme: dark; }\n\n${rules.join('\n')}\n`)
console.log(`Wrote app/dark-theme.css with ${rules.length} rules from ${tokens.size} class tokens`)
